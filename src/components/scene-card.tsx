// 场景卡片组件 — 在首页和场景库复用
import Link from 'next/link'

interface SceneCardProps {
  scene: {
    slug: string
    title: string
    summary: string
    suitableFor: string
    coverImage: string | null
    taxonomies: { taxonomy: { name: string; type: string } }[]
  }
}

export function SceneCard({ scene }: SceneCardProps) {
  return (
    <Link href={`/scenes/${scene.slug}`} className="group block h-full">
      <article className="scroll-card flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-primary/10">
        <div className="relative aspect-video w-full overflow-hidden ink-gradient">
          {scene.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scene.coverImage}
              alt={scene.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rice-paper">
              <span className="seal-stamp rounded-sm bg-background/70 text-sm">AI之翼</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {scene.taxonomies.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent dark:text-accent-foreground"
              >
                {t.taxonomy.name}
              </span>
            ))}
          </div>

          <h3 className="line-clamp-1 text-xl font-bold text-foreground group-hover:text-primary">
            {scene.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {scene.summary}
          </p>
          <p className="mt-4 line-clamp-1 text-xs text-muted-foreground">
            适合：{scene.suitableFor}
          </p>

          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="h-px flex-1 bg-border" />
            <span className="ml-4 text-sm font-semibold text-primary transition group-hover:translate-x-1">
              开始路径 →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
