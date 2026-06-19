// 工具建议管理页面 — 按场景筛选、新建/编辑/删除
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const stageTypeLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

interface GuidanceItem {
  id: string
  sceneId: string
  stageId: string | null
  nodeId: string | null
  currentTool: string
  currentToolUsage: string
  betterTool: string | null
  betterToolUsage: string | null
  migrationTrigger: string | null
  sortOrder: number
  scene: { id: string; title: string }
  stage: { id: string; stageType: string } | null
  node: { id: string; title: string } | null
}

interface SceneOption {
  id: string
  title: string
}

const emptyForm = {
  sceneId: '',
  stageId: '',
  nodeId: '',
  currentTool: '',
  currentToolUsage: '',
  betterTool: '',
  betterToolUsage: '',
  migrationTrigger: '',
  sortOrder: '0',
}

export default function AdminToolsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const canCreateEdit = isAdmin || session?.user?.role === 'EDITOR'

  const [scenes, setScenes] = useState<SceneOption[]>([])
  const [sceneFilter, setSceneFilter] = useState('')
  const [guidances, setGuidances] = useState<GuidanceItem[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 加载场景列表
  useEffect(() => {
    fetch('/api/admin/scenes?pageSize=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.scenes) setScenes(data.scenes.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title })))
      })
  }, [])

  // 加载工具建议列表
  useEffect(() => {
    async function load() {
      const params = new URLSearchParams()
      if (sceneFilter) params.set('sceneId', sceneFilter)
      const res = await fetch(`/api/admin/tool-guidances?${params}`)
      if (res.ok) setGuidances(await res.json())
    }
    load()
  }, [sceneFilter, refreshKey])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, sceneId: sceneFilter })
    setShowDialog(true)
  }

  function openEdit(g: GuidanceItem) {
    setEditingId(g.id)
    setForm({
      sceneId: g.sceneId,
      stageId: g.stageId || '',
      nodeId: g.nodeId || '',
      currentTool: g.currentTool,
      currentToolUsage: g.currentToolUsage,
      betterTool: g.betterTool || '',
      betterToolUsage: g.betterToolUsage || '',
      migrationTrigger: g.migrationTrigger || '',
      sortOrder: String(g.sortOrder),
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!form.sceneId || !form.currentTool || !form.currentToolUsage) {
      alert('请填写必填字段')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        sortOrder: parseInt(form.sortOrder) || 0,
        stageId: form.stageId || null,
        nodeId: form.nodeId || null,
        betterTool: form.betterTool || null,
        betterToolUsage: form.betterToolUsage || null,
        migrationTrigger: form.migrationTrigger || null,
      }

      const res = editingId
        ? await fetch(`/api/admin/tool-guidances/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/tool-guidances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

      if (res.ok) {
        setShowDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此工具建议？')) return
    const res = await fetch(`/api/admin/tool-guidances/${id}`, { method: 'DELETE' })
    if (res.ok) setRefreshKey((k) => k + 1)
    else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">工具建议管理</h1>
        {canCreateEdit && <Button onClick={openCreate}>新建工具建议</Button>}
      </div>

      <div>
        <select
          className="rounded-md border px-3 py-1.5 text-sm"
          value={sceneFilter}
          onChange={(e) => setSceneFilter(e.target.value)}
        >
          <option value="">全部场景</option>
          {scenes.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2">所属场景</th>
              <th className="px-4 py-2">阶段/节点</th>
              <th className="px-4 py-2">当前工具</th>
              <th className="px-4 py-2">更优工具</th>
              <th className="px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {guidances.map((g) => (
              <tr key={g.id} className="border-b last:border-0">
                <td className="px-4 py-2 text-muted-foreground">{g.scene.title}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {g.stage ? stageTypeLabels[g.stage.stageType] : '-'}
                  {g.node ? ` / ${g.node.title}` : ''}
                </td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{g.currentTool}</span>
                </td>
                <td className="px-4 py-2">
                  {g.betterTool ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{g.betterTool}</span>
                  ) : '-'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {canCreateEdit && <button onClick={() => openEdit(g)} className="text-xs text-blue-600 hover:underline">编辑</button>}
                    {isAdmin && (
                      <button onClick={() => handleDelete(g.id)} className="text-xs text-red-600 hover:underline">删除</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {guidances.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">暂无工具建议</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑对话框 */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {editingId ? '编辑工具建议' : '新建工具建议'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">所属场景 *</label>
                <select className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.sceneId} onChange={(e) => setForm({ ...form, sceneId: e.target.value })}>
                  <option value="">选择场景</option>
                  {scenes.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">阶段 ID</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })} placeholder="可选" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">节点 ID</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.nodeId} onChange={(e) => setForm({ ...form, nodeId: e.target.value })} placeholder="可选" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">当前工具 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.currentTool} onChange={(e) => setForm({ ...form, currentTool: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">当前工具用法 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.currentToolUsage} onChange={(e) => setForm({ ...form, currentToolUsage: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">更优工具</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.betterTool} onChange={(e) => setForm({ ...form, betterTool: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">更优工具用法</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.betterToolUsage} onChange={(e) => setForm({ ...form, betterToolUsage: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">迁移触发条件</label>
                <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.migrationTrigger} onChange={(e) => setForm({ ...form, migrationTrigger: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">排序</label>
                <input type="number" className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline" size="sm">
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
