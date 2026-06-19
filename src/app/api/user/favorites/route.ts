// 用户收藏 API — GET/POST/DELETE
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取当前用户的收藏列表
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const favorites = await prisma.userFavorite.findMany({
    where: { userId: session.user.id },
    include: {
      scene: {
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          coverImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(favorites)
}

// 收藏场景
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { sceneId } = await request.json()
  if (!sceneId) {
    return NextResponse.json({ error: '缺少 sceneId' }, { status: 400 })
  }

  try {
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: session.user.id,
        sceneId,
      },
    })
    return NextResponse.json(favorite, { status: 201 })
  } catch {
    // 唯一约束冲突 = 已收藏
    return NextResponse.json({ error: '已收藏' }, { status: 409 })
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { sceneId } = await request.json()
  if (!sceneId) {
    return NextResponse.json({ error: '缺少 sceneId' }, { status: 400 })
  }

  await prisma.userFavorite.deleteMany({
    where: { userId: session.user.id, sceneId },
  })

  return NextResponse.json({ success: true })
}
