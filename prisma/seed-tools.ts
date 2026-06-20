import { PrismaClient, PublishStatus, ToolDifficulty, ToolPricing } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: '写作与内容生产', slug: 'writing-content', description: '适合文章、脚本、邮件、营销文案与日常内容生产。' },
  { name: '搜索与研究', slug: 'search-research', description: '适合资料检索、论文阅读、事实核验与选题研究。' },
  { name: '办公与效率', slug: 'office-productivity', description: '适合会议、表格、演示、邮件和日常办公提效。' },
  { name: '编程与开发', slug: 'coding-development', description: '适合代码生成、调试、重构、测试与工程协作。' },
  { name: '设计与视觉', slug: 'design-visual', description: '适合图片生成、品牌视觉、海报、电商图与界面灵感。' },
  { name: '视频与音频', slug: 'video-audio', description: '适合短视频、配音、剪辑、字幕、播客与多媒体内容。' },
  { name: '个人知识管理', slug: 'knowledge-management', description: '适合读书笔记、资料沉淀、知识库整理与长期复用。' },
  { name: '自动化与 Agent', slug: 'automation-agent', description: '适合工作流自动化、内部工具、客服助手与任务代理。' },
]

const tools = [
  ['writing-content', 'Notion AI', 'notion-ai', '在文档与知识库中完成写作和整理。', 'Notion AI 适合在已有笔记、项目文档和团队知识库中直接改写、总结和生成内容。', 'https://www.notion.so/product/ai', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '文档写作、会议纪要整理、知识库内容改写'],
  ['writing-content', '秘塔写作猫', 'xiezuocat', '中文写作纠错与润色助手。', '秘塔写作猫适合中文语境下的错别字、病句、表达优化和公文润色。', 'https://xiezuocat.com', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '中文文章润色、公文优化、表达纠错'],
  ['writing-content', 'Grammarly', 'grammarly', '英文写作校对与语气优化工具。', 'Grammarly 适合英文邮件、论文、简历和商务文本的语法检查与表达优化。', 'https://www.grammarly.com', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '英文邮件、简历、论文和商务写作'],
  ['search-research', 'Perplexity', 'perplexity', '带来源引用的 AI 搜索引擎。', 'Perplexity 适合快速了解陌生主题，并通过来源链接继续深入。', 'https://www.perplexity.ai', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '资料检索、竞品研究、事实核验'],
  ['search-research', 'Consensus', 'consensus', '面向科研论文的证据搜索工具。', 'Consensus 适合查找论文结论、研究共识和学术证据。', 'https://consensus.app', ToolPricing.FREEMIUM, ToolDifficulty.INTERMEDIATE, '论文检索、学术综述、研究论证'],
  ['search-research', 'Elicit', 'elicit', '辅助论文阅读和研究整理。', 'Elicit 适合把论文筛选、摘要、变量提取等研究流程结构化。', 'https://elicit.com', ToolPricing.FREEMIUM, ToolDifficulty.INTERMEDIATE, '文献综述、论文筛选、研究问题整理'],
  ['office-productivity', 'Microsoft Copilot', 'microsoft-copilot', 'Office 工作流里的 AI 助手。', 'Microsoft Copilot 适合在 Word、Excel、PowerPoint 和 Teams 中辅助办公。', 'https://www.microsoft.com/microsoft-copilot', ToolPricing.PAID, ToolDifficulty.BEGINNER, '文档、表格、演示和会议办公'],
  ['office-productivity', 'WPS AI', 'wps-ai', '中文办公场景友好的 AI 助手。', 'WPS AI 适合中文文档、表格、PPT 和 PDF 场景。', 'https://ai.wps.cn', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '中文办公文档、表格分析、PPT 初稿'],
  ['office-productivity', 'Otter.ai', 'otter-ai', '会议转写和摘要工具。', 'Otter.ai 适合英文会议录音转写、要点提取和行动项整理。', 'https://otter.ai', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '会议纪要、访谈转写、行动项整理'],
  ['coding-development', 'Claude Code', 'claude-code', '面向代码库的终端 AI 编程助手。', 'Claude Code 适合在真实项目中理解代码、修改文件、运行测试和完成工程任务。', 'https://www.anthropic.com/claude-code', ToolPricing.PAID, ToolDifficulty.INTERMEDIATE, '项目级代码修改、调试、重构和自动化工程任务'],
  ['coding-development', 'Cursor', 'cursor', 'AI 原生代码编辑器。', 'Cursor 适合在 IDE 中进行代码补全、跨文件修改和项目问答。', 'https://www.cursor.com', ToolPricing.FREEMIUM, ToolDifficulty.INTERMEDIATE, '日常开发、跨文件重构、代码解释'],
  ['coding-development', 'GitHub Copilot', 'github-copilot', '主流 IDE 的代码补全助手。', 'GitHub Copilot 适合补全函数、生成测试和降低样板代码成本。', 'https://github.com/features/copilot', ToolPricing.PAID, ToolDifficulty.BEGINNER, '代码补全、单元测试、样板代码生成'],
  ['design-visual', 'Midjourney', 'midjourney', '高质量图像生成工具。', 'Midjourney 适合生成高审美概念图、海报视觉和风格探索。', 'https://www.midjourney.com', ToolPricing.PAID, ToolDifficulty.INTERMEDIATE, '概念视觉、海报、电商图和风格探索'],
  ['design-visual', 'Canva AI', 'canva-ai', '面向非设计师的 AI 设计工具。', 'Canva AI 适合快速制作海报、社媒图、演示和营销素材。', 'https://www.canva.com/ai', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '社媒图、PPT、海报和轻量设计'],
  ['design-visual', 'Krea', 'krea', '实时图像生成与视觉探索工具。', 'Krea 适合快速尝试画面风格、产品视觉和图像变体。', 'https://www.krea.ai', ToolPricing.FREEMIUM, ToolDifficulty.INTERMEDIATE, '视觉灵感、产品图、风格迭代'],
  ['video-audio', 'Runway', 'runway', 'AI 视频生成与编辑平台。', 'Runway 适合视频生成、镜头扩展、背景处理和创意短片制作。', 'https://runwayml.com', ToolPricing.FREEMIUM, ToolDifficulty.INTERMEDIATE, '短视频生成、镜头创意、视频后期'],
  ['video-audio', 'Descript', 'descript', '像编辑文档一样剪音视频。', 'Descript 适合播客、课程、访谈和短视频的转写剪辑。', 'https://www.descript.com', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '播客剪辑、字幕、访谈整理'],
  ['video-audio', 'ElevenLabs', 'elevenlabs', '高质量 AI 语音生成。', 'ElevenLabs 适合配音、旁白、多语言语音和声音原型。', 'https://elevenlabs.io', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '旁白配音、多语言音频、声音原型'],
  ['knowledge-management', 'Mem', 'mem', 'AI 辅助个人知识库。', 'Mem 适合把零散笔记自动关联、搜索和整理。', 'https://mem.ai', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '个人笔记、知识检索、灵感沉淀'],
  ['knowledge-management', 'Tana', 'tana', '结构化笔记与知识网络工具。', 'Tana 适合用节点、标签和 AI 工作流组织复杂知识。', 'https://tana.inc', ToolPricing.FREEMIUM, ToolDifficulty.ADVANCED, '研究笔记、知识图谱、结构化工作流'],
  ['knowledge-management', 'Readwise Reader', 'readwise-reader', '阅读、标注与稍后读工具。', 'Readwise Reader 适合把文章、PDF、Newsletter 和高亮统一管理。', 'https://readwise.io/read', ToolPricing.PAID, ToolDifficulty.BEGINNER, '稍后读、阅读标注、资料归档'],
  ['automation-agent', 'Zapier AI', 'zapier-ai', '低代码自动化与 AI 工作流。', 'Zapier AI 适合把常用 SaaS 应用连接成自动化流程。', 'https://zapier.com/ai', ToolPricing.FREEMIUM, ToolDifficulty.BEGINNER, '跨应用自动化、通知同步、线索处理'],
  ['automation-agent', 'Dify', 'dify', '开源 LLM 应用开发平台。', 'Dify 适合搭建知识库问答、客服助手和内部 AI 应用。', 'https://dify.ai', ToolPricing.FREEMIUM, ToolDifficulty.INTERMEDIATE, '知识库应用、客服机器人、内部工具'],
  ['automation-agent', 'Make', 'make', '可视化自动化编排平台。', 'Make 适合设计复杂分支、定时任务和多系统数据流。', 'https://www.make.com', ToolPricing.FREEMIUM, ToolDifficulty.INTERMEDIATE, '复杂自动化、数据同步、运营流程'],
] as const

