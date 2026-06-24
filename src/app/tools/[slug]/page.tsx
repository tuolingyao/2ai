import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ToolCard } from '@/components/tool-library/tool-card'
import { RelatedScenes } from '@/components/tool-library/related-scenes'
import { StarRating } from '@/components/tool-library/star-rating'

const pricingLabels = {
  FREE: '免费',
  FREEMIUM: '免费增值',
  PAID: '付费',
} as const

const difficultyLabels = {
  BEGINNER: '入手难度 低',
  INTERMEDIATE: '入手难度 中',
  ADVANCED: '入手难度 高',
} as const

const accessRegionLabels = {
  DOMESTIC: '境内可用',
  OVERSEAS: '境外可用',
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = await prisma.aiTool.findUnique({
    where: { slug },
    select: { name: true, tagline: true, seoTitle: true, seoDescription: true, publishStatus: true, logoUrl: true },
  })

  if (!tool || tool.publishStatus !== 'PUBLISHED') return { title: '工具未找到' }

  return {
    title: tool.seoTitle || `${tool.name} — AI 工具库`,
    description: tool.seoDescription || tool.tagline,
  }
}

function parseItems(text: string): string[] {
  return text.split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
}

function parsePromptExamples(text: string): { label: string; content: string }[] {
  const blocks = text.split(/【场景\d+[:：]/).filter(Boolean)
  return blocks.map((block) => {
    const labelEnd = block.indexOf('】')
    if (labelEnd === -1) return { label: '提示词', content: block.trim() }
    return { label: block.slice(0, labelEnd).trim(), content: block.slice(labelEnd + 1).trim() }
  })
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
    orderBy: { sortOrder: 'asc' },
    take: 4,
    select: {
      name: true,
      slug: true,
      tagline: true,
      bestFor: true,
      pricing: true,
      difficulty: true,
      accessRegion: true,
      category: { select: { name: true } },
      recommendationScore: true,
      logoUrl: true,
    },
  })

  const bestForItems = parseItems(tool.bestFor)
  const notForItems = tool.notFor ? parseItems(tool.notFor) : []
  const whyRecItems = parseItems(tool.whyRecommended)
  const quickStartSteps = parseItems(tool.quickStart)
  const promptExamples = tool.promptExample ? parsePromptExamples(tool.promptExample) : []

  return (
    <div className="min-h-screen bg-background">
      <section className="ink-gradient rice-paper border-b border-border px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="seal-stamp rounded-sm bg-background/70 text-sm">{tool.category.name}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{pricingLabels[tool.pricing]}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{difficultyLabels[tool.difficulty]}</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{accessRegionLabels[tool.accessRegion]}</span>
              {tool.recommendationScore && (
                <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  <StarRating score={tool.recommendationScore} size="sm" />
                  {tool.recommendationScore}/5
                </span>
              )}
            </div>
            <div className="mt-6 flex items-center gap-3">
              {tool.logoUrl && (
                <Image src={tool.logoUrl} alt={`${tool.name} Logo`} width={36} height={36} className="h-9 w-9 flex-shrink-0 rounded object-contain" />
              )}
              <h1 className="text-4xl font-black leading-tight text-foreground sm:text-6xl">{tool.name}</h1>
            </div>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{tool.tagline}</p>
          </div>
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            访问官网
          </a>
        </div>
      </section>

      <main className="px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">适合做什么</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {bestForItems.map((item, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {notForItems.length > 0 && (
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold text-foreground">不适合做什么</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {notForItems.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-6 text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">为什么推荐</h2>
              <div className="mt-4 space-y-3">
                {whyRecItems.map((item, i) => (
                  <div key={i} className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">快速上手</h2>
              <div className="mt-4 space-y-3">
                {quickStartSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </section>

            {promptExamples.length > 0 && (
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold text-foreground">示例提示词</h2>
                <div className="mt-4 space-y-4">
                  {promptExamples.map((ex, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-muted/50 p-4">
                      <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{ex.label}</span>
                      <pre className="whitespace-pre-wrap text-sm leading-7 text-foreground">{ex.content}</pre>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <RelatedScenes scenes={relatedScenes} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">工具说明</h2>
              <div className="mt-4 space-y-3">
                {tool.description.split('。').filter(Boolean).map((sentence, i) => (
                  <div key={i} className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span>{sentence.trim()}。</span>
                  </div>
                ))}
              </div>
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
