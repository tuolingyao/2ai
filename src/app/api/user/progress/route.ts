// 用户进度 API — GET/POST
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取当前用户的进度列表（含节点和场景信息）
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      nodeId: true,
      status: true,
      completedAt: true,
      node: {
        select: {
          id: true,
          title: true,
          slug: true,
          scene: {
            select: { slug: true, title: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(progress)
}

// 更新节点进度
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { nodeId, status } = await request.json()
  if (!nodeId || !status) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return NextResponse.json({ error: '无效状态' }, { status: 400 })
  }

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_nodeId: { userId: session.user.id, nodeId },
    },
    update: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
    create: {
      userId: session.user.id,
      nodeId,
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
  })

  return NextResponse.json(progress)
}
