// 阶段区块组件 — 展示阶段目标、节点和工具建议
import { NodeCard } from './node-card'
import { ToolGuidanceCard } from './tool-guidance-card'

const stageLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

interface StageSectionProps {
  stage: {
    id: string
    stageType: string
    capabilityStd: string
    learningFocus: string
    practiceTask: string
    capabilityEvidence: string
    commonFailure?: string | null
    remedialAction?: string | null
    nodes: {
      id: string
      title: string
      slug: string
      objective: string
      sceneSlug: string
    }[]
    toolGuidances: {
      id: string
      currentTool: string
      currentToolUsage: string
      betterTool: string | null
      betterToolUsage: string | null
      migrationTrigger: string | null
    }[]
  }
  stageProgress?: { completedNodes: number; totalNodes: number; isCompleted: boolean } | null
}

export function StageSection({ stage, stageProgress }: StageSectionProps) {
  return (
    <section id={`stage-${stage.id}`} className="scroll-mt-28 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="seal-stamp rounded-sm bg-background/60 text-sm">{stageLabels[stage.stageType] || stage.stageType}</span>
            {stageProgress?.isCompleted ? (
              <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">阶段已完成</span>
            ) : stageProgress && stageProgress.completedNodes > 0 ? (
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                {stageProgress.completedNodes}/{stageProgress.totalNodes} 节点已完成
              </span>
            ) : null}
          </div>
          <h2 className="text-2xl font-black text-foreground">{stage.capabilityStd}</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background/70 p-5">
          <p className="text-xs font-semibold text-primary">学习重点</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{stage.learningFocus}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background/70 p-5">
          <p className="text-xs font-semibold text-primary">练习任务</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{stage.practiceTask}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background/70 p-5">
          <p className="text-xs font-semibold text-primary">能力证据</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{stage.capabilityEvidence}</p>
        </div>
      </div>

      {(stage.commonFailure || stage.remedialAction) && (
        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-7 text-muted-foreground">
          {stage.commonFailure && <p><span className="font-semibold text-foreground">常见卡点：</span>{stage.commonFailure}</p>}
          {stage.remedialAction && <p className="mt-2"><span className="font-semibold text-foreground">补救动作：</span>{stage.remedialAction}</p>}
        </div>
      )}

      {stage.nodes.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-foreground">学习节点</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {stage.nodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}

      {stage.toolGuidances.length > 0 && (
        <div className="mt-8 space-y-4">
          {stage.toolGuidances.map((guidance) => (
            <ToolGuidanceCard key={guidance.id} guidance={guidance} />
          ))}
        </div>
      )}
    </section>
  )
}
