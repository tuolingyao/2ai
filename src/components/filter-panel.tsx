// 筛选面板组件 — 按分类标签筛选场景
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, Suspense } from 'react'
import { Badge } from '@/components/ui/badge'

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

  // 获取分类标签
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
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={selectedCategory === cat.slug ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => toggleCategory(cat.slug)}
        >
          {cat.name}
        </Badge>
      ))}
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
