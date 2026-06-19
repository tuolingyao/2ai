// 能力证据提交表单 — 提交/编辑/删除能力证据
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'

interface Evidence {
  id: string
  content: string
}

interface EvidenceFormProps {
  nodeId: string
  existingEvidence: Evidence | null
}

export function EvidenceForm({ nodeId, existingEvidence }: EvidenceFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState(existingEvidence?.content || '')
  const [evidence, setEvidence] = useState<Evidence | null>(existingEvidence)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(!existingEvidence)

  async function handleSubmit() {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    if (!content.trim()) return

    setLoading(true)
    try {
      if (evidence) {
        const res = await fetch(`/api/user/evidences/${evidence.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() }),
        })
        if (res.ok) {
          const data = await res.json()
          setEvidence(data)
          setEditing(false)
        }
      } else {
        const res = await fetch('/api/user/evidences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId, content: content.trim() }),
        })
        if (res.ok) {
          const data = await res.json()
          setEvidence(data)
          setEditing(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!evidence) return

    setLoading(true)
    try {
      const res = await fetch(`/api/user/evidences/${evidence.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setEvidence(null)
        setContent('')
        setEditing(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <h4 className="text-sm font-semibold text-foreground">能力证据</h4>

      {evidence && !editing ? (
        <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{evidence.content}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-primary hover:text-primary" onClick={() => setEditing(true)}>
              编辑
            </button>
            <button type="button" className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-primary hover:text-primary" onClick={handleDelete} disabled={loading}>
              删除
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <Textarea
            placeholder="记录你的能力证据..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {evidence ? '更新' : '提交'}
          </button>
        </div>
      )}
    </div>
  )
}
