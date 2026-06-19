// 场景详情页面 — 完整场景展示 + 四阶段学习路径 + SEO + 预览支持
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { StageTimeline } from '@/components/stage-timeline'
import { StageSection } from '@/components/stage-section'

// 动态生成 metadata — 优先使用 seoTitle/seoDescription
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const scene = await prisma.scene.findUnique({
    where: { slug },
    select: { title: true, summary: true, seoTitle: true, seoDescription: true, publishStatus: true },
  })

  if (!scene) return { title: '场景未找到' }

  return {
    title: scene.seoTitle || scene.title,
    description: scene.seoDescription || scene.summary,
  }
}

export default async function SceneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 检查当前用户是否为管理员
  const session = await getServerSession(authOptions)
  let userRole: string | null = null
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    userRole = user?.role || null
  }
  const isAdminUser = userRole && ['ADMIN', 'EDITOR', 'REVIEWER'].includes(userRole)

  // 查询场景完整数据
  const scene = await prisma.scene.findUnique({
    where: { slug },
    include: {
      taxonomies: {
        include: {
          taxonomy: { select: { name: true, type: true } },
        },
      },
      stages: {
        orderBy: { sortOrder: 'asc' },
        include: {
          nodes: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              title: true,
              slug: true,
              objective: true,
              sceneId: true,
              sortOrder: true,
            },
          },
          toolGuidances: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  // 不存在则 404
  if (!scene) notFound()

  // 非已发布状态：只有管理员可以访问
  if (scene.publishStatus !== 'PUBLISHED') {
    if (!isAdminUser) notFound()
  }

  // 是否为预览状态
  const isPreview = scene.publishStatus === 'PREVIEW' || scene.publishStatus === 'PENDING_REVIEW'

  // 查询场景 slug 用于节点链接
  const sceneSlug = scene.slug

  // 为节点添加 sceneSlug
  const stagesWithNodes = scene.stages.map((stage) => ({
    ...stage,
    nodes: stage.nodes.map((node) => ({ ...node, sceneSlug })),
  }))

  // 查询登录用户的阶段完成状态
  type StageProgressMap = Record<string, { completedNodes: number; totalNodes: number; isCompleted: boolean; inProgressCount: number }>
  let stageProgressMap: StageProgressMap | null = null

  if (session?.user?.id) {
    const userId = session.user.id
    // 获取该场景所有节点 ID，按阶段分组
    const stageNodeMap = new Map<string, string[]>()
    for (const stage of scene.stages) {
      const nodeIds = stage.nodes.map((n) => n.id)
      stageNodeMap.set(stage.id, nodeIds)
    }

    const allNodeIds = scene.stages.flatMap((s) => s.nodes.map((n) => n.id))

    if (allNodeIds.length > 0) {
      // 查询用户在该场景所有节点的进度
      const userProgresses = await prisma.userProgress.findMany({
        where: {
          userId,
          nodeId: { in: allNodeIds },
          status: { in: ['COMPLETED', 'IN_PROGRESS'] },
        },
        select: {
          nodeId: true,
          status: true,
        },
      })

      const progressByNode = new Map(userProgresses.map((p) => [p.nodeId, p.status]))

      stageProgressMap = {}
      for (const [stageId, nodeIds] of stageNodeMap) {
        const totalNodes = nodeIds.length
        let completedNodes = 0
        let inProgressCount = 0
        for (const nodeId of nodeIds) {
          const status = progressByNode.get(nodeId)
          if (status === 'COMPLETED') completedNodes++
          else if (status === 'IN_PROGRESS') inProgressCount++
        }
        stageProgressMap[stageId] = {
          completedNodes,
          totalNodes,
          isCompleted: completedNodes === totalNodes && totalNodes > 0,
          inProgressCount,
        }
      }
    }
  }

  // 第一个学习节点（sortOrder 最小的节点）
  const firstNode = stagesWithNodes
    .flatMap((s) => s.nodes)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0]

  // JSON-LD 结构化数据（Course 类型）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: scene.title,
    description: scene.summary,
    provider: {
      '@type': 'Organization',
      name: 'AI之翼',
    },
  }

  // 状态标签映射
  const statusLabels: Record<string, string> = {
    DRAFT: '草稿',
    PREVIEW: '预览中',
    PENDING_REVIEW: '待审核',
    PUBLISHED: '已发布',
    OFFLINE: '已下线',
  }

  return (
    <div className="min-h-screen">
      <section className="ink-gradient rice-paper border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-4">
          {isPreview && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              此内容正在{statusLabels[scene.publishStatus]}，仅管理员可见
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="seal-stamp rounded-sm bg-background/60 text-xs">学习地图</span>
                <Badge variant={scene.publishStatus === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {statusLabels[scene.publishStatus]}
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-wide text-foreground sm:text-5xl">{scene.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{scene.summary}</p>

              <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card/70 p-4">
                  <span className="font-semibold text-primary">适合人群：</span>
                  <span className="text-muted-foreground">{scene.suitableFor}</span>
                </div>
                <div className="rounded-2xl border border-border bg-card/70 p-4">
                  <span className="font-semibold text-primary">不适合人群：</span>
                  <span className="text-muted-foreground">{scene.notSuitableFor}</span>
                </div>
              </div>

              {scene.taxonomies.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {scene.taxonomies.map((t, i) => (
                    <span key={i} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent dark:text-accent-foreground">
                      {t.taxonomy.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="scroll-card rounded-[2rem] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-foreground">四阶段小地图</h2>
                <span className="text-xs text-muted-foreground">点击跳转</span>
              </div>
              <StageTimeline stages={scene.stages} stageProgresses={stageProgressMap} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card/80 p-5 backdrop-blur">
            <p className="mb-4 text-sm font-semibold text-foreground">学习地图导航</p>
            <StageTimeline stages={scene.stages} stageProgresses={stageProgressMap} />
          </div>
        </aside>

        <div>
          <div className="space-y-8">
            {stagesWithNodes.map((stage) => (
              <StageSection
                key={stage.id}
                stage={stage}
                stageProgress={stageProgressMap?.[stage.id] ?? null}
              />
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-border bg-card/80 p-8">
            <h2 className="mb-3 text-xl font-black text-foreground">走完后你会掌握...</h2>
            <p className="mb-6 leading-8 text-muted-foreground">
              {scene.stages.map((s) => s.capabilityStd).join('；')}
            </p>
            {firstNode && (
              <Link
                href={`/scenes/${sceneSlug}/nodes/${firstNode.slug}`}
                className="inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                从第一个学习节点开始
              </Link>
            )}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
