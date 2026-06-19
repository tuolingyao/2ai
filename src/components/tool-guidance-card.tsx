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
    <div className="rounded-3xl border border-accent/25 bg-accent/5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">工具建议</h4>
        <span className="seal-stamp rounded-sm text-xs">后置</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold text-accent dark:text-accent-foreground">当前工具</p>
          <p className="mt-2 font-bold text-foreground">{guidance.currentTool}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{guidance.currentToolUsage}</p>
        </div>

        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary">进阶工具</p>
          <p className="mt-2 font-bold text-foreground">{guidance.betterTool || '暂不需要升级'}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{guidance.betterToolUsage || '先把当前流程跑通，再根据瓶颈选择更高阶工具。'}</p>
        </div>
      </div>

      {guidance.migrationTrigger && (
        <p className="mt-4 rounded-2xl bg-background/70 px-4 py-3 text-xs leading-6 text-muted-foreground">
          迁移条件：{guidance.migrationTrigger}
        </p>
      )}
    </div>
  )
}
