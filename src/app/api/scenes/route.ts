// 场景列表 API — 支持搜索、筛选、排序、分页
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const capability = searchParams.get('capability') || ''
  const tool = searchParams.get('tool') || ''
  const sort = searchParams.get('sort') || 'recommended'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')))

  // 构建查询条件
  const where: Record<string, unknown> = {
    publishStatus: 'PUBLISHED',
  }

  // 关键词搜索
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } },
    ]
  }

  // 分类标签筛选
  if (category || capability || tool) {
    const taxonomyFilters: Record<string, unknown>[] = []
    if (category) taxonomyFilters.push({ taxonomy: { type: 'CATEGORY', slug: category } })
    if (capability) taxonomyFilters.push({ taxonomy: { type: 'CAPABILITY_TAG', slug: capability } })
    if (tool) taxonomyFilters.push({ taxonomy: { type: 'TOOL_TAG', slug: tool } })

    where.taxonomies = {
      some: {
        OR: taxonomyFilters,
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
              select: { name: true, type: true, slug: true },
            },
          },
        },
      },
    }),
    prisma.scene.count({ where }),
  ])

  return NextResponse.json({
    scenes,
    total,
    page,
    pageSize,
  })
}
