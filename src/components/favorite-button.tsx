// 收藏按钮组件 — 切换收藏/取消收藏
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

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
    // 未登录跳转登录页
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
    <Button
      variant={isFavorited ? 'default' : 'outline'}
      onClick={handleToggle}
      disabled={loading}
      size="sm"
    >
      {isFavorited ? '已收藏' : '收藏'}
    </Button>
  )
}
