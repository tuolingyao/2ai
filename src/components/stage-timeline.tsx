// 四阶段时间线组件 — 水平展示四个阶段概览
'use client'

const stageLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

const stageDescs: Record<string, string> = {
  UNDERSTAND: '搞清楚做什么、为什么做、标准是什么',
  HANDS_ON: '在 AI 辅助下完成一次完整实践',
  STABLE_PRODUCTION: '复用 AI 上下文，连续完成多次产出',
  ADVANCE: '发现瓶颈，用 AI 辅助优化升级',
}

interface StageTimelineProps {
  stages: { stageType: string; id: string }[]
  stageProgresses?: Record<string, { completedNodes: number; totalNodes: number; isCompleted: boolean }> | null
}

export function StageTimeline({ stages, stageProgresses }: StageTimelineProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {stages.map((stage, i) => {
        const progress = stageProgresses?.[stage.id]
        return (
        <div key={stage.id} className="flex items-center sm:flex-1">
          {/* 步骤 */}
          <button
            onClick={() => {
              document.getElementById(`stage-${stage.id}`)?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center hover:opacity-80 transition-opacity"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              {i + 1}
              {progress?.isCompleted && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <div className="sm:text-center">
              <span className="text-sm font-medium text-zinc-900">
                {stageLabels[stage.stageType] || stage.stageType}
              </span>
              {progress && !progress.isCompleted && progress.completedNodes > 0 && (
                <span className="ml-2 text-xs text-amber-600 sm:ml-0 sm:block sm:mt-0.5">
                  {progress.completedNodes}/{progress.totalNodes}
                </span>
              )}
              {!progress?.isCompleted && (
                <span className="ml-2 text-xs text-zinc-500 sm:ml-0 sm:block sm:mt-0.5 sm:max-w-[120px] sm:mx-auto">
                  {stageDescs[stage.stageType]}
                </span>
              )}
            </div>
          </button>
          {/* 连接线 — 移动端隐藏，桌面端水平 */}
          {i < stages.length - 1 && (
            <div className="hidden sm:block mx-2 h-0.5 flex-1 bg-zinc-200" />
          )}
        </div>
        )
      })}
    </div>
  )
}
