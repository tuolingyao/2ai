// 场景编辑页 — 基本信息 + 四阶段编辑 + 节点列表
'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { QualityCheckPanel } from '@/components/quality-check-panel'

// 阶段类型映射
const stageTypeLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

const publishStatuses = ['DRAFT', 'PREVIEW', 'PENDING_REVIEW', 'PUBLISHED', 'OFFLINE'] as const
const editorStatuses = ['DRAFT', 'PREVIEW', 'PENDING_REVIEW'] as const
const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  PREVIEW: '预览',
  PENDING_REVIEW: '待审核',
  PUBLISHED: '已发布',
  OFFLINE: '已下线',
}

interface Stage {
  id: string
  stageType: string
  capabilityStd: string
  learningFocus: string
  practiceTask: string
  capabilityEvidence: string
  aiIntervention: string
  commonFailure: string | null
  remedialAction: string | null
  sortOrder: number
  nodes: { id: string; title: string; slug: string; sortOrder: number }[]
}

interface SceneData {
  id: string
  title: string
  slug: string
  summary: string
  suitableFor: string
  notSuitableFor: string
  coverImage: string | null
  sortOrder: number
  isRecommended: boolean
  publishStatus: string
  seoTitle: string | null
  seoDescription: string | null
  stages: Stage[]
  nodes: { id: string; title: string; slug: string; stageId: string; sortOrder: number }[]
}

