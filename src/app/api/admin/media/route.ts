// 媒体资源列表/新建 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

// 获取媒体资源列表
export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const media = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      scene: { select: { id: true, title: true } },
      node: { select: { id: true, title: true } },
    },
  })

  return NextResponse.json(media)
}

// 新建媒体记录
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const { url } = body

  if (!url) {
    return NextResponse.json({ error: '缺少 URL' }, { status: 400 })
  }

  const media = await prisma.mediaAsset.create({
    data: {
      url,
      alt: body.alt || null,
      purpose: body.purpose || null,
      sceneId: body.sceneId || null,
      nodeId: body.nodeId || null,
    },
  })

  return NextResponse.json(media, { status: 201 })
}
