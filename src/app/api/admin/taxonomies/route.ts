// 分类标签列表/新建 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

// 获取分类标签列表（支持按 type 筛选）
export async function GET(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const type = request.nextUrl.searchParams.get('type')
  const where = type ? { type: type as never } : {}

  const taxonomies = await prisma.taxonomy.findMany({
    where,
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    include: {
      _count: { select: { scenes: true } },
    },
  })

  return NextResponse.json(taxonomies)
}

// 新建分类标签
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const { name, type, slug } = body

  if (!name || !type || !slug) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // 检查同类型 slug 唯一性
  const existing = await prisma.taxonomy.findUnique({
    where: { type_slug: { type: type as never, slug } },
  })
  if (existing) {
    return NextResponse.json({ error: '同类型下 slug 已存在' }, { status: 409 })
  }

  const taxonomy = await prisma.taxonomy.create({
    data: {
      name,
      type: type as never,
      slug,
      description: body.description || null,
      sortOrder: body.sortOrder ?? 0,
    },
  })

  return NextResponse.json(taxonomy, { status: 201 })
}
