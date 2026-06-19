// 搜索栏组件 — 输入关键词后更新 URL 参数
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function SearchBarInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    params.delete('page') // 搜索时重置页码
    router.push(`/scenes?${params.toString()}`)
  }, [query, searchParams, router])

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="搜索场景..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="max-w-sm"
      />
      <Button onClick={handleSearch} variant="outline">
        搜索
      </Button>
    </div>
  )
}

export function SearchBar() {
  return (
    <Suspense>
      <SearchBarInner />
    </Suspense>
  )
}
