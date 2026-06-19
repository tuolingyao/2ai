// 媒体资源删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canDelete } from '@/lib/admin-auth'

// 删除媒体资源
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

  const existing = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '资源不存在' }, { status: 404 })
  }

  await prisma.mediaAsset.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
