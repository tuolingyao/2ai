// AI 对话示范列表/新建 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

// 获取对话示范列表（按 nodeId 筛选）
export async function GET(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const nodeId = request.nextUrl.searchParams.get('nodeId')
  const where = nodeId ? { nodeId } : {}

  const dialogues = await prisma.aiDialogueExample.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(dialogues)
}

// 新建对话示范
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const { nodeId, toolChoice, prompt, aiOutput, checkList } = body

  if (!nodeId || !toolChoice || !prompt || !aiOutput || !checkList) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // 检查节点存在
  const node = await prisma.learningNode.findUnique({ where: { id: nodeId } })
  if (!node) {
    return NextResponse.json({ error: '节点不存在' }, { status: 404 })
  }

  const dialogue = await prisma.aiDialogueExample.create({
    data: {
      nodeId,
      toolChoice,
      prompt,
      aiFollowUp: body.aiFollowUp || null,
      userSupplement: body.userSupplement || null,
      aiOutput,
      checkList,
      sortOrder: body.sortOrder ?? 0,
    },
  })

  return NextResponse.json(dialogue, { status: 201 })
}
