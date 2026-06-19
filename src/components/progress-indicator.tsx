// 节点进度指示器 — 切换节点完成状态
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ProgressIndicatorProps {
  nodeId: string
  initialStatus: string | null
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: '未开始',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
}

// 状态流转：未开始 → 进行中 → 已完成
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
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-600">
        状态：
        <span className={
          status === 'COMPLETED'
            ? 'font-medium text-green-600'
            : status === 'IN_PROGRESS'
            ? 'font-medium text-blue-600'
            : 'text-zinc-500'
        }>
          {statusLabels[status]}
        </span>
      </span>
      {status !== 'COMPLETED' ? (
        <Button onClick={handleToggle} disabled={loading} size="sm" variant="outline">
          {status === 'NOT_STARTED' ? '开始学习' : '标记完成'}
        </Button>
      ) : (
        <span className="text-green-600">&#10003; 已完成</span>
      )}
    </div>
  )
}
