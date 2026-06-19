// 场景库页 — 场景探索台 + 搜索筛选 + 排序分页
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

  const orderBy: Record<string, unknown>[] = []
  if (sort === 'recommended') {
    orderBy.push({ isRecommended: 'desc' })
  }
  orderBy.push({ publishedAt: 'desc' })

  const [scenes, total, publishedTotal] = await Promise.all([
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
    prisma.scene.count({ where: { publishStatus: 'PUBLISHED' } }),
  ])

  const totalPages = Math.ceil(total / pageSize)

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
    <div className="min-h-screen">
      <section className="ink-gradient rice-paper border-b border-border py-14">
        <div className="mx-auto max-w-7xl px-4">
          <span className="seal-stamp rounded-sm bg-background/60 text-xs">探索台</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-wide text-foreground sm:text-5xl">场景探索台</h1>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                按任务、能力和使用场景筛选学习路径，从真实问题进入 AI 实践。
              </p>
            </div>
            <div className="scroll-card rounded-3xl p-5">
              <p className="text-sm text-muted-foreground">已发布场景</p>
              <p className="mt-2 text-4xl font-black text-primary">{publishedTotal}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="scroll-card h-fit rounded-3xl p-5 lg:sticky lg:top-24">
          <SearchBar />
          <div className="my-6 h-px bg-border" />
          <FilterPanel />
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">当前找到</p>
              <p className="text-xl font-bold text-foreground">{total} 个学习场景</p>
            </div>
            <div className="flex gap-2 text-sm">
              <Link
                href={getSortUrl('recommended')}
                className={`rounded-full px-4 py-2 ${
                  sort === 'recommended'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-primary'
                }`}
              >
                推荐优先
              </Link>
              <Link
                href={getSortUrl('newest')}
                className={`rounded-full px-4 py-2 ${
                  sort === 'newest'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-primary'
                }`}
              >
                最新
              </Link>
            </div>
          </div>

          {scenes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {scenes.map((scene) => (
                <SceneCard key={scene.id} scene={scene} />
              ))}
            </div>
          ) : (
            <div className="scroll-card rounded-[2rem] px-6 py-20 text-center">
              <span className="seal-stamp rounded-sm text-xs">空卷</span>
              <h2 className="mt-6 text-2xl font-bold text-foreground">墨迹未落，暂未寻得匹配场景</h2>
              <p className="mt-3 text-muted-foreground">换一个关键词，或收起分类筛选再试一次。</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {page > 1 ? (
                <Link href={getPageUrl(page - 1)} className="rounded-full border border-border px-5 py-2 text-sm text-foreground hover:border-primary hover:text-primary">
                  上一页
                </Link>
              ) : (
                <span className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground opacity-50">上一页</span>
              )}
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页（共 {total} 个场景）
              </span>
              {page < totalPages ? (
                <Link href={getPageUrl(page + 1)} className="rounded-full border border-border px-5 py-2 text-sm text-foreground hover:border-primary hover:text-primary">
                  下一页
                </Link>
              ) : (
                <span className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground opacity-50">下一页</span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
