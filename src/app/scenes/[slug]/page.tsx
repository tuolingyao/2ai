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
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* ===== 预览提示条 ===== */}
      {isPreview && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          此内容正在{statusLabels[scene.publishStatus]}，仅管理员可见
        </div>
      )}

      {/* ===== 顶部区块 ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-zinc-900">{scene.title}</h1>
          <Badge variant={scene.publishStatus === 'PUBLISHED' ? 'default' : 'secondary'}>
            {statusLabels[scene.publishStatus]}
          </Badge>
        </div>
        <p className="text-zinc-600 mb-4">{scene.summary}</p>

        {/* 适合/不适合人群 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6 mb-4 text-sm">
          <div>
            <span className="font-medium text-zinc-700">适合人群：</span>
            <span className="text-zinc-600">{scene.suitableFor}</span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">不适合人群：</span>
            <span className="text-zinc-600">{scene.notSuitableFor}</span>
          </div>
        </div>

        {/* 分类标签 */}
        {scene.taxonomies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {scene.taxonomies.map((t, i) => (
              <Badge key={i} variant="secondary">
                {t.taxonomy.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ===== 四阶段总览时间线 ===== */}
      <div className="mb-10 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-zinc-900">学习路径</h2>
        <StageTimeline stages={scene.stages} stageProgresses={stageProgressMap} />
      </div>

      {/* ===== 四阶段详情 ===== */}
      <div className="space-y-6">
        {stagesWithNodes.map((stage, i) => (
          <StageSection
            key={stage.id}
            stage={stage}
            nodes={stage.nodes}
            toolGuidances={stage.toolGuidances}
            stageIndex={i}
            stageProgress={stageProgressMap?.[stage.id] ?? null}
          />
        ))}
      </div>

      {/* ===== 底部区块 ===== */}
      <div className="mt-10 rounded-lg border bg-zinc-50 p-6">
        <h2 className="mb-2 text-lg font-bold text-zinc-900">走完后你会掌握...</h2>
        <p className="mb-6 text-zinc-600">
          {scene.stages.map((s) => s.capabilityStd).join('；')}
        </p>
        {firstNode && (
          <Link
            href={`/scenes/${sceneSlug}/nodes/${firstNode.slug}`}
            className="inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-white hover:bg-zinc-700 transition-colors"
          >
            从第一个学习节点开始
          </Link>
        )}
      </div>

      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
