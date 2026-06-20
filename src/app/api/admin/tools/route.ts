import { NextRequest, NextResponse } from 'next/server'
import { PublishStatus, ToolDifficulty, ToolPricing } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canEdit } from '@/lib/admin-auth'

const pricingValues = Object.values(ToolPricing)
const difficultyValues = Object.values(ToolDifficulty)
const publishStatusValues = Object.values(PublishStatus)

function parseEnum<T extends string>(value: unknown, fallback: T, values: T[]) {
  const normalized = String(value || fallback)
  return values.includes(normalized as T) ? normalized as T : null
}

function normalizeToolBody(body: Record<string, unknown>) {
  return {
    categoryId: String(body.categoryId || ''),
    name: String(body.name || ''),
    slug: String(body.slug || ''),
    tagline: String(body.tagline || ''),
    description: String(body.description || ''),
    websiteUrl: String(body.websiteUrl || ''),
    logoUrl: body.logoUrl ? String(body.logoUrl) : null,
    pricing: parseEnum(body.pricing, ToolPricing.FREEMIUM, pricingValues),
    difficulty: parseEnum(body.difficulty, ToolDifficulty.BEGINNER, difficultyValues),
    bestFor: String(body.bestFor || ''),
    notFor: body.notFor ? String(body.notFor) : null,
    whyRecommended: String(body.whyRecommended || ''),
    quickStart: String(body.quickStart || ''),
    promptExample: body.promptExample ? String(body.promptExample) : null,
    sortOrder: Number(body.sortOrder) || 0,
    isTop: Boolean(body.isTop),
    publishStatus: parseEnum(body.publishStatus, PublishStatus.DRAFT, publishStatusValues),
    seoTitle: body.seoTitle ? String(body.seoTitle) : null,
    seoDescription: body.seoDescription ? String(body.seoDescription) : null,
  }
}

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const tools = await prisma.aiTool.findMany({
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    include: {
      category: { select: { id: true, name: true } },
      scenes: { include: { scene: { select: { id: true, title: true } } } },
    },
  })

  return NextResponse.json(tools)
}

export async function POST(request: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })
  if (!canEdit(user.role)) return NextResponse.json({ error: '审核员不能创建内容' }, { status: 403 })

  const body = await request.json()
  const data = normalizeToolBody(body)
  const sceneIds: string[] = Array.isArray(body.sceneIds) ? body.sceneIds.map(String).filter(Boolean) : []

  if (!data.pricing || !data.difficulty || !data.publishStatus) {
    return NextResponse.json({ error: 'pricing、difficulty 或 publishStatus 非法' }, { status: 400 })
  }
  const pricing = data.pricing
  const difficulty = data.difficulty
  const publishStatus = data.publishStatus

  if (!data.name || !data.slug || !data.categoryId || !data.tagline || !data.description || !data.websiteUrl || !data.bestFor || !data.whyRecommended || !data.quickStart) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  const existing = await prisma.aiTool.findUnique({ where: { slug: data.slug } })
  if (existing) return NextResponse.json({ error: 'slug 已存在' }, { status: 409 })

  const tool = await prisma.aiTool.create({
    data: {
      ...data,
      pricing,
      difficulty,
      publishStatus,
      scenes: {
        create: sceneIds.map((sceneId) => ({ sceneId })),
      },
    },
    include: { category: true, scenes: true },
  })

  return NextResponse.json(tool, { status: 201 })
}
