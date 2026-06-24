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

const traeTool = {
  categorySlug: 'coding-development',
  name: 'Trae',
  slug: 'trae',
  tagline: '字节跳动推出的 AI 工作助手，覆盖办公与开发，三端免费使用。',
  description: 'Trae Work CN 是字节跳动推出的新一代 AI 工作助手，覆盖办公与开发两大场景，提供网页版、桌面版和移动端三端体验。核心架构是 Work 模式与 Code 模式双模式：Work 模式面向办公、内容生产、资料整理和任务执行；Code 模式面向开发、代码理解和工程任务。两种模式共享同一套 AI 能力底层，用户可按任务自由切换。Trae Work CN 内置 Skills 技能体系，支持把固定工作流封装为可复用的技能，也支持自动化任务配置，让周期性、重复性流程自动执行。模型能力方面，免费接入豆包、DeepSeek 等国内一线大模型，提供国内额度最高的免费使用额度，同时支持自定义模型接入，适合团队和个人进阶需求。截至 2026 年，Trae 全球用户已超 2000 万，是国内 AI 工具用户量最大的产品之一。',
  websiteUrl: 'https://www.trae.cn',
  pricing: ToolPricing.FREEMIUM,
  difficulty: ToolDifficulty.BEGINNER,
  isTop: true,
  bestFor: 'Work 模式办公：用自然语言完成文档整理、内容生产、资料调研和任务执行，不需要写代码\nWork 模式内容生产：把公众号选题、大纲、正文、标题的完整流程交给 AI 分步执行，人工只做判断和校准\nCode 模式开发：从需求描述到代码实现、测试、部署的完整开发流程，AI 自主推进\nSkills 技能封装：把重复工作流（如周报生成、会议纪要整理）封装为可复用技能，一键调用\n自动化任务：把周期性重复流程（如每日数据汇总、定时内容发布）配置为自动化，无需人工值守\n三端协同：网页版快速处理轻量任务、桌面版深度办公和开发、移动端随时查看和简单操作\n多模型选择：需要对比不同模型输出质量，或需要国内大模型稳定访问的场景\n自定义模型接入：团队有私有模型或需要特定模型能力的进阶用户',
  notFor: '完全不愿配置工作流或技能的人：Trae 的价值在于把流程沉淀为可复用资产，如果每次从零开始，效率提升有限\n把 AI 输出直接当最终结果的人：Work 模式和 Code 模式的输出都需要人工确认，尤其是涉及数据准确性和业务决策的内容\n移动端复杂长时间编辑：移动端适合查看和简单操作，不适合长文档写作、复杂代码编辑或工程开发\n高风险任务完全无人值守：自动化任务不适合涉及资金安全、合规审批、关键业务决策等高风险场景\n自定义模型接入无技术基础：接入私有模型需要理解模型配置、API 调用和数据边界，不适合完全无技术背景的用户\n跨平台插件强依赖：部分 VS Code 插件在 Code 模式下兼容性需验证，企业级特定插件可能不完全支持',
  whyRecommended: 'Work / Code 双模式覆盖办公与开发两大核心场景，一个产品解决两类需求，降低工具切换成本。三端覆盖（网页/桌面/移动）让使用场景不受设备限制，网页版 5 秒启动处理轻量任务，桌面版深度处理复杂工作，移动端随时响应。Skills 技能体系让经验可复用——把一次做好的流程封装成技能，后续一键调用，团队内可共享。自动化任务让重复流程沉淀为系统能力，周期性任务自动执行，减少人工值守。免费使用国内一线大模型（豆包、DeepSeek 等），国内额度最高，可用模型数量最多，无需额外付费即可体验多模型能力。支持自定义模型接入，适合有私有模型需求的团队和个人进阶用户。界面设计获得开发者广泛好评，从 VS Code 迁移零学习成本。局限：复杂项目（10万行+）的上下文理解仍有损耗，关键改动建议拆分小任务；Work 模式的办公自动化需要一定的流程设计能力才能发挥最大价值。',
  quickStart: '1. 选择入口：访问 trae.cn，选择网页版（无需安装，5秒启动）、桌面版（Windows/Mac/Linux，功能最全）或移动端（iOS/Android，随时查看）\n2. 选择模式：Work 模式用于办公、内容生产、资料整理；Code 模式用于开发、代码理解、工程任务\n3. 选择模型：根据任务选择豆包、DeepSeek 等国内一线大模型，免费额度充足，可切换对比不同模型输出\n4. 使用或创建 Skill：从技能市场选择已有技能（如周报生成、会议纪要整理），或把自己的固定流程封装为新技能\n5. 配置自动化：把周期性重复任务（如每日数据汇总、定时内容检查）配置为自动化流程，设定触发条件和执行步骤\n6. 接入自定义模型（可选）：在设置中配置私有模型 API，扩展模型能力边界，适合团队特定需求\n7. 结果检查：Work 模式输出需确认数据准确性和业务合理性；Code 模式输出需运行测试和代码审查\n8. 迭代优化：根据使用反馈调整技能参数、优化自动化流程、切换更适合的模型',
  promptExample: `【场景1：Work 模式 — 公众号内容生产】
"用 Work 模式帮我完成一篇公众号文章的生产流程：
- 第一步：基于我的账号定位（AI工具测评），用 AI 生成 3 个选题并说明每个选题的目标读者和核心价值
- 第二步：我选择选题后，用 AI 整理相关素材（工具官网、用户评价、对比数据）
- 第三步：基于素材生成文章大纲，每段说明"说什么+为什么说"
- 第四步：按大纲逐段生成正文，每段生成后我确认或要求修改
- 第五步：生成 3 个候选标题，说明每个标题的吸引点
- 第六步：输出完整的发布检查清单（标题、封面、摘要、标签）
要求：每步输出后暂停，等我确认后再进行下一步"

【场景2：Work 模式 — 资料整理与调研报告】
"帮我整理一份关于'AI 编程工具市场'的调研报告：
- 收集当前主流的 5 款 AI 编程工具（Trae、Cursor、GitHub Copilot、Windsurf、Claude Code）
- 每款工具说明：核心能力、价格、适用人群、主要局限
- 对比表格：功能、价格、模型支持、三端覆盖、社区生态
- 输出一份 2 页以内的执行摘要，适合给团队决策参考
要求：标注信息来源，不确定的地方明确说明"

【场景3：Code 模式 — 从需求到代码实现】
"用 Code 模式完成一个用户登录功能：
- 需求：在现有 Next.js 项目中添加邮箱+密码登录，使用 NextAuth.js
- 第一步：分析现有项目结构，确定集成方案
- 第二步：安装依赖并配置 NextAuth provider
- 第三步：创建登录页面 UI（使用现有 shadcn/ui 组件风格）
- 第四步：实现登录 API 路由和数据库用户模型
- 第五步：添加登录状态检查和路由保护
- 第六步：运行测试验证整个流程
要求：每步完成后运行 pnpm lint 和 pnpm build 确保不破坏现有功能"

【场景4：Skills — 封装周报生成技能】
"帮我把周报生成流程封装为一个 Skill：
- 输入：本周完成的任务列表（来自项目管理工具或手动输入）
- 处理：按"已完成/进行中/阻塞/下周计划"分类整理
- 输出：结构化周报文档，包含数据亮点、问题说明、下周目标
- 附加：生成一份给上级的 3 分钟汇报版本
要求：封装为可复用 Skill，下次只需输入任务列表即可一键生成"

【场景5：自动化 — 定时内容检查】
"配置一个自动化任务：
- 触发条件：每天上午 9 点
- 执行内容：检查我的公众号后台数据（阅读量、点赞、分享），与前一日对比
- 输出：生成一份数据简报，标注异常波动和趋势变化
- 通知：把简报发送到我的工作邮箱
要求：先手动运行一次验证流程正确，再开启定时执行"

【场景6：自定义模型 — 团队私有模型接入】
"帮我配置 Trae 接入我们团队的私有模型：
- 模型信息：基于 Llama 3 微调的行业专用模型，部署在内网服务器
- 配置需求：在 Trae 的模型设置中添加自定义模型 endpoint
- 测试：用行业术语测试模型理解能力，对比与通用模型的差异
- 使用场景：团队内部文档生成、行业报告撰写
要求：说明配置步骤和注意事项，标注数据安全边界"`,
  seoTitle: 'Trae Work CN — 字节跳动 AI 工作助手，办公与开发双模式，三端免费',
  seoDescription: 'Trae Work CN 是字节跳动推出的 AI 工作助手，提供 Work 办公模式和 Code 开发模式，覆盖网页版、桌面版、移动端三端。支持 Skills 技能封装、自动化任务、免费国内一线大模型、自定义模型接入。2000万用户，国内 AI 工具用户量最大的产品之一。',
  recommendationScore: 5,
  screenshotUrls: [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Trae%20Work%20CN%20web%20interface%20showing%20Work%20mode%20with%20AI%20chat%20panel%20document%20editing%20dark%20theme%20modern%20UI&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Trae%20Work%20CN%20Code%20mode%20IDE%20with%20SOLO%20agent%20coding%20automation%20multi-file%20editing%20dark%20theme&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Trae%20Work%20CN%20mobile%20app%20interface%20AI%20assistant%20chat%20clean%20modern%20design&image_size=landscape_16_9',
  ],
}

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

  const traeCategoryId = categoryMap.get(traeTool.categorySlug)
  if (traeCategoryId) {
    const trae = await prisma.aiTool.upsert({
      where: { slug: traeTool.slug },
      update: {
        categoryId: traeCategoryId,
        name: traeTool.name,
        tagline: traeTool.tagline,
        description: traeTool.description,
        websiteUrl: traeTool.websiteUrl,
        pricing: traeTool.pricing,
        difficulty: traeTool.difficulty,
        bestFor: traeTool.bestFor,
        notFor: traeTool.notFor,
        whyRecommended: traeTool.whyRecommended,
        quickStart: traeTool.quickStart,
        promptExample: traeTool.promptExample,
        sortOrder: tools.length,
        isTop: traeTool.isTop,
        publishStatus: PublishStatus.PUBLISHED,
        seoTitle: traeTool.seoTitle,
        seoDescription: traeTool.seoDescription,
        recommendationScore: traeTool.recommendationScore,
        screenshotUrls: traeTool.screenshotUrls,
      },
      create: {
        categoryId: traeCategoryId,
        name: traeTool.name,
        slug: traeTool.slug,
        tagline: traeTool.tagline,
        description: traeTool.description,
        websiteUrl: traeTool.websiteUrl,
        pricing: traeTool.pricing,
        difficulty: traeTool.difficulty,
        bestFor: traeTool.bestFor,
        notFor: traeTool.notFor,
        whyRecommended: traeTool.whyRecommended,
        quickStart: traeTool.quickStart,
        promptExample: traeTool.promptExample,
        sortOrder: tools.length,
        isTop: traeTool.isTop,
        publishStatus: PublishStatus.PUBLISHED,
        seoTitle: traeTool.seoTitle,
        seoDescription: traeTool.seoDescription,
        recommendationScore: traeTool.recommendationScore,
        screenshotUrls: traeTool.screenshotUrls,
      },
    })
    toolMap.set(traeTool.slug, trae.id)
  }

  const sceneLinks: Record<string, string[]> = {
    'ai-wechat-official-account': ['notion-ai', 'xiezuocat', 'perplexity', 'canva-ai', 'dify', 'trae'],
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

  console.log(`Seeded ${categories.length} AI tool categories and ${tools.length + 1} AI tools`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
