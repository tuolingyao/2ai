// 能力证据列表 API — GET/POST
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取当前用户的能力证据列表
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const nodeId = request.nextUrl.searchParams.get('nodeId')

  const evidences = await prisma.capabilityEvidence.findMany({
    where: {
      userId: session.user.id,
      ...(nodeId ? { nodeId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(evidences)
}

// 提交能力证据
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { nodeId, content } = await request.json()
  if (!nodeId || !content) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const evidence = await prisma.capabilityEvidence.create({
    data: {
      userId: session.user.id,
      nodeId,
      content,
    },
  })

  return NextResponse.json(evidence, { status: 201 })
}
