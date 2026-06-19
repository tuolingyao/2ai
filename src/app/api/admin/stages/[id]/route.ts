// 后台阶段详情/编辑/删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit, canDelete } from '@/lib/admin-auth'

// 编辑阶段
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能编辑内容' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.stage.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '阶段不存在' }, { status: 404 })
  }

  const stage = await prisma.stage.update({
    where: { id },
    data: {
      capabilityStd: body.capabilityStd,
      learningFocus: body.learningFocus,
      practiceTask: body.practiceTask,
      capabilityEvidence: body.capabilityEvidence,
      aiIntervention: body.aiIntervention,
      commonFailure: body.commonFailure,
      remedialAction: body.remedialAction,
      sortOrder: body.sortOrder,
    },
  })

  return NextResponse.json(stage)
}

// 删除阶段
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  // 只有 ADMIN 可以删除
  if (!canDelete(user.role)) {
    return NextResponse.json({ error: '仅管理员可删除阶段' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.stage.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '阶段不存在' }, { status: 404 })
  }

  await prisma.stage.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
