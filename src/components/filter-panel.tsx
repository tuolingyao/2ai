// 筛选面板组件 — 按分类标签筛选场景
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, Suspense } from 'react'

interface Taxonomy {
  id: string
  name: string
  slug: string
  type: string
}

function FilterPanelInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Taxonomy[]>([])

  const selectedCategory = searchParams.get('category') || ''

  useEffect(() => {
    fetch('/api/taxonomies?type=CATEGORY')
      .then((res) => res.json())
      .then((data) => setCategories(data))
  }, [])

  const toggleCategory = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (selectedCategory === slug) {
        params.delete('category')
      } else {
        params.set('category', slug)
      }
      params.delete('page')
      router.push(`/scenes?${params.toString()}`)
    },
    [selectedCategory, searchParams, router]
  )

  if (categories.length === 0) return null

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-foreground">场景分类</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = selectedCategory === cat.slug
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background/60 text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FilterPanel() {
  return (
    <Suspense>
      <FilterPanelInner />
    </Suspense>
  )
}
