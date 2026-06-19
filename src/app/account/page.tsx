// 我的账户页面 — 个人信息 + 收藏 + 学习记录 + 进度总览
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SignOutButton } from '@/components/account/sign-out-button'

// 角色中文映射
const roleLabels: Record<string, string> = {
  ADMIN: '管理员',
  EDITOR: '内容编辑',
  REVIEWER: '审核发布者',
  USER: '普通用户',
}

// 进度状态映射
const statusLabels: Record<string, string> = {
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
}

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

export default async function AccountPage() {
  const user = await requireAuth()

  // 并行查询收藏和进度数据
  const [favorites, progressList, totalNodes] = await Promise.all([
    prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        scene: {
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        node: {
          select: {
            id: true,
            title: true,
            slug: true,
            scene: {
              select: { slug: true, title: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.learningNode.count(),
  ])

  // 统计进度
  const completedCount = progressList.filter((p) => p.status === 'COMPLETED').length
  const inProgressCount = progressList.filter((p) => p.status === 'IN_PROGRESS').length
  const notStartedCount = totalNodes - completedCount - inProgressCount

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">我的账户</h1>

      {/* ===== 个人信息 ===== */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{user.name}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
              {roleLabels[user.role] || user.role}
            </span>
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* ===== 学习进度总览 ===== */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">学习进度</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-green-700">已完成</p>
          </div>
          <div className="rounded-md bg-blue-50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
            <p className="text-xs text-blue-700">进行中</p>
          </div>
          <div className="rounded-md bg-zinc-50 p-3 text-center">
            <p className="text-2xl font-bold text-zinc-500">{Math.max(0, notStartedCount)}</p>
            <p className="text-xs text-zinc-600">未开始</p>
          </div>
        </div>
        {totalNodes > 0 && (
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${(completedCount / totalNodes) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              总进度 {completedCount}/{totalNodes} 节点已完成
            </p>
          </div>
        )}
      </div>

      {/* ===== 收藏列表 ===== */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">我的收藏</h2>
        </div>
        {favorites.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-500">暂无收藏</p>
        ) : (
          <div className="divide-y">
            {favorites.map((fav) => (
              <div key={fav.id} className="flex items-center justify-between px-6 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/scenes/${fav.scene.slug}`}
                    className="font-medium text-zinc-900 hover:text-blue-600 hover:underline"
                  >
                    {fav.scene.title}
                  </Link>
                  <p className="mt-0.5 truncate text-sm text-zinc-500">{fav.scene.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== 最近学习 ===== */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">最近学习</h2>
        </div>
        {progressList.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-500">暂无学习记录</p>
        ) : (
          <div className="divide-y">
            {progressList.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{p.node.title}</p>
                  <p className="text-xs text-zinc-500">{p.node.scene.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || 'bg-zinc-100 text-zinc-700'}`}>
                    {statusLabels[p.status] || p.status}
                  </span>
                  {p.status === 'IN_PROGRESS' && (
                    <Link
                      href={`/scenes/${p.node.scene.slug}/nodes/${p.node.slug}`}
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      继续学习
                    </Link>
                  )}
                  {p.status === 'COMPLETED' && (
                    <Link
                      href={`/scenes/${p.node.scene.slug}/nodes/${p.node.slug}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      查看
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
