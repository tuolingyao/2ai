// 统一质量检查模块 — 供 API 和发布流程共用
import { prisma } from '@/lib/prisma'

// 质量检查结果项
export interface QualityCheckItem {
  name: string
  passed: boolean
  message?: string
}

// 质量检查结果
export interface QualityCheckResult {
  passed: boolean
  checks: QualityCheckItem[]
}

/**
 * 对指定场景执行质量检查
 * 查询场景完整数据后逐项检查，返回结果
 */
export async function runSceneQualityCheck(sceneId: string): Promise<QualityCheckResult> {
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    select: {
      slug: true,
      coverImage: true,
      seoTitle: true,
      seoDescription: true,
      sortOrder: true,
      stages: {
        orderBy: { sortOrder: 'asc' },
        select: {
          stageType: true,
          capabilityStd: true,
          learningFocus: true,
          practiceTask: true,
          capabilityEvidence: true,
          aiIntervention: true,
          nodes: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  if (!scene) {
    return {
      passed: false,
      checks: [{ name: '场景存在', passed: false, message: '场景不存在' }],
    }
  }

  const checks: QualityCheckItem[] = []

  // 阶段类型中文映射
  const stageTypeLabels: Record<string, string> = {
    UNDERSTAND: '理解',
    HANDS_ON: '上手',
    STABLE_PRODUCTION: '独立稳定产出',
    ADVANCE: '持续进阶',
  }

  // 1. 四阶段完整
  const requiredStages = ['UNDERSTAND', 'HANDS_ON', 'STABLE_PRODUCTION', 'ADVANCE']
  const existingStages = scene.stages.map((s) => s.stageType as string)
  const missingStages = requiredStages.filter((s) => !existingStages.includes(s))
  checks.push({
    name: '四阶段完整',
    passed: missingStages.length === 0,
    message: missingStages.length > 0
      ? `缺少阶段：${missingStages.map((s) => stageTypeLabels[s] || s).join('、')}`
      : undefined,
  })

  // 2. 阶段字段完整
  const requiredFields: { key: 'capabilityStd' | 'learningFocus' | 'practiceTask' | 'capabilityEvidence' | 'aiIntervention'; label: string }[] = [
    { key: 'capabilityStd', label: '能力标准' },
    { key: 'learningFocus', label: '学习重点' },
    { key: 'practiceTask', label: '练习任务' },
    { key: 'capabilityEvidence', label: '能力证据' },
    { key: 'aiIntervention', label: 'AI介入方式' },
  ]
  const incompleteStages = scene.stages.filter((stage) =>
    requiredFields.some((f) => !stage[f.key]?.trim())
  )
  checks.push({
    name: '阶段字段完整',
    passed: incompleteStages.length === 0,
    message: incompleteStages.length > 0
      ? incompleteStages
          .map((s) =>
            `${stageTypeLabels[s.stageType] || s.stageType} 阶段缺少 ${requiredFields
              .filter((f) => !s[f.key]?.trim())
              .map((f) => f.label)
              .join('、')}`
          )
          .join('；')
      : undefined,
  })

  // 3. 至少一个学习节点
  const totalNodes = scene.stages.reduce((sum, s) => sum + s.nodes.length, 0)
  checks.push({
    name: '至少一个学习节点',
    passed: totalNodes > 0,
    message: totalNodes === 0 ? '场景下没有任何学习节点' : undefined,
  })

  // 4. AI 对话示范完整 — 每个节点至少有一个对话示范
  const allNodeIds = scene.stages.flatMap((s) => s.nodes.map((n) => n.id))
  let dialogueCheckPassed = true
  let dialogueMessage: string | undefined

  if (allNodeIds.length === 0) {
    dialogueCheckPassed = false
    dialogueMessage = '没有学习节点，无法验证 AI 对话示范'
  } else {
    // 查询每个节点的对话示范数量
    const dialogueCounts = await prisma.aiDialogueExample.groupBy({
      by: ['nodeId'],
      where: { nodeId: { in: allNodeIds } },
      _count: { id: true },
    })

    const countMap = new Map(dialogueCounts.map((d) => [d.nodeId, d._count.id]))
    const nodesWithoutDialogue = scene.stages
      .flatMap((s) => s.nodes)
      .filter((n) => !countMap.get(n.id))

    if (nodesWithoutDialogue.length > 0) {
      dialogueCheckPassed = false
      dialogueMessage = `节点 ${nodesWithoutDialogue.map((n) => n.title).join('、')} 缺少 AI 对话示范`
    }
  }

  checks.push({
    name: 'AI 对话示范完整',
    passed: dialogueCheckPassed,
    message: dialogueMessage,
  })

  // 5. slug 已设置
  checks.push({
    name: 'slug 已设置',
    passed: !!scene.slug?.trim(),
    message: !scene.slug?.trim() ? '场景 slug 未设置' : undefined,
  })

  // 6. SEO 信息完整
  const missingSeo: string[] = []
  if (!scene.seoTitle?.trim()) missingSeo.push('seoTitle')
  if (!scene.seoDescription?.trim()) missingSeo.push('seoDescription')
  checks.push({
    name: 'SEO 信息完整',
    passed: missingSeo.length === 0,
    message: missingSeo.length > 0 ? `缺少 ${missingSeo.join(' 和 ')}` : undefined,
  })

  // 7. 封面图已设置
  checks.push({
    name: '封面图已设置',
    passed: !!scene.coverImage?.trim(),
    message: !scene.coverImage?.trim() ? '封面图未设置' : undefined,
  })

  // 8. 排序已设置
  checks.push({
    name: '排序已设置',
    passed: scene.sortOrder >= 0,
  })

  const allPassed = checks.every((c) => c.passed)
  return { passed: allPassed, checks }
}
