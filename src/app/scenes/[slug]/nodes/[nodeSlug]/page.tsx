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
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ===== 面包屑导航 ===== */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900">首页</Link>
        <span>/</span>
        <Link href="/scenes" className="hover:text-zinc-900">场景库</Link>
        <span>/</span>
        <Link href={`/scenes/${slug}`} className="hover:text-zinc-900">{node.scene.title}</Link>
        <span>/</span>
        <span className="text-zinc-900">{node.title}</span>
      </nav>

      {/* ===== 顶部 ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-zinc-900">{node.title}</h1>
          <Badge variant="secondary">{stageLabels[node.stage.stageType]}</Badge>
        </div>
      </div>

      {/* ===== 节点内容 ===== */}
      <div className="space-y-6">
        {/* 学习目标 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">学习目标</h2>
          <p className="text-zinc-800">{node.objective}</p>
        </section>

        {/* 前置条件 */}
        {node.prerequisites && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-700">前置条件</h2>
            <p className="text-zinc-600">{node.prerequisites}</p>
          </section>
        )}

        {/* 为什么先学这个 */}
        {node.whyFirst && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-700">为什么先学这个</h2>
            <p className="text-zinc-600">{node.whyFirst}</p>
          </section>
        )}

        {/* 关键概念 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">关键概念</h2>
          <p className="text-zinc-600">{node.keyConcepts}</p>
        </section>

        {/* 方法重点 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">方法重点</h2>
          <p className="text-zinc-800">{node.methodFocus}</p>
        </section>

        {/* AI 对话示范 */}
        {node.dialogueExamples.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">AI 对话示范</h2>
            <div className="space-y-4">
              {node.dialogueExamples.map((d) => (
                <AiDialogue key={d.id} dialogue={d} />
              ))}
            </div>
          </section>
        )}

        {/* 练习任务 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">练习任务</h2>
          <p className="text-zinc-800">{node.practiceTask}</p>
        </section>

        {/* 工具建议（后置展示） */}
        {node.toolGuidances.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">工具建议</h2>
            <div className="space-y-3">
              {node.toolGuidances.map((g) => (
                <ToolGuidanceCard key={g.id} guidance={g} />
              ))}
            </div>
          </section>
        )}

        {/* 常见错误 */}
        {node.commonMistakes && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-700">常见错误</h2>
            <p className="text-zinc-600">{node.commonMistakes}</p>
          </section>
        )}

        {/* 通关标准 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">通关标准</h2>
          <p className="text-zinc-800">{node.passCriteria}</p>
        </section>

        {/* 能力证据说明 */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">能力证据</h2>
          <p className="text-zinc-600">{node.capabilityEvidence}</p>
        </section>
      </div>

      {/* ===== 交互区域 ===== */}
      <div className="mt-10 rounded-lg border bg-zinc-50 p-6">
        {!userId && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            请先 <Link href="/auth/signin" className="font-medium underline">登录</Link> 后使用收藏、进度和证据功能
          </div>
        )}

        <div className="space-y-6">
          {/* 收藏 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-700">收藏场景</h3>
            <FavoriteButton sceneId={node.scene.id} isFavorited={isFavorited} />
          </div>

          {/* 进度 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-700">学习进度</h3>
            <ProgressIndicator nodeId={node.id} initialStatus={progressStatus} />
          </div>

          {/* 能力证据提交 */}
          <div>
            <EvidenceForm nodeId={node.id} existingEvidence={existingEvidence} />
          </div>
        </div>
      </div>

      {/* ===== 底部导航 ===== */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          href={`/scenes/${slug}`}
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          &larr; 返回场景页
        </Link>
        {nextNode && (
          <Link
            href={`/scenes/${slug}/nodes/${nextNode.slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            下一步：{nextNode.title} &rarr;
          </Link>
        )}
      </div>

      {/* ===== JSON-LD 结构化数据 ===== */}
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
