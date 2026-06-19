// 分类标签管理页面 — 按类型筛选、新建/编辑/删除
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

// 标签类型映射
const typeLabels: Record<string, string> = {
  CATEGORY: '分类',
  TARGET_AUDIENCE: '目标人群',
  CAPABILITY_TAG: '能力标签',
  TOOL_TAG: '工具标签',
}

const typeColors: Record<string, string> = {
  CATEGORY: 'bg-blue-100 text-blue-700',
  TARGET_AUDIENCE: 'bg-purple-100 text-purple-700',
  CAPABILITY_TAG: 'bg-green-100 text-green-700',
  TOOL_TAG: 'bg-amber-100 text-amber-700',
}

interface TaxonomyItem {
  id: string
  name: string
  type: string
  slug: string
  description: string | null
  sortOrder: number
  _count: { scenes: number }
}

const emptyForm = {
  name: '',
  type: 'CATEGORY',
  slug: '',
  description: '',
  sortOrder: '0',
}

export default function AdminTaxonomiesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const canCreateEdit = isAdmin || session?.user?.role === 'EDITOR'

  const [typeFilter, setTypeFilter] = useState('')
  const [taxonomies, setTaxonomies] = useState<TaxonomyItem[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 加载标签列表
  useEffect(() => {
    async function load() {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/admin/taxonomies?${params}`)
      if (res.ok) setTaxonomies(await res.json())
    }
    load()
  }, [typeFilter, refreshKey])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, type: typeFilter || 'CATEGORY' })
    setShowDialog(true)
  }

  function openEdit(t: TaxonomyItem) {
    setEditingId(t.id)
    setForm({
      name: t.name,
      type: t.type,
      slug: t.slug,
      description: t.description || '',
      sortOrder: String(t.sortOrder),
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!form.name || !form.type || !form.slug) {
      alert('请填写必填字段')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        sortOrder: parseInt(form.sortOrder) || 0,
        description: form.description || null,
      }

      const res = editingId
        ? await fetch(`/api/admin/taxonomies/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/taxonomies', {
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
    if (!confirm('确定删除此标签？关联的场景标签也会被删除。')) return
    const res = await fetch(`/api/admin/taxonomies/${id}`, { method: 'DELETE' })
    if (res.ok) setRefreshKey((k) => k + 1)
    else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">分类标签管理</h1>
        {canCreateEdit && <Button onClick={openCreate}>新建标签</Button>}
      </div>

      {/* 类型筛选 */}
      <div className="flex gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${!typeFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          全部
        </button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${typeFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2">名称</th>
              <th className="px-4 py-2">类型</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">描述</th>
              <th className="px-4 py-2">关联场景</th>
              <th className="px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {taxonomies.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[t.type]}`}>
                    {typeLabels[t.type]}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{t.slug}</td>
                <td className="px-4 py-2 text-muted-foreground max-w-[200px] truncate">{t.description || '-'}</td>
                <td className="px-4 py-2 text-muted-foreground">{t._count.scenes}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {canCreateEdit && <button onClick={() => openEdit(t)} className="text-xs text-blue-600 hover:underline">编辑</button>}
                    {isAdmin && (
                      <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline">删除</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {taxonomies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">暂无标签</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑对话框 */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {editingId ? '编辑标签' : '新建标签'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">名称 *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Slug *</label>
                  <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">类型 *</label>
                  <select className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">排序</label>
                  <input type="number" className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">描述</label>
                <textarea className="w-full rounded-md border px-3 py-1.5 text-sm" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