async function main() {
  const categoryMap = new Map<string, string>()

  for (let i = 0; i < categories.length; i++) {
    const category = await prisma.aiToolCategory.upsert({
      where: { slug: categories[i].slug },
      update: { ...categories[i], sortOrder: i, isActive: true },
      create: { ...categories[i], sortOrder: i, isActive: true },
    })
    categoryMap.set(categories[i].slug, category.id)
  }

  const toolMap = new Map<string, string>()
  for (let i = 0; i < tools.length; i++) {
    const [categorySlug, name, slug, tagline, description, websiteUrl, pricing, difficulty, bestFor] = tools[i]
    const categoryId = categoryMap.get(categorySlug)
    if (!categoryId) continue
    const tool = await prisma.aiTool.upsert({
      where: { slug },
      update: {
        categoryId,
        name,
        tagline,
        description,
        websiteUrl,
        pricing,
        difficulty,
        bestFor,
        whyRecommended: '该工具在对应任务中成熟度高、学习成本可控，适合作为首批上手选择。',
        quickStart: '1. 打开官网注册账号\n2. 选择一个真实任务输入需求\n3. 根据输出继续追问和修正',
        sortOrder: i,
        isTop: true,
        publishStatus: PublishStatus.PUBLISHED,
        seoTitle: `${name} — AI 工具库`,
        seoDescription: tagline,
      },
      create: {
        categoryId,
        name,
        slug,
        tagline,
        description,
        websiteUrl,
        pricing,
        difficulty,
        bestFor,
        whyRecommended: '该工具在对应任务中成熟度高、学习成本可控，适合作为首批上手选择。',
        quickStart: '1. 打开官网注册账号\n2. 选择一个真实任务输入需求\n3. 根据输出继续追问和修正',
        sortOrder: i,
        isTop: true,
        publishStatus: PublishStatus.PUBLISHED,
        seoTitle: `${name} — AI 工具库`,
        seoDescription: tagline,
      },
    })
    toolMap.set(slug, tool.id)
  }

  const sceneLinks: Record<string, string[]> = {
    'ai-wechat-official-account': ['notion-ai', 'xiezuocat', 'perplexity', 'canva-ai', 'dify'],
    'ai-workplace-efficiency': ['microsoft-copilot', 'wps-ai', 'otter-ai', 'zapier-ai', 'perplexity'],
    'ai-coding-assistant': ['claude-code', 'cursor', 'github-copilot', 'dify'],
  }

  for (const [sceneSlug, toolSlugs] of Object.entries(sceneLinks)) {
    const scene = await prisma.scene.findUnique({ where: { slug: sceneSlug }, select: { id: true } })
    if (!scene) continue
    await prisma.aiToolScene.createMany({
      data: toolSlugs
        .map((slug) => toolMap.get(slug))
        .filter((toolId): toolId is string => Boolean(toolId))
        .map((toolId) => ({ toolId, sceneId: scene.id })),
      skipDuplicates: true,
    })
  }

  console.log(`Seeded ${categories.length} AI tool categories and ${tools.length} AI tools`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