export default function AdminSceneEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [scene, setScene] = useState<SceneData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())
  const [stageEdits, setStageEdits] = useState<Record<string, Partial<Stage>>>({} as Record<string, Partial<Stage>>)

  // 判断角色
  const role = session?.user?.role
  const isEditor = role === 'EDITOR'
  const isReviewer = role === 'REVIEWER'
  const canPublishScene = role === 'ADMIN' || role === 'REVIEWER'

  // 加载场景数据
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/scenes/${id}`)
        if (res.ok) {
          const data = await res.json()
          setScene(data)
          // 默认展开所有阶段
          setExpandedStages(new Set(data.stages.map((s: Stage) => s.id)))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // 保存场景基本信息
  async function handleSaveScene() {
    if (!scene) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/scenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scene.title,
          slug: scene.slug,
          summary: scene.summary,
          suitableFor: scene.suitableFor,
          notSuitableFor: scene.notSuitableFor,
          coverImage: scene.coverImage,
          sortOrder: scene.sortOrder,
          isRecommended: scene.isRecommended,
          seoTitle: scene.seoTitle,
          seoDescription: scene.seoDescription,
          publishStatus: scene.publishStatus,
        }),
      })
      if (res.ok) {
        alert('保存成功')
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  // 保存审核状态（REVIEWER 专用）
  async function handleSaveReviewStatus() {
    if (!scene) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/scenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publishStatus: scene.publishStatus,
          isRecommended: scene.isRecommended,
        }),
      })
      if (res.ok) {
        alert('审核状态保存成功')
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  // 保存阶段
  async function handleSaveStage(stageId: string) {
    const edits = stageEdits[stageId]
    if (!edits) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/stages/${stageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edits),
      })
      if (res.ok) {
        alert('阶段保存成功')
        // 重新加载场景数据
        const sceneRes = await fetch(`/api/admin/scenes/${id}`)
        if (sceneRes.ok) setScene(await sceneRes.json())
        setStageEdits((prev) => {
          const next = { ...prev }
          delete next[stageId]
          return next
        })
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  // 更新阶段编辑状态
  function updateStageEdit(stageId: string, field: string, value: string) {
    setStageEdits((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], [field]: value },
    }))
  }

  // 获取阶段的当前值（编辑值优先）
  function getStageValue(stage: Stage, field: keyof Stage): string {
    const edits = stageEdits[stage.id]
    if (edits && field in edits && edits[field] !== undefined) {
      return edits[field] as string
    }
    return (stage[field] as string) || ''
  }

  // 切换阶段展开/折叠
  function toggleStage(stageId: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stageId)) next.delete(stageId)
      else next.add(stageId)
      return next
    })
  }

  if (loading) {
    return <p className="text-muted-foreground">加载中...</p>
  }

  if (!scene) {
    return <p className="text-red-600">场景不存在</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/scenes" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; 返回列表
          </Link>
          <h1 className="text-2xl font-bold text-foreground">编辑场景</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isReviewer && (
            <Button onClick={handleSaveScene} disabled={saving} size="sm">
              {saving ? '保存中...' : '保存基本信息'}
            </Button>
          )}
          {isReviewer && (
            <Button onClick={handleSaveReviewStatus} disabled={saving} size="sm">
              {saving ? '保存中...' : '保存审核状态'}
            </Button>
          )}
        </div>
      </div>

      {/* ===== 基本信息 ===== */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-foreground">基本信息</h2>
        {!isReviewer ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">标题</label>
                <input
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.title}
                  onChange={(e) => setScene({ ...scene, title: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Slug</label>
                <input
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.slug}
                  onChange={(e) => setScene({ ...scene, slug: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">摘要</label>
              <textarea
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                rows={2}
                value={scene.summary}
                onChange={(e) => setScene({ ...scene, summary: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">适合人群</label>
                <input
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.suitableFor}
                  onChange={(e) => setScene({ ...scene, suitableFor: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">不适合人群</label>
                <input
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.notSuitableFor}
                  onChange={(e) => setScene({ ...scene, notSuitableFor: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">封面图 URL</label>
                <input
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.coverImage || ''}
                  onChange={(e) => setScene({ ...scene, coverImage: e.target.value || null })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">发布状态</label>
                <select
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.publishStatus}
                  onChange={(e) => setScene({ ...scene, publishStatus: e.target.value })}
                >
                  {isEditor
                    ? editorStatuses.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))
                    : publishStatuses.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))
                  }
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">排序</label>
                <input
                  type="number"
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.sortOrder}
                  onChange={(e) => setScene({ ...scene, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">推荐</label>
                <select
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.isRecommended ? 'true' : 'false'}
                  onChange={(e) => setScene({ ...scene, isRecommended: e.target.value === 'true' })}
                >
                  <option value="false">否</option>
                  <option value="true">是</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">SEO Title</label>
                <input
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.seoTitle || ''}
                  onChange={(e) => setScene({ ...scene, seoTitle: e.target.value || null })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">SEO Description</label>
                <input
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.seoDescription || ''}
                  onChange={(e) => setScene({ ...scene, seoDescription: e.target.value || null })}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">发布状态</label>
                <select
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.publishStatus}
                  onChange={(e) => setScene({ ...scene, publishStatus: e.target.value })}
                >
                  {publishStatuses.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">推荐</label>
                <select
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                  value={scene.isRecommended ? 'true' : 'false'}
                  onChange={(e) => setScene({ ...scene, isRecommended: e.target.value === 'true' })}
                >
                  <option value="false">否</option>
                  <option value="true">是</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== 四阶段编辑 ===== */}
      {!isReviewer && (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">四阶段内容</h2>
        {scene.stages.map((stage) => {
          const isExpanded = expandedStages.has(stage.id)
          return (
            <div key={stage.id} className="rounded-lg border bg-card">
              {/* 阶段标题栏 */}
              <button
                onClick={() => toggleStage(stage.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-medium text-foreground">
                  {stageTypeLabels[stage.stageType] || stage.stageType}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isExpanded ? '收起' : '展开'} | {stage.nodes.length} 个节点
                </span>
              </button>

              {/* 阶段内容 */}
              {isExpanded && (
                <div className="border-t px-4 py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">能力标准</label>
                      <textarea
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                        rows={2}
                        value={getStageValue(stage, 'capabilityStd')}
                        onChange={(e) => updateStageEdit(stage.id, 'capabilityStd', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">学习重点</label>
                      <textarea
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                        rows={2}
                        value={getStageValue(stage, 'learningFocus')}
                        onChange={(e) => updateStageEdit(stage.id, 'learningFocus', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">练习任务</label>
                      <textarea
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                        rows={2}
                        value={getStageValue(stage, 'practiceTask')}
                        onChange={(e) => updateStageEdit(stage.id, 'practiceTask', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">能力证据</label>
                      <textarea
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                        rows={2}
                        value={getStageValue(stage, 'capabilityEvidence')}
                        onChange={(e) => updateStageEdit(stage.id, 'capabilityEvidence', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">AI 介入方式</label>
                      <textarea
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                        rows={2}
                        value={getStageValue(stage, 'aiIntervention')}
                        onChange={(e) => updateStageEdit(stage.id, 'aiIntervention', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">常见未达标原因</label>
                      <textarea
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                        rows={2}
                        value={getStageValue(stage, 'commonFailure')}
                        onChange={(e) => updateStageEdit(stage.id, 'commonFailure', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">补强动作</label>
                    <textarea
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                      rows={2}
                      value={getStageValue(stage, 'remedialAction')}
                      onChange={(e) => updateStageEdit(stage.id, 'remedialAction', e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => handleSaveStage(stage.id)}
                    disabled={saving}
                    size="sm"
                    variant="outline"
                  >
                    保存此阶段
                  </Button>

                  {/* 阶段下的节点列表 */}
                  {stage.nodes.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-medium text-muted-foreground">学习节点</h3>
                      <div className="space-y-1">
                        {stage.nodes.map((node) => (
                          <div key={node.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm">
                            <span className="text-foreground">{node.title}</span>
                            <span className="text-xs text-zinc-400">{node.slug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}

      {/* ===== 发布管理 ===== */}
      <QualityCheckPanel sceneId={id} canPublish={canPublishScene} />

      {/* ===== 节点列表 ===== */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-foreground">所有学习节点</h2>
          <Link href="/admin/nodes" className="text-sm text-blue-600 hover:underline">
            管理节点 &rarr;
          </Link>
        </div>
        {scene.nodes.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">暂无节点</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2">标题</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">排序</th>
              </tr>
            </thead>
            <tbody>
              {scene.nodes.map((node) => (
                <tr key={node.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-foreground">{node.title}</td>
                  <td className="px-4 py-2 text-muted-foreground">{node.slug}</td>
                  <td className="px-4 py-2 text-muted-foreground">{node.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
