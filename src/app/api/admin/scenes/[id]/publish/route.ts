// 发布场景 — 需通过质量检查，仅 ADMIN/REVIEWER 可执行
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, canPublish } from '@/lib/admin-auth'
import { runSceneQualityCheck } from '@/lib/quality-check'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  if (!canPublish(user.role)) {
    return NextResponse.json({ error: '仅管理员或审核员可发布场景' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.scene.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  // 质量检查
  const result = await runSceneQualityCheck(id)

  if (!result.passed) {
    return NextResponse.json({
      error: '质量检查未通过',
      checks: result.checks,
    }, { status: 400 })
  }

  const updated = await prisma.scene.update({
    where: { id },
    data: {
      publishStatus: 'PUBLISHED',
      publishedAt: existing.publishedAt || new Date(),
    },
  })

  return NextResponse.json(updated)
}
