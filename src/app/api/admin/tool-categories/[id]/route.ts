import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canDelete, canEdit } from '@/lib/admin-auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能编辑分类' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { name, slug, description } = body

  if (!name || !slug || !description) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  const conflict = await prisma.aiToolCategory.findFirst({
    where: { slug, NOT: { id } },
  })
  if (conflict) return NextResponse.json({ error: 'slug 已存在' }, { status: 409 })

  const category = await prisma.aiToolCategory.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive ?? true,
    },
  })

  return NextResponse.json(category)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canDelete(user.role)) return NextResponse.json({ error: '仅管理员可删除分类' }, { status: 403 })

  const { id } = await params
  const toolCount = await prisma.aiTool.count({ where: { categoryId: id } })
  if (toolCount > 0) {
    return NextResponse.json({ error: '分类下存在工具，不能删除' }, { status: 409 })
  }

  await prisma.aiToolCategory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
