// 前台顶部导航
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 左侧 Logo + 导航 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-zinc-900">
            AI之翼
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
              首页
            </Link>
            <Link href="/scenes" className="text-sm text-zinc-600 hover:text-zinc-900">
              场景库
            </Link>
          </nav>
        </div>

        {/* 右侧用户区域 */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="text-sm text-zinc-600">{session.user.name}</span>
              {['ADMIN', 'EDITOR', 'REVIEWER'].includes(session.user.role || '') && (
                <Link
                  href="/admin"
                  className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                  后台
                </Link>
              )}
              <Link
                href="/account"
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                我的账户
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700"
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
