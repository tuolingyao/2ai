// 登录页面
'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SigninForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const registered = searchParams.get('registered')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('邮箱或密码错误')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ink-gradient rice-paper min-h-screen px-4 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <span className="seal-stamp rounded-sm bg-background/60 text-xs">归档入境</span>
          <h1 className="mt-6 text-5xl font-black tracking-wide text-foreground">回到你的 AI 修行地图</h1>
          <p className="mt-5 max-w-xl leading-8 text-muted-foreground">登录后继续收藏、进度和能力证据，所有学习记录只属于你自己。</p>
        </div>

        <Card className="scroll-card border-border bg-card/85">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">登录</CardTitle>
            <CardDescription>登录您的 AI之翼 账号</CardDescription>
          </CardHeader>
          <CardContent>
            {registered && <p className="mb-4 text-sm text-primary">注册成功，请登录</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" name="password" type="password" placeholder="输入密码" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              没有账号？{' '}
              <Link href="/auth/signup" className="text-primary hover:underline">去注册</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SigninPage() {
  return (
    <Suspense>
      <SigninForm />
    </Suspense>
  )
}
