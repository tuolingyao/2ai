// 后台外壳组件（客户端，管理 Sidebar 状态）
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-zinc-50 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
