// AI 对话示范组件 — 赛博水墨气泡风格展示
interface AiDialogueProps {
  dialogue: {
    toolChoice: string
    prompt: string
    aiFollowUp: string | null
    userSupplement: string | null
    aiOutput: string
    checkList: string
  }
}

export function AiDialogue({ dialogue }: AiDialogueProps) {
  const checkItems = dialogue.checkList
    .split(/\n|(?<=\d\.)\s/)
    .map((s) => s.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)

  return (
    <div className="scroll-card rounded-[2rem] p-5">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">工具：</span>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent dark:text-accent-foreground">
          {dialogue.toolChoice}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="max-w-[86%] rounded-2xl border border-primary/25 bg-card px-4 py-3 text-sm text-foreground">
            <p className="mb-2 inline-flex rounded-sm bg-primary px-2 py-0.5 text-xs text-primary-foreground">你的提示词</p>
            <p className="leading-7">{dialogue.prompt}</p>
          </div>
        </div>

        {dialogue.aiFollowUp && (
          <div className="flex justify-start">
            <div className="max-w-[86%] rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-foreground">
              <p className="mb-2 inline-flex rounded-sm border border-accent/30 px-2 py-0.5 text-xs text-accent dark:text-accent-foreground">AI 追问</p>
              <p className="leading-7">{dialogue.aiFollowUp}</p>
            </div>
          </div>
        )}

        {dialogue.userSupplement && (
          <div className="flex justify-end">
            <div className="max-w-[86%] rounded-2xl border border-primary/25 bg-card px-4 py-3 text-sm text-foreground">
              <p className="mb-2 inline-flex rounded-sm bg-primary px-2 py-0.5 text-xs text-primary-foreground">你的补充</p>
              <p className="leading-7">{dialogue.userSupplement}</p>
            </div>
          </div>
        )}

        <div className="flex justify-start">
          <div className="max-w-[86%] rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-foreground">
            <p className="mb-2 inline-flex rounded-sm border border-accent/30 px-2 py-0.5 text-xs text-accent dark:text-accent-foreground">AI 输出</p>
            <p className="leading-7">{dialogue.aiOutput}</p>
          </div>
        </div>
      </div>

      {checkItems.length > 0 && (
        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="mb-3 text-xs font-semibold text-primary">检查清单</p>
          <ul className="space-y-2">
            {checkItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                <span className="mt-0.5 text-primary">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
