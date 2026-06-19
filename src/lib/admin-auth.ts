// 后台统一权限检查模块
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 验证后台管理权限
 * 返回用户信息（含角色）或 null（无权限）
 * 适用于 ADMIN / EDITOR / REVIEWER 三种角色
 */
export async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !['ADMIN', 'EDITOR', 'REVIEWER'].includes(user.role)) return null
  return user
}

/**
 * 检查用户是否有删除权限（仅 ADMIN）
 */
export function canDelete(role: string): boolean {
  return role === 'ADMIN'
}

/**
 * 检查用户是否有发布权限（ADMIN 或 REVIEWER）
 */
export function canPublish(role: string): boolean {
  return role === 'ADMIN' || role === 'REVIEWER'
}

/**
 * 检查用户是否有创建/编辑权限（ADMIN 或 EDITOR）
 */
export function canEdit(role: string): boolean {
  return role === 'ADMIN' || role === 'EDITOR'
}
