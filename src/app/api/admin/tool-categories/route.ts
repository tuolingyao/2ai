import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const categories = await prisma.aiToolCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { tools: true } } },
  })

  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const { name, slug, description } = body

  if (!name || !slug || !description) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  const category = await prisma.aiToolCategory.upsert({
    where: { slug },
    update: {
      name,
      description,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: Boolean(body.isActive),
    },
    create: {
      name,
      slug,
      description,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive ?? true,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
