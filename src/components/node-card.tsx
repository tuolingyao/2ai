// 学习节点卡片 — 点击跳转到节点详情页
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

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
    <Link href={`/scenes/${node.sceneSlug}/nodes/${node.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <h4 className="font-medium text-zinc-900">{node.title}</h4>
          <p className="mt-1 text-sm text-zinc-500 line-clamp-1">{node.objective}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
