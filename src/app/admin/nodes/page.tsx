// 节点管理页面 — 按场景筛选、新建/编辑/删除节点 + AI 对话示范管理
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

// 阶段类型映射
const stageTypeLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

interface SceneOption {
  id: string
  title: string
}

interface NodeItem {
  id: string
  title: string
  slug: string
  sortOrder: number
  sceneId: string
  stageId: string
  nextNodeId: string | null
  scene: { id: string; title: string }
  stage: { id: string; stageType: string }
}

interface DialogueItem {
  id: string
  toolChoice: string
  prompt: string
  aiFollowUp: string | null
  userSupplement: string | null
  aiOutput: string
  checkList: string
  sortOrder: number
}

// 空白节点表单
const emptyForm = {
  title: '',
  slug: '',
  objective: '',
  prerequisites: '',
  whyFirst: '',
  keyConcepts: '',
  methodFocus: '',
  practiceTask: '',
  commonMistakes: '',
  passCriteria: '',
  capabilityEvidence: '',
  nextNodeId: '',
  sceneId: '',
  stageId: '',
  sortOrder: '0',
}

// 空白对话示范表单
const emptyDialogueForm = {
  toolChoice: '',
  prompt: '',
  aiFollowUp: '',
  userSupplement: '',
  aiOutput: '',
  checkList: '',
  sortOrder: '0',
}

