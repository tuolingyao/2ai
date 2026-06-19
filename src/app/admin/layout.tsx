// 后台布局 — 需要管理员/编辑/审核角色
import { requireRole } from '@/lib/auth-guard'
import { AdminShell } from './shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 权限检查：ADMIN/EDITOR/REVIEWER 可访问
  await requireRole(['ADMIN', 'EDITOR', 'REVIEWER'])

  return <AdminShell>{children}</AdminShell>
}
