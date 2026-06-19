// AI 对话示范组件 — 对话气泡风格展示
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
  // 解析检查清单（按换行或数字序号分割）
  const checkItems = dialogue.checkList
    .split(/\n|(?<=\d\.)\s/)
    .map((s) => s.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)

  return (
    <div className="rounded-lg border bg-white p-4">
      {/* 工具选择标签 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">工具：</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
          {dialogue.toolChoice}
        </span>
      </div>

      <div className="space-y-3">
        {/* 用户：提示词 */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-lg bg-blue-500 px-4 py-2.5 text-sm text-white">
            <p className="mb-1 text-xs opacity-75">你的提示词</p>
            {dialogue.prompt}
          </div>
        </div>

        {/* AI：追问 */}
        {dialogue.aiFollowUp && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-zinc-100 px-4 py-2.5 text-sm text-zinc-800">
              <p className="mb-1 text-xs text-zinc-500">AI 追问</p>
              {dialogue.aiFollowUp}
            </div>
          </div>
        )}

        {/* 用户：补充 */}
        {dialogue.userSupplement && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg bg-blue-500 px-4 py-2.5 text-sm text-white">
              <p className="mb-1 text-xs opacity-75">你的补充</p>
              {dialogue.userSupplement}
            </div>
          </div>
        )}

        {/* AI：输出 */}
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg bg-zinc-100 px-4 py-2.5 text-sm text-zinc-800">
            <p className="mb-1 text-xs text-zinc-500">AI 输出</p>
            {dialogue.aiOutput}
          </div>
        </div>
      </div>

      {/* 检查清单 */}
      {checkItems.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 text-xs font-medium text-amber-800">检查清单</p>
          <ul className="space-y-1">
            {checkItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="mt-0.5 text-amber-500">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
