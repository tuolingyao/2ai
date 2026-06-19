// 退出登录按钮 — 客户端组件
'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="rounded-md border px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
    >
      退出登录
    </button>
  )
}
