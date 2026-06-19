// 搜索栏组件 — 输入关键词后更新 URL 参数
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, Suspense } from 'react'
import { Search } from 'lucide-react'

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
    params.delete('page')
    router.push(`/scenes?${params.toString()}`)
  }, [query, searchParams, router])

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索场景、任务或能力..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="h-12 w-full rounded-full border border-border bg-background/70 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>
      <button
        onClick={handleSearch}
        className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        搜索
      </button>
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
