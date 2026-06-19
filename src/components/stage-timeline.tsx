// 四阶段时间线组件 — 学习地图导航
'use client'

const stageLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

const stageDescs: Record<string, string> = {
  UNDERSTAND: '明确目标与标准',
  HANDS_ON: '完成首次实践',
  STABLE_PRODUCTION: '形成稳定产出',
  ADVANCE: '优化升级工作流',
}

interface StageTimelineProps {
  stages: { stageType: string; id: string }[]
  stageProgresses?: Record<string, { completedNodes: number; totalNodes: number; isCompleted: boolean }> | null
}

export function StageTimeline({ stages, stageProgresses }: StageTimelineProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage, i) => {
        const progress = stageProgresses?.[stage.id]
        const started = progress && progress.completedNodes > 0
        return (
          <button
            key={stage.id}
            onClick={() => {
              document.getElementById(`stage-${stage.id}`)?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary ${
              progress?.isCompleted
                ? 'border-primary bg-primary/10'
                : started
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-border bg-background/60'
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="seal-stamp rounded-sm text-xs">0{i + 1}</span>
              {progress?.isCompleted ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">已完成</span>
              ) : started ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                  {progress.completedNodes}/{progress.totalNodes}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">未开始</span>
              )}
            </div>
            <h3 className="font-bold text-foreground">{stageLabels[stage.stageType] || stage.stageType}</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{stageDescs[stage.stageType]}</p>
          </button>
        )
      })}
    </div>
  )
}
