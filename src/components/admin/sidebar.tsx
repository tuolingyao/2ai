// 后台侧边栏
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 导航菜单配置
const navItems = [
  { href: '/admin', label: '仪表盘' },
  { href: '/admin/scenes', label: '场景管理' },
  { href: '/admin/nodes', label: '节点管理' },
  { href: '/admin/tools', label: '工具建议' },
  { href: '/admin/taxonomies', label: '分类标签' },
  { href: '/admin/media', label: '媒体管理' },
  { href: '/admin/settings', label: '站点设置' },
]

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-60 flex-col bg-zinc-900 text-white transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-700 px-4">
          <Link href="/admin" className="text-lg font-bold">
            AI之翼管理
          </Link>
          <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* 导航链接 */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* 返回前台 */}
        <div className="border-t border-zinc-700 p-3">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            ← 返回前台
          </Link>
        </div>
      </aside>
    </>
  )
}

// 移动端菜单按钮
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 lg:hidden"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}
