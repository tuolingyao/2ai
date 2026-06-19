// 场景库页 — 搜索 + 筛选 + 排序 + 场景卡片网格 + 分页
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SceneCard } from '@/components/scene-card'
import { SearchBar } from '@/components/search-bar'
import { FilterPanel } from '@/components/filter-panel'

export const metadata: Metadata = {
  title: '场景库 — AI之翼',
  description: '浏览所有 AI 学习场景，找到适合你的学习路径',
}

interface ScenesPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    capability?: string
    tool?: string
    sort?: string
    page?: string
  }>
}

export default async function ScenesPage({ searchParams }: ScenesPageProps) {
  const params = await searchParams
  const q = params.q || ''
  const category = params.category || ''
  const sort = params.sort || 'recommended'
  const page = Math.max(1, parseInt(params.page || '1'))
  const pageSize = 12

  // 构建查询条件
  const where: Record<string, unknown> = {
    publishStatus: 'PUBLISHED',
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.taxonomies = {
      some: {
        taxonomy: { type: 'CATEGORY', slug: category },
      },
    }
  }

  // 排序
  const orderBy: Record<string, unknown>[] = []
  if (sort === 'recommended') {
    orderBy.push({ isRecommended: 'desc' })
  }
  orderBy.push({ publishedAt: 'desc' })

  // 查询
  const [scenes, total] = await Promise.all([
    prisma.scene.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        taxonomies: {
          include: {
            taxonomy: {
              select: { name: true, type: true },
            },
          },
        },
      },
    }),
    prisma.scene.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  // 构建分页链接
  function getPageUrl(pageNum: number) {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (category) p.set('category', category)
    if (sort !== 'recommended') p.set('sort', sort)
    p.set('page', String(pageNum))
    return `/scenes?${p.toString()}`
  }

  function getSortUrl(sortVal: string) {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (category) p.set('category', category)
    p.set('sort', sortVal)
    return `/scenes?${p.toString()}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">场景库</h1>

      {/* 搜索栏 */}
      <div className="mb-4">
        <SearchBar />
      </div>

      {/* 筛选面板 + 排序 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterPanel />
        <div className="flex gap-2 text-sm">
          <Link
            href={getSortUrl('recommended')}
            className={`rounded-md px-3 py-1 ${
              sort === 'recommended'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            推荐优先
          </Link>
          <Link
            href={getSortUrl('newest')}
            className={`rounded-md px-3 py-1 ${
              sort === 'newest'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            最新
          </Link>
        </div>
      </div>

      {/* 场景卡片网格 */}
      {scenes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-500">
          没有找到匹配的场景
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link
              href={getPageUrl(page - 1)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              上一页
            </Link>
          ) : (
            <span className="rounded-md border px-4 py-2 text-sm text-zinc-300">
              上一页
            </span>
          )}
          <span className="text-sm text-zinc-600">
            第 {page} / {totalPages} 页（共 {total} 个场景）
          </span>
          {page < totalPages ? (
            <Link
              href={getPageUrl(page + 1)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              下一页
            </Link>
          ) : (
            <span className="rounded-md border px-4 py-2 text-sm text-zinc-300">
              下一页
            </span>
          )}
        </div>
      )}
    </div>
  )
}
