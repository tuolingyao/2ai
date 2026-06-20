import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ToolCard } from '@/components/tool-library/tool-card'
import { RelatedScenes } from '@/components/tool-library/related-scenes'

const pricingLabels = {
  FREE: '免费',
  FREEMIUM: '免费增值',
  PAID: '付费',
} as const

const difficultyLabels = {
  BEGINNER: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = await prisma.aiTool.findUnique({
    where: { slug },
    select: { name: true, tagline: true, seoTitle: true, seoDescription: true, publishStatus: true },
  })

  if (!tool || tool.publishStatus !== 'PUBLISHED') return { title: '工具未找到' }

  return {
    title: tool.seoTitle || `${tool.name} — AI 工具库`,
    description: tool.seoDescription || tool.tagline,
  }
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tool = await prisma.aiTool.findUnique({
    where: { slug },
    include: {
      category: true,
      scenes: {
        include: {
          scene: {
            select: { title: true, slug: true, summary: true, publishStatus: true },
          },
        },
      },
    },
  })

  if (!tool || tool.publishStatus !== 'PUBLISHED') notFound()

  const relatedScenes = tool.scenes.filter(({ scene }) => scene.publishStatus === 'PUBLISHED')
  const siblingTools = await prisma.aiTool.findMany({
    where: {
      categoryId: tool.categoryId,
      publishStatus: 'PUBLISHED',
      NOT: { id: tool.id },
    },
    include: { category: { select: { name: true } } },
    orderBy: { sortOrder: 'asc' },
    take: 4,
  })

  const quickStartSteps = tool.quickStart.split('\n').filter(Boolean)

  return (
    <div className="min-h-screen bg-background">
      <section className="ink-gradient rice-paper border-b border-border px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <span className="seal-stamp rounded-sm bg-background/70 text-xs">{tool.category.name}</span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-foreground sm:text-6xl">{tool.name}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{tool.tagline}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{pricingLabels[tool.pricing]}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{difficultyLabels[tool.difficulty]}</span>
            </div>
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              访问官网
            </a>
          </div>
        </div>
      </section>

      <main className="px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">适合做什么</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{tool.bestFor}</p>
            </section>

            {tool.notFor && (
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold text-foreground">不适合做什么</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{tool.notFor}</p>
              </section>
            )}

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">为什么推荐</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{tool.whyRecommended}</p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">三步上手</h2>
              <ol className="mt-4 space-y-3">
                {quickStartSteps.map((step) => (
                  <li key={step} className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            {tool.promptExample && (
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold text-foreground">示例提示词</h2>
                <div className="mt-4 rounded-2xl border border-border bg-muted p-4 text-sm leading-7 text-foreground">
                  {tool.promptExample}
                </div>
              </section>
            )}

            <RelatedScenes scenes={relatedScenes} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">工具说明</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.description}</p>
            </div>
            {siblingTools.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-foreground">同类工具</h2>
                <div className="space-y-3">
                  {siblingTools.map((sibling) => (
                    <ToolCard key={sibling.slug} tool={sibling} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
