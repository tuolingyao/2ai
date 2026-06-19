// 场景卡片组件 — 在首页和场景库复用
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <Link href={`/scenes/${scene.slug}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        {/* 封面图或渐变占位 */}
        <div className="aspect-video w-full overflow-hidden">
          {scene.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scene.coverImage}
              alt={scene.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500" />
          )}
        </div>

        <CardContent className="p-4">
          {/* 标题 */}
          <h3 className="mb-1 text-lg font-semibold text-zinc-900 line-clamp-1">
            {scene.title}
          </h3>

          {/* 摘要 */}
          <p className="mb-2 text-sm text-zinc-600 line-clamp-2">
            {scene.summary}
          </p>

          {/* 适合人群 */}
          <p className="mb-3 text-xs text-zinc-500">
            适合：{scene.suitableFor}
          </p>

          {/* 分类标签 */}
          {scene.taxonomies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {scene.taxonomies.map((t, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {t.taxonomy.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
