// 工具建议列表/新建 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

// 获取工具建议列表（按 sceneId/stageId/nodeId 筛选）
export async function GET(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { searchParams } = request.nextUrl
  const sceneId = searchParams.get('sceneId')
  const stageId = searchParams.get('stageId')
  const nodeId = searchParams.get('nodeId')

  const where: Record<string, unknown> = {}
  if (sceneId) where.sceneId = sceneId
  if (stageId) where.stageId = stageId
  if (nodeId) where.nodeId = nodeId

  const guidances = await prisma.toolGuidance.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: {
      scene: { select: { id: true, title: true } },
      stage: { select: { id: true, stageType: true } },
      node: { select: { id: true, title: true } },
    },
  })

  return NextResponse.json(guidances)
}

// 新建工具建议
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const { sceneId, currentTool, currentToolUsage } = body

  if (!sceneId || !currentTool || !currentToolUsage) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // 检查场景存在
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } })
  if (!scene) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  const guidance = await prisma.toolGuidance.create({
    data: {
      sceneId,
      stageId: body.stageId || null,
      nodeId: body.nodeId || null,
      currentTool,
      currentToolUsage,
      betterTool: body.betterTool || null,
      betterToolUsage: body.betterToolUsage || null,
      migrationTrigger: body.migrationTrigger || null,
      sortOrder: body.sortOrder ?? 0,
    },
  })

  return NextResponse.json(guidance, { status: 201 })
}
