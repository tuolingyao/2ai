// 学习节点卡片 — 点击跳转到节点详情页
import Link from 'next/link'

interface NodeCardProps {
  node: {
    id: string
    title: string
    slug: string
    objective: string
    sceneSlug: string
  }
}

export function NodeCard({ node }: NodeCardProps) {
  return (
    <Link href={`/scenes/${node.sceneSlug}/nodes/${node.slug}`} className="group block h-full">
      <article className="h-full rounded-2xl border border-border bg-background/70 p-5 transition hover:-translate-y-0.5 hover:border-primary hover:bg-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent dark:text-accent-foreground">学习节点</span>
          <span className="text-sm font-semibold text-primary transition group-hover:translate-x-1">进入 →</span>
        </div>
        <h4 className="font-bold text-foreground">{node.title}</h4>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{node.objective}</p>
      </article>
    </Link>
  )
}
