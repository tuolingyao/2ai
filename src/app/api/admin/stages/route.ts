// 后台阶段管理 API — 列表/新建
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

// 获取阶段列表（按场景筛选）
export async function GET(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const sceneId = request.nextUrl.searchParams.get('sceneId')
  if (!sceneId) {
    return NextResponse.json({ error: '缺少 sceneId' }, { status: 400 })
  }

  const stages = await prisma.stage.findMany({
    where: { sceneId },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { nodes: true } },
    },
  })

  return NextResponse.json(stages)
}

// 新建阶段
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const { sceneId, stageType, capabilityStd, learningFocus, practiceTask, capabilityEvidence, aiIntervention } = body

  if (!sceneId || !stageType) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // 检查场景存在
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } })
  if (!scene) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  // 检查同场景同类型阶段唯一性
  const existing = await prisma.stage.findUnique({
    where: { sceneId_stageType: { sceneId, stageType } },
  })
  if (existing) {
    return NextResponse.json({ error: '该阶段类型已存在' }, { status: 409 })
  }

  const stage = await prisma.stage.create({
    data: {
      sceneId,
      stageType,
      capabilityStd: capabilityStd || '',
      learningFocus: learningFocus || '',
      practiceTask: practiceTask || '',
      capabilityEvidence: capabilityEvidence || '',
      aiIntervention: aiIntervention || '',
      commonFailure: body.commonFailure || null,
      remedialAction: body.remedialAction || null,
      sortOrder: body.sortOrder ?? 0,
    },
  })

  return NextResponse.json(stage, { status: 201 })
}
