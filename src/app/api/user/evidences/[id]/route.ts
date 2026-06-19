// 单条能力证据 API — PUT/DELETE
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 修改能力证据
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { id } = await params
  const { content } = await request.json()
  if (!content) {
    return NextResponse.json({ error: '缺少内容' }, { status: 400 })
  }

  // 验证是自己的证据
  const existing = await prisma.capabilityEvidence.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const evidence = await prisma.capabilityEvidence.update({
    where: { id },
    data: { content },
  })

  return NextResponse.json(evidence)
}

// 删除能力证据
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { id } = await params

  // 验证是自己的证据
  const existing = await prisma.capabilityEvidence.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  await prisma.capabilityEvidence.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
