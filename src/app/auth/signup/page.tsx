// 注册页面
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('两次密码不一致')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '注册失败')
        return
      }

      router.push('/auth/signin?registered=true')
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ink-gradient rice-paper min-h-screen px-4 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <span className="seal-stamp rounded-sm bg-background/60 text-xs">开卷立档</span>
          <h1 className="mt-6 text-5xl font-black tracking-wide text-foreground">建立你的 AI 能力档案</h1>
          <p className="mt-5 max-w-xl leading-8 text-muted-foreground">注册后即可收藏场景、记录学习进度，并提交每个节点的能力证据。</p>
        </div>

        <Card className="scroll-card border-border bg-card/85">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">注册账号</CardTitle>
            <CardDescription>创建您的 AI之翼 账号</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input id="name" name="name" type="text" placeholder="您的姓名" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" name="password" type="password" placeholder="至少6位" minLength={6} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="再次输入密码" minLength={6} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              已有账号？{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">去登录</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
