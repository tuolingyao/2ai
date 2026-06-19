// 提交审核 — EDITOR 提交，将状态改为 PENDING_REVIEW
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  // EDITOR 和 ADMIN 都可以提交审核
  if (!canEdit(user.role) && user.role !== 'REVIEWER') {
    return NextResponse.json({ error: '无提交审核权限' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.scene.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  const scene = await prisma.scene.update({
    where: { id },
    data: { publishStatus: 'PENDING_REVIEW' },
  })

  return NextResponse.json(scene)
}
