// 首页 — 赛博水墨品牌故事 + 推荐场景 + 四阶段路径
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SceneCard } from '@/components/scene-card'

export const metadata: Metadata = {
  title: 'AI之翼 — AI 场景式学习与能力进阶',
  description:
    'AI之翼帮助你按真实场景学会 AI 能力，从理解到上手，从独立产出到持续进阶，每一步都有 AI 陪伴',
}

const stages = [
  { step: '一', title: '理解', desc: '识别场景、目标和评价标准' },
  { step: '二', title: '上手', desc: '跟随 AI 陪练完成一次实践' },
  { step: '三', title: '稳定', desc: '沉淀上下文并连续产出' },
  { step: '四', title: '进阶', desc: '复盘瓶颈并升级工作流' },
]

const reasons = [
  { title: '真实场景', desc: '从公众号、职场效率等任务切入，不背工具名，先解决问题。' },
  { title: 'AI陪练', desc: '每个节点都有示范对话，把提示词、追问和修订过程拆给你看。' },
  { title: '能力证据', desc: '用作品、复盘和可交付物记录进步，让学习不止停留在看过。' },
]

export default async function HomePage() {
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
    <div className="overflow-hidden">
      <section className="ink-gradient rice-paper relative border-b border-border py-20 sm:py-28">
        <div className="absolute left-8 top-10 hidden h-28 w-28 rounded-full border border-primary/20 md:block" />
        <div className="absolute bottom-8 right-10 hidden h-40 w-40 rounded-full bg-primary/10 blur-3xl md:block" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="seal-stamp mb-6 inline-flex rounded-sm bg-background/60 text-sm">场景式 AI 修行谱</div>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-[0.08em] text-foreground sm:text-7xl">
              AI之翼
            </h1>
            <p className="mt-5 text-2xl font-semibold text-primary sm:text-3xl">给每个人装上 AI 的翅膀</p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              不从工具清单开始，而从真实任务进入。每个场景是一张学习地图，每个节点都有 AI 对话、练习任务与能力证据，帮你把 AI 变成稳定产出的习惯。
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/scenes" className="vermilion-gradient rounded-full px-8 py-3 text-center font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
                开始学习
              </Link>
              <Link href="/scenes" className="rounded-full border border-border bg-card/70 px-8 py-3 text-center font-semibold text-foreground backdrop-blur transition hover:border-primary hover:text-primary">
                进入场景库
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="scroll-card cyber-ink-ring rounded-[2rem] p-5 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">四阶段能力进阶图</span>
                <span className="seal-stamp rounded-sm text-xs">卷轴</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {stages.map((stage, index) => (
                  <div key={stage.step} className="group rounded-2xl border border-border bg-background/60 p-5 transition hover:-translate-y-1 hover:border-primary">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">{stage.step}</span>
                      <span className="text-xs text-muted-foreground">0{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{stage.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <div className="mb-4 h-10 w-1 rounded-full bg-primary" />
          <h2 className="text-3xl font-black tracking-wide text-foreground">为什么选择场景式学习</h2>
          <p className="mt-4 text-muted-foreground">把 AI 能力放回任务现场，用可复用流程和作品证据完成进阶。</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="scroll-card rounded-3xl p-7 transition hover:-translate-y-1 hover:border-primary">
              <span className="seal-stamp rounded-sm text-xs">{reason.title.slice(0, 2)}</span>
              <h3 className="mt-6 text-xl font-bold text-foreground">{reason.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{reason.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {recommendedScenes.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="border-l-4 border-primary pl-5">
              <h2 className="text-3xl font-black text-foreground">推荐场景</h2>
              <p className="mt-2 text-muted-foreground">从最适合上手的路径开始修行。</p>
            </div>
            <Link href="/scenes" className="hidden text-sm font-semibold text-primary hover:underline sm:inline">查看全部 →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedScenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="scroll-card rounded-[2rem] p-6 sm:p-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-foreground">四阶段卷轴式进阶路径</h2>
            <p className="mt-3 text-muted-foreground">理解、上手、稳定、进阶，统一节奏贯穿每个场景。</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {stages.map((stage, index) => (
              <div key={stage.step} className="relative rounded-3xl border border-border bg-card/80 p-6">
                {index < stages.length - 1 && <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-primary/50 lg:block" />}
                <div className="mb-5 flex items-center gap-3">
                  <span className="seal-stamp rounded-sm text-xs">第{stage.step}境</span>
                  <span className="text-xs text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{stage.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[oklch(0.14_0.02_260)] p-8 text-center text-white shadow-2xl sm:p-14">
          <div className="mx-auto max-w-3xl">
            <span className="seal-stamp rounded-sm border-primary text-primary">启程</span>
            <h2 className="mt-6 text-3xl font-black sm:text-4xl">找到适合你的学习场景</h2>
            <p className="mt-4 text-white/70">浏览所有场景，选择你最想解决的问题，沿着四阶段地图开始第一次 AI 实践。</p>
            <Link href="/scenes" className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90">
              进入场景库
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'AI之翼',
            description: 'AI 场景式学习与能力进阶网站',
            url: 'https://2ai.8xlab.cn',
          }),
        }}
      />
    </div>
  )
}
