// 工具建议卡片 — 展示当前工具和更优工具
interface ToolGuidanceCardProps {
  guidance: {
    currentTool: string
    currentToolUsage: string
    betterTool: string | null
    betterToolUsage: string | null
    migrationTrigger: string | null
  }
}

export function ToolGuidanceCard({ guidance }: ToolGuidanceCardProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-blue-900">工具建议</h4>

      {/* 当前工具 */}
      <div className="mb-2">
        <span className="text-xs font-medium text-blue-700">当前工具：</span>
        <span className="text-sm text-zinc-800">{guidance.currentTool}</span>
        <p className="mt-0.5 text-xs text-zinc-600">{guidance.currentToolUsage}</p>
      </div>

      {/* 更优工具 */}
      {guidance.betterTool && (
        <div className="mb-2">
          <span className="text-xs font-medium text-green-700">更优工具：</span>
          <span className="text-sm text-zinc-800">{guidance.betterTool}</span>
          <p className="mt-0.5 text-xs text-zinc-600">{guidance.betterToolUsage}</p>
        </div>
      )}

      {/* 迁移触发条件 */}
      {guidance.migrationTrigger && (
        <div>
          <span className="text-xs font-medium text-amber-700">迁移条件：</span>
          <span className="text-xs text-zinc-600">{guidance.migrationTrigger}</span>
        </div>
      )}
    </div>
  )
}
