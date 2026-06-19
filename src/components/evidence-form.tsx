// 能力证据提交表单 — 提交/编辑/删除能力证据
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

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
        // 更新
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
        // 创建
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
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-700">能力证据</h4>

      {evidence && !editing ? (
        <div className="rounded-md border bg-white p-3">
          <p className="text-sm text-zinc-800 whitespace-pre-wrap">{evidence.content}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              编辑
            </Button>
            <Button size="sm" variant="outline" onClick={handleDelete} disabled={loading}>
              删除
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="记录你的能力证据..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSubmit} disabled={loading || !content.trim()} size="sm">
            {evidence ? '更新' : '提交'}
          </Button>
        </div>
      )}
    </div>
  )
}
