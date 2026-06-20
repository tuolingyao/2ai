'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ToolForm, type ToolFormValue } from '@/components/admin/tool-form'

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string
  sortOrder: number
  isActive: boolean
  _count?: { tools: number }
}

interface SceneOption {
  id: string
  title: string
}

interface ToolItem {
  id: string
  categoryId: string
  name: string
  slug: string
  tagline: string
  description: string
  websiteUrl: string
  logoUrl: string | null
  pricing: string
  difficulty: string
  bestFor: string
  notFor: string | null
  whyRecommended: string
  quickStart: string
  promptExample: string | null
  sortOrder: number
  isTop: boolean
  publishStatus: string
  seoTitle: string | null
  seoDescription: string | null
  category: { id: string; name: string }
  scenes: { scene: { id: string; title: string } }[]
}

const emptyToolForm: ToolFormValue = {
  name: '',
  slug: '',
  categoryId: '',
  tagline: '',
  description: '',
  websiteUrl: '',
  logoUrl: '',
  pricing: 'FREEMIUM',
  difficulty: 'BEGINNER',
  bestFor: '',
  notFor: '',
  whyRecommended: '',
  quickStart: '',
  promptExample: '',
  sortOrder: '0',
  isTop: true,
  publishStatus: 'DRAFT',
  seoTitle: '',
  seoDescription: '',
  sceneIds: [],
}

const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  PREVIEW: '预览',
  PENDING_REVIEW: '待审核',
  PUBLISHED: '已发布',
  OFFLINE: '已下线',
}

