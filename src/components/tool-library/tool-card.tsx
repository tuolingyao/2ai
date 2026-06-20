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

interface ToolCardProps {
  tool: {
    name: string
    slug: string
    tagline: string
    bestFor: string
    pricing: ToolPricing
    difficulty: ToolDifficulty
    category?: { name: string } | null
  }
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className="group block h-full">
      <article className="scroll-card flex h-full flex-col rounded-3xl p-5 transition duration-300 group-hover:-translate-y-1 group-hover:border-primary">
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

        <h3 className="mt-5 line-clamp-1 text-xl font-bold text-foreground group-hover:text-primary">
          {tool.name}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {tool.tagline}
        </p>
        <p className="mt-4 line-clamp-2 text-xs leading-5 text-muted-foreground">
          适合：{tool.bestFor}
        </p>

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="h-px flex-1 bg-border" />
          <span className="ml-4 text-sm font-semibold text-primary transition group-hover:translate-x-1">
            查看详情 →
          </span>
        </div>
      </article>
    </Link>
  )
}
