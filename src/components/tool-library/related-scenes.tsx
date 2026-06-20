import Link from 'next/link'

interface RelatedScenesProps {
  scenes: {
    scene: {
      title: string
      slug: string
      summary: string
    }
  }[]
}

export function RelatedScenes({ scenes }: RelatedScenesProps) {
  if (scenes.length === 0) return null

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">关联学习场景</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {scenes.map(({ scene }) => (
          <Link
            key={scene.slug}
            href={`/scenes/${scene.slug}`}
            className="rounded-2xl border border-border bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary"
          >
            <h3 className="font-semibold text-foreground">{scene.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{scene.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
