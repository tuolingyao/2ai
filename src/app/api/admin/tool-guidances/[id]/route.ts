// 工具建议编辑/删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit, canDelete } from '@/lib/admin-auth'

// 编辑工具建议
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能编辑内容' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.toolGuidance.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '工具建议不存在' }, { status: 404 })
  }

  const guidance = await prisma.toolGuidance.update({
    where: { id },
    data: {
      currentTool: body.currentTool,
      currentToolUsage: body.currentToolUsage,
      betterTool: body.betterTool,
      betterToolUsage: body.betterToolUsage,
      migrationTrigger: body.migrationTrigger,
      stageId: body.stageId,
      nodeId: body.nodeId,
      sortOrder: body.sortOrder,
    },
  })

  return NextResponse.json(guidance)
}

// 删除工具建议
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

  const existing = await prisma.toolGuidance.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '工具建议不存在' }, { status: 404 })
  }

  await prisma.toolGuidance.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
