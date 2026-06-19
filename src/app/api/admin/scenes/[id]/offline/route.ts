// 下线场景 — 仅 ADMIN/REVIEWER 可执行
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canPublish } from '@/lib/admin-auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  if (!canPublish(user.role)) {
    return NextResponse.json({ error: '仅管理员或审核员可下线场景' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.scene.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  const scene = await prisma.scene.update({
    where: { id },
    data: { publishStatus: 'OFFLINE' },
  })

  return NextResponse.json(scene)
}
