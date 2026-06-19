// 我的账户页面 — 个人修行档案
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SignOutButton } from '@/components/account/sign-out-button'

const roleLabels: Record<string, string> = {
  ADMIN: '管理员',
  EDITOR: '内容编辑',
  REVIEWER: '审核发布者',
  USER: '普通用户',
}

const statusLabels: Record<string, string> = {
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
}

export default async function AccountPage() {
  const user = await requireAuth()

  const [favorites, progressList, totalNodes] = await Promise.all([
    prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        scene: {
          select: { id: true, title: true, slug: true, summary: true },
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
            scene: { select: { slug: true, title: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.learningNode.count(),
  ])

  const completedCount = progressList.filter((p) => p.status === 'COMPLETED').length
  const inProgressCount = progressList.filter((p) => p.status === 'IN_PROGRESS').length
  const notStartedCount = Math.max(0, totalNodes - completedCount - inProgressCount)

  return (
    <div className="min-h-screen">
      <section className="ink-gradient rice-paper border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-4">
          <span className="seal-stamp rounded-sm bg-background/60 text-xs">个人修行档案</span>
          <div className="mt-6 flex flex-col gap-6 rounded-[2rem] border border-border bg-card/80 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground">{user.name}</h1>
              <p className="mt-2 text-muted-foreground">{user.email}</p>
              <span className="mt-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                {roleLabels[user.role] || user.role}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="已完成" value={completedCount} tone="primary" />
          <StatCard title="进行中" value={inProgressCount} tone="amber" />
          <StatCard title="未开始" value={notStartedCount} tone="muted" />
        </div>

        {totalNodes > 0 && (
          <div className="mt-6 scroll-card rounded-3xl p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">总进度</span>
              <span className="text-muted-foreground">{completedCount}/{totalNodes} 节点已完成</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div className="h-3 rounded-full bg-primary" style={{ width: `${(completedCount / totalNodes) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="scroll-card rounded-[2rem]">
            <div className="border-b border-border px-6 py-5">
              <h2 className="text-xl font-black text-foreground">我的收藏</h2>
            </div>
            {favorites.length === 0 ? (
              <p className="px-6 py-10 text-sm text-muted-foreground">暂无收藏</p>
            ) : (
              <div className="divide-y divide-border">
                {favorites.map((fav) => (
                  <Link key={fav.id} href={`/scenes/${fav.scene.slug}`} className="block px-6 py-4 transition hover:bg-primary/5">
                    <h3 className="font-bold text-foreground hover:text-primary">{fav.scene.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{fav.scene.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="scroll-card rounded-[2rem]">
            <div className="border-b border-border px-6 py-5">
              <h2 className="text-xl font-black text-foreground">最近学习</h2>
            </div>
            {progressList.length === 0 ? (
              <p className="px-6 py-10 text-sm text-muted-foreground">暂无学习记录</p>
            ) : (
              <div className="divide-y divide-border">
                {progressList.map((p) => (
                  <div key={p.id} className="px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground">{p.node.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.node.scene.title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs ${p.status === 'COMPLETED' ? 'bg-primary text-primary-foreground' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>
                          {statusLabels[p.status] || p.status}
                        </span>
                        <Link href={`/scenes/${p.node.scene.slug}/nodes/${p.node.slug}`} className={p.status === 'IN_PROGRESS' ? 'rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90' : 'text-xs font-semibold text-primary hover:underline'}>
                          {p.status === 'IN_PROGRESS' ? '继续学习' : '查看'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, tone }: { title: string; value: number; tone: 'primary' | 'amber' | 'muted' }) {
  const toneClass = tone === 'primary' ? 'text-primary bg-primary/10' : tone === 'amber' ? 'text-amber-700 bg-amber-500/10 dark:text-amber-300' : 'text-muted-foreground bg-muted'
  return (
    <div className="scroll-card rounded-3xl p-6 text-center">
      <p className={`mx-auto mb-4 inline-flex rounded-full px-3 py-1 text-xs ${toneClass}`}>{title}</p>
      <p className="text-4xl font-black text-foreground">{value}</p>
    </div>
  )
}
