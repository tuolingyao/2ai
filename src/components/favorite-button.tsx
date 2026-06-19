// 收藏按钮组件 — 切换收藏/取消收藏
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

interface FavoriteButtonProps {
  sceneId: string
  isFavorited: boolean
}

export function FavoriteButton({ sceneId, isFavorited: initialFavorited }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId }),
      })

      if (res.ok) {
        setIsFavorited(!isFavorited)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        isFavorited
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background/70 text-foreground hover:border-primary hover:text-primary'
      }`}
    >
      <Heart className="h-4 w-4" />
      {isFavorited ? '已收藏' : '收藏场景'}
    </button>
  )
}
