// 阶段详情区块组件 — 展示单个阶段的完整内容
import { NodeCard } from './node-card'
import { ToolGuidanceCard } from './tool-guidance-card'

const stageLabels: Record<string, string> = {
  UNDERSTAND: '理解',
  HANDS_ON: '上手',
  STABLE_PRODUCTION: '独立稳定产出',
  ADVANCE: '持续进阶',
}

interface NodeData {
  id: string
  title: string
  slug: string
  objective: string
  sceneSlug: string
}

interface ToolGuidanceData {
  id: string
  currentTool: string
  currentToolUsage: string
  betterTool: string | null
  betterToolUsage: string | null
  migrationTrigger: string | null
}

interface StageSectionProps {
  stage: {
    id: string
    stageType: string
    capabilityStd: string
    learningFocus: string
    practiceTask: string
    capabilityEvidence: string
    aiIntervention: string
    sortOrder: number
  }
  nodes: NodeData[]
  toolGuidances: ToolGuidanceData[]
  stageIndex: number
  stageProgress?: { completedNodes: number; totalNodes: number; isCompleted: boolean; inProgressCount: number } | null
}

export function StageSection({ stage, nodes, toolGuidances, stageIndex, stageProgress }: StageSectionProps) {
  return (
    <section id={`stage-${stage.id}`} className="scroll-mt-20">
      <div className="rounded-lg border bg-white p-6">
        {/* 阶段标题 */}
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
            {stageIndex + 1}
          </span>
          <h2 className="text-xl font-bold text-zinc-900">
            {stageLabels[stage.stageType] || stage.stageType}
          </h2>
          {stageProgress?.isCompleted && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white" title="阶段已完成">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          {stageProgress && !stageProgress.isCompleted && (stageProgress.completedNodes > 0 || stageProgress.inProgressCount > 0) && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {stageProgress.completedNodes}/{stageProgress.totalNodes} 节点已完成
            </span>
          )}
        </div>

        {/* 阶段内容 */}
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-zinc-700">能力标准：</span>
            <span className="text-zinc-600">{stage.capabilityStd}</span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">学习重点：</span>
            <span className="text-zinc-600">{stage.learningFocus}</span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">练习任务：</span>
            <span className="text-zinc-600">{stage.practiceTask}</span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">能力证据：</span>
            <span className="text-zinc-600">{stage.capabilityEvidence}</span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">AI 介入方式：</span>
            <span className="text-zinc-600">{stage.aiIntervention}</span>
          </div>
        </div>

        {/* 学习节点 */}
        {nodes.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-zinc-700">学习节点</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {nodes.map((node) => (
                <NodeCard key={node.id} node={node} />
              ))}
            </div>
          </div>
        )}

        {/* 工具建议（后置展示） */}
        {toolGuidances.length > 0 && (
          <div className="mt-6">
            {toolGuidances.map((guidance) => (
              <ToolGuidanceCard key={guidance.id} guidance={guidance} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
