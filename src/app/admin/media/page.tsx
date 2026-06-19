// 媒体管理页面 — 列表、新建、删除
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface MediaItem {
  id: string
  url: string
  alt: string | null
  purpose: string | null
  sceneId: string | null
  nodeId: string | null
  createdAt: string
  scene: { id: string; title: string } | null
  node: { id: string; title: string } | null
}

interface SceneOption {
  id: string
  title: string
}

const emptyForm = {
  url: '',
  alt: '',
  purpose: '',
  sceneId: '',
  nodeId: '',
}

export default function AdminMediaPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const canCreateEdit = isAdmin || session?.user?.role === 'EDITOR'

  const [media, setMedia] = useState<MediaItem[]>([])
  const [scenes, setScenes] = useState<SceneOption[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 加载媒体列表
  useEffect(() => {
    fetch('/api/admin/media')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMedia(data) })
  }, [refreshKey])

  // 加载场景列表
  useEffect(() => {
    fetch('/api/admin/scenes?pageSize=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.scenes) setScenes(data.scenes.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title })))
      })
  }, [])

  async function handleCreate() {
    if (!form.url) {
      alert('请填写 URL')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: form.url,
          alt: form.alt || null,
          purpose: form.purpose || null,
          sceneId: form.sceneId || null,
          nodeId: form.nodeId || null,
        }),
      })
      if (res.ok) {
        setShowCreate(false)
        setForm({ ...emptyForm })
        setRefreshKey((k) => k + 1)
      } else {
        const data = await res.json()
        alert(data.error || '创建失败')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此媒体资源？')) return
    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    if (res.ok) setRefreshKey((k) => k + 1)
    else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">媒体管理</h1>
        {canCreateEdit && <Button onClick={() => setShowCreate(true)}>新建媒体</Button>}
      </div>

      {/* 新建表单 */}
      {showCreate && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-foreground">新建媒体资源</h2>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">URL *</label>
            <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Alt 文本</label>
              <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">用途</label>
              <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">关联场景</label>
              <select className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.sceneId} onChange={(e) => setForm({ ...form, sceneId: e.target.value })}>
                <option value="">无</option>
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">关联节点 ID</label>
              <input className="w-full rounded-md border px-3 py-1.5 text-sm" value={form.nodeId} onChange={(e) => setForm({ ...form, nodeId: e.target.value })} placeholder="可选" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving} size="sm">
              {saving ? '创建中...' : '创建'}
            </Button>
            <Button onClick={() => setShowCreate(false)} variant="outline" size="sm">
              取消
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2">Alt</th>
              <th className="px-4 py-2">用途</th>
              <th className="px-4 py-2">关联场景</th>
              <th className="px-4 py-2">关联节点</th>
              <th className="px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {media.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="max-w-[200px] truncate px-4 py-2 text-blue-600">{m.url}</td>
                <td className="px-4 py-2 text-muted-foreground">{m.alt || '-'}</td>
                <td className="px-4 py-2 text-muted-foreground">{m.purpose || '-'}</td>
                <td className="px-4 py-2 text-muted-foreground">{m.scene?.title || '-'}</td>
                <td className="px-4 py-2 text-muted-foreground">{m.node?.title || '-'}</td>
                <td className="px-4 py-2">
                  {isAdmin && (
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-600 hover:underline">删除</button>
                  )}
                </td>
              </tr>
            ))}
            {media.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">暂无媒体资源</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
