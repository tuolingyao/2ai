// 首页 — 品牌区 + 推荐场景 + 学习路径说明 + 场景入口
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SceneCard } from '@/components/scene-card'

export const metadata: Metadata = {
  title: 'AI之翼 — AI 场景式学习与能力进阶',
  description:
    'AI之翼帮助你按真实场景学会 AI 能力，从理解到上手，从独立产出到持续进阶，每一步都有 AI 陪伴',
}

// 四阶段学习骨架
const stages = [
  {
    step: '01',
    title: '理解',
    desc: '搞清楚做什么、为什么做、标准是什么',
  },
  {
    step: '02',
    title: '上手',
    desc: '在 AI 辅助下完成一次完整实践',
  },
  {
    step: '03',
    title: '独立稳定产出',
    desc: '复用 AI 上下文，连续完成多次产出',
  },
  {
    step: '04',
    title: '持续进阶',
    desc: '发现瓶颈，用 AI 辅助优化升级',
  },
]

export default async function HomePage() {
  // 查询推荐场景
  const recommendedScenes = await prisma.scene.findMany({
    where: {
      publishStatus: 'PUBLISHED',
      isRecommended: true,
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      taxonomies: {
        include: {
          taxonomy: {
            select: { name: true, type: true },
          },
        },
      },
    },
  })

  return (
    <div>
      {/* 品牌区 */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-5xl font-bold text-zinc-900">AI之翼</h1>
          <p className="mt-4 text-xl text-zinc-600">给每个人装上 AI 的翅膀</p>
          <Link
            href="/scenes"
            className="mt-8 inline-block rounded-lg bg-zinc-900 px-8 py-3 text-white hover:bg-zinc-700 transition-colors"
          >
            开始学习
          </Link>
        </div>
      </section>

      {/* 推荐场景 */}
      {recommendedScenes.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900">推荐场景</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedScenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
          </div>
        </section>
      )}

      {/* 学习路径说明 */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
            四阶段学习骨架
          </h2>
          <p className="mb-10 text-center text-zinc-600">
            从理解到上手，从稳定产出到持续进阶，每一步都有 AI 陪伴
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((s) => (
              <div
                key={s.step}
                className="rounded-lg border bg-white p-6 text-center"
              >
                <div className="mb-3 text-3xl font-bold text-blue-500">
                  {s.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                  {s.title}
                </h3>
                <p className="text-sm text-zinc-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 场景入口 */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900">
            找到适合你的学习场景
          </h2>
          <p className="mb-8 text-zinc-600">
            浏览所有场景，选择你感兴趣的方向开始学习
          </p>
          <Link
            href="/scenes"
            className="inline-block rounded-lg border border-zinc-900 px-8 py-3 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            进入场景库
          </Link>
        </div>
      </section>

      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'AI之翼',
            description: 'AI 场景式学习与能力进阶网站',
            url: 'https://aiwings.example.com',
          }),
        }}
      />
    </div>
  )
}
