// 质量检查面板组件 — 显示检查结果，控制发布按钮
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CheckItem {
  name: string
  passed: boolean
  message?: string
}

interface QualityCheckPanelProps {
  sceneId: string
  canPublish: boolean
}

export function QualityCheckPanel({ sceneId, canPublish }: QualityCheckPanelProps) {
  const [checks, setChecks] = useState<CheckItem[]>([])
  const [passed, setPassed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 执行质量检查
  async function runCheck() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/quality-check/${sceneId}`)
      if (res.ok) {
        const data = await res.json()
        setChecks(data.checks)
        setPassed(data.passed)
      }
    } finally {
      setLoading(false)
    }
  }

  // 发布操作
  async function handleAction(action: string) {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/admin/scenes/${sceneId}/${action}`, { method: 'POST' })
      if (res.ok) {
        alert(action === 'publish' ? '发布成功' : action === 'offline' ? '已下线' : action === 'preview' ? '已设为预览' : '已提交审核')
        window.location.reload()
      } else {
        const data = await res.json()
        if (data.checks) {
          setChecks(data.checks)
          setPassed(false)
        }
        alert(data.error || '操作失败')
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold text-zinc-900">发布管理</h2>
        <Button onClick={runCheck} disabled={loading} size="sm" variant="outline">
          {loading ? '检查中...' : '质量检查'}
        </Button>
      </div>

      {/* 检查结果 */}
      {checks.length > 0 && (
        <div className="border-b px-4 py-3 space-y-2">
          {checks.map((check, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex-shrink-0">
                {check.passed ? (
                  <span className="text-green-600">&#10003;</span>
                ) : (
                  <span className="text-red-600">&#10007;</span>
                )}
              </span>
              <div>
                <span className={check.passed ? 'text-zinc-700' : 'text-red-700 font-medium'}>
                  {check.name}
                </span>
                {check.message && (
                  <p className="mt-0.5 text-xs text-red-600">{check.message}</p>
                )}
              </div>
            </div>
          ))}
          {passed !== null && (
            <p className={`text-sm font-medium ${passed ? 'text-green-700' : 'text-red-700'}`}>
              {passed ? '所有检查通过，可以发布' : '存在未通过项，请修复后再发布'}
            </p>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2 px-4 py-3">
        <Button
          onClick={() => handleAction('preview')}
          disabled={actionLoading !== null}
          size="sm"
          variant="outline"
        >
          {actionLoading === 'preview' ? '处理中...' : '设为预览'}
        </Button>
        <Button
          onClick={() => handleAction('submit-review')}
          disabled={actionLoading !== null}
          size="sm"
          variant="outline"
        >
          {actionLoading === 'submit-review' ? '处理中...' : '提交审核'}
        </Button>
        {canPublish && (
          <>
            <Button
              onClick={() => handleAction('publish')}
              disabled={actionLoading !== null || passed === false}
              size="sm"
            >
              {actionLoading === 'publish' ? '发布中...' : '发布'}
            </Button>
            <Button
              onClick={() => handleAction('offline')}
              disabled={actionLoading !== null}
              size="sm"
              variant="destructive"
            >
              {actionLoading === 'offline' ? '处理中...' : '下线'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
