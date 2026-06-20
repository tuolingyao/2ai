// 前台顶部导航
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* 左侧 Logo + 导航 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="seal-stamp rounded-sm px-2 py-0.5 text-xs">翼</span>
            <span className="tracking-[0.18em] group-hover:text-primary">AI之翼</span>
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              首页
            </Link>
            <Link href="/scenes" className="text-sm text-muted-foreground hover:text-primary">
              场景库
            </Link>
            <Link href="/tools" className="text-sm text-muted-foreground hover:text-primary">
              工具库
            </Link>
          </nav>
        </div>

        {/* 右侧用户区域 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {session?.user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">{session.user.name}</span>
              {['ADMIN', 'EDITOR', 'REVIEWER'].includes(session.user.role || '') && (
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  后台
                </Link>
              )}
              <Link
                href="/account"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                我的账户
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
