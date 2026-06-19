// 后台场景详情/编辑/删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canDelete, canPublish } from '@/lib/admin-auth'

// 获取场景详情（含阶段、节点、分类标签）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { id } = await params
  const scene = await prisma.scene.findUnique({
    where: { id },
    include: {
      stages: {
        orderBy: { sortOrder: 'asc' },
        include: {
          nodes: { orderBy: { sortOrder: 'asc' } },
        },
      },
      nodes: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, title: true, slug: true, stageId: true, sortOrder: true },
      },
      taxonomies: {
        include: { taxonomy: { select: { id: true, name: true, type: true } } },
      },
    },
  })

  if (!scene) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  return NextResponse.json(scene)
}

// 编辑场景
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  // 检查场景存在
  const existing = await prisma.scene.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  // REVIEWER 角色只能修改 publishStatus 和 isRecommended
  if (user.role === 'REVIEWER') {
    const allowedFields = ['publishStatus', 'isRecommended']
    const bodyFields = Object.keys(body).filter(k => body[k] !== undefined)
    const hasDisallowedField = bodyFields.some(k => !allowedFields.includes(k))
    if (hasDisallowedField) {
      return NextResponse.json({ error: '审核员仅可修改发布状态和推荐标记' }, { status: 403 })
    }
    // REVIEWER 修改 publishStatus 需要 canPublish 权限
    if (body.publishStatus && !canPublish(user.role)) {
      return NextResponse.json({ error: '无发布权限' }, { status: 403 })
    }
    const updateData: Record<string, unknown> = {}
    if (body.publishStatus !== undefined) updateData.publishStatus = body.publishStatus
    if (body.isRecommended !== undefined) updateData.isRecommended = body.isRecommended
    if (body.publishStatus === 'PUBLISHED' && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }
    const scene = await prisma.scene.update({ where: { id }, data: updateData })
    return NextResponse.json(scene)
  }

  // EDITOR 角色不能将 publishStatus 改为 PUBLISHED
  if (user.role === 'EDITOR') {
    if (body.publishStatus === 'PUBLISHED' && !canPublish(user.role)) {
      return NextResponse.json({ error: '编辑不能直接发布场景，请提交审核' }, { status: 403 })
    }
  }

  // 如果修改 slug，检查唯一性
  if (body.slug && body.slug !== existing.slug) {
    const slugExists = await prisma.scene.findUnique({ where: { slug: body.slug } })
    if (slugExists) {
      return NextResponse.json({ error: 'slug 已存在' }, { status: 409 })
    }
  }

  const scene = await prisma.scene.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      suitableFor: body.suitableFor,
      notSuitableFor: body.notSuitableFor,
      coverImage: body.coverImage,
      sortOrder: body.sortOrder,
      isRecommended: body.isRecommended,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      publishStatus: body.publishStatus,
      publishedAt: body.publishStatus === 'PUBLISHED' && !existing.publishedAt
        ? new Date()
        : existing.publishedAt,
    },
  })

  return NextResponse.json(scene)
}

// 删除场景（级联删除由 Prisma schema 的 onDelete: Cascade 处理）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  // 只有 ADMIN 可以删除
  if (!canDelete(user.role)) {
    return NextResponse.json({ error: '仅管理员可删除场景' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.scene.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  await prisma.scene.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
