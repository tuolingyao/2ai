// 节点进度指示器 — 切换节点完成状态
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ProgressIndicatorProps {
  nodeId: string
  initialStatus: string | null
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: '未开始',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
}

function nextStatus(current: string): string {
  if (current === 'NOT_STARTED') return 'IN_PROGRESS'
  if (current === 'IN_PROGRESS') return 'COMPLETED'
  return 'COMPLETED'
}

export function ProgressIndicator({ nodeId, initialStatus }: ProgressIndicatorProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus || 'NOT_STARTED')
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    const newStatus = nextStatus(status)
    setLoading(true)
    try {
      const res = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, status: newStatus }),
      })

      if (res.ok) {
        setStatus(newStatus)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">学习状态</span>
        <span className={`rounded-full px-3 py-1 text-xs ${
          status === 'COMPLETED'
            ? 'bg-primary text-primary-foreground'
            : status === 'IN_PROGRESS'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'bg-muted text-muted-foreground'
        }`}>{statusLabels[status]}</span>
      </div>
      {status !== 'COMPLETED' ? (
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className="w-full rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          {status === 'NOT_STARTED' ? '开始学习' : '标记完成'}
        </button>
      ) : (
        <p className="text-sm text-primary">✓ 此节点已完成</p>
      )}
    </div>
  )
}
