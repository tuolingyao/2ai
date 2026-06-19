// 认证辅助函数
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 获取当前登录用户（服务端用）
 * 返回完整的用户信息，未登录返回 null
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  })

  return user
}

/**
 * 必须登录，否则重定向到登录页
 * 返回当前用户信息
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return user
}

/**
 * 必须具有指定角色之一，否则返回 403
 * @param roles 允许的角色列表
 */
export async function requireRole(roles: string | string[]) {
  const user = await requireAuth()

  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  // ADMIN 始终拥有所有权限
  if (user.role === 'ADMIN' || allowedRoles.includes(user.role)) {
    return user
  }

  throw new Error('权限不足')
}
