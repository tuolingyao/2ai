import type { ToolAccessRegion, ToolDifficulty, ToolPricing } from '@prisma/client'
import { ToolCard } from './tool-card'

interface ToolCategorySectionProps {
  category: {
    name: string
    slug: string
    description: string
    tools: {
      name: string
      slug: string
      tagline: string
      bestFor: string
      pricing: ToolPricing
      difficulty: ToolDifficulty
      accessRegion: ToolAccessRegion
      category?: { name: string } | null
      logoUrl?: string | null
    }[]
  }
}

export function ToolCategorySection({ category }: ToolCategorySectionProps) {
  return (
    <section id={category.slug} className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="seal-stamp rounded-sm bg-background/70 text-xs">工具分类</span>
          <h2 className="mt-3 text-2xl font-black text-foreground sm:text-3xl">{category.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description}</p>
        </div>
        <span className="text-sm text-muted-foreground">精选 {category.tools.length} 个</span>
      </div>

      {category.tools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {category.tools.map((tool) => (
            <ToolCard key={tool.slug} tool={{ ...tool, category: { name: category.name } }} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          这个分类暂时还没有精选工具，后续会按真实任务逐步补充。
        </div>
      )}
    </section>
  )
}
