// 阶段完成状态 API — 查询当前用户在每个阶段的完成状态
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sceneId = searchParams.get('sceneId')

  if (!sceneId) {
    return NextResponse.json({ error: '缺少 sceneId' }, { status: 400 })
  }

  // 查询场景的所有阶段和节点
  const stages = await prisma.stage.findMany({
    where: { sceneId },
    orderBy: { sortOrder: 'asc' },
    include: {
      nodes: { select: { id: true } },
    },
  })

  // 查询用户已完成的节点
  const completedProgress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      status: 'COMPLETED',
      node: { stage: { sceneId } },
    },
    select: { nodeId: true },
  })
  const completedNodeIds = new Set(completedProgress.map((p) => p.nodeId))

  // 查询用户进行中的节点
  const inProgressNodes = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      status: 'IN_PROGRESS',
      node: { stage: { sceneId } },
    },
    select: { nodeId: true },
  })
  const inProgressNodeIds = new Set(inProgressNodes.map((p) => p.nodeId))

  // 计算每个阶段的完成状态
  const result = stages.map((stage) => {
    const totalNodes = stage.nodes.length
    const completedNodes = stage.nodes.filter((n) => completedNodeIds.has(n.id)).length
    const inProgressCount = stage.nodes.filter((n) => inProgressNodeIds.has(n.id)).length

    return {
      stageId: stage.id,
      sceneId,
      stageType: stage.stageType,
      totalNodes,
      completedNodes,
      inProgressCount,
      isCompleted: totalNodes > 0 && completedNodes === totalNodes,
    }
  })

  return NextResponse.json(result)
}
