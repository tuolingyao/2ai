// 后台仪表盘 — 统计数据 + 最近更新 + 待审核
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// 发布状态标签映射
const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  PREVIEW: '预览',
  PENDING_REVIEW: '待审核',
  PUBLISHED: '已发布',
  OFFLINE: '已下线',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700',
  PREVIEW: 'bg-blue-100 text-blue-700',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  OFFLINE: 'bg-red-100 text-red-700',
}

export default async function AdminDashboard() {
  await requireRole(['ADMIN', 'EDITOR', 'REVIEWER'])

  // 并行查询统计数据
  const [
    totalScenes,
    publishedScenes,
    draftScenes,
    totalNodes,
    recentScenes,
    pendingReviewScenes,
    totalUsers,
    completedProgress,
    activeUsers,
    topFavorites,
  ] = await Promise.all([
    prisma.scene.count(),
    prisma.scene.count({ where: { publishStatus: 'PUBLISHED' } }),
    prisma.scene.count({ where: { publishStatus: 'DRAFT' } }),
    prisma.learningNode.count(),
    prisma.scene.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        publishStatus: true,
        updatedAt: true,
      },
    }),
    prisma.scene.findMany({
      where: { publishStatus: 'PENDING_REVIEW' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    }),
    // 注册用户数
    prisma.user.count(),
    // 节点完成总数
    prisma.userProgress.count({ where: { status: 'COMPLETED' } }),
    // 活跃用户数（最近7天有进度记录的不重复用户数）
    (async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const active = await prisma.userProgress.findMany({
        where: { updatedAt: { gte: sevenDaysAgo } },
        select: { userId: true },
        distinct: ['userId'],
      })
      return active.length
    })(),
    // 热门场景（按收藏数排序前5）
    prisma.userFavorite.groupBy({
      by: ['sceneId'],
      _count: { sceneId: true },
      orderBy: { _count: { sceneId: 'desc' } },
      take: 5,
    }),
  ])

  // 查询热门场景详情
  const sceneIds = topFavorites.map((s) => s.sceneId)
  const sceneDetails = sceneIds.length > 0
    ? await prisma.scene.findMany({
        where: { id: { in: sceneIds } },
        select: { id: true, title: true, slug: true },
      })
    : []
  const sceneDetailMap = new Map(sceneDetails.map((s) => [s.id, s]))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">仪表盘</h1>

      {/* ===== 统计卡片 ===== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">场景总数</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{totalScenes}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">已发布</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{publishedScenes}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">草稿</p>
          <p className="mt-1 text-3xl font-bold text-zinc-500">{draftScenes}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">学习节点</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{totalNodes}</p>
        </div>
      </div>

      {/* ===== 学习统计卡片 ===== */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">注册用户</p>
          <p className="mt-1 text-3xl font-bold text-purple-600">{totalUsers}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">节点完成总数</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{completedProgress}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">活跃用户（7天）</p>
          <p className="mt-1 text-3xl font-bold text-orange-600">{activeUsers}</p>
        </div>
      </div>

      {/* ===== 最近更新 ===== */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold text-zinc-900">最近更新</h2>
        </div>
        {recentScenes.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">暂无场景</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-4 py-2">标题</th>
                <th className="px-4 py-2">状态</th>
                <th className="px-4 py-2">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {recentScenes.map((scene) => (
                <tr key={scene.id} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/scenes/${scene.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {scene.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[scene.publishStatus]}`}
                    >
                      {statusLabels[scene.publishStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {scene.updatedAt.toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== 待审核 ===== */}
      {pendingReviewScenes.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50">
          <div className="border-b border-amber-200 px-4 py-3">
            <h2 className="font-semibold text-amber-800">待审核内容</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-amber-200 text-left text-xs text-amber-600">
              <tr>
                <th className="px-4 py-2">标题</th>
                <th className="px-4 py-2">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {pendingReviewScenes.map((scene) => (
                <tr key={scene.id} className="border-b border-amber-200 last:border-0">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/scenes/${scene.id}`}
                      className="text-amber-900 hover:underline"
                    >
                      {scene.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-amber-700">
                    {scene.updatedAt.toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== 热门场景 ===== */}
      {topFavorites.length > 0 && (
        <div className="rounded-lg border bg-white overflow-x-auto">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-zinc-900">热门场景</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-4 py-2">排名</th>
                <th className="px-4 py-2">标题</th>
                <th className="px-4 py-2">收藏数</th>
              </tr>
            </thead>
            <tbody>
              {topFavorites.map((fav, index) => {
                const detail = sceneDetailMap.get(fav.sceneId)
                return (
                  <tr key={fav.sceneId} className="border-b last:border-0">
                    <td className="px-4 py-2 text-zinc-500">{index + 1}</td>
                    <td className="px-4 py-2">
                      {detail ? (
                        <Link
                          href={`/admin/scenes/${fav.sceneId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {detail.title}
                        </Link>
                      ) : (
                        <span className="text-zinc-400">已删除的场景</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {fav._count.sceneId}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
