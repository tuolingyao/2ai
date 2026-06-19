// 质量检查 API — 返回场景质量检查结果
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'
import { runSceneQualityCheck } from '@/lib/quality-check'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { sceneId } = await params

  const result = await runSceneQualityCheck(sceneId)

  if (result.checks[0]?.name === '场景存在' && !result.checks[0].passed) {
    return NextResponse.json({ error: '场景不存在' }, { status: 404 })
  }

  return NextResponse.json(result)
}