export default function AdminToolsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const canEditContent = session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR'
  const canManage = canEditContent || session?.user?.role === 'REVIEWER'

  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [tools, setTools] = useState<ToolItem[]>([])
  const [scenes, setScenes] = useState<SceneOption[]>([])
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', sortOrder: '0', isActive: true })
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null)
  const [toolForm, setToolForm] = useState<ToolFormValue>({ ...emptyToolForm })
  const [showToolForm, setShowToolForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function load() {
      const [categoryRes, toolRes, sceneRes] = await Promise.all([
        fetch('/api/admin/tool-categories'),
        fetch('/api/admin/tools'),
        fetch('/api/admin/scenes?pageSize=100'),
      ])
      if (categoryRes.ok) setCategories(await categoryRes.json())
      if (toolRes.ok) setTools(await toolRes.json())
      if (sceneRes.ok) {
        const data = await sceneRes.json()
        setScenes((data.scenes || []).map((scene: { id: string; title: string }) => ({ id: scene.id, title: scene.title })))
      }
    }
    load()
  }, [refreshKey])

  async function saveCategory() {
    if (!categoryForm.name || !categoryForm.slug || !categoryForm.description) {
      alert('请填写分类必填字段')
      return
    }
    const res = editingCategory
      ? await fetch(`/api/admin/tool-categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...categoryForm, sortOrder: Number(categoryForm.sortOrder) || 0 }),
        })
      : await fetch('/api/admin/tool-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...categoryForm, sortOrder: Number(categoryForm.sortOrder) || 0 }),
        })
    if (res.ok) {
      setCategoryForm({ name: '', slug: '', description: '', sortOrder: '0', isActive: true })
      setEditingCategory(null)
      setRefreshKey((key) => key + 1)
    } else {
      const data = await res.json()
      alert(data.error || '保存失败')
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('确定删除此分类？分类下存在工具时会被拒绝。')) return
    const res = await fetch(`/api/admin/tool-categories/${id}`, { method: 'DELETE' })
    if (res.ok) setRefreshKey((key) => key + 1)
    else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  function openCreateTool() {
    setEditingTool(null)
    setToolForm({ ...emptyToolForm, categoryId: categories[0]?.id || '' })
    setShowToolForm(true)
  }

  function openEditTool(tool: ToolItem) {
    setEditingTool(tool)
    setToolForm({
      name: tool.name,
      slug: tool.slug,
      categoryId: tool.categoryId,
      tagline: tool.tagline,
      description: tool.description,
      websiteUrl: tool.websiteUrl,
      logoUrl: tool.logoUrl || '',
      pricing: tool.pricing,
      difficulty: tool.difficulty,
      bestFor: tool.bestFor,
      notFor: tool.notFor || '',
      whyRecommended: tool.whyRecommended,
      quickStart: tool.quickStart,
      promptExample: tool.promptExample || '',
      sortOrder: String(tool.sortOrder),
      isTop: tool.isTop,
      publishStatus: tool.publishStatus,
      seoTitle: tool.seoTitle || '',
      seoDescription: tool.seoDescription || '',
      sceneIds: tool.scenes.map(({ scene }) => scene.id),
    })
    setShowToolForm(true)
  }

  async function saveTool() {
    setSaving(true)
    try {
      const payload = { ...toolForm, sortOrder: Number(toolForm.sortOrder) || 0 }
      const res = editingTool
        ? await fetch(`/api/admin/tools/${editingTool.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/admin/tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        setShowToolForm(false)
        setRefreshKey((key) => key + 1)
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteTool(id: string) {
    if (!confirm('确定删除此工具？')) return
    const res = await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' })
    if (res.ok) setRefreshKey((key) => key + 1)
    else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  if (!canManage) {
    return <p className="text-sm text-muted-foreground">无权限访问工具库管理。</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">AI 工具库 CMS</h1>
        {canEditContent && <Button onClick={openCreateTool}>新建工具</Button>}
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold text-foreground">工具分类管理</h2>
        {canEditContent && (
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <input className="rounded-md border bg-background px-3 py-1.5 text-sm" placeholder="分类名" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            <input className="rounded-md border bg-background px-3 py-1.5 text-sm" placeholder="slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
            <input className="rounded-md border bg-background px-3 py-1.5 text-sm" placeholder="描述" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            <input type="number" className="rounded-md border bg-background px-3 py-1.5 text-sm" placeholder="排序" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: e.target.value })} />
            <Button onClick={saveCategory}>{editingCategory ? '保存编辑' : '新增分类'}</Button>
          </div>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
              <tr><th className="px-3 py-2">名称</th><th className="px-3 py-2">Slug</th><th className="px-3 py-2">排序</th><th className="px-3 py-2">状态</th><th className="px-3 py-2">工具数</th><th className="px-3 py-2">操作</th></tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b last:border-0">
                  <td className="px-3 py-2 text-foreground">{category.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{category.slug}</td>
                  <td className="px-3 py-2 text-muted-foreground">{category.sortOrder}</td>
                  <td className="px-3 py-2 text-muted-foreground">{category.isActive ? '启用' : '禁用'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{category._count?.tools || 0}</td>
                  <td className="px-3 py-2">
                    {canEditContent && (
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 hover:underline" onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, slug: category.slug, description: category.description, sortOrder: String(category.sortOrder), isActive: category.isActive }) }}>
                          编辑
                        </button>
                        <button className="text-xs text-amber-600 hover:underline" onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, slug: category.slug, description: category.description, sortOrder: String(category.sortOrder), isActive: !category.isActive }) }}>
                          {category.isActive ? '禁用' : '启用'}
                        </button>
                        {isAdmin && <button className="text-xs text-red-600 hover:underline" onClick={() => deleteCategory(category.id)}>删除</button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold text-foreground">工具管理</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
              <tr><th className="px-3 py-2">名称</th><th className="px-3 py-2">分类</th><th className="px-3 py-2">定价</th><th className="px-3 py-2">难度</th><th className="px-3 py-2">发布状态</th><th className="px-3 py-2">关联场景</th><th className="px-3 py-2">操作</th></tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id} className="border-b last:border-0">
                  <td className="px-3 py-2 text-foreground">{tool.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{tool.category.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{tool.pricing}</td>
                  <td className="px-3 py-2 text-muted-foreground">{tool.difficulty}</td>
                  <td className="px-3 py-2 text-muted-foreground">{statusLabels[tool.publishStatus]}</td>
                  <td className="px-3 py-2 text-muted-foreground">{tool.scenes.length}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {canEditContent && <button onClick={() => openEditTool(tool)} className="text-xs text-blue-600 hover:underline">编辑</button>}
                      {isAdmin && <button onClick={() => deleteTool(tool.id)} className="text-xs text-red-600 hover:underline">删除</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {tools.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">暂无工具</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {showToolForm && (
        <ToolForm
          form={toolForm}
          categories={categories}
          scenes={scenes}
          saving={saving}
          submitLabel={editingTool ? '保存工具' : '新建工具'}
          onChange={setToolForm}
          onSubmit={saveTool}
          onCancel={() => setShowToolForm(false)}
        />
      )}
    </div>
  )
}
