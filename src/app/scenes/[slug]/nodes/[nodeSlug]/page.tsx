// 学习节点页面 — 完整节点内容 + 交互功能
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { AiDialogue } from '@/components/ai-dialogue'
import { ToolGuidanceCard } from '@/components/tool-guidance-card'
import { FavoriteButton } from '@/components/favorite-button'
import { ProgressIndicator } from '@/components/progress-indicator'
import { EvidenceForm } from '@/components/evidence-form'

// 阶段名称映射
const stageLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-5">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{content}</p>
    </div>
  )
}

// 动态生成 metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; nodeSlug: string }>
}): Promise<Metadata> {
  const { nodeSlug } = await params
  const node = await prisma.learningNode.findFirst({
    where: { slug: nodeSlug },
    select: { title: true, objective: true, scene: { select: { title: true } } },
  })
  if (!node) return { title: '节点未找到' }
  return {
    title: `${node.title} - ${node.scene.title}`,
    description: node.objective || node.title,
  }
}

export default async function NodePage({
  params,
}: {
  params: Promise<{ slug: string; nodeSlug: string }>
}) {
  const { slug, nodeSlug } = await params

  // 查询节点完整数据
  const node = await prisma.learningNode.findFirst({
    where: { slug: nodeSlug, scene: { slug } },
    include: {
      scene: {
        select: {
          id: true,
          title: true,
          slug: true,
          publishStatus: true,
        },
      },
      stage: {
        select: { stageType: true },
      },
      dialogueExamples: {
        orderBy: { sortOrder: 'asc' },
      },
      toolGuidances: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // 不存在则 404
  if (!node) notFound()

  // 获取当前用户 session（合并权限检查和用户状态查询）
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  // 非已发布状态：只有管理员可以访问
  if (node.scene.publishStatus !== 'PUBLISHED') {
    let userRole: string | null = null
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })
      userRole = user?.role || null
    }
    const isAdminUser = userRole && ['ADMIN', 'EDITOR', 'REVIEWER'].includes(userRole)
    if (!isAdminUser) notFound()
  }

  // 查询下一个节点
  const nextNode = node.nextNodeId
    ? await prisma.learningNode.findUnique({
        where: { id: node.nextNodeId },
        select: { title: true, slug: true },
      })
    : null

  // 获取当前用户状态（收藏、进度、证据）
  let isFavorited = false
  let progressStatus: string | null = null
  let existingEvidence: { id: string; content: string } | null = null

  if (userId) {
    const [fav, prog, evi] = await Promise.all([
      prisma.userFavorite.findUnique({
        where: {
          userId_sceneId: { userId, sceneId: node.scene.id },
        },
      }),
      prisma.userProgress.findUnique({
        where: {
          userId_nodeId: { userId, nodeId: node.id },
        },
        select: { status: true },
      }),
      prisma.capabilityEvidence.findFirst({
        where: { userId, nodeId: node.id },
        select: { id: true, content: true },
      }),
    ])

    isFavorited = !!fav
    progressStatus = prog?.status || null
    existingEvidence = evi
  }

  return (
    <div className="min-h-screen">
      <section className="ink-gradient rice-paper border-b border-border py-10">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">首页</Link>
            <span>/</span>
            <Link href="/scenes" className="hover:text-primary">场景库</Link>
            <span>/</span>
            <Link href={`/scenes/${slug}`} className="hover:text-primary">{node.scene.title}</Link>
            <span>/</span>
            <span className="text-foreground">{node.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <span className="seal-stamp rounded-sm bg-background/60 text-xs">学习工作台</span>
            <Badge variant="secondary">{stageLabels[node.stage.stageType]}</Badge>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-wide text-foreground sm:text-5xl">{node.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{node.objective}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <main className="space-y-6">
          <section className="scroll-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-xl font-black text-foreground">学习内容</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {node.prerequisites && <InfoBlock title="前置条件" content={node.prerequisites} />}
              {node.whyFirst && <InfoBlock title="为什么先学这个" content={node.whyFirst} />}
              <InfoBlock title="关键概念" content={node.keyConcepts} />
              <InfoBlock title="方法重点" content={node.methodFocus} />
              <InfoBlock title="练习任务" content={node.practiceTask} />
              <InfoBlock title="通关标准" content={node.passCriteria} />
            </div>
          </section>

          {node.dialogueExamples.length > 0 && (
            <section>
              <div className="mb-4 border-l-4 border-primary pl-4">
                <h2 className="text-xl font-black text-foreground">AI 对话示范</h2>
                <p className="mt-1 text-sm text-muted-foreground">观察提示词、追问、补充和输出如何协同。</p>
              </div>
              <div className="space-y-5">
                {node.dialogueExamples.map((d) => (
                  <AiDialogue key={d.id} dialogue={d} />
                ))}
              </div>
            </section>
          )}

          {node.toolGuidances.length > 0 && (
            <section>
              <div className="mb-4 border-l-4 border-primary pl-4">
                <h2 className="text-xl font-black text-foreground">工具建议</h2>
                <p className="mt-1 text-sm text-muted-foreground">工具后置，先跑通当前任务，再判断是否升级。</p>
              </div>
              <div className="space-y-4">
                {node.toolGuidances.map((g) => (
                  <ToolGuidanceCard key={g.id} guidance={g} />
                ))}
              </div>
            </section>
          )}

          {node.commonMistakes && (
            <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-6">
              <h2 className="text-sm font-semibold text-primary">常见错误</h2>
              <p className="mt-3 leading-8 text-muted-foreground">{node.commonMistakes}</p>
            </section>
          )}
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="scroll-card rounded-[2rem] p-5">
            {!userId && (
              <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                请先 <Link href="/auth/signin" className="font-medium underline">登录</Link> 后使用收藏、进度和证据功能
              </div>
            )}

            <div className="space-y-4">
              <FavoriteButton sceneId={node.scene.id} isFavorited={isFavorited} />
              <ProgressIndicator nodeId={node.id} initialStatus={progressStatus} />
              <EvidenceForm nodeId={node.id} existingEvidence={existingEvidence} />
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <h3 className="text-sm font-semibold text-foreground">能力证据说明</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{node.capabilityEvidence}</p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                {nextNode && (
                  <Link href={`/scenes/${slug}/nodes/${nextNode.slug}`} className="rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                    下一步：{nextNode.title} →
                  </Link>
                )}
                <Link href={`/scenes/${slug}`} className="rounded-full border border-border px-5 py-3 text-center text-sm font-semibold text-foreground hover:border-primary hover:text-primary">
                  返回场景页
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: node.title,
            description: node.objective || node.title,
            isPartOf: {
              '@type': 'Course',
              name: node.scene.title,
            },
            learningResourceType: 'Practice exercise',
            educationalLevel: stageLabels[node.stage.stageType],
          }),
        }}
      />
    </div>
  )
}
