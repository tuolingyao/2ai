// 后台节点管理 API — 列表/新建
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

// 获取节点列表（按场景/阶段筛选）
export async function GET(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const sceneId = request.nextUrl.searchParams.get('sceneId')
  const stageId = request.nextUrl.searchParams.get('stageId')

  const where: Record<string, unknown> = {}
  if (sceneId) where.sceneId = sceneId
  if (stageId) where.stageId = stageId

  const nodes = await prisma.learningNode.findMany({
    where,
    orderBy: [{ sceneId: 'asc' }, { sortOrder: 'asc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      sortOrder: true,
      sceneId: true,
      stageId: true,
      nextNodeId: true,
      scene: { select: { id: true, title: true } },
      stage: { select: { id: true, stageType: true } },
    },
  })

  return NextResponse.json(nodes)
}

// 新建节点
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const { sceneId, stageId, title, slug, objective, keyConcepts, methodFocus, practiceTask, passCriteria, capabilityEvidence } = body

  if (!sceneId || !stageId || !title || !slug || !objective || !keyConcepts || !methodFocus || !practiceTask || !passCriteria || !capabilityEvidence) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  // 检查场景存在
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } })
  if (!scene) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  // 检查同场景 slug 唯一性
  const slugExists = await prisma.learningNode.findFirst({
    where: { sceneId, slug },
  })
  if (slugExists) {
    return NextResponse.json({ error: '同场景下 slug 已存在' }, { status: 409 })
  }

  const node = await prisma.learningNode.create({
    data: {
      sceneId,
      stageId,
      title,
      slug,
      objective,
      keyConcepts,
      methodFocus,
      practiceTask,
      passCriteria,
      capabilityEvidence,
      prerequisites: body.prerequisites || null,
      whyFirst: body.whyFirst || null,
      commonMistakes: body.commonMistakes || null,
      nextNodeId: body.nextNodeId || null,
      sortOrder: body.sortOrder ?? 0,
    },
  })

  return NextResponse.json(node, { status: 201 })
}
