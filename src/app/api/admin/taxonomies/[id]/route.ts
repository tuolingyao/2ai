// 分类标签编辑/删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit, canDelete } from '@/lib/admin-auth'

// 编辑分类标签
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能编辑内容' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.taxonomy.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '标签不存在' }, { status: 404 })
  }

  // 如果修改 slug 或 type，检查唯一性
  if ((body.slug && body.slug !== existing.slug) || (body.type && body.type !== existing.type)) {
    const newType = body.type || existing.type
    const newSlug = body.slug || existing.slug
    const slugExists = await prisma.taxonomy.findUnique({
      where: { type_slug: { type: newType as never, slug: newSlug } },
    })
    if (slugExists && slugExists.id !== id) {
      return NextResponse.json({ error: '同类型下 slug 已存在' }, { status: 409 })
    }
  }

  const taxonomy = await prisma.taxonomy.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      slug: body.slug,
      description: body.description,
      sortOrder: body.sortOrder,
    },
  })

  return NextResponse.json(taxonomy)
}

// 删除分类标签
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  if (!canDelete(user.role)) {
    return NextResponse.json({ error: '仅管理员可删除' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.taxonomy.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '标签不存在' }, { status: 404 })
  }

  await prisma.taxonomy.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
