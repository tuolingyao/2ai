'use client'

import { Button } from '@/components/ui/button'

export interface ToolFormValue {
  name: string
  slug: string
  categoryId: string
  tagline: string
  description: string
  websiteUrl: string
  logoUrl: string
  pricing: string
  difficulty: string
  bestFor: string
  notFor: string
  whyRecommended: string
  quickStart: string
  promptExample: string
  sortOrder: string
  isTop: boolean
  publishStatus: string
  seoTitle: string
  seoDescription: string
  sceneIds: string[]
}

interface ToolFormProps {
  form: ToolFormValue
  categories: { id: string; name: string }[]
  scenes: { id: string; title: string }[]
  saving: boolean
  submitLabel: string
  onChange: (form: ToolFormValue) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ToolForm({ form, categories, scenes, saving, submitLabel, onChange, onSubmit, onCancel }: ToolFormProps) {
  function update<K extends keyof ToolFormValue>(key: K, value: ToolFormValue[K]) {
    onChange({ ...form, [key]: value })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{submitLabel}</h2>
          <Button variant="outline" size="sm" onClick={onCancel}>关闭</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="工具名 *"><input className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.name} onChange={(e) => update('name', e.target.value)} /></Field>
          <Field label="Slug *"><input className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.slug} onChange={(e) => update('slug', e.target.value)} /></Field>
          <Field label="分类 *">
            <select className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
              <option value="">选择分类</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="官网 URL *"><input className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} /></Field>
          <Field label="一句话定位 *"><input className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} /></Field>
          <Field label="Logo URL"><input className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} /></Field>
          <Field label="定价 *">
            <select className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.pricing} onChange={(e) => update('pricing', e.target.value)}>
              <option value="FREE">FREE</option>
              <option value="FREEMIUM">FREEMIUM</option>
              <option value="PAID">PAID</option>
            </select>
          </Field>
          <Field label="难度 *">
            <select className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </Field>
          <Field label="排序 *"><input type="number" className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.sortOrder} onChange={(e) => update('sortOrder', e.target.value)} /></Field>
          <Field label="发布状态 *">
            <select className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={form.publishStatus} onChange={(e) => update('publishStatus', e.target.value)}>
              <option value="DRAFT">DRAFT</option>
              <option value="PREVIEW">PREVIEW</option>
              <option value="PENDING_REVIEW">PENDING_REVIEW</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea label="说明 *" value={form.description} onChange={(value) => update('description', value)} />
          <TextArea label="适合任务 *" value={form.bestFor} onChange={(value) => update('bestFor', value)} />
          <TextArea label="不适合任务" value={form.notFor} onChange={(value) => update('notFor', value)} />
          <TextArea label="推荐理由 *" value={form.whyRecommended} onChange={(value) => update('whyRecommended', value)} />
          <TextArea label="三步上手 *" value={form.quickStart} onChange={(value) => update('quickStart', value)} />
          <TextArea label="示例提示词" value={form.promptExample} onChange={(value) => update('promptExample', value)} />
          <TextArea label="SEO 标题" value={form.seoTitle} onChange={(value) => update('seoTitle', value)} />
          <TextArea label="SEO 描述" value={form.seoDescription} onChange={(value) => update('seoDescription', value)} />
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <label className="mb-3 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.isTop} onChange={(e) => update('isTop', e.target.checked)} />
            精选工具
          </label>
          <p className="mb-2 text-xs text-muted-foreground">关联场景</p>
          <div className="grid gap-2 md:grid-cols-2">
            {scenes.map((scene) => (
              <label key={scene.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.sceneIds.includes(scene.id)}
                  onChange={(e) => {
                    const sceneIds = e.target.checked ? [...form.sceneIds, scene.id] : form.sceneIds.filter((id) => id !== scene.id)
                    update('sceneIds', sceneIds)
                  }}
                />
                {scene.title}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onSubmit} disabled={saving}>{saving ? '保存中...' : submitLabel}</Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm text-muted-foreground"><span className="mb-1 block text-xs">{label}</span>{children}</label>
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-muted-foreground">
      <span className="mb-1 block text-xs">{label}</span>
      <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-1.5 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
