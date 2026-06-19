// AI 对话示范编辑/删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit, canDelete } from '@/lib/admin-auth'

// 编辑对话示范
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能编辑内容' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.aiDialogueExample.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '对话示范不存在' }, { status: 404 })
  }

  const dialogue = await prisma.aiDialogueExample.update({
    where: { id },
    data: {
      toolChoice: body.toolChoice,
      prompt: body.prompt,
      aiFollowUp: body.aiFollowUp,
      userSupplement: body.userSupplement,
      aiOutput: body.aiOutput,
      checkList: body.checkList,
      sortOrder: body.sortOrder,
    },
  })

  return NextResponse.json(dialogue)
}

// 删除对话示范
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

  const existing = await prisma.aiDialogueExample.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '对话示范不存在' }, { status: 404 })
  }

  await prisma.aiDialogueExample.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
