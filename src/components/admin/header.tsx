// 后台顶部栏
'use client'

import { useSession, signOut } from 'next-auth/react'
import { SidebarToggle } from './sidebar'

export function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { data: session } = useSession()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarToggle onClick={onToggleSidebar} />
        <h1 className="text-sm font-medium text-foreground">AI之翼管理后台</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{session?.user?.name || '未登录'}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          退出
        </button>
      </div>
    </header>
  )
}
