import Link from 'next/link'
import type { ToolDifficulty, ToolPricing } from '@prisma/client'

const pricingLabels: Record<ToolPricing, string> = {
  FREE: '免费',
  FREEMIUM: '免费增值',
  PAID: '付费',
}

const difficultyLabels: Record<ToolDifficulty, string> = {
  BEGINNER: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
}

interface RelatedToolsProps {
  tools: {
    name: string
    slug: string
    tagline: string
    pricing: ToolPricing
    difficulty: ToolDifficulty
    category?: { name: string } | null
  }[]
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">相关 AI 工具</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group block">
            <article className="scroll-card rounded-2xl p-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-primary">
              <div className="flex flex-wrap items-center gap-2">
                {tool.category?.name && (
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent dark:text-accent-foreground">
                    {tool.category.name}
                  </span>
                )}
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {pricingLabels[tool.pricing]}
                </span>
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {difficultyLabels[tool.difficulty]}
                </span>
              </div>
              <h3 className="mt-4 line-clamp-1 font-semibold text-foreground group-hover:text-primary">
                {tool.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{tool.tagline}</p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
