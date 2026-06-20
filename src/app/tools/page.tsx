import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ToolCategorySection } from '@/components/tool-library/tool-category-section'

export const metadata: Metadata = {
  title: 'AI 工具库 — AI之翼',
  description: '按真实任务场景精选 AI 工具，每个领域只推荐少量高价值工具，帮助你快速找到适合当前任务的 AI 工具。',
}

export default async function ToolsPage() {
  const categories = await prisma.aiToolCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      tools: {
        where: {
          publishStatus: 'PUBLISHED',
          isTop: true,
        },
        orderBy: { sortOrder: 'asc' },
        take: 5,
      },
    },
  })

  const hasTools = categories.some((category) => category.tools.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <section className="ink-gradient rice-paper border-b border-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="seal-stamp rounded-sm bg-background/70 text-xs">AI 工具库</span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-foreground sm:text-6xl">
              按任务找 AI 工具，而不是逛工具大全
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              每个分类只展示少量高价值工具，帮你从写作、研究、办公、编程、设计到自动化任务中快速找到合适入口。
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl space-y-14">
          {hasTools ? (
            categories.map((category) => (
              <ToolCategorySection key={category.slug} category={category} />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <h2 className="text-2xl font-bold text-foreground">工具库正在整理中</h2>
              <p className="mt-3 text-sm text-muted-foreground">精选工具会按真实任务陆续上线。</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
