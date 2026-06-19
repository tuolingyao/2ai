// 后台场景列表/新建 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

// 获取场景列表（分页 + 状态筛选）
export async function GET(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const status = searchParams.get('status') || undefined

  const where = status ? { publishStatus: status as never } : {}

  const [scenes, total] = await Promise.all([
    prisma.scene.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        publishStatus: true,
        sortOrder: true,
        isRecommended: true,
        updatedAt: true,
        _count: { select: { stages: true, nodes: true } },
      },
    }),
    prisma.scene.count({ where }),
  ])

  return NextResponse.json({ scenes, total, page, pageSize })
}

// 新建场景
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '仅管理员或编辑可创建场景' }, { status: 403 })

  const body = await request.json()
  const { title, slug, summary, suitableFor, notSuitableFor } = body

  if (!title || !slug || !summary || !suitableFor || !notSuitableFor) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // 检查 slug 唯一性
  const existing = await prisma.scene.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'slug 已存在' }, { status: 409 })
  }

  const scene = await prisma.scene.create({
    data: {
      title,
      slug,
      summary,
      suitableFor,
      notSuitableFor,
      coverImage: body.coverImage || null,
      sortOrder: body.sortOrder || 0,
      isRecommended: body.isRecommended || false,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      publishStatus: body.publishStatus || 'DRAFT',
    },
  })

  // 自动创建四阶段
  const stageTypes = ['UNDERSTAND', 'HANDS_ON', 'STABLE_PRODUCTION', 'ADVANCE'] as const
  await prisma.stage.createMany({
    data: stageTypes.map((stageType, index) => ({
      sceneId: scene.id,
      stageType,
      capabilityStd: '',
      learningFocus: '',
      practiceTask: '',
      capabilityEvidence: '',
      aiIntervention: '',
      sortOrder: index,
    })),
  })

  return NextResponse.json(scene, { status: 201 })
}