export default function AdminNodesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const canCreateEdit = isAdmin || session?.user?.role === 'EDITOR'

  const [scenes, setScenes] = useState<SceneOption[]>([])
  const [sceneFilter, setSceneFilter] = useState('')
  const [nodes, setNodes] = useState<NodeItem[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 可选的 nextNodeId 选项（同场景其他节点）
  const [sceneNodes, setSceneNodes] = useState<{ id: string; title: string }[]>([])

  // AI 对话示范相关状态
  const [dialogueTab, setDialogueTab] = useState<'node' | 'dialogue'>('node')
  const [dialogues, setDialogues] = useState<DialogueItem[]>([])
  const [dialogueForm, setDialogueForm] = useState({ ...emptyDialogueForm })
  const [editingDialogueId, setEditingDialogueId] = useState<string | null>(null)
  const [dialogueRefreshKey, setDialogueRefreshKey] = useState(0)

  // 加载场景列表
  useEffect(() => {
    fetch('/api/admin/scenes?pageSize=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.scenes) setScenes(data.scenes.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title })))
      })
  }, [])

  // 加载节点列表
  useEffect(() => {
    async function load() {
      const params = new URLSearchParams()
      if (sceneFilter) params.set('sceneId', sceneFilter)
      const res = await fetch(`/api/admin/nodes?${params}`)
      if (res.ok) setNodes(await res.json())
    }
    load()
  }, [sceneFilter, refreshKey])

  // 加载 AI 对话示范
  useEffect(() => {
    if (editingId && dialogueTab === 'dialogue') {
      fetch(`/api/admin/dialogue-examples?nodeId=${editingId}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setDialogues(data) })
    }
  }, [editingId, dialogueTab, dialogueRefreshKey])

  // 加载同场景节点（用于 nextNodeId 选择）
  async function loadSceneNodes(sceneId: string) {
    const res = await fetch(`/api/admin/nodes?sceneId=${sceneId}`)
    if (res.ok) {
      const data = await res.json()
      setSceneNodes(data.filter((n: NodeItem) => n.id !== editingId))
    }
  }

  // 打开新建对话框
  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, sceneId: sceneFilter })
    setDialogueTab('node')
    setShowDialog(true)
    if (sceneFilter) loadSceneNodes(sceneFilter)
  }

  // 打开编辑对话框
  function openEdit(node: NodeItem) {
    setEditingId(node.id)
    setForm({
      title: node.title,
      slug: node.slug,
      objective: '',
      prerequisites: '',
      whyFirst: '',
      keyConcepts: '',
      methodFocus: '',
      practiceTask: '',
      commonMistakes: '',
      passCriteria: '',
      capabilityEvidence: '',
      nextNodeId: node.nextNodeId || '',
      sceneId: node.sceneId,
      stageId: node.stageId,
      sortOrder: String(node.sortOrder),
    })
    setDialogueTab('node')
    setDialogues([])

    // 加载完整节点数据
    fetch(`/api/admin/nodes?sceneId=${node.sceneId}`)
      .then((r) => r.json())
      .then((data) => setSceneNodes(data.filter((n: NodeItem) => n.id !== node.id)))

    fetch(`/api/admin/scenes/${node.sceneId}`)
      .then((r) => r.json())
      .then((sceneData) => {
        const fullNode = sceneData.nodes?.find((n: { id: string }) => n.id === node.id)
        if (fullNode) {
          setForm((prev) => ({
            ...prev,
            objective: fullNode.objective || '',
            keyConcepts: fullNode.keyConcepts || '',
            methodFocus: fullNode.methodFocus || '',
            practiceTask: fullNode.practiceTask || '',
            passCriteria: fullNode.passCriteria || '',
            capabilityEvidence: fullNode.capabilityEvidence || '',
            prerequisites: fullNode.prerequisites || '',
            whyFirst: fullNode.whyFirst || '',
            commonMistakes: fullNode.commonMistakes || '',
          }))
        }
      })

    setShowDialog(true)
  }

  // 保存节点
  async function handleSave() {
    if (!form.title || !form.slug || !form.sceneId || !form.stageId) {
      alert('请填写必填字段')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        sortOrder: parseInt(form.sortOrder) || 0,
        nextNodeId: form.nextNodeId || null,
        prerequisites: form.prerequisites || null,
        whyFirst: form.whyFirst || null,
        commonMistakes: form.commonMistakes || null,
      }

      const res = editingId
        ? await fetch(`/api/admin/nodes/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/nodes', {
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

  // 删除节点
  async function handleDelete(id: string) {
    if (!confirm('确定删除此节点？')) return
    const res = await fetch(`/api/admin/nodes/${id}`, { method: 'DELETE' })
    if (res.ok) setRefreshKey((k) => k + 1)
    else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  // ===== AI 对话示范操作 =====

  // 保存对话示范
  async function handleSaveDialogue() {
    if (!dialogueForm.toolChoice || !dialogueForm.prompt || !dialogueForm.aiOutput || !dialogueForm.checkList) {
      alert('请填写必填字段（工具、提示词、AI输出、检查清单）')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...dialogueForm,
        nodeId: editingId,
        sortOrder: parseInt(dialogueForm.sortOrder) || 0,
        aiFollowUp: dialogueForm.aiFollowUp || null,
        userSupplement: dialogueForm.userSupplement || null,
      }

      const res = editingDialogueId
        ? await fetch(`/api/admin/dialogue-examples/${editingDialogueId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/dialogue-examples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

      if (res.ok) {
        setEditingDialogueId(null)
        setDialogueForm({ ...emptyDialogueForm })
        setDialogueRefreshKey((k) => k + 1)
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  // 编辑对话示范
  function openEditDialogue(d: DialogueItem) {
    setEditingDialogueId(d.id)
    setDialogueForm({
      toolChoice: d.toolChoice,
      prompt: d.prompt,
      aiFollowUp: d.aiFollowUp || '',
      userSupplement: d.userSupplement || '',
      aiOutput: d.aiOutput,
      checkList: d.checkList,
      sortOrder: String(d.sortOrder),
    })
  }

  // 删除对话示范
  async function handleDeleteDialogue(id: string) {
    if (!confirm('确定删除此对话示范？')) return
    const res = await fetch(`/api/admin/dialogue-examples/${id}`, { method: 'DELETE' })
    if (res.ok) setDialogueRefreshKey((k) => k + 1)
    else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">节点管理</h1>
        {canCreateEdit && <Button onClick={openCreate}>新建节点</Button>}
      </div>

      {/* ===== 场景筛选 ===== */}
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

      {/* ===== 节点列表 ===== */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2">标题</th>
              <th className="px-4 py-2">所属场景</th>
              <th className="px-4 py-2">所属阶段</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">排序</th>
              <th className="px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium text-foreground">{node.title}</td>
                <td className="px-4 py-2 text-muted-foreground">{node.scene.title}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {stageTypeLabels[node.stage.stageType] || node.stage.stageType}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{node.slug}</td>
                <td className="px-4 py-2 text-muted-foreground">{node.sortOrder}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {canCreateEdit && (
                      <button
                        onClick={() => openEdit(node)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        编辑
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(node.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {nodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  暂无节点
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== 新建/编辑对话框 ===== */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {editingId ? '编辑节点' : '新建节点'}
            </h2>

            {/* 标签切换 */}
            {editingId && (
              <div className="mb-4 flex gap-1 border-b">
                <button
                  onClick={() => setDialogueTab('node')}
                  className={`px-3 py-1.5 text-sm font-medium ${dialogueTab === 'node' ? 'border-b-2 border-zinc-900 text-foreground' : 'text-muted-foreground'}`}
                >
                  节点信息
                </button>
                <button
                  onClick={() => setDialogueTab('dialogue')}
                  className={`px-3 py-1.5 text-sm font-medium ${dialogueTab === 'dialogue' ? 'border-b-2 border-zinc-900 text-foreground' : 'text-muted-foreground'}`}
                >
                  AI 对话示范
                </button>
              </div>
            )}

            {/* ===== 节点信息标签页 ===== */}
            {dialogueTab === 'node' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">标题 *</label>
                    <input
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Slug *</label>
                    <input
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">所属场景 *</label>
                    <select
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                      value={form.sceneId}
                      onChange={(e) => {
                        setForm({ ...form, sceneId: e.target.value, stageId: '', nextNodeId: '' })
                        loadSceneNodes(e.target.value)
                      }}
                    >
                      <option value="">选择场景</option>
                      {scenes.map((s) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">所属阶段 *</label>
                    <input
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                      value={form.stageId}
                      onChange={(e) => setForm({ ...form, stageId: e.target.value })}
                      placeholder="阶段 ID"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">学习目标 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">关键概念 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.keyConcepts} onChange={(e) => setForm({ ...form, keyConcepts: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">方法重点 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.methodFocus} onChange={(e) => setForm({ ...form, methodFocus: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">练习任务 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.practiceTask} onChange={(e) => setForm({ ...form, practiceTask: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">通关标准 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.passCriteria} onChange={(e) => setForm({ ...form, passCriteria: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">能力证据 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.capabilityEvidence} onChange={(e) => setForm({ ...form, capabilityEvidence: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">前置条件</label>
                    <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.prerequisites} onChange={(e) => setForm({ ...form, prerequisites: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">为什么先学这个</label>
                    <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.whyFirst} onChange={(e) => setForm({ ...form, whyFirst: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">常见错误</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.commonMistakes} onChange={(e) => setForm({ ...form, commonMistakes: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">下一步节点</label>
                    <select className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.nextNodeId} onChange={(e) => setForm({ ...form, nextNodeId: e.target.value })}>
                      <option value="">无</option>
                      {sceneNodes.map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">排序</label>
                    <input type="number" className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving ? '保存中...' : '保存节点'}
                  </Button>
                  <Button onClick={() => setShowDialog(false)} variant="outline" size="sm">
                    取消
                  </Button>
                </div>
              </div>
            )}

            {/* ===== AI 对话示范标签页 ===== */}
            {dialogueTab === 'dialogue' && editingId && (
              <div className="space-y-4">
                {/* 对话示范列表 */}
                {dialogues.length > 0 && (
                  <div className="space-y-2">
                    {dialogues.map((d) => (
                      <div key={d.id} className="rounded-md border bg-muted p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{d.toolChoice}</span>
                            <span className="ml-2 text-sm text-muted-foreground">{d.prompt.substring(0, 50)}...</span>
                          </div>
                          <div className="flex gap-2">
                            {canCreateEdit && <button onClick={() => openEditDialogue(d)} className="text-xs text-blue-600 hover:underline">编辑</button>}
                            {isAdmin && (
                              <button onClick={() => handleDeleteDialogue(d.id)} className="text-xs text-red-600 hover:underline">删除</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 对话示范表单 */}
                {canCreateEdit && (
                <div className="rounded-md border bg-card p-3 space-y-2">
                  <h3 className="text-sm font-medium text-foreground">
                    {editingDialogueId ? '编辑对话示范' : '新建对话示范'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">工具选择 *</label>
                      <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={dialogueForm.toolChoice} onChange={(e) => setDialogueForm({ ...dialogueForm, toolChoice: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">排序</label>
                      <input type="number" className="w-full rounded-md border px-3 py-1.5 text-sm" value={dialogueForm.sortOrder} onChange={(e) => setDialogueForm({ ...dialogueForm, sortOrder: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">提示词 *</label>
                    <textarea className="w-full rounded-md border px-3 py-1.5 text-sm" rows={2} value={dialogueForm.prompt} onChange={(e) => setDialogueForm({ ...dialogueForm, prompt: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">AI 追问</label>
                    <textarea className="w-full rounded-md border px-3 py-1.5 text-sm" rows={2} value={dialogueForm.aiFollowUp} onChange={(e) => setDialogueForm({ ...dialogueForm, aiFollowUp: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">用户补充</label>
                    <textarea className="w-full rounded-md border px-3 py-1.5 text-sm" rows={2} value={dialogueForm.userSupplement} onChange={(e) => setDialogueForm({ ...dialogueForm, userSupplement: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">AI 输出 *</label>
                    <textarea className="w-full rounded-md border px-3 py-1.5 text-sm" rows={2} value={dialogueForm.aiOutput} onChange={(e) => setDialogueForm({ ...dialogueForm, aiOutput: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">检查清单 *</label>
                    <textarea className="w-full rounded-md border px-3 py-1.5 text-sm" rows={2} value={dialogueForm.checkList} onChange={(e) => setDialogueForm({ ...dialogueForm, checkList: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveDialogue} disabled={saving} size="sm">
                      {saving ? '保存中...' : editingDialogueId ? '更新' : '添加'}
                    </Button>
                    {editingDialogueId && (
                      <Button onClick={() => { setEditingDialogueId(null); setDialogueForm({ ...emptyDialogueForm }) }} variant="outline" size="sm">
                        取消编辑
                      </Button>
                    )}
                  </div>
                </div>
                )}

                <Button onClick={() => setShowDialog(false)} variant="outline" size="sm">
                  关闭
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
