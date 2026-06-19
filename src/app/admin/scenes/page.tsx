// 场景管理列表页 — 筛选、新建、编辑、删除
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

// 发布状态映射
const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  PREVIEW: '预览',
  PENDING_REVIEW: '待审核',
  PUBLISHED: '已发布',
  OFFLINE: '已下线',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PREVIEW: 'bg-blue-100 text-blue-700',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  OFFLINE: 'bg-red-100 text-red-700',
}

interface Scene {
  id: string
  title: string
  slug: string
  publishStatus: string
  sortOrder: number
  isRecommended: boolean
  updatedAt: string
  _count: { stages: number; nodes: number }
}

export default function AdminScenesPage() {
  const { data: session } = useSession()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  // 新建表单状态
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    suitableFor: '',
    notSuitableFor: '',
  })
  const [creating, setCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 判断角色
  const isAdmin = session?.user?.role === 'ADMIN'
  const isEditor = session?.user?.role === 'EDITOR'
  const isReviewer = session?.user?.role === 'REVIEWER'
  const canEdit = isAdmin || isEditor

  // 加载场景列表
  useEffect(() => {
    async function load() {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/scenes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setScenes(data.scenes)
        setTotal(data.total)
      }
    }
    load()
  }, [page, statusFilter, refreshKey])

  // 新建场景
  async function handleCreate() {
    if (!form.title || !form.slug || !form.summary || !form.suitableFor || !form.notSuitableFor) {
      alert('请填写所有必填字段')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowCreate(false)
        setForm({ title: '', slug: '', summary: '', suitableFor: '', notSuitableFor: '' })
        // 重新加载列表
        setPage(1)
        setRefreshKey((k) => k + 1)
      } else {
        const data = await res.json()
        alert(data.error || '创建失败')
      }
    } finally {
      setCreating(false)
    }
  }

  // 删除场景
  async function handleDelete(id: string) {
    if (!confirm('确定删除此场景？关联的阶段和节点也会被删除。')) return
    const res = await fetch(`/api/admin/scenes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setRefreshKey((k) => k + 1)
    } else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  // 自动生成 slug
  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">场景管理</h1>
        {canEdit && <Button onClick={() => setShowCreate(true)}>新建场景</Button>}
      </div>

      {/* ===== 状态筛选 ===== */}
      <div className="flex gap-2">
        <button
          onClick={() => { setStatusFilter(''); setPage(1) }}
          className={`rounded-full px-3 py-1 text-xs font-medium ${!statusFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          全部
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key); setPage(1) }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== 新建表单 ===== */}
      {showCreate && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-foreground">新建场景</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">标题 *</label>
              <input
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm({ ...form, title, slug: form.slug || generateSlug(title) })
                }}
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
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">摘要 *</label>
            <textarea
              className="w-full rounded-md border px-3 py-1.5 text-sm"
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">适合人群 *</label>
              <input
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                value={form.suitableFor}
                onChange={(e) => setForm({ ...form, suitableFor: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">不适合人群 *</label>
              <input
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                value={form.notSuitableFor}
                onChange={(e) => setForm({ ...form, notSuitableFor: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} size="sm">
              {creating ? '创建中...' : '创建'}
            </Button>
            <Button onClick={() => setShowCreate(false)} variant="outline" size="sm">
              取消
            </Button>
          </div>
        </div>
      )}

      {/* ===== 场景列表 ===== */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2">标题</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">状态</th>
              <th className="px-4 py-2">排序</th>
              <th className="px-4 py-2">推荐</th>
              <th className="px-4 py-2">阶段/节点</th>
              <th className="px-4 py-2">更新时间</th>
              <th className="px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {scenes.map((scene) => (
              <tr key={scene.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium text-foreground">{scene.title}</td>
                <td className="px-4 py-2 text-muted-foreground">{scene.slug}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[scene.publishStatus]}`}>
                    {statusLabels[scene.publishStatus]}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{scene.sortOrder}</td>
                <td className="px-4 py-2">{scene.isRecommended ? '⭐' : '-'}</td>
                <td className="px-4 py-2 text-muted-foreground">{scene._count.stages}/{scene._count.nodes}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Date(scene.updatedAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {!isReviewer && (
                      <Link
                        href={`/admin/scenes/${scene.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        编辑
                      </Link>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(scene.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {scenes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  暂无场景
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== 分页 ===== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
