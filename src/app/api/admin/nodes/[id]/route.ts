// 后台节点详情/编辑/删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit, canDelete } from '@/lib/admin-auth'

// 编辑节点
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能编辑内容' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.learningNode.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '节点不存在' }, { status: 404 })
  }

  // 如果修改 slug，检查同场景唯一性
  if (body.slug && body.slug !== existing.slug) {
    const slugExists = await prisma.learningNode.findFirst({
      where: { sceneId: existing.sceneId, slug: body.slug, id: { not: id } },
    })
    if (slugExists) {
      return NextResponse.json({ error: '同场景下 slug 已存在' }, { status: 409 })
    }
  }

  const node = await prisma.learningNode.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      objective: body.objective,
      prerequisites: body.prerequisites,
      whyFirst: body.whyFirst,
      keyConcepts: body.keyConcepts,
      methodFocus: body.methodFocus,
      practiceTask: body.practiceTask,
      commonMistakes: body.commonMistakes,
      passCriteria: body.passCriteria,
      capabilityEvidence: body.capabilityEvidence,
      nextNodeId: body.nextNodeId,
      stageId: body.stageId,
      sortOrder: body.sortOrder,
    },
  })

  return NextResponse.json(node)
}

// 删除节点
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  // 只有 ADMIN 可以删除
  if (!canDelete(user.role)) {
    return NextResponse.json({ error: '仅管理员可删除节点' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.learningNode.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '节点不存在' }, { status: 404 })
  }

  // 清除指向此节点的 nextNodeId 引用
  await prisma.learningNode.updateMany({
    where: { nextNodeId: id },
    data: { nextNodeId: null },
  })

  await prisma.learningNode.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
