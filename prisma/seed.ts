// Prisma seed 脚本 — 插入测试数据
import { PrismaClient, UserRole, PublishStatus, StageType, TaxonomyType, ToolPricing, ToolDifficulty } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始清空数据库...')

  // 按依赖顺序删除
  await prisma.capabilityEvidence.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.aiToolScene.deleteMany()
  await prisma.aiDialogueExample.deleteMany()
  await prisma.toolGuidance.deleteMany()
  await prisma.learningNode.deleteMany()
  await prisma.stage.deleteMany()
  await prisma.sceneTaxonomy.deleteMany()
  await prisma.mediaAsset.deleteMany()
  await prisma.aiTool.deleteMany()
  await prisma.aiToolCategory.deleteMany()
  await prisma.scene.deleteMany()
  await prisma.taxonomy.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ 数据库已清空')

  // ==================== 用户 ====================
  console.log('👤 创建用户...')

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@aiwings.com' },
      update: {},
      create: {
        email: 'admin@aiwings.com',
        name: '管理员',
        role: UserRole.ADMIN,
        passwordHash: await hash('admin123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'editor@aiwings.com' },
      update: {},
      create: {
        email: 'editor@aiwings.com',
        name: '内容编辑',
        role: UserRole.EDITOR,
        passwordHash: await hash('editor123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'reviewer@aiwings.com' },
      update: {},
      create: {
        email: 'reviewer@aiwings.com',
        name: '审核发布者',
        role: UserRole.REVIEWER,
        passwordHash: await hash('reviewer123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user@aiwings.com' },
      update: {},
      create: {
        email: 'user@aiwings.com',
        name: '测试用户',
        role: UserRole.USER,
        passwordHash: await hash('user123', 10),
      },
    }),
  ])

  console.log(`  创建了 ${users.length} 个用户`)

  // ==================== 分类标签 ====================
  console.log('🏷️ 创建分类标签...')

  const taxonomies = {
    contentCreation: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.CATEGORY, slug: 'content-creation' } },
      update: {},
      create: { name: '内容创作', type: TaxonomyType.CATEGORY, slug: 'content-creation' },
    }),
    dataAnalysis: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.CATEGORY, slug: 'data-analysis' } },
      update: {},
      create: { name: '数据分析', type: TaxonomyType.CATEGORY, slug: 'data-analysis' },
    }),
    programming: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.CATEGORY, slug: 'programming' } },
      update: {},
      create: { name: '编程开发', type: TaxonomyType.CATEGORY, slug: 'programming' },
    }),
    selfMediaOperator: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.TARGET_AUDIENCE, slug: 'self-media-operator' } },
      update: {},
      create: { name: '自媒体运营者', type: TaxonomyType.TARGET_AUDIENCE, slug: 'self-media-operator' },
    }),
    officeWorker: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.TARGET_AUDIENCE, slug: 'office-worker' } },
      update: {},
      create: { name: '职场人士', type: TaxonomyType.TARGET_AUDIENCE, slug: 'office-worker' },
    }),
    promptEngineering: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.CAPABILITY_TAG, slug: 'prompt-engineering' } },
      update: {},
      create: { name: '提示词工程', type: TaxonomyType.CAPABILITY_TAG, slug: 'prompt-engineering' },
    }),
    contentPlanning: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.CAPABILITY_TAG, slug: 'content-planning' } },
      update: {},
      create: { name: '内容规划', type: TaxonomyType.CAPABILITY_TAG, slug: 'content-planning' },
    }),
    chatgpt: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.TOOL_TAG, slug: 'chatgpt' } },
      update: {},
      create: { name: 'ChatGPT', type: TaxonomyType.TOOL_TAG, slug: 'chatgpt' },
    }),
    deepseek: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.TOOL_TAG, slug: 'deepseek' } },
      update: {},
      create: { name: 'DeepSeek', type: TaxonomyType.TOOL_TAG, slug: 'deepseek' },
    }),
    claude: await prisma.taxonomy.upsert({
      where: { type_slug: { type: TaxonomyType.TOOL_TAG, slug: 'claude' } },
      update: {},
      create: { name: 'Claude', type: TaxonomyType.TOOL_TAG, slug: 'claude' },
    }),
  }

  console.log(`  创建了 ${Object.keys(taxonomies).length} 个分类标签`)

  // ==================== AI 工具库 ====================
  console.log('🧰 创建 AI 工具库...')

  const toolCategorySeeds = [
    { name: '写作与内容生产', slug: 'writing-content', description: '用于选题、写作、改写、校对和内容生产流程的 AI 工具。' },
    { name: '搜索与研究', slug: 'search-research', description: '用于资料检索、问题研究、来源整理和信息核验的 AI 工具。' },
    { name: '办公与效率', slug: 'office-productivity', description: '用于文档、表格、会议、邮件和日常办公提效的 AI 工具。' },
    { name: '编程与开发', slug: 'coding-development', description: '用于代码生成、调试、重构、文档和开发协作的 AI 工具。' },
    { name: '设计与视觉', slug: 'design-visual', description: '用于视觉创意、图像生成、版式设计和设计协作的 AI 工具。' },
    { name: '视频与音频', slug: 'video-audio', description: '用于视频生成、剪辑、配音、转写和音频处理的 AI 工具。' },
    { name: '个人知识管理', slug: 'knowledge-management', description: '用于笔记整理、知识沉淀、资料问答和个人知识库建设的 AI 工具。' },
    { name: '自动化与 Agent', slug: 'automation-agent', description: '用于工作流自动化、多步骤任务执行和智能体编排的 AI 工具。' },
  ]

  const toolCategories = new Map<string, { id: string }>()
  for (let i = 0; i < toolCategorySeeds.length; i++) {
    const category = await prisma.aiToolCategory.upsert({
      where: { slug: toolCategorySeeds[i].slug },
      update: {
        name: toolCategorySeeds[i].name,
        description: toolCategorySeeds[i].description,
        sortOrder: i,
        isActive: true,
      },
      create: {
        ...toolCategorySeeds[i],
        sortOrder: i,
      },
    })
    toolCategories.set(category.slug, category)
  }

  const aiToolSeeds = [
    { categorySlug: 'writing-content', name: 'Notion AI', slug: 'notion-ai', tagline: '在文档与知识库中完成写作和整理。', description: 'Notion AI 适合在已有笔记、项目文档和团队知识库中直接改写、总结和生成内容。它的优势是贴近文档工作流，减少复制粘贴。', websiteUrl: 'https://www.notion.so/product/ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '文档写作、会议纪要整理、知识库内容改写', notFor: '需要复杂事实核验或高强度长文创作的任务', whyRecommended: '适合把 AI 嵌入日常文档流程，学习成本低。', quickStart: '1. 打开一篇已有文档\n2. 选中段落让 AI 总结或改写\n3. 保存可复用的写作模板' },
    { categorySlug: 'writing-content', name: '秘塔写作猫', slug: 'xiezuocat', tagline: '中文写作校对与润色助手。', description: '秘塔写作猫适合中文文本纠错、润色、续写和风格优化。它对中文表达和病句检查较友好。', websiteUrl: 'https://xiezuocat.com', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '中文文章润色、错别字检查、表达优化', notFor: '复杂多轮内容策划或深度研究', whyRecommended: '中文写作场景上手快，适合内容发布前检查。', quickStart: '1. 粘贴待检查文本\n2. 查看纠错与润色建议\n3. 保留符合自己语气的修改' },
    { categorySlug: 'writing-content', name: 'Grammarly', slug: 'grammarly', tagline: '英文写作语法与语气优化工具。', description: 'Grammarly 面向英文邮件、文档和营销文案，能检查语法、拼写和语气。它适合需要稳定英文输出的人。', websiteUrl: 'https://www.grammarly.com', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '英文邮件、英文报告、跨境沟通文案', notFor: '中文写作或强创意长文生成', whyRecommended: '英文表达质量提升明显，适合职场沟通。', quickStart: '1. 安装浏览器插件\n2. 在邮件或文档中输入英文\n3. 根据语气目标接受修改' },
    { categorySlug: 'search-research', name: 'Perplexity', slug: 'perplexity', tagline: '带来源引用的 AI 搜索与研究工具。', description: 'Perplexity 适合围绕问题快速检索资料并查看来源链接。它比普通聊天更适合做初步研究。', websiteUrl: 'https://www.perplexity.ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '主题调研、资料检索、竞品信息初筛', notFor: '不能替代权威数据库和人工事实核验', whyRecommended: '结果带引用，适合作为研究入口。', quickStart: '1. 用完整问题发起搜索\n2. 打开引用来源核对\n3. 追问让它整理成提纲' },
    { categorySlug: 'search-research', name: 'Consensus', slug: 'consensus', tagline: '面向学术论文的 AI 检索助手。', description: 'Consensus 适合查找研究论文和总结研究结论。它更适合学术与专业主题，不适合泛娱乐搜索。', websiteUrl: 'https://consensus.app', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '论文检索、研究结论对比、专业主题调研', notFor: '即时新闻、中文本地资料和非学术内容', whyRecommended: '能帮助用户从论文视角建立证据意识。', quickStart: '1. 输入具体研究问题\n2. 查看论文摘要和结论\n3. 记录仍需人工核验的来源' },
    { categorySlug: 'search-research', name: 'Elicit', slug: 'elicit', tagline: '用 AI 辅助文献综述和研究表格。', description: 'Elicit 面向研究人员，适合从论文中提取变量、结论和方法。它适合较复杂的资料整理任务。', websiteUrl: 'https://elicit.com', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '文献综述、论文表格整理、研究问题拆解', notFor: '普通网页搜索和轻量内容创作', whyRecommended: '适合训练结构化研究能力。', quickStart: '1. 输入研究问题\n2. 选择相关论文\n3. 导出表格并人工复核' },
    { categorySlug: 'office-productivity', name: 'Microsoft Copilot', slug: 'microsoft-copilot', tagline: '面向 Office 工作流的 AI 助手。', description: 'Microsoft Copilot 适合在 Word、Excel、PowerPoint 和 Teams 中提升办公效率。它依赖组织环境和账号权限。', websiteUrl: 'https://www.microsoft.com/microsoft-copilot', pricing: ToolPricing.PAID, difficulty: ToolDifficulty.BEGINNER, bestFor: '文档总结、表格分析、PPT 初稿、会议整理', notFor: '没有 Microsoft 生态的个人轻量使用', whyRecommended: '覆盖常见办公入口，适合企业场景。', quickStart: '1. 在 Word 或 Excel 打开 Copilot\n2. 输入明确任务\n3. 人工检查数据和措辞' },
    { categorySlug: 'office-productivity', name: 'WPS AI', slug: 'wps-ai', tagline: '中文办公文档中的 AI 助手。', description: 'WPS AI 适合中文办公用户在文档、表格和演示中生成内容。它对国内办公习惯更贴近。', websiteUrl: 'https://ai.wps.cn', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '中文报告、表格处理、演示文稿初稿', notFor: '高度定制的数据系统分析', whyRecommended: '适合国内职场用户快速接入。', quickStart: '1. 打开 WPS 文档\n2. 选择 AI 写作或总结\n3. 按模板改成自己的业务内容' },
    { categorySlug: 'office-productivity', name: 'Otter.ai', slug: 'otter-ai', tagline: '会议录音转写与纪要生成工具。', description: 'Otter.ai 适合英文会议转写、摘要和行动项整理。它能减少会后整理成本。', websiteUrl: 'https://otter.ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '英文会议转写、纪要、行动项整理', notFor: '中文会议或强隐私会议场景', whyRecommended: '会议场景价值直接，易验证效果。', quickStart: '1. 连接会议或上传录音\n2. 等待自动转写\n3. 提取行动项并人工确认' },
    { categorySlug: 'coding-development', name: 'Claude Code', slug: 'claude-code', tagline: '面向代码库任务的终端智能编程助手。', description: 'Claude Code 适合阅读代码库、修改文件、运行验证并协助完成工程任务。它更适合有明确任务卡的开发流程。', websiteUrl: 'https://www.anthropic.com/claude-code', pricing: ToolPricing.PAID, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '代码库理解、功能开发、重构、测试修复', notFor: '没有版本控制和验收标准的随意修改', whyRecommended: '适合项目制开发，能和任务卡流程结合。', quickStart: '1. 在项目根目录启动\n2. 提供明确任务卡\n3. 审查 diff 并运行验证命令' },
    { categorySlug: 'coding-development', name: 'Cursor', slug: 'cursor', tagline: '面向开发者的 AI 代码编辑器。', description: 'Cursor 适合在编辑器内理解项目、批量改代码和生成解释。它适合已有开发基础的人使用。', websiteUrl: 'https://www.cursor.com', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '代码补全、项目问答、多文件编辑', notFor: '完全不懂代码且无人审查的生产改动', whyRecommended: '编辑器体验完整，适合日常开发。', quickStart: '1. 打开代码仓库\n2. 用聊天定位文件\n3. 小步修改并运行测试' },
    { categorySlug: 'coding-development', name: 'GitHub Copilot', slug: 'github-copilot', tagline: 'IDE 内代码补全与开发辅助。', description: 'GitHub Copilot 适合函数补全、测试生成和局部代码解释。它适合提高常规编码速度。', websiteUrl: 'https://github.com/features/copilot', pricing: ToolPricing.PAID, difficulty: ToolDifficulty.BEGINNER, bestFor: '代码补全、样板代码、单元测试草稿', notFor: '缺少人工审查的复杂架构决策', whyRecommended: '集成广泛，适合开发者低摩擦使用。', quickStart: '1. 在 IDE 安装插件\n2. 写清函数名和输入输出\n3. 审查生成代码并测试' },
    { categorySlug: 'design-visual', name: 'Midjourney', slug: 'midjourney', tagline: '高质量图像生成与视觉创意工具。', description: 'Midjourney 适合概念图、风格探索和视觉灵感生成。它需要较好的提示词描述能力。', websiteUrl: 'https://www.midjourney.com', pricing: ToolPricing.PAID, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '概念视觉、海报风格探索、插画灵感', notFor: '严格可控的商业设计交付全流程', whyRecommended: '图像质感强，适合视觉探索阶段。', quickStart: '1. 描述主体、风格和构图\n2. 生成多张候选\n3. 迭代提示词选择方向' },
    { categorySlug: 'design-visual', name: 'Canva AI', slug: 'canva-ai', tagline: '模板化设计中的 AI 创作助手。', description: 'Canva AI 适合非设计师快速制作海报、社媒图和演示页面。它将 AI 生成和模板编辑结合。', websiteUrl: 'https://www.canva.com/ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '社媒图、海报、演示设计、轻量品牌物料', notFor: '复杂品牌系统和专业印刷交付', whyRecommended: '模板丰富，上手门槛低。', quickStart: '1. 选择目标模板\n2. 用 AI 生成文案或图像\n3. 调整版式并导出' },
    { categorySlug: 'design-visual', name: 'Krea', slug: 'krea', tagline: '实时图像生成与视觉迭代工具。', description: 'Krea 适合实时生成图像、放大图片和做视觉方向实验。它适合需要快速比较视觉变化的用户。', websiteUrl: 'https://www.krea.ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '视觉灵感、图片增强、风格迭代', notFor: '完全确定版式的精细排版工作', whyRecommended: '反馈速度快，适合探索多个方向。', quickStart: '1. 上传参考或输入提示词\n2. 调整风格参数\n3. 保存可继续编辑的版本' },
    { categorySlug: 'video-audio', name: 'Runway', slug: 'runway', tagline: 'AI 视频生成与创意剪辑平台。', description: 'Runway 适合短视频生成、画面延展、抠像和创意视频实验。它适合视觉团队做原型。', websiteUrl: 'https://runwayml.com', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '视频生成、镜头实验、创意短片原型', notFor: '长片稳定制作和强一致角色控制', whyRecommended: '视频能力完整，适合探索 AI 视频流程。', quickStart: '1. 准备文字或图片输入\n2. 生成短视频片段\n3. 选择片段继续剪辑' },
    { categorySlug: 'video-audio', name: 'Descript', slug: 'descript', tagline: '像编辑文档一样编辑音视频。', description: 'Descript 适合播客、课程和短视频的转写、剪辑与字幕处理。它把音视频编辑转成文本编辑流程。', websiteUrl: 'https://www.descript.com', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '播客剪辑、字幕、课程视频粗剪', notFor: '复杂影视级后期制作', whyRecommended: '把剪辑门槛降到文字编辑层面。', quickStart: '1. 上传音频或视频\n2. 等待自动转写\n3. 删除文字完成粗剪' },
    { categorySlug: 'video-audio', name: 'ElevenLabs', slug: 'elevenlabs', tagline: '高质量 AI 语音生成工具。', description: 'ElevenLabs 适合旁白、配音和多语言语音生成。它的声音自然度较高，但需要注意授权和合规。', websiteUrl: 'https://elevenlabs.io', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '旁白、课程配音、多语言音频', notFor: '未授权声音克隆或敏感内容', whyRecommended: '语音质量高，适合内容生产流程。', quickStart: '1. 输入旁白文本\n2. 选择合适声音\n3. 导出后检查发音和授权' },
    { categorySlug: 'knowledge-management', name: 'Mem', slug: 'mem', tagline: '面向个人知识沉淀的 AI 笔记工具。', description: 'Mem 适合收集碎片笔记并通过 AI 找回关联内容。它适合重视个人知识连接的人。', websiteUrl: 'https://mem.ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.BEGINNER, bestFor: '个人笔记、资料沉淀、知识回顾', notFor: '团队级复杂权限知识库', whyRecommended: '强调自动关联，适合建立长期知识资产。', quickStart: '1. 每天记录关键笔记\n2. 用 AI 查询相关内容\n3. 定期整理成主题页面' },
    { categorySlug: 'knowledge-management', name: 'Tana', slug: 'tana', tagline: '结构化笔记与 AI 知识管理工具。', description: 'Tana 适合用标签、字段和结构化节点管理知识。它功能强但学习成本更高。', websiteUrl: 'https://tana.inc', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.ADVANCED, bestFor: '结构化知识库、研究笔记、复杂个人系统', notFor: '只需要简单便签的用户', whyRecommended: '适合进阶用户搭建可复用知识系统。', quickStart: '1. 设计少量核心标签\n2. 录入真实笔记\n3. 用 AI 生成摘要和关联' },
    { categorySlug: 'knowledge-management', name: 'Readwise Reader', slug: 'readwise-reader', tagline: '阅读、标注和知识回收工具。', description: 'Readwise Reader 适合统一管理文章、PDF、邮件和高亮内容。它能帮助把阅读转化为可回顾的知识。', websiteUrl: 'https://readwise.io/read', pricing: ToolPricing.PAID, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '深度阅读、资料标注、知识回顾', notFor: '一次性浅阅读和纯写作生成', whyRecommended: '适合把输入侧资料长期沉淀。', quickStart: '1. 保存文章或 PDF\n2. 阅读时标注重点\n3. 定期回顾并导出笔记' },
    { categorySlug: 'automation-agent', name: 'Zapier AI', slug: 'zapier-ai', tagline: '连接应用并自动执行重复流程。', description: 'Zapier AI 适合把表单、邮件、表格和通知连接成自动化流程。它适合无代码自动化场景。', websiteUrl: 'https://zapier.com/ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '跨应用自动化、通知流、轻量运营流程', notFor: '复杂后端业务系统和强事务流程', whyRecommended: '生态连接丰富，适合快速验证自动化价值。', quickStart: '1. 选择触发应用\n2. 设置 AI 处理步骤\n3. 测试输出再启用' },
    { categorySlug: 'automation-agent', name: 'Dify', slug: 'dify', tagline: '开源 AI 应用与 Agent 编排平台。', description: 'Dify 适合构建聊天应用、知识库问答和工作流 Agent。它适合团队把 AI 能力产品化。', websiteUrl: 'https://dify.ai', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: 'AI 应用原型、知识库问答、工作流编排', notFor: '只想使用现成聊天工具的轻量用户', whyRecommended: '兼具低代码和可扩展性，适合产品化验证。', quickStart: '1. 创建应用并选择模型\n2. 添加知识库或工作流\n3. 发布并收集反馈' },
    { categorySlug: 'automation-agent', name: 'Make', slug: 'make', tagline: '可视化工作流自动化平台。', description: 'Make 适合把多个 SaaS 服务编排成可视化流程。它比简单自动化更灵活，但需要理解流程节点。', websiteUrl: 'https://www.make.com', pricing: ToolPricing.FREEMIUM, difficulty: ToolDifficulty.INTERMEDIATE, bestFor: '营销运营流程、数据同步、跨工具自动化', notFor: '强代码控制或复杂事务系统', whyRecommended: '可视化流程清晰，适合学习自动化思维。', quickStart: '1. 选择触发器\n2. 添加条件和动作\n3. 跑通样例后开启调度' },
  ]

  // Trae 单独定义：含 promptExample、seoTitle、seoDescription 等深度字段
  const traeToolSeed = {
    categorySlug: 'coding-development',
    name: 'Trae',
    slug: 'trae',
    tagline: '字节跳动推出的国内首个 AI 原生 IDE，中文开发者免费使用。',
    description: 'Trae 是字节跳动 2025 年推出的 AI 原生集成开发环境，基于 VS Code 架构，深度融合豆包、DeepSeek 等大模型。它不是在传统编辑器上加 AI 插件，而是把 AI 作为交互核心重新设计的 IDE——支持自然语言对话、全仓库理解、多文件编辑、Agent 自主开发四种模式。核心机制：AI 能读取整个项目上下文（不只是当前文件），理解模块间依赖关系，因此生成的代码更贴合项目风格。与 Cursor 相比：Trae 原生中文界面、国内模型直连、免费使用，但插件生态和稳定性仍在追赶。与 GitHub Copilot 相比：Copilot 是补全工具，Trae 是开发助手——前者帮你写下一行，后者帮你实现一个功能。截至 2026 年已有 600 万注册用户，月活超 100 万，是国内最主流的 AI IDE。',
    websiteUrl: 'https://www.trae.cn',
    pricing: ToolPricing.FREEMIUM,
    difficulty: ToolDifficulty.BEGINNER,
    bestFor: '日常开发：用 Ctrl+K 行内补全，按 Tab 接受，适合写样板代码和函数实现\n项目理解：接手陌生项目时，用对话让 AI 解释目录结构、模块依赖、核心逻辑\n跨文件重构：描述需求让 AI 同时修改多个文件，如"把所有 console.log 换成 logger"\n功能开发：用 Agent 模式描述一个完整需求，AI 分步实现并运行验证\nBug 定位：粘贴报错信息，AI 结合项目上下文定位原因并给出修复方案\n中文开发者：原生中文界面，国内模型直连，无需翻墙',
    notFor: '生产环境直接部署 AI 生成代码：AI 会编造不存在的 API、忽略边界条件，必须人工审查\n强依赖特定 IDE 插件的老项目：部分 VS Code 插件兼容性需验证，企业级插件可能不支持\n团队协作要求强权限管控的场景：Trae 的协作和权限能力仍在完善，不如 JetBrains 系列\n对代码质量要求极高的场景：AI 生成代码风格统一但可能缺乏深度优化，性能关键路径仍需人工',
    whyRecommended: '国内唯一免费且原生支持中文的 AI 原生 IDE，学习成本低于 Cursor。底层基于 VS Code，原有插件、配置、快捷键可直接迁移，零切换成本。Agent 模式能理解整个项目结构，适合从"补全代码"升级到"描述需求让 AI 实现"。适合作为中文开发者接触 AI 编程的第一站——免费、中文、上手快。局限：复杂项目（10万行+）的上下文理解仍有损耗，关键改动建议拆分小任务。',
    quickStart: '1. 访问 trae.cn 下载对应系统安装包（支持 Windows/Mac/Linux），安装后用字节账号或手机号登录\n2. 打开一个现有项目（建议先用非生产项目练手），等待 Trae 完成代码库索引（右下角会显示进度）\n3. 按 Ctrl+L 打开右侧 AI 对话面板，输入"帮我理解这个项目的目录结构和核心模块"，观察 AI 如何基于项目上下文回答\n4. 选中一段代码，右键选择"解释这段代码"或"重构这段代码"，对比 AI 的修改建议\n5. 按 Ctrl+K 在编辑器内触发行内补全，写完函数签名后按 Tab 接受 AI 建议的函数体\n6. 尝试 Agent 模式：输入"给这个项目加一个用户登录页面，使用现有 UI 组件"，观察 AI 如何分步实现\n7. 关键习惯：每次 AI 生成代码后，用 git diff 审查改动，不要直接接受——AI 会编造 API、忽略类型，人工审查是必须的\n8. 进阶：在项目根目录创建 .trae/rules/project_rules.md，写入项目规范，AI 会遵循这些规则生成代码',
    promptExample: '【场景1：理解陌生项目】\n"这是一个 Next.js 项目，帮我分析 src/app 目录下的路由结构，列出每个页面的功能，并指出哪些页面可能有性能问题。要求：按路由层级展示，每个页面说明功能、数据来源、潜在问题"\n\n【场景2：功能开发（Agent 模式）】\n"在 src/components/admin/ 下新建一个用户管理表格组件，要求：\n- 支持分页（每页20条）、按创建时间排序、按邮箱搜索\n- 使用 shadcn/ui 的 Table 组件，风格参考 src/components/admin/scenes-page.tsx\n- 调用 /api/admin/users 接口，接口返回 { data: User[], total: number }\n- 加载状态用 Skeleton，错误状态显示重试按钮\n- 完成后运行 pnpm lint 验证"\n\n【场景3：Bug 修复】\n"用户反馈 /tools 页面在手机上布局错乱。帮我检查 src/app/tools/page.tsx 的响应式样式，定位问题并修复。修复后说明原因和修改点。"\n\n【场景4：代码审查】\n"审查 src/app/api/admin/tools/route.ts 这个文件，重点检查：权限校验是否完整、输入验证是否充分、错误处理是否覆盖、是否有 SQL 注入风险。按严重程度列出问题。"',
    seoTitle: 'Trae AI IDE — 字节跳动出品的国内首个 AI 原生编辑器（免费）',
    seoDescription: 'Trae 是字节跳动推出的 AI 原生 IDE，基于 VS Code，融合豆包和 DeepSeek 大模型。支持自然语言生成代码、全仓库理解、Agent 自主开发，中文开发者免费使用。600万注册用户，国内最主流的 AI 编程工具。',
  }

  const aiTools = new Map<string, { id: string }>()
  for (let i = 0; i < aiToolSeeds.length; i++) {
    const seed = aiToolSeeds[i]
    const category = toolCategories.get(seed.categorySlug)
    if (!category) throw new Error(`缺少工具分类: ${seed.categorySlug}`)
    const tool = await prisma.aiTool.upsert({ 
      where: { slug: seed.slug },
      update: {
        categoryId: category.id,
        name: seed.name,
        tagline: seed.tagline,
        description: seed.description,
        websiteUrl: seed.websiteUrl,
        pricing: seed.pricing,
        difficulty: seed.difficulty,
        bestFor: seed.bestFor,
        notFor: seed.notFor,
        whyRecommended: seed.whyRecommended,
        quickStart: seed.quickStart,
        sortOrder: i,
        publishStatus: PublishStatus.PUBLISHED,
      },
      create: {
        categoryId: category.id,
        name: seed.name,
        slug: seed.slug,
        tagline: seed.tagline,
        description: seed.description,
        websiteUrl: seed.websiteUrl,
        pricing: seed.pricing,
        difficulty: seed.difficulty,
        bestFor: seed.bestFor,
        notFor: seed.notFor,
        whyRecommended: seed.whyRecommended,
        quickStart: seed.quickStart,
        sortOrder: i,
        publishStatus: PublishStatus.PUBLISHED,
      },
    })
    aiTools.set(seed.slug, tool)
  }

  // 单独写入 Trae（含 promptExample、seoTitle、seoDescription 等深度字段）
  const traeCategory = toolCategories.get(traeToolSeed.categorySlug)
  if (traeCategory) {
    const traeTool = await prisma.aiTool.upsert({
      where: { slug: traeToolSeed.slug },
      update: {
        categoryId: traeCategory.id,
        name: traeToolSeed.name,
        tagline: traeToolSeed.tagline,
        description: traeToolSeed.description,
        websiteUrl: traeToolSeed.websiteUrl,
        pricing: traeToolSeed.pricing,
        difficulty: traeToolSeed.difficulty,
        bestFor: traeToolSeed.bestFor,
        notFor: traeToolSeed.notFor,
        whyRecommended: traeToolSeed.whyRecommended,
        quickStart: traeToolSeed.quickStart,
        promptExample: traeToolSeed.promptExample,
        sortOrder: aiToolSeeds.length,
        isTop: true,
        publishStatus: PublishStatus.PUBLISHED,
        seoTitle: traeToolSeed.seoTitle,
        seoDescription: traeToolSeed.seoDescription,
      },
      create: {
        categoryId: traeCategory.id,
        name: traeToolSeed.name,
        slug: traeToolSeed.slug,
        tagline: traeToolSeed.tagline,
        description: traeToolSeed.description,
        websiteUrl: traeToolSeed.websiteUrl,
        pricing: traeToolSeed.pricing,
        difficulty: traeToolSeed.difficulty,
        bestFor: traeToolSeed.bestFor,
        notFor: traeToolSeed.notFor,
        whyRecommended: traeToolSeed.whyRecommended,
        quickStart: traeToolSeed.quickStart,
        promptExample: traeToolSeed.promptExample,
        sortOrder: aiToolSeeds.length,
        isTop: true,
        publishStatus: PublishStatus.PUBLISHED,
        seoTitle: traeToolSeed.seoTitle,
        seoDescription: traeToolSeed.seoDescription,
      },
    })
    aiTools.set(traeToolSeed.slug, traeTool)
  }

  console.log(`  创建了 ${toolCategorySeeds.length} 个工具分类`)
  console.log(`  创建了 ${aiToolSeeds.length + 1} 个 AI 工具`)

  // ==================== 草稿场景：数据分析 ====================
  console.log('🎬 创建草稿场景...')

  const draftScene = await prisma.scene.upsert({
    where: { slug: 'ai-data-analysis' },
    update: {},
    create: {
      title: '用 AI 做数据分析',
      slug: 'ai-data-analysis',
      summary: '学会用 AI 辅助数据清洗、分析和可视化',
      suitableFor: '需要处理数据但不会编程的职场人士',
      notSuitableFor: '专业数据科学家',
      publishStatus: PublishStatus.DRAFT,
    },
  })

  console.log(`  创建草稿场景: ${draftScene.title}`)

  // 草稿场景的4个空阶段
  const draftStageTypes: StageType[] = [StageType.UNDERSTAND, StageType.HANDS_ON, StageType.STABLE_PRODUCTION, StageType.ADVANCE]
  for (let i = 0; i < draftStageTypes.length; i++) {
    await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: draftScene.id, stageType: draftStageTypes[i] } },
      update: {},
      create: {
        sceneId: draftScene.id,
        stageType: draftStageTypes[i],
        capabilityStd: '待补充',
        learningFocus: '待补充',
        practiceTask: '待补充',
        capabilityEvidence: '待补充',
        aiIntervention: '待补充',
        sortOrder: i,
      },
    })
  }

  // ==================== 已发布场景1：公众号运营 ====================
  console.log('🎬 创建已发布场景：公众号运营...')

  const wechatScene = await prisma.scene.upsert({
    where: { slug: 'ai-wechat-official-account' },
    update: {
      summary: '从零开始运营一个"AI 工具测评与实践"公众号，用 AI 贯穿定位、选题、写作、发布、复盘全链路。学完后你能独立完成：账号定位说明、每周选题规划、分环节 AI 辅助写作、发布数据复盘、瓶颈识别与升级。核心理念：不是"让 AI 替你写"，而是"用 AI 把每个环节做得更扎实"——AI 帮你想清楚定位、校准选题、整理素材、搭建大纲、改写正文、复盘数据，但每一步的判断和决策仍是你的。本场景以"AI 工具测评"为案例，但方法可迁移到任何内容方向。',
      suitableFor: '正在或准备运营公众号的个人创作者、自媒体新人、内容运营岗\n已有公众号但选题随机、产出不稳定、缺乏复盘习惯的人\n想用 AI 提效但不知道具体在哪些环节用的运营者\n特别适合：有某个领域经验（如 AI、编程、职场、育儿），但缺乏内容运营方法论的人',
      notSuitableFor: '完全不做内容运营的人\n已有成熟内容团队和 SOP 的大型账号（这套流程偏个人和小团队）\n期望 AI 一键生成文章直接发布的人（本场景强调分环节辅助，不是替代思考）\n没有任何领域经验只想"蹭 AI 流量"的人（内容质量仍取决于你的专业度）',
      seoTitle: '用 AI 运营公众号全流程指南 — 从定位到复盘的实战场景',
      seoDescription: '一个完整的公众号 AI 运营场景，覆盖定位、选题、写作、发布、复盘、升级六个环节。通过 4 个阶段 8 个节点，学会在每个环节具体如何使用 AI，附带真实对话示例和检查清单。以 AI 工具测评公众号为案例，方法可迁移到任何内容方向。',
    },
    create: {
      title: '用 AI 运营一个公众号',
      slug: 'ai-wechat-official-account',
      summary: '从零开始运营一个"AI 工具测评与实践"公众号，用 AI 贯穿定位、选题、写作、发布、复盘全链路。学完后你能独立完成：账号定位说明、每周选题规划、分环节 AI 辅助写作、发布数据复盘、瓶颈识别与升级。核心理念：不是"让 AI 替你写"，而是"用 AI 把每个环节做得更扎实"——AI 帮你想清楚定位、校准选题、整理素材、搭建大纲、改写正文、复盘数据，但每一步的判断和决策仍是你的。本场景以"AI 工具测评"为案例，但方法可迁移到任何内容方向。',
      suitableFor: '正在或准备运营公众号的个人创作者、自媒体新人、内容运营岗\n已有公众号但选题随机、产出不稳定、缺乏复盘习惯的人\n想用 AI 提效但不知道具体在哪些环节用的运营者\n特别适合：有某个领域经验（如 AI、编程、职场、育儿），但缺乏内容运营方法论的人',
      notSuitableFor: '完全不做内容运营的人\n已有成熟内容团队和 SOP 的大型账号（这套流程偏个人和小团队）\n期望 AI 一键生成文章直接发布的人（本场景强调分环节辅助，不是替代思考）\n没有任何领域经验只想"蹭 AI 流量"的人（内容质量仍取决于你的专业度）',
      seoTitle: '用 AI 运营公众号全流程指南 — 从定位到复盘的实战场景',
      seoDescription: '一个完整的公众号 AI 运营场景，覆盖定位、选题、写作、发布、复盘、升级六个环节。通过 4 个阶段 8 个节点，学会在每个环节具体如何使用 AI，附带真实对话示例和检查清单。以 AI 工具测评公众号为案例，方法可迁移到任何内容方向。',
      publishStatus: PublishStatus.PUBLISHED,
      isRecommended: true,
      publishedAt: new Date(),
    },
  })

  console.log(`  创建已发布场景: ${wechatScene.title}`)

  await prisma.aiToolScene.createMany({
    data: ['notion-ai', 'xiezuocat', 'perplexity', 'canva-ai', 'dify', 'trae']
      .map((slug) => aiTools.get(slug))
      .filter((tool): tool is { id: string } => Boolean(tool))
      .map((tool) => ({ toolId: tool.id, sceneId: wechatScene.id })),
    skipDuplicates: true,
  })

  // 关联分类标签
  await prisma.sceneTaxonomy.createMany({
    data: [
      { sceneId: wechatScene.id, taxonomyId: taxonomies.contentCreation.id },
      { sceneId: wechatScene.id, taxonomyId: taxonomies.selfMediaOperator.id },
      { sceneId: wechatScene.id, taxonomyId: taxonomies.promptEngineering.id },
      { sceneId: wechatScene.id, taxonomyId: taxonomies.contentPlanning.id },
      { sceneId: wechatScene.id, taxonomyId: taxonomies.chatgpt.id },
      { sceneId: wechatScene.id, taxonomyId: taxonomies.deepseek.id },
    ],
    skipDuplicates: true,
  })

  console.log('  关联了 6 个分类标签')

  // 公众号场景四阶段（含 commonFailure 和 remedialAction）
  const wechatStages = {
    understand: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: wechatScene.id, stageType: StageType.UNDERSTAND } },
      update: {
        capabilityStd: '能用一句话说清楚公众号服务谁、解决什么问题、和同类账号的差异化是什么，并输出一份可执行的运营链路说明。',
        learningFocus: '账号定位厘清与运营链路理解。不是让 AI 给你定位建议，而是通过 AI 追问法逼自己想清楚三个根本问题：服务谁、解决什么、凭什么是你。',
        practiceTask: '用 AI 追问法完成一份公众号定位说明，并梳理从定位到复盘的完整运营链路。交付物：定位说明文档 + 运营链路图。',
        capabilityEvidence: '一份可检查的运营链路说明，包含：目标读者画像（具体到职业、经验、痛点）、核心价值主张（一句话差异化）、3-5 个栏目规划（每个栏目附 5 个选题示例）、从定位到复盘的完整链路图',
        aiIntervention: '用 AI 追问账号定位、读者问题、栏目边界和复盘指标。关键是让 AI"追问"而不是"回答"——AI 的价值在于逼你想清楚，不是替你想。',
        commonFailure: '只会复述定位概念（如"我要服务职场人"），不会结合自己场景具体化。典型表现：目标读者写"对 AI 感兴趣的人"，栏目写"分享 AI 内容"——这种定位无法指导选题。',
        remedialAction: '重写定位说明，每个字段必须具体化：目标读者从"对 AI 感兴趣的人"改为"用过 ChatGPT 但没深度用的互联网中层"；栏目从"分享 AI 内容"改为"AI 工具测评 / 实践案例 / 对比横评"三个具体栏目；每个栏目立刻列出 5 个具体选题验证可持续性',
      },
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.UNDERSTAND,
        capabilityStd: '能用一句话说清楚公众号服务谁、解决什么问题、和同类账号的差异化是什么，并输出一份可执行的运营链路说明。',
        learningFocus: '账号定位厘清与运营链路理解。不是让 AI 给你定位建议，而是通过 AI 追问法逼自己想清楚三个根本问题：服务谁、解决什么、凭什么是你。',
        practiceTask: '用 AI 追问法完成一份公众号定位说明，并梳理从定位到复盘的完整运营链路。交付物：定位说明文档 + 运营链路图。',
        capabilityEvidence: '一份可检查的运营链路说明，包含：目标读者画像（具体到职业、经验、痛点）、核心价值主张（一句话差异化）、3-5 个栏目规划（每个栏目附 5 个选题示例）、从定位到复盘的完整链路图',
        aiIntervention: '用 AI 追问账号定位、读者问题、栏目边界和复盘指标。关键是让 AI"追问"而不是"回答"——AI 的价值在于逼你想清楚，不是替你想。',
        commonFailure: '只会复述定位概念（如"我要服务职场人"），不会结合自己场景具体化。典型表现：目标读者写"对 AI 感兴趣的人"，栏目写"分享 AI 内容"——这种定位无法指导选题。',
        remedialAction: '重写定位说明，每个字段必须具体化：目标读者从"对 AI 感兴趣的人"改为"用过 ChatGPT 但没深度用的互联网中层"；栏目从"分享 AI 内容"改为"AI 工具测评 / 实践案例 / 对比横评"三个具体栏目；每个栏目立刻列出 5 个具体选题验证可持续性',
        sortOrder: 0,
      },
    }),
    handsOn: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: wechatScene.id, stageType: StageType.HANDS_ON } },
      update: {
        capabilityStd: '能用 AI 分环节辅助完成一篇文章从选题到发布前检查的完整准备，不一次性要成稿。',
        learningFocus: '分环节使用 AI 辅助内容产出。核心方法：把写作拆成选题校准→资料整理→大纲搭建→分段改写→标题生成→发布检查 6 个环节，每个环节单独用 AI，不一次性让 AI 写完整篇文章。',
        practiceTask: '用 AI 分环节辅助完成一篇文章准备。交付物：选题校准记录 + 结构化素材 + 大纲 + 分段完成的文章初稿 + 发布检查清单。',
        capabilityEvidence: '一篇文章的完整准备过程，包含：选题校准记录（原选题→AI 追问→校准后选题）、结构化素材（不是散乱的链接，是按主题分类的要点）、分环节完成的文章初稿（每环节单独用 AI）、发布检查清单（标题、封面、摘要、标签）',
        aiIntervention: '用 AI 分环节辅助选题校准、资料整理、大纲搭建、正文改写、标题生成和发布检查。关键原则：每个环节给 AI 明确任务，不让 AI 自由发挥——AI 是助手不是作者。',
        commonFailure: '照抄 AI 输出但不理解每步为什么存在。典型表现：让 AI 一次性写完整篇文章，跳过分环节；或分环节但每步都直接接受 AI 输出，不追问不调整。',
        remedialAction: '重新演示一次，补充每步说明：选题校准——说明原选题为什么不够，校准后为什么更好；资料整理——说明每个素材用在哪；大纲——说明结构为什么这样搭；正文——说明每段改了什么、为什么改',
      },
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.HANDS_ON,
        capabilityStd: '能用 AI 分环节辅助完成一篇文章从选题到发布前检查的完整准备，不一次性要成稿。',
        learningFocus: '分环节使用 AI 辅助内容产出。核心方法：把写作拆成选题校准→资料整理→大纲搭建→分段改写→标题生成→发布检查 6 个环节，每个环节单独用 AI，不一次性让 AI 写完整篇文章。',
        practiceTask: '用 AI 分环节辅助完成一篇文章准备。交付物：选题校准记录 + 结构化素材 + 大纲 + 分段完成的文章初稿 + 发布检查清单。',
        capabilityEvidence: '一篇文章的完整准备过程，包含：选题校准记录（原选题→AI 追问→校准后选题）、结构化素材（不是散乱的链接，是按主题分类的要点）、分环节完成的文章初稿（每环节单独用 AI）、发布检查清单（标题、封面、摘要、标签）',
        aiIntervention: '用 AI 分环节辅助选题校准、资料整理、大纲搭建、正文改写、标题生成和发布检查。关键原则：每个环节给 AI 明确任务，不让 AI 自由发挥——AI 是助手不是作者。',
        commonFailure: '照抄 AI 输出但不理解每步为什么存在。典型表现：让 AI 一次性写完整篇文章，跳过分环节；或分环节但每步都直接接受 AI 输出，不追问不调整。',
        remedialAction: '重新演示一次，补充每步说明：选题校准——说明原选题为什么不够，校准后为什么更好；资料整理——说明每个素材用在哪；大纲——说明结构为什么这样搭；正文——说明每段改了什么、为什么改',
        sortOrder: 1,
      },
    }),
    stableProduction: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: wechatScene.id, stageType: StageType.STABLE_PRODUCTION } },
      update: {
        capabilityStd: '能围绕同一账号定位连续完成三篇内容并复盘，产出风格一致、质量稳定。',
        learningFocus: '复用 AI 上下文稳定产出。核心方法：让 AI 记住你的账号设定、栏目标准、写作风格，复用上下文连续产出，而不是每次从零开始。',
        practiceTask: '连续完成三篇内容并记录复盘。交付物：三篇内容 + 复盘记录（含数据对比和调整方向）。',
        capabilityEvidence: '三篇内容+复盘记录，包含：三篇风格一致的文章（栏目、结构、语气统一）、每篇的产出过程记录（复用了哪些上下文）、复盘报告（数据对比、规律发现、调整方向）',
        aiIntervention: '用 AI 复用账号设定、栏目标准和复盘表。关键操作：把账号定位、栏目规范、风格示例作为上下文喂给 AI，让 AI 在此基础上产出。',
        commonFailure: '只能重复原案例，换输入就不稳。典型表现：第一篇用 AI 写得很好，第二篇换主题后风格完全变了，第三篇质量明显下降。',
        remedialAction: '更换输入再做一轮，按清单自查：是否把账号设定作为上下文喂给 AI；是否在 prompt 中明确要求保持风格一致；是否对比了三篇文章的风格差异；复盘记录是否有具体数据，不是主观感受',
      },
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.STABLE_PRODUCTION,
        capabilityStd: '能围绕同一账号定位连续完成三篇内容并复盘，产出风格一致、质量稳定。',
        learningFocus: '复用 AI 上下文稳定产出。核心方法：让 AI 记住你的账号设定、栏目标准、写作风格，复用上下文连续产出，而不是每次从零开始。',
        practiceTask: '连续完成三篇内容并记录复盘。交付物：三篇内容 + 复盘记录（含数据对比和调整方向）。',
        capabilityEvidence: '三篇内容+复盘记录，包含：三篇风格一致的文章（栏目、结构、语气统一）、每篇的产出过程记录（复用了哪些上下文）、复盘报告（数据对比、规律发现、调整方向）',
        aiIntervention: '用 AI 复用账号设定、栏目标准和复盘表。关键操作：把账号定位、栏目规范、风格示例作为上下文喂给 AI，让 AI 在此基础上产出。',
        commonFailure: '只能重复原案例，换输入就不稳。典型表现：第一篇用 AI 写得很好，第二篇换主题后风格完全变了，第三篇质量明显下降。',
        remedialAction: '更换输入再做一轮，按清单自查：是否把账号设定作为上下文喂给 AI；是否在 prompt 中明确要求保持风格一致；是否对比了三篇文章的风格差异；复盘记录是否有具体数据，不是主观感受',
        sortOrder: 2,
      },
    }),
    advance: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: wechatScene.id, stageType: StageType.ADVANCE } },
      update: {
        capabilityStd: '能基于真实数据识别一个内容瓶颈并输出可执行的升级方案，方案需有前后对比和预期效果。',
        learningFocus: '用 AI 发现瓶颈并辅助优化。核心方法：用 AI 分析多篇内容的共性问题（标题、结构、结尾、互动），生成可执行的升级方案，不是泛泛而谈的"建议"。',
        practiceTask: '分析三篇内容的共性问题，生成一个可执行升级方案并实施。交付物：升级方案 + 实施后的前后对比数据。',
        capabilityEvidence: '升级方案+前后对比，包含：瓶颈分析（具体问题+数据证据，不是主观感受）、升级方案（可执行步骤+预期效果）、实施记录（改了什么、怎么改的）、前后对比数据（点击率、点赞率、分享率等）',
        aiIntervention: '用 AI 分析共性问题，生成可执行升级方案。关键操作：把三篇内容的数据和内容喂给 AI，让 AI 找共性问题和优化方向，但方案需人工判断是否可执行。',
        commonFailure: '只有主观感受没有前后证据。典型表现：说"感觉标题不够吸引人"，但没有点击率数据；说"升级后效果更好"，但没有前后对比。',
        remedialAction: '补交前后对比与复盘数据：瓶颈必须有数据支撑（如"三篇平均点击率 2.5%，低于行业 4%"）；升级方案必须有预期效果（如"改用结果导向标题，预期点击率提升至 4%"）；实施后必须有实际数据对比（如"升级后点击率 3.8%，提升 52%"）',
      },
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.ADVANCE,
        capabilityStd: '能基于真实数据识别一个内容瓶颈并输出可执行的升级方案，方案需有前后对比和预期效果。',
        learningFocus: '用 AI 发现瓶颈并辅助优化。核心方法：用 AI 分析多篇内容的共性问题（标题、结构、结尾、互动），生成可执行的升级方案，不是泛泛而谈的"建议"。',
        practiceTask: '分析三篇内容的共性问题，生成一个可执行升级方案并实施。交付物：升级方案 + 实施后的前后对比数据。',
        capabilityEvidence: '升级方案+前后对比，包含：瓶颈分析（具体问题+数据证据，不是主观感受）、升级方案（可执行步骤+预期效果）、实施记录（改了什么、怎么改的）、前后对比数据（点击率、点赞率、分享率等）',
        aiIntervention: '用 AI 分析共性问题，生成可执行升级方案。关键操作：把三篇内容的数据和内容喂给 AI，让 AI 找共性问题和优化方向，但方案需人工判断是否可执行。',
        commonFailure: '只有主观感受没有前后证据。典型表现：说"感觉标题不够吸引人"，但没有点击率数据；说"升级后效果更好"，但没有前后对比。',
        remedialAction: '补交前后对比与复盘数据：瓶颈必须有数据支撑（如"三篇平均点击率 2.5%，低于行业 4%"）；升级方案必须有预期效果（如"改用结果导向标题，预期点击率提升至 4%"）；实施后必须有实际数据对比（如"升级后点击率 3.8%，提升 52%"）',
        sortOrder: 3,
      },
    }),
  }

  console.log(`  创建了 ${Object.keys(wechatStages).length} 个阶段`)

  // ==================== 公众号场景学习节点 ====================
  console.log('📚 创建公众号场景学习节点...')

  // 节点1: define-account-positioning
  const node1 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'define-account-positioning' } },
    update: {
      objective: '学会用"AI 追问法"厘清公众号定位，输出一份可执行的定位说明。核心不是让 AI 直接给你定位建议，而是通过 AI 不断追问，逼你想清楚三个根本问题：1. 服务谁——不是"对 AI 感兴趣的人"，而是具体到"刚接触 AI、不知道选什么工具的职场人" 2. 解决什么问题——不是"提供 AI 内容"，而是"帮读者从工具海洋中选出适合的，并教他们怎么用" 3. 凭什么是你——你的差异化在哪，为什么读者看你的而不是看官方文档或大V。想清楚这三点，后面的选题、写作、复盘才有锚点。',
      prerequisites: '有一个想运营公众号的方向（哪怕很模糊，如"想做 AI 相关的内容"）\n准备好一个 AI 聊天工具（DeepSeek、豆包、ChatGPT 均可）\n准备 30-60 分钟不被打扰的时间（定位想清楚能省后面几十小时的弯路）',
      keyConcepts: '目标读者画像：不是"职场人"这种泛标签，而是具体到"3-5年经验、面临效率瓶颈、想用 AI 但不知道从哪入手的互联网中层"。画像越具体，选题越精准。\n核心价值主张：读者为什么要看你的内容而不是别人的。三种典型价值：工具推荐（门槛低但同质化）、实践案例（有差异化但需真实经验）、思维方法（天花板高但难持续）。你必须选一个主轴。\n栏目规划：3-5个可持续产出的栏目，每个栏目有明确的选题方向和产出节奏。验证可持续性的方法：每个栏目能立刻说出 5 个具体选题。\n能力边界：明确不写什么，比写什么更重要。边界清晰才能聚焦，聚焦才能做出辨识度。',
      methodFocus: 'AI 追问法：你给一个初步想法，让 AI 扮演"资深内容顾问"角色，不断追问你的目标读者、核心价值、栏目边界。关键是让 AI"追问"而不是"回答"——AI 的价值在于逼你想清楚，不是替你想。操作要点：每次只回答 AI 的一个问题，不要一次性倒完所有想法；回答要具体，不要用"大概""可能"这种模糊词。典型流程：初步想法 → AI 追问目标读者 → AI 追问核心价值 → AI 追问差异化 → AI 追问栏目规划 → AI 追问可持续性 → 整理成定位说明。',
      practiceTask: '1. 准备一段 100 字以内的公众号方向描述（如"想做一个关于 AI 工具的公众号"）\n2. 用下面的 prompt 启动 AI 追问（见对话示例）\n3. 经历至少 5 轮追问，每轮逼自己给出具体答案，不用"大概""可能"\n4. 追问结束后，让 AI 把所有问答整理成一份定位说明\n5. 用检查清单自查定位说明是否可执行——能否让另一个人直接理解并照做\n6. 把定位说明保存下来，后续选题、写作、复盘都要对照这份说明',
      passCriteria: '能用一句话说清楚：公众号服务谁、解决什么具体问题、和同类账号的差异化是什么\n栏目规划至少 3 个，每个栏目能立刻说出 5 个具体选题（可持续性验证）\n能明确说出"不写什么"的边界（聚焦验证）\n定位说明能让另一个人直接理解并执行（可执行性验证）',
      capabilityEvidence: '一份定位说明文档，包含：目标读者画像（具体到职业、经验、痛点、当前解决方案）、核心价值主张（一句话，说清差异化）、3-5 个栏目规划（每个栏目附 5 个选题示例）、能力边界（明确不写的方向及原因）、可持续性的自我评估（为什么你能持续产出 3 个月以上）',
    },
    create: {
      stageId: wechatStages.understand.id,
      sceneId: wechatScene.id,
      title: '明确你的公众号定位',
      slug: 'define-account-positioning',
      objective: '学会用"AI 追问法"厘清公众号定位，输出一份可执行的定位说明。核心不是让 AI 直接给你定位建议，而是通过 AI 不断追问，逼你想清楚三个根本问题：1. 服务谁——不是"对 AI 感兴趣的人"，而是具体到"刚接触 AI、不知道选什么工具的职场人" 2. 解决什么问题——不是"提供 AI 内容"，而是"帮读者从工具海洋中选出适合的，并教他们怎么用" 3. 凭什么是你——你的差异化在哪，为什么读者看你的而不是看官方文档或大V。想清楚这三点，后面的选题、写作、复盘才有锚点。',
      prerequisites: '有一个想运营公众号的方向（哪怕很模糊，如"想做 AI 相关的内容"）\n准备好一个 AI 聊天工具（DeepSeek、豆包、ChatGPT 均可）\n准备 30-60 分钟不被打扰的时间（定位想清楚能省后面几十小时的弯路）',
      keyConcepts: '目标读者画像：不是"职场人"这种泛标签，而是具体到"3-5年经验、面临效率瓶颈、想用 AI 但不知道从哪入手的互联网中层"。画像越具体，选题越精准。\n核心价值主张：读者为什么要看你的内容而不是别人的。三种典型价值：工具推荐（门槛低但同质化）、实践案例（有差异化但需真实经验）、思维方法（天花板高但难持续）。你必须选一个主轴。\n栏目规划：3-5个可持续产出的栏目，每个栏目有明确的选题方向和产出节奏。验证可持续性的方法：每个栏目能立刻说出 5 个具体选题。\n能力边界：明确不写什么，比写什么更重要。边界清晰才能聚焦，聚焦才能做出辨识度。',
      methodFocus: 'AI 追问法：你给一个初步想法，让 AI 扮演"资深内容顾问"角色，不断追问你的目标读者、核心价值、栏目边界。关键是让 AI"追问"而不是"回答"——AI 的价值在于逼你想清楚，不是替你想。操作要点：每次只回答 AI 的一个问题，不要一次性倒完所有想法；回答要具体，不要用"大概""可能"这种模糊词。典型流程：初步想法 → AI 追问目标读者 → AI 追问核心价值 → AI 追问差异化 → AI 追问栏目规划 → AI 追问可持续性 → 整理成定位说明。',
      practiceTask: '1. 准备一段 100 字以内的公众号方向描述（如"想做一个关于 AI 工具的公众号"）\n2. 用下面的 prompt 启动 AI 追问（见对话示例）\n3. 经历至少 5 轮追问，每轮逼自己给出具体答案，不用"大概""可能"\n4. 追问结束后，让 AI 把所有问答整理成一份定位说明\n5. 用检查清单自查定位说明是否可执行——能否让另一个人直接理解并照做\n6. 把定位说明保存下来，后续选题、写作、复盘都要对照这份说明',
      passCriteria: '能用一句话说清楚：公众号服务谁、解决什么具体问题、和同类账号的差异化是什么\n栏目规划至少 3 个，每个栏目能立刻说出 5 个具体选题（可持续性验证）\n能明确说出"不写什么"的边界（聚焦验证）\n定位说明能让另一个人直接理解并执行（可执行性验证）',
      capabilityEvidence: '一份定位说明文档，包含：目标读者画像（具体到职业、经验、痛点、当前解决方案）、核心价值主张（一句话，说清差异化）、3-5 个栏目规划（每个栏目附 5 个选题示例）、能力边界（明确不写的方向及原因）、可持续性的自我评估（为什么你能持续产出 3 个月以上）',
      sortOrder: 0,
    },
  })

  // 节点2: understand-operation-chain
  const node2 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'understand-operation-chain' } },
    update: {
      objective: '理解公众号从定位到复盘的完整运营链路，知道每个环节的目的和产出。核心不是记住流程图，而是理解为什么需要每个环节、跳过哪个环节会导致什么问题。典型错误：跳过选题校准直接写，导致写完发现没人看；跳过复盘直接写下一篇，导致同样的问题反复出现。',
      prerequisites: '已完成节点1的定位说明（运营链路需要基于明确的定位）\n准备好 AI 聊天工具',
      keyConcepts: '运营链路：定位→选题→资料整理→大纲→正文→标题封面→发布检查→数据复盘→回到选题。每个环节有明确的输入和输出，跳过任何环节都会在后面付出代价。\n复盘指标：阅读量、点赞率、分享率、收藏率。不同指标反映不同问题：阅读量看标题和封面，点赞率看内容质量，分享率看传播价值，收藏率看实用程度。\n选题卡：把选题从"想法"变成"可执行的任务"。选题卡包含：选题方向、目标读者、核心价值、预估阅读量、关联栏目。',
      methodFocus: '用 AI 梳理完整运营链路，重点理解每个环节的输入输出和跳过的后果。操作要点：让 AI 帮你画出链路图，然后追问"如果跳过选题校准会怎样""如果复盘只看阅读量会漏掉什么"。',
      practiceTask: '1. 用 AI 梳理从定位到复盘的完整运营链路\n2. 对每个环节追问：跳过会怎样？输入是什么？输出是什么？\n3. 基于你的定位说明，为每个环节写出具体操作（如"选题"环节：每周三固定选题日，用 AI 校准方向）\n4. 输出一份运营链路说明，包含每个环节的具体操作和产出',
      passCriteria: '能说清楚从定位到复盘的完整链路，每个环节有具体操作\n能说出跳过任何一个环节的后果\n链路有复盘闭环（不是线性流程，而是循环改进）',
      capabilityEvidence: '一份运营链路说明文档，包含：完整链路图（每个环节的输入→处理→输出）、每个环节的具体操作（基于你的定位）、跳过每个环节的后果说明、复盘闭环设计（数据如何反馈到选题）',
    },
    create: {
      stageId: wechatStages.understand.id,
      sceneId: wechatScene.id,
      title: '了解公众号运营链路',
      slug: 'understand-operation-chain',
      objective: '理解公众号从定位到复盘的完整运营链路，知道每个环节的目的和产出。核心不是记住流程图，而是理解为什么需要每个环节、跳过哪个环节会导致什么问题。典型错误：跳过选题校准直接写，导致写完发现没人看；跳过复盘直接写下一篇，导致同样的问题反复出现。',
      prerequisites: '已完成节点1的定位说明（运营链路需要基于明确的定位）\n准备好 AI 聊天工具',
      keyConcepts: '运营链路：定位→选题→资料整理→大纲→正文→标题封面→发布检查→数据复盘→回到选题。每个环节有明确的输入和输出，跳过任何环节都会在后面付出代价。\n复盘指标：阅读量、点赞率、分享率、收藏率。不同指标反映不同问题：阅读量看标题和封面，点赞率看内容质量，分享率看传播价值，收藏率看实用程度。\n选题卡：把选题从"想法"变成"可执行的任务"。选题卡包含：选题方向、目标读者、核心价值、预估阅读量、关联栏目。',
      methodFocus: '用 AI 梳理完整运营链路，重点理解每个环节的输入输出和跳过的后果。操作要点：让 AI 帮你画出链路图，然后追问"如果跳过选题校准会怎样""如果复盘只看阅读量会漏掉什么"。',
      practiceTask: '1. 用 AI 梳理从定位到复盘的完整运营链路\n2. 对每个环节追问：跳过会怎样？输入是什么？输出是什么？\n3. 基于你的定位说明，为每个环节写出具体操作（如"选题"环节：每周三固定选题日，用 AI 校准方向）\n4. 输出一份运营链路说明，包含每个环节的具体操作和产出',
      passCriteria: '能说清楚从定位到复盘的完整链路，每个环节有具体操作\n能说出跳过任何一个环节的后果\n链路有复盘闭环（不是线性流程，而是循环改进）',
      capabilityEvidence: '一份运营链路说明文档，包含：完整链路图（每个环节的输入→处理→输出）、每个环节的具体操作（基于你的定位）、跳过每个环节的后果说明、复盘闭环设计（数据如何反馈到选题）',
      sortOrder: 1,
    },
  })

  // 节点3: hands-on-topic-selection
  const node3 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'hands-on-topic-selection' } },
    update: {
      objective: '学会用 AI 辅助选题校准和资料整理，把"想法"变成"可执行的选题卡"。核心方法：选题不是"想到什么写什么"，而是基于定位校准方向、基于读者需求验证价值。常见错误：选题太泛（"AI 工具推荐"）→ 没人看；选题太窄（"某工具某个参数"）→ 受众太小。',
      prerequisites: '已完成公众号定位说明（选题必须基于定位）\n已了解运营链路（选题是链路的起点）',
      keyConcepts: '选题校准：从"想法"到"可执行选题"的过程。校准三个维度：方向（是否符合定位）、价值（读者为什么要看）、可行性（你能否写出）。\n结构化素材：不是散乱的链接收藏，而是按主题分类、标注用途的要点整理。素材分三类：事实数据（需核验）、观点引用（需注明来源）、案例故事（需真实经历）。\n选题卡：选题的标准化输出，包含选题方向、目标读者、核心价值、预估阅读量、关联栏目、素材清单。',
      methodFocus: '用 AI 校准选题方向，整理资料为结构化素材。操作要点：先给 AI 你的定位说明和初步选题，让 AI 追问校准；然后让 AI 帮你把散乱资料整理成结构化素材。',
      practiceTask: '1. 从你的栏目规划中选一个选题方向\n2. 用 AI 校准选题（见对话示例），从"想法"变成"校准后选题"\n3. 围绕校准后选题，用 AI 整理资料为结构化素材\n4. 输出选题卡 + 结构化素材清单',
      passCriteria: '选题校准后有明确的目标读者和核心价值（不是泛泛的"AI工具推荐"）\n素材是结构化的（按主题分类、标注用途），不是散乱的链接\n选题卡完整（方向、读者、价值、素材清单）',
      capabilityEvidence: '选题校准记录 + 结构化素材，包含：原选题→AI 追问→校准后选题的完整过程、选题卡（方向、目标读者、核心价值、关联栏目）、结构化素材清单（按主题分类，标注用途）',
    },
    create: {
      stageId: wechatStages.handsOn.id,
      sceneId: wechatScene.id,
      title: '选题与资料整理',
      slug: 'hands-on-topic-selection',
      objective: '学会用 AI 辅助选题校准和资料整理，把"想法"变成"可执行的选题卡"。核心方法：选题不是"想到什么写什么"，而是基于定位校准方向、基于读者需求验证价值。常见错误：选题太泛（"AI 工具推荐"）→ 没人看；选题太窄（"某工具某个参数"）→ 受众太小。',
      prerequisites: '已完成公众号定位说明（选题必须基于定位）\n已了解运营链路（选题是链路的起点）',
      keyConcepts: '选题校准：从"想法"到"可执行选题"的过程。校准三个维度：方向（是否符合定位）、价值（读者为什么要看）、可行性（你能否写出）。\n结构化素材：不是散乱的链接收藏，而是按主题分类、标注用途的要点整理。素材分三类：事实数据（需核验）、观点引用（需注明来源）、案例故事（需真实经历）。\n选题卡：选题的标准化输出，包含选题方向、目标读者、核心价值、预估阅读量、关联栏目、素材清单。',
      methodFocus: '用 AI 校准选题方向，整理资料为结构化素材。操作要点：先给 AI 你的定位说明和初步选题，让 AI 追问校准；然后让 AI 帮你把散乱资料整理成结构化素材。',
      practiceTask: '1. 从你的栏目规划中选一个选题方向\n2. 用 AI 校准选题（见对话示例），从"想法"变成"校准后选题"\n3. 围绕校准后选题，用 AI 整理资料为结构化素材\n4. 输出选题卡 + 结构化素材清单',
      passCriteria: '选题校准后有明确的目标读者和核心价值（不是泛泛的"AI工具推荐"）\n素材是结构化的（按主题分类、标注用途），不是散乱的链接\n选题卡完整（方向、读者、价值、素材清单）',
      capabilityEvidence: '选题校准记录 + 结构化素材，包含：原选题→AI 追问→校准后选题的完整过程、选题卡（方向、目标读者、核心价值、关联栏目）、结构化素材清单（按主题分类，标注用途）',
      sortOrder: 0,
    },
  })

  // 节点4: hands-on-outline-writing
  const node4 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'hands-on-outline-writing' } },
    update: {
      objective: '学会用 AI 分环节辅助大纲搭建和正文改写，不一次性要成稿。核心方法：先搭大纲确定结构，再分段改写填充内容，最后整体润色。每一步单独用 AI，不让 AI 自由发挥。为什么要分环节：一次性让 AI 写完整篇文章，输出质量不可控、风格不统一、无法迭代。分环节则每步可控、可调、可复用。',
      prerequisites: '已完成选题校准和资料整理（大纲需要基于校准后的选题和结构化素材）',
      keyConcepts: '大纲结构：不是列几个标题，而是每个段落有明确的"说什么+为什么说+怎么说"。好的大纲能让另一个人按大纲写出风格一致的文章。\n分段改写：不一次性改写全文，而是按段落逐段改写。每段给 AI 明确的输入（这段要说什么、用什么素材、什么语气）和约束（字数、风格、禁忌）。\n发布检查：发布前的最后一道关卡，检查标题是否吸引人、封面是否匹配、摘要是否准确、标签是否覆盖关键词。',
      methodFocus: '不一次性要成稿，分环节让 AI 辅助。操作要点：大纲环节给 AI 你的选题卡和素材，让 AI 搭结构；改写环节给 AI 每段的具体要求和约束；检查环节让 AI 按清单逐项检查。',
      practiceTask: '1. 用 AI 基于选题卡和素材搭建大纲（每段有"说什么+为什么说"）\n2. 按段落逐段用 AI 改写（每段给明确输入和约束）\n3. 用 AI 生成 3 个候选标题，选最佳\n4. 用 AI 按发布检查清单逐项检查\n5. 输出分环节完成的文章初稿 + 每步说明',
      passCriteria: '大纲每段有明确的"说什么+为什么说"（不是只有标题）\n正文是分环节完成的（不是一次性生成）\n每步有说明（为什么这样搭大纲、为什么这样改写）\n有 3 个候选标题和选择理由',
      capabilityEvidence: '分环节完成的文章 + 每步说明，包含：大纲（每段有"说什么+为什么说+怎么说"）、分段改写记录（每段的输入、约束、输出）、3 个候选标题 + 选择理由、发布检查清单结果',
    },
    create: {
      stageId: wechatStages.handsOn.id,
      sceneId: wechatScene.id,
      title: '大纲搭建与正文改写',
      slug: 'hands-on-outline-writing',
      objective: '学会用 AI 分环节辅助大纲搭建和正文改写，不一次性要成稿。核心方法：先搭大纲确定结构，再分段改写填充内容，最后整体润色。每一步单独用 AI，不让 AI 自由发挥。为什么要分环节：一次性让 AI 写完整篇文章，输出质量不可控、风格不统一、无法迭代。分环节则每步可控、可调、可复用。',
      prerequisites: '已完成选题校准和资料整理（大纲需要基于校准后的选题和结构化素材）',
      keyConcepts: '大纲结构：不是列几个标题，而是每个段落有明确的"说什么+为什么说+怎么说"。好的大纲能让另一个人按大纲写出风格一致的文章。\n分段改写：不一次性改写全文，而是按段落逐段改写。每段给 AI 明确的输入（这段要说什么、用什么素材、什么语气）和约束（字数、风格、禁忌）。\n发布检查：发布前的最后一道关卡，检查标题是否吸引人、封面是否匹配、摘要是否准确、标签是否覆盖关键词。',
      methodFocus: '不一次性要成稿，分环节让 AI 辅助。操作要点：大纲环节给 AI 你的选题卡和素材，让 AI 搭结构；改写环节给 AI 每段的具体要求和约束；检查环节让 AI 按清单逐项检查。',
      practiceTask: '1. 用 AI 基于选题卡和素材搭建大纲（每段有"说什么+为什么说"）\n2. 按段落逐段用 AI 改写（每段给明确输入和约束）\n3. 用 AI 生成 3 个候选标题，选最佳\n4. 用 AI 按发布检查清单逐项检查\n5. 输出分环节完成的文章初稿 + 每步说明',
      passCriteria: '大纲每段有明确的"说什么+为什么说"（不是只有标题）\n正文是分环节完成的（不是一次性生成）\n每步有说明（为什么这样搭大纲、为什么这样改写）\n有 3 个候选标题和选择理由',
      capabilityEvidence: '分环节完成的文章 + 每步说明，包含：大纲（每段有"说什么+为什么说+怎么说"）、分段改写记录（每段的输入、约束、输出）、3 个候选标题 + 选择理由、发布检查清单结果',
      sortOrder: 1,
    },
  })

  // 节点5: stable-reuse-context
  const node5 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'stable-reuse-context' } },
    update: {
      objective: '学会复用 AI 上下文和账号设定稳定产出内容，风格一致、质量稳定。核心方法：把账号定位、栏目规范、风格示例作为"上下文模板"喂给 AI，让 AI 在此基础上产出，而不是每次从零开始。关键认知：AI 没有记忆，每次对话都是全新的。复用上下文就是人为地给 AI "记忆"，让它知道你的账号是什么、风格是什么、标准是什么。',
      prerequisites: '已独立完成一篇文章（复用上下文需要先有可复用的内容）\n已有明确的账号定位和栏目规范',
      keyConcepts: '上下文模板：包含账号定位、栏目规范、风格示例的固定文本。每次新文章的对话开头先喂上下文模板，AI 就能在此基础上保持一致。\n栏目标准：每个栏目的结构模板、字数范围、语气要求、禁忌事项。如"AI 工具测评"栏目：先痛点→再测评→后推荐，1500-2000字，口语化但不随意，不写"颠覆""革命"等夸张词。\n风格一致性检查：对比三篇文章的标题风格、开头方式、段落长度、结尾结构，找出偏差并修正。',
      methodFocus: '让 AI 记住你的账号设定和栏目标准，复用产出。操作要点：每次新文章对话开头，先粘贴上下文模板；在 prompt 中明确要求"保持与上一篇风格一致"；产出后对比检查风格偏差。',
      practiceTask: '1. 整理一份上下文模板（账号定位+栏目规范+风格示例）\n2. 用上下文模板 + AI 连续完成两篇内容\n3. 对比两篇内容的风格一致性（标题、开头、段落、结尾）\n4. 输出两篇内容 + 复用说明 + 风格对比',
      passCriteria: '两篇内容风格一致（栏目、结构、语气统一）\n能说清楚复用了哪些上下文、怎么复用的\n风格对比有具体发现（不是"差不多"）',
      capabilityEvidence: '两篇内容 + 复用说明，包含：上下文模板文本、两篇文章、复用过程说明（哪些上下文被复用、效果如何）、风格一致性对比（标题、开头、段落、结尾的具体对比）',
    },
    create: {
      stageId: wechatStages.stableProduction.id,
      sceneId: wechatScene.id,
      title: '复用上下文稳定产出',
      slug: 'stable-reuse-context',
      objective: '学会复用 AI 上下文和账号设定稳定产出内容，风格一致、质量稳定。核心方法：把账号定位、栏目规范、风格示例作为"上下文模板"喂给 AI，让 AI 在此基础上产出，而不是每次从零开始。关键认知：AI 没有记忆，每次对话都是全新的。复用上下文就是人为地给 AI "记忆"，让它知道你的账号是什么、风格是什么、标准是什么。',
      prerequisites: '已独立完成一篇文章（复用上下文需要先有可复用的内容）\n已有明确的账号定位和栏目规范',
      keyConcepts: '上下文模板：包含账号定位、栏目规范、风格示例的固定文本。每次新文章的对话开头先喂上下文模板，AI 就能在此基础上保持一致。\n栏目标准：每个栏目的结构模板、字数范围、语气要求、禁忌事项。如"AI 工具测评"栏目：先痛点→再测评→后推荐，1500-2000字，口语化但不随意，不写"颠覆""革命"等夸张词。\n风格一致性检查：对比三篇文章的标题风格、开头方式、段落长度、结尾结构，找出偏差并修正。',
      methodFocus: '让 AI 记住你的账号设定和栏目标准，复用产出。操作要点：每次新文章对话开头，先粘贴上下文模板；在 prompt 中明确要求"保持与上一篇风格一致"；产出后对比检查风格偏差。',
      practiceTask: '1. 整理一份上下文模板（账号定位+栏目规范+风格示例）\n2. 用上下文模板 + AI 连续完成两篇内容\n3. 对比两篇内容的风格一致性（标题、开头、段落、结尾）\n4. 输出两篇内容 + 复用说明 + 风格对比',
      passCriteria: '两篇内容风格一致（栏目、结构、语气统一）\n能说清楚复用了哪些上下文、怎么复用的\n风格对比有具体发现（不是"差不多"）',
      capabilityEvidence: '两篇内容 + 复用说明，包含：上下文模板文本、两篇文章、复用过程说明（哪些上下文被复用、效果如何）、风格一致性对比（标题、开头、段落、结尾的具体对比）',
      sortOrder: 0,
    },
  })

  // 节点6: stable-data-review
  const node6 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'stable-data-review' } },
    update: {
      objective: '学会用 AI 辅助发布数据复盘，从数据中发现规律、生成调整方向。核心方法：复盘不是"看看数据然后凭感觉调整"，而是用 AI 帮你对比数据、发现规律、生成可执行的调整建议。关键认知：数据本身不说话，需要你提出正确的问题。AI 的价值是帮你从数据中找规律，但"调整什么"仍需你判断。',
      prerequisites: '已发布至少两篇内容并有数据（复盘需要数据）\n已有运营链路说明（复盘是链路的闭环环节）',
      keyConcepts: '复盘指标：阅读量（看标题和封面）、点赞率（看内容质量）、分享率（看传播价值）、收藏率（看实用程度）。不同指标反映不同问题，不能只看阅读量。\n数据对比：不是看绝对值，而是看趋势和差异。如"第二篇比第一篇阅读量高60%，原因是标题更具体"。\n调整方向：从数据发现到可执行调整。如"周三发布阅读量最高→固定周三发布""标题含具体数字的点赞率更高→标题加数字"。',
      methodFocus: '用 AI 整理数据、发现规律、生成调整建议。操作要点：把三篇内容的数据和标题/发布时间喂给 AI，让 AI 找规律；但调整方向需人工判断是否可执行。',
      practiceTask: '1. 收集三篇内容的发布数据（阅读量、点赞、分享、收藏）\n2. 把数据和内容信息喂给 AI，让 AI 分析规律\n3. 基于 AI 分析，生成 3 个可执行的调整方向\n4. 输出复盘报告 + 调整计划',
      passCriteria: '复盘包含数据对比（不是只看绝对值）\n有规律发现（不是"数据有好有坏"这种废话）\n有具体调整方向（不是"继续努力"）',
      capabilityEvidence: '复盘报告 + 调整计划，包含：三篇内容的数据对比表、规律发现（哪些因素影响哪些指标）、3 个可执行的调整方向（每个方向有具体操作和预期效果）',
    },
    create: {
      stageId: wechatStages.stableProduction.id,
      sceneId: wechatScene.id,
      title: '发布数据复盘',
      slug: 'stable-data-review',
      objective: '学会用 AI 辅助发布数据复盘，从数据中发现规律、生成调整方向。核心方法：复盘不是"看看数据然后凭感觉调整"，而是用 AI 帮你对比数据、发现规律、生成可执行的调整建议。关键认知：数据本身不说话，需要你提出正确的问题。AI 的价值是帮你从数据中找规律，但"调整什么"仍需你判断。',
      prerequisites: '已发布至少两篇内容并有数据（复盘需要数据）\n已有运营链路说明（复盘是链路的闭环环节）',
      keyConcepts: '复盘指标：阅读量（看标题和封面）、点赞率（看内容质量）、分享率（看传播价值）、收藏率（看实用程度）。不同指标反映不同问题，不能只看阅读量。\n数据对比：不是看绝对值，而是看趋势和差异。如"第二篇比第一篇阅读量高60%，原因是标题更具体"。\n调整方向：从数据发现到可执行调整。如"周三发布阅读量最高→固定周三发布""标题含具体数字的点赞率更高→标题加数字"。',
      methodFocus: '用 AI 整理数据、发现规律、生成调整建议。操作要点：把三篇内容的数据和标题/发布时间喂给 AI，让 AI 找规律；但调整方向需人工判断是否可执行。',
      practiceTask: '1. 收集三篇内容的发布数据（阅读量、点赞、分享、收藏）\n2. 把数据和内容信息喂给 AI，让 AI 分析规律\n3. 基于 AI 分析，生成 3 个可执行的调整方向\n4. 输出复盘报告 + 调整计划',
      passCriteria: '复盘包含数据对比（不是只看绝对值）\n有规律发现（不是"数据有好有坏"这种废话）\n有具体调整方向（不是"继续努力"）',
      capabilityEvidence: '复盘报告 + 调整计划，包含：三篇内容的数据对比表、规律发现（哪些因素影响哪些指标）、3 个可执行的调整方向（每个方向有具体操作和预期效果）',
      sortOrder: 1,
    },
  })

  // 节点7: advance-bottleneck-upgrade
  const node7 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'advance-bottleneck-upgrade' } },
    update: {
      objective: '学会用 AI 分析内容共性问题并生成可执行的升级方案，方案需有前后对比和预期效果。核心方法：瓶颈分析不是"感觉哪里不好"，而是用数据定位具体问题，用 AI 生成可执行方案，用前后对比验证效果。关键认知：瓶颈通常不在你以为的地方。你以为内容不够好，实际是标题不够吸引人；你以为更新太慢，实际是结尾缺少转发引导。',
      prerequisites: '已完成三篇以上内容并有复盘数据（瓶颈分析需要足够的数据样本）\n已掌握基本复盘方法（瓶颈分析是复盘的深化）',
      keyConcepts: '瓶颈分析：从数据中定位具体问题，而不是主观感受。如"三篇平均点击率 2.5%，低于行业 4%"比"感觉标题不够好"更有价值。\n升级方案：针对瓶颈的可执行改进计划。好的升级方案有三个要素：具体改什么、怎么改、预期效果是什么。\nA/B 测试：同时测试两种方案，用数据决定哪个更好。如一半读者看原标题，一半看新标题，对比点击率。',
      methodFocus: '用 AI 分析三篇内容的共性问题，生成可执行升级方案。操作要点：把三篇内容的数据和内容喂给 AI，让 AI 找共性问题和优化方向；但方案需人工判断是否可执行。',
      practiceTask: '1. 把三篇内容的数据和内容喂给 AI，让 AI 分析共性问题\n2. 基于分析结果，用 AI 生成一个可执行升级方案\n3. 实施升级方案（至少改一篇文章验证）\n4. 输出升级方案 + 前后对比数据',
      passCriteria: '瓶颈有数据支撑（不是主观感受）\n升级方案可执行（有具体步骤和预期效果）\n有前后对比数据（验证升级是否有效）',
      capabilityEvidence: '升级方案 + 前后对比，包含：瓶颈分析（具体问题+数据证据）、升级方案（可执行步骤+预期效果）、实施记录（改了什么、怎么改的）、前后对比数据（点击率、点赞率、分享率等）',
    },
    create: {
      stageId: wechatStages.advance.id,
      sceneId: wechatScene.id,
      title: '发现瓶颈与升级方案',
      slug: 'advance-bottleneck-upgrade',
      objective: '学会用 AI 分析内容共性问题并生成可执行的升级方案，方案需有前后对比和预期效果。核心方法：瓶颈分析不是"感觉哪里不好"，而是用数据定位具体问题，用 AI 生成可执行方案，用前后对比验证效果。关键认知：瓶颈通常不在你以为的地方。你以为内容不够好，实际是标题不够吸引人；你以为更新太慢，实际是结尾缺少转发引导。',
      prerequisites: '已完成三篇以上内容并有复盘数据（瓶颈分析需要足够的数据样本）\n已掌握基本复盘方法（瓶颈分析是复盘的深化）',
      keyConcepts: '瓶颈分析：从数据中定位具体问题，而不是主观感受。如"三篇平均点击率 2.5%，低于行业 4%"比"感觉标题不够好"更有价值。\n升级方案：针对瓶颈的可执行改进计划。好的升级方案有三个要素：具体改什么、怎么改、预期效果是什么。\nA/B 测试：同时测试两种方案，用数据决定哪个更好。如一半读者看原标题，一半看新标题，对比点击率。',
      methodFocus: '用 AI 分析三篇内容的共性问题，生成可执行升级方案。操作要点：把三篇内容的数据和内容喂给 AI，让 AI 找共性问题和优化方向；但方案需人工判断是否可执行。',
      practiceTask: '1. 把三篇内容的数据和内容喂给 AI，让 AI 分析共性问题\n2. 基于分析结果，用 AI 生成一个可执行升级方案\n3. 实施升级方案（至少改一篇文章验证）\n4. 输出升级方案 + 前后对比数据',
      passCriteria: '瓶颈有数据支撑（不是主观感受）\n升级方案可执行（有具体步骤和预期效果）\n有前后对比数据（验证升级是否有效）',
      capabilityEvidence: '升级方案 + 前后对比，包含：瓶颈分析（具体问题+数据证据）、升级方案（可执行步骤+预期效果）、实施记录（改了什么、怎么改的）、前后对比数据（点击率、点赞率、分享率等）',
      sortOrder: 0,
    },
  })

  // 节点8: advance-migrate-scene
  const node8 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'advance-migrate-scene' } },
    update: {
      objective: '学会将公众号运营能力迁移到更复杂的内容场景，识别可迁移能力和需新学能力。核心方法：能力迁移不是"换个平台继续做"，而是先识别哪些能力可直接复用、哪些需要新学，然后规划新场景的学习路径。典型迁移方向：公众号→短视频脚本、公众号→小红书图文、公众号→B站视频、公众号→知识付费课程。',
      prerequisites: '已完成升级方案（迁移需要先在原场景达到稳定水平）\n已有明确的新场景目标（迁移不是漫无目的的探索）',
      keyConcepts: '可迁移能力：在原场景中已掌握、可直接复用到新场景的能力。如选题校准、大纲搭建、复盘分析等"方法论"能力通常可迁移。\n需新学能力：新场景特有的、原场景中没有的能力。如短视频需要画面描述和时间控制、小红书需要封面设计和标签策略。\n学习路径：从"理解"到"上手"到"稳定"到"进阶"的四阶段路径，和公众号场景结构一致，但内容针对新场景。',
      methodFocus: '识别可迁移的核心能力，规划新场景学习路径。操作要点：用 AI 帮你列出原场景的能力清单，逐项判断是否可迁移；然后基于新场景的特点，规划四阶段学习路径。',
      practiceTask: '1. 列出你在公众号场景中掌握的能力清单\n2. 用 AI 逐项判断哪些可迁移、哪些需新学\n3. 选择一个新场景（如短视频脚本），规划四阶段学习路径\n4. 输出迁移规划 + 新场景学习路径',
      passCriteria: '能说清楚哪些能力可迁移、哪些需新学（不是"都能迁移"或"都要重学"）\n新场景学习路径有四阶段结构（理解→上手→稳定→进阶）\n每个阶段有具体的学习内容和验证标准',
      capabilityEvidence: '迁移规划 + 新场景学习路径，包含：能力清单（每项标注可迁移/需新学）、可迁移能力的具体说明（怎么迁移、需做什么调整）、需新学能力的具体说明（学什么、怎么学）、新场景四阶段学习路径（每阶段有学习内容和验证标准）',
    },
    create: {
      stageId: wechatStages.advance.id,
      sceneId: wechatScene.id,
      title: '迁移到更复杂场景',
      slug: 'advance-migrate-scene',
      objective: '学会将公众号运营能力迁移到更复杂的内容场景，识别可迁移能力和需新学能力。核心方法：能力迁移不是"换个平台继续做"，而是先识别哪些能力可直接复用、哪些需要新学，然后规划新场景的学习路径。典型迁移方向：公众号→短视频脚本、公众号→小红书图文、公众号→B站视频、公众号→知识付费课程。',
      prerequisites: '已完成升级方案（迁移需要先在原场景达到稳定水平）\n已有明确的新场景目标（迁移不是漫无目的的探索）',
      keyConcepts: '可迁移能力：在原场景中已掌握、可直接复用到新场景的能力。如选题校准、大纲搭建、复盘分析等"方法论"能力通常可迁移。\n需新学能力：新场景特有的、原场景中没有的能力。如短视频需要画面描述和时间控制、小红书需要封面设计和标签策略。\n学习路径：从"理解"到"上手"到"稳定"到"进阶"的四阶段路径，和公众号场景结构一致，但内容针对新场景。',
      methodFocus: '识别可迁移的核心能力，规划新场景学习路径。操作要点：用 AI 帮你列出原场景的能力清单，逐项判断是否可迁移；然后基于新场景的特点，规划四阶段学习路径。',
      practiceTask: '1. 列出你在公众号场景中掌握的能力清单\n2. 用 AI 逐项判断哪些可迁移、哪些需新学\n3. 选择一个新场景（如短视频脚本），规划四阶段学习路径\n4. 输出迁移规划 + 新场景学习路径',
      passCriteria: '能说清楚哪些能力可迁移、哪些需新学（不是"都能迁移"或"都要重学"）\n新场景学习路径有四阶段结构（理解→上手→稳定→进阶）\n每个阶段有具体的学习内容和验证标准',
      capabilityEvidence: '迁移规划 + 新场景学习路径，包含：能力清单（每项标注可迁移/需新学）、可迁移能力的具体说明（怎么迁移、需做什么调整）、需新学能力的具体说明（学什么、怎么学）、新场景四阶段学习路径（每阶段有学习内容和验证标准）',
      sortOrder: 1,
    },
  })

  // 链接节点 nextNodeId
  await prisma.learningNode.update({ where: { id: node1.id }, data: { nextNodeId: node2.id } })
  await prisma.learningNode.update({ where: { id: node2.id }, data: { nextNodeId: node3.id } })
  await prisma.learningNode.update({ where: { id: node3.id }, data: { nextNodeId: node4.id } })
  await prisma.learningNode.update({ where: { id: node4.id }, data: { nextNodeId: node5.id } })
  await prisma.learningNode.update({ where: { id: node5.id }, data: { nextNodeId: node6.id } })
  await prisma.learningNode.update({ where: { id: node6.id }, data: { nextNodeId: node7.id } })
  await prisma.learningNode.update({ where: { id: node7.id }, data: { nextNodeId: node8.id } })

  console.log('  创建了 8 个学习节点并完成链接')

  // ==================== 公众号场景 AI 对话示范 ====================
  console.log('💬 创建公众号场景 AI 对话示范...')

  // 对话示范1: define-account-positioning
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node1.id,
      toolChoice: 'DeepSeek',
      prompt: '我想做一个关于 AI 工具的公众号，请你扮演一位资深内容顾问，用追问法帮我厘清定位。\n规则：\n1. 不要直接给我建议或方案，通过提问逼我想清楚\n2. 每次只问一个问题，等我回答后再问下一个\n3. 我的回答如果模糊（如"大概""可能""很多人"），你要继续追问具体化\n4. 追问方向围绕：目标读者、核心价值、差异化、栏目规划、可持续性\n5. 追问至少 5 轮，直到我给出一份可执行的定位说明\n我的初步想法：想做一个分享 AI 工具的公众号。',
      aiFollowUp: '好，我们先从目标读者开始。\n"分享 AI 工具"这个方向太宽——AI 工具几万个，读者也差异巨大。你想服务的读者，是哪种人？\n给你几个维度帮你想清楚：\n- AI 经验：完全没用过 AI 的新手 / 用过 ChatGPT 但没深度用 / 熟练用户想找进阶玩法\n- 职业背景：职场人 / 开发者 / 学生 / 创业者 / 自媒体人\n- 核心诉求：想入门 / 想提效 / 想做副业 / 想做产品\n你想服务的是哪一类？只能选一个主群体。',
      userSupplement: '我想服务"用过 ChatGPT 但没深度用的职场人"，他们的诉求是"想用 AI 提效但不知道具体怎么用、用哪个工具"。',
      aiOutput: '好，目标读者更清晰了：用过 ChatGPT 但没深度用的职场人，诉求是 AI 提效。\n接下来追问核心价值。这类读者已经知道 ChatGPT，为什么要点开你的文章？市面上 AI 工具内容很多，你能提供的价值是哪种：\nA. 工具推荐型："10个好用的AI工具"——门槛低，但同质化严重，读者看完就忘\nB. 实践案例型："我用AI在30分钟内做完了一份周报"——有差异化，但需要真实经验\nC. 对比测评型："Notion AI vs 飞书AI，职场场景谁更好"——有深度，但工作量大\nD. 方法论型："职场人用AI的3个层次"——天花板高，但难持续产出\n你倾向哪个方向？为什么你觉得你能做好这个方向？',
      checkList: '1. 目标读者是否具体到职业、AI 经验、核心诉求（而不是"对AI感兴趣的人"）\n2. 核心价值是否说清了"凭什么是你"——你的经验、视角、资源的差异化\n3. 栏目是否每个都能立刻说出 5 个具体选题（可持续性验证）\n4. 是否明确了"不写什么"及原因（能力边界）\n5. 定位说明是否能让另一个人直接理解并照做（可执行性）\n6. 是否评估了"为什么你能持续产出 3 个月以上"（可持续性自我评估）',
      sortOrder: 0,
    },
  })

  // 对话示范2: understand-operation-chain
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node2.id,
      toolChoice: 'DeepSeek',
      prompt: '我已经明确了公众号定位（AI 工具测评，服务用过 ChatGPT 但没深度用的职场人），请你帮我梳理从定位到复盘的完整运营链路。\n要求：\n1. 列出每个环节的输入、处理、输出\n2. 对每个环节说明：如果跳过会怎样\n3. 基于我的定位，为每个环节给出具体操作建议',
      aiFollowUp: '你的链路已经比较完整了。现在追问一个关键问题：\n你列的链路是线性的（定位→选题→...→复盘），但好的运营链路应该是循环的——复盘的结果要反馈到选题。\n你打算怎么设计这个闭环？比如：复盘发现"对比测评类文章点赞率最高"，这个信息怎么影响你下一期的选题？',
      userSupplement: '复盘后我会把高表现文章的特征提取出来，作为下次选题的筛选条件。比如对比测评点赞率高，下次选题优先选对比类。',
      aiOutput: '好，闭环思路有了。但还有一个常见问题需要追问：\n很多人的复盘只看阅读量，这会漏掉重要信息。比如一篇文章阅读量高但分享率低，说明标题吸引人但内容不值得传播——如果只看阅读量，你会继续写类似内容，但传播不会增长。\n你打算看哪些指标？每个指标反映什么问题？建议至少看四个：阅读量（标题封面）、点赞率（内容质量）、分享率（传播价值）、收藏率（实用程度）。',
      checkList: '1. 链路是否完整（定位→选题→...→复盘→回到选题）\n2. 每个环节是否有明确的输入和输出\n3. 是否说明了跳过每个环节的后果\n4. 是否有复盘闭环设计（数据如何反馈到选题）\n5. 复盘指标是否至少包含阅读量、点赞率、分享率、收藏率\n6. 每个环节的具体操作是否基于你的定位（不是泛泛的建议）',
      sortOrder: 0,
    },
  })

  // 对话示范3: hands-on-topic-selection
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node3.id,
      toolChoice: 'DeepSeek',
      prompt: '我的公众号定位：AI 工具测评，服务用过 ChatGPT 但没深度用的职场人。栏目有"工具测评""实践案例""对比横评"。\n现在我想写一篇"AI 工具推荐"的文章，帮我校准这个选题。',
      aiFollowUp: '"AI 工具推荐"这个选题太泛了——推荐什么工具？给谁推荐？解决什么问题？\n你有三个栏目，这个选题适合哪个栏目？不同栏目的选题校准标准不同：\n- 工具测评：需要聚焦一个工具，说清适合谁、不适合谁\n- 实践案例：需要一个真实场景，说清怎么用、效果如何\n- 对比横评：需要两个以上同类工具，说清各自优劣\n你想写哪个栏目？选题想聚焦到什么程度？',
      userSupplement: '我想写"工具测评"栏目，聚焦 Notion AI，给职场人推荐，解决"不知道用哪个 AI 工具整理会议纪要"的问题。',
      aiOutput: '选题校准建议：\n原选题"AI 工具推荐"→ 校准后"Notion AI 测评：30分钟把一周会议纪要整理成行动清单"\n校准理由：\n1. 方向：从泛推荐聚焦到单工具测评，符合栏目定位\n2. 价值：从"推荐工具"升级到"解决具体问题"——读者不是要工具，是要解决方案\n3. 可行性：你有 Notion AI 的使用经验，能写出真实测评\n接下来帮你整理素材框架——你手头有哪些关于 Notion AI 的素材？',
      checkList: '1. 选题校准后是否有明确的目标读者和核心价值\n2. 选题是否符合你的栏目定位\n3. 选题是否具体到"一个工具+一个场景+一个结果"\n4. 素材是否按主题分类、标注用途（不是散乱的链接）\n5. 选题卡是否完整（方向、读者、价值、素材清单）\n6. 你是否有足够的素材和经验支撑这个选题',
      sortOrder: 0,
    },
  })

  // 对话示范4: hands-on-outline-writing
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node4.id,
      toolChoice: 'DeepSeek',
      prompt: '我的选题卡：Notion AI 测评，目标读者是职场人，核心价值是"30分钟把一周会议纪要整理成行动清单"。\n素材：Notion AI 的会议纪要功能实测截图、3个真实会议纪要的处理过程、与手动整理的效率对比数据。\n帮我搭建文章大纲，要求每段有"说什么+为什么说+怎么说"。',
      aiFollowUp: '大纲结构看起来完整。追问一个关键问题：\n你的大纲是"功能介绍"逻辑（Notion AI 能做什么→怎么做→效果如何），但你的核心价值是"解决会议纪要问题"。\n这两种逻辑的差异：功能介绍是工具视角，读者看完知道 Notion AI 能做什么，但不知道自己该不该用；问题解决是读者视角，读者看完知道自己的会议纪要问题能不能用 Notion AI 解决。\n你想用哪种逻辑？为什么？',
      userSupplement: '用问题解决逻辑。先说会议纪要的痛点（整理耗时、遗漏行动项），再说 Notion AI 怎么解决，最后说效果和局限。',
      aiOutput: '好，问题解决逻辑更符合你的定位。调整后大纲：\n1. 痛点共鸣：每周花2小时整理会议纪要，还是遗漏行动项（说什么：痛点→为什么说：让读者对号入座→怎么说：用真实场景开头）\n2. Notion AI 方案：从录音到行动清单的3步流程（说什么：解决方案→为什么说：展示可行性→怎么说：分步骤+截图）\n3. 实测效果：3个真实会议的处理过程和效率对比（说什么：效果证据→为什么说：建立信任→怎么说：数据+前后对比）\n4. 局限说明：Notion AI 做不到什么，什么场景不适合（说什么：边界→为什么说：建立可信度→怎么说：坦诚说局限比吹嘘更有效）\n5. 行动建议：如果你也有会议纪要困扰，试试这3步（说什么：下一步→为什么说：促进行动→怎么说：简洁可执行）',
      checkList: '1. 大纲每段是否有"说什么+为什么说+怎么说"\n2. 大纲逻辑是问题解决式还是功能介绍式（推荐前者）\n3. 是否有局限说明（不吹嘘的工具测评更可信）\n4. 是否有行动建议（给读者下一步）\n5. 正文是否分环节完成（不是一次性生成）\n6. 是否有 3 个候选标题和选择理由',
      sortOrder: 0,
    },
  })

  // 对话示范5: stable-reuse-context
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node5.id,
      toolChoice: 'DeepSeek',
      prompt: '记住我的账号设定：AI 工具测评公众号，服务用过 ChatGPT 但没深度用的职场人。\n栏目规范：\n- 工具测评：先痛点→再测评→后推荐，1500-2000字，口语化但不随意，不写"颠覆""革命"等夸张词\n- 实践案例：先场景→再操作→后效果，1200-1500字\n- 对比横评：先结论→再展开→后建议，2000-2500字\n上一篇是"Notion AI 测评"，风格参考上一篇。\n帮我按"工具测评"栏目的标准写一篇 Perplexity 测评，聚焦"用 Perplexity 做竞品调研"这个场景。',
      aiFollowUp: '收到账号设定和栏目规范。追问一个关键问题：\n上一篇 Notion AI 测评的开头是"每周花2小时整理会议纪要"的痛点共鸣，这篇 Perplexity 测评的开头你打算怎么写？\n风格一致性要求：开头方式保持一致（痛点共鸣），但痛点要换成 Perplexity 的场景。',
      userSupplement: '开头用"每次做竞品调研都要翻几十个网页，还是找不到关键信息"的痛点共鸣。',
      aiOutput: '好，风格保持一致。生成文章框架：\n标题：Perplexity 测评：1小时搞定原来要1天的竞品调研\n结构：\n1. 痛点共鸣：每次做竞品调研都要翻几十个网页（风格与上一篇一致）\n2. Perplexity 方案：从问题到带来源的答案（保持"先痛点→再测评→后推荐"结构）\n3. 实测效果：3个竞品调研问题的处理过程\n4. 局限说明：Perplexity 做不到什么（保持坦诚风格）\n5. 行动建议：试试用 Perplexity 搜一个你正在研究的竞品\n语气：口语化但不随意，不写"颠覆""革命"等夸张词（与上一篇一致）',
      checkList: '1. 是否把账号设定作为上下文喂给 AI\n2. 是否在 prompt 中明确要求保持风格一致\n3. 两篇文章的开头方式是否一致（痛点共鸣）\n4. 两篇文章的结构是否一致（先痛点→再测评→后推荐）\n5. 语气是否一致（口语化但不随意）\n6. 是否有局限说明（风格一致的可信度）',
      sortOrder: 0,
    },
  })

  // 对话示范6: stable-data-review
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node6.id,
      toolChoice: 'DeepSeek',
      prompt: '我最近三篇文章的数据如下：\n- 第一篇"Notion AI 测评"：阅读1200，点赞68，分享22，收藏95，周二发布\n- 第二篇"Perplexity 测评"：阅读980，点赞52，分享18，收藏78，周三发布\n- 第三篇"Grammarly 测评"：阅读650，点赞25，分享8，收藏42，周五发布\n帮我复盘，找出规律和调整方向。要求：不只看阅读量，要综合看四个指标。',
      aiFollowUp: '数据分析出来了，但追问一个关键问题：\n三篇文章的收藏率都很高（第一篇7.9%，第二篇8.0%，第三篇6.5%），远高于行业平均的2-3%。这说明你的内容实用性强，读者想留着以后用。\n但分享率很低（1.8%、1.8%、1.2%），低于行业平均的3-5%。这说明读者觉得有用，但不觉得值得分享给别人。\n你觉得分享率低的原因可能是什么？是内容问题还是结尾问题？',
      userSupplement: '我觉得是结尾问题——结尾只是总结，没有给读者分享的理由。',
      aiOutput: '分析结论：\n1. 发布时间：周二>周三>周五，建议固定周二或周三发布\n2. 收藏率高（7-8%）：内容实用性强，这是你的优势，继续坚持\n3. 分享率低（1.2-1.8%）：瓶颈在结尾，缺少"转发理由"\n调整方向：\nA. 结尾加分享引导：如"如果你同事也在为XX困扰，转发给TA看看"——预期分享率提升至3%\nB. 固定周二发布：阅读量数据支撑——预期阅读量稳定在1000+\nC. 标题加具体数字：第一篇标题有"30分钟"，阅读量最高——后续标题统一加数字',
      checkList: '1. 复盘是否综合看了四个指标（不只是阅读量）\n2. 是否发现了收藏率高这个优势\n3. 是否定位了分享率低这个瓶颈\n4. 调整方向是否可执行（有具体操作和预期效果）\n5. 是否有数据对比（不是只看绝对值）\n6. 是否有规律发现（不是"数据有好有坏"）',
      sortOrder: 0,
    },
  })

  // 对话示范7: advance-bottleneck-upgrade
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node7.id,
      toolChoice: 'DeepSeek',
      prompt: '分析我最近三篇工具测评文章的共性问题：\n- 标题都有"测评"二字，但点击率在下降（1200→980→650）\n- 收藏率一直很高（7-8%），说明内容实用\n- 分享率一直很低（1.8%→1.8%→1.2%），且在下降\n- 结尾都是总结式，没有分享引导\n帮我分析瓶颈并生成可执行的升级方案。',
      aiFollowUp: '瓶颈定位很清晰了：点击率下降+分享率低。追问一个关键问题：\n你打算先解决哪个瓶颈？两个瓶颈的升级方向不同：\n- 点击率下降：改标题策略（从"XX测评"改为结果导向标题）\n- 分享率低：改结尾策略（加分享引导）\n建议先改结尾——因为结尾改动小、风险低、效果可量化。标题改动大，可能影响现有读者的认知。\n你同意先改结尾吗？',
      userSupplement: '同意先改结尾。标题后面再优化。',
      aiOutput: '升级方案：\n瓶颈：分享率1.2-1.8%，低于行业3-5%，原因是结尾缺少转发理由\n升级动作：结尾从"总结式"改为"分享引导式"\n具体改法：\n- 原结尾："总之，XX是一个值得尝试的工具"（总结式，无分享动力）\n- 新结尾："如果你同事也在为XX困扰，把这篇文章转发给TA——3分钟就能判断适不适合"（分享引导式，给转发理由+降低决策成本）\n预期效果：分享率从1.5%提升至3%，约翻倍\n验证方式：下一篇文章用新结尾，对比分享率',
      checkList: '1. 瓶颈是否有数据支撑（不是主观感受）\n2. 是否先解决影响大、改动小、风险低的瓶颈\n3. 升级方案是否有具体改法（不是"优化结尾"这种模糊描述）\n4. 是否有前后对比（原结尾 vs 新结尾）\n5. 是否有预期效果（分享率从X%提升至Y%）\n6. 是否有验证方式（怎么确认升级有效）',
      sortOrder: 0,
    },
  })

  // 对话示范8: advance-migrate-scene
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node8.id,
      toolChoice: 'DeepSeek',
      prompt: '我已经掌握了公众号运营的 AI 能力，想迁移到"用 AI 做短视频脚本"这个新场景。\n请帮我：\n1. 列出我在公众号场景中掌握的能力清单\n2. 逐项判断哪些可迁移、哪些需新学\n3. 规划新场景的四阶段学习路径',
      aiFollowUp: '能力清单整理出来了。追问一个关键问题：\n你说"选题校准"和"大纲搭建"可以迁移，但短视频脚本和公众号文章有一个本质区别：\n公众号文章是"读者自己读"，节奏由读者控制；短视频脚本是"观众被动看"，节奏由你控制。\n这意味着你的"大纲搭建"能力需要调整——不是"每段说什么"，而是"每5秒说什么"。你觉得这个调整大吗？',
      userSupplement: '调整不小。短视频需要控制节奏和时间，公众号不需要。但选题校准和复盘分析应该可以直接复用。',
      aiOutput: '迁移规划：\n可迁移能力（约60%）：\n- 选题校准：直接复用，短视频也需要基于定位校准选题\n- 复盘分析：直接复用，短视频也需要数据复盘\n- 分环节产出：需调整，从"分环节写文章"改为"分环节写脚本（开头5秒+主体+结尾）"\n需新学能力（约40%）：\n- 画面描述：公众号只有文字，短视频需要"画面+旁白"双线叙事\n- 时间控制：5秒抓注意力、15秒说清价值、每30秒一个信息点\n- 平台算法：短视频的推荐逻辑和公众号完全不同\n学习路径：\n1. 理解：看10个优质短视频脚本，理解"画面+旁白"双线结构\n2. 上手：把一篇公众号文章改写为60秒短视频脚本\n3. 稳定：连续产出3个脚本，风格一致\n4. 进阶：基于数据复盘优化脚本结构',
      checkList: '1. 是否列出了完整的能力清单\n2. 是否逐项标注了可迁移/需新学\n3. 可迁移能力是否说明了怎么迁移、需做什么调整\n4. 需新学能力是否说明了学什么、怎么学\n5. 新场景学习路径是否有四阶段结构\n6. 每个阶段是否有具体的学习内容和验证标准',
      sortOrder: 0,
    },
  })

  console.log('  创建了 8 个 AI 对话示范')

  // ==================== 公众号场景工具建议 ====================
  console.log('🔧 创建公众号场景工具建议...')

  const wechatToolGuidances = [
    {
      stageId: wechatStages.understand.id,
      currentTool: 'AI 聊天工具（如 ChatGPT/DeepSeek）',
      currentToolUsage: '直接对话，让 AI 追问你的定位',
      betterTool: null,
      betterToolUsage: null,
      migrationTrigger: null,
      sortOrder: 0,
    },
    {
      stageId: wechatStages.handsOn.id,
      currentTool: 'AI 聊天工具',
      currentToolUsage: '分环节辅助，不一次性要成稿',
      betterTool: '长文编辑工具（如 Notion AI）',
      betterToolUsage: '当素材和版本开始散乱时使用',
      migrationTrigger: '素材和版本开始散乱',
      sortOrder: 0,
    },
    {
      stageId: wechatStages.stableProduction.id,
      currentTool: '可保存上下文的 AI 工具',
      currentToolUsage: '复用账号设定和栏目标准',
      betterTool: '内容日历或看板工具',
      betterToolUsage: '内容增多后管理发布节奏',
      migrationTrigger: '内容数量增多，需要管理发布节奏',
      sortOrder: 0,
    },
    {
      stageId: wechatStages.advance.id,
      currentTool: '现有工具组合',
      currentToolUsage: '分析数据，生成升级方案',
      betterTool: '内容运营工作台',
      betterToolUsage: '当内容数量、协作或数据复盘超出现有工具承载时',
      migrationTrigger: '内容数量、协作或数据复盘超出现有工具承载',
      sortOrder: 0,
    },
  ]

  for (const tg of wechatToolGuidances) {
    await prisma.toolGuidance.create({
      data: {
        sceneId: wechatScene.id,
        ...tg,
      },
    })
  }

  console.log(`  创建了 ${wechatToolGuidances.length} 个工具建议`)

  // ==================== 已发布场景2：职场效率 ====================
  console.log('🎬 创建已发布场景：职场效率...')

  const workplaceScene = await prisma.scene.upsert({
    where: { slug: 'ai-workplace-efficiency' },
    update: {},
    create: {
      title: '用 AI 提升职场效率',
      slug: 'ai-workplace-efficiency',
      summary: '学会在日常工作中用 AI 处理邮件、文档、会议纪要和汇报',
      suitableFor: '希望提升日常工作效率的职场人士',
      notSuitableFor: '不需要处理文字工作的岗位',
      publishStatus: PublishStatus.PUBLISHED,
      isRecommended: true,
      publishedAt: new Date(),
    },
  })

  console.log(`  创建已发布场景: ${workplaceScene.title}`)

  await prisma.aiToolScene.createMany({
    data: ['microsoft-copilot', 'wps-ai', 'otter-ai', 'zapier-ai', 'make']
      .map((slug) => aiTools.get(slug))
      .filter((tool): tool is { id: string } => Boolean(tool))
      .map((tool) => ({ toolId: tool.id, sceneId: workplaceScene.id })),
    skipDuplicates: true,
  })

  // 关联标签
  await prisma.sceneTaxonomy.createMany({
    data: [
      { sceneId: workplaceScene.id, taxonomyId: taxonomies.officeWorker.id },
      { sceneId: workplaceScene.id, taxonomyId: taxonomies.promptEngineering.id },
      { sceneId: workplaceScene.id, taxonomyId: taxonomies.chatgpt.id },
      { sceneId: workplaceScene.id, taxonomyId: taxonomies.deepseek.id },
    ],
    skipDuplicates: true,
  })

  console.log('  关联了 4 个分类标签')

  // 职场效率场景四阶段（完整内容）
  const workplaceStages = {
    understand: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: workplaceScene.id, stageType: StageType.UNDERSTAND } },
      update: {},
      create: {
        sceneId: workplaceScene.id,
        stageType: StageType.UNDERSTAND,
        capabilityStd: '能识别自己工作中最大的效率瓶颈',
        learningFocus: '时间审计与瓶颈识别',
        practiceTask: '用AI追问法完成一次时间审计',
        capabilityEvidence: '时间审计记录+瓶颈分析',
        aiIntervention: '用AI追问法梳理一周工作',
        commonFailure: '列了很多问题但没找到最大的瓶颈',
        remedialAction: '聚焦一个最耗时的重复性任务',
        sortOrder: 0,
      },
    }),
    handsOn: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: workplaceScene.id, stageType: StageType.HANDS_ON } },
      update: {},
      create: {
        sceneId: workplaceScene.id,
        stageType: StageType.HANDS_ON,
        capabilityStd: '能用AI辅助处理一个日常效率任务',
        learningFocus: 'AI辅助邮件处理',
        practiceTask: '用AI处理5封工作邮件',
        capabilityEvidence: '5封邮件的AI辅助回复记录',
        aiIntervention: '用AI分类和草拟回复',
        commonFailure: 'AI回复太模板化不够具体',
        remedialAction: '补充上下文让AI回复更贴合实际',
        sortOrder: 1,
      },
    }),
    stableProduction: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: workplaceScene.id, stageType: StageType.STABLE_PRODUCTION } },
      update: {},
      create: {
        sceneId: workplaceScene.id,
        stageType: StageType.STABLE_PRODUCTION,
        capabilityStd: '能稳定用AI处理日常邮件和文档',
        learningFocus: 'AI工作流稳定化',
        practiceTask: '连续一周用AI处理邮件',
        capabilityEvidence: '一周邮件处理记录',
        aiIntervention: '用AI建立邮件处理工作流',
        commonFailure: '只能处理简单邮件，复杂邮件还是手动',
        remedialAction: '从简单邮件开始，逐步增加复杂度',
        sortOrder: 2,
      },
    }),
    advance: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: workplaceScene.id, stageType: StageType.ADVANCE } },
      update: {},
      create: {
        sceneId: workplaceScene.id,
        stageType: StageType.ADVANCE,
        capabilityStd: '能将AI效率能力迁移到新的工作场景',
        learningFocus: '能力迁移与工具升级',
        practiceTask: '选择一个新场景规划迁移',
        capabilityEvidence: '迁移规划',
        aiIntervention: '用AI分析可迁移能力和新场景需求',
        commonFailure: '只列了能力清单没有具体迁移步骤',
        remedialAction: '补充每个能力的迁移操作步骤',
        sortOrder: 3,
      },
    }),
  }

  console.log(`  创建了 ${Object.keys(workplaceStages).length} 个阶段`)

  // ==================== 职场效率场景学习节点 ====================
  console.log('📚 创建职场效率场景学习节点...')

  // 节点1: identify-efficiency-bottleneck
  const wpNode1 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: workplaceScene.id, slug: 'identify-efficiency-bottleneck' } },
    update: {},
    create: {
      stageId: workplaceStages.understand.id,
      sceneId: workplaceScene.id,
      title: '识别你的职场效率瓶颈',
      slug: 'identify-efficiency-bottleneck',
      objective: '学会用 AI 帮你识别日常工作中最大的效率瓶颈',
      prerequisites: '有日常办公经验',
      keyConcepts: '效率瓶颈、时间审计、AI追问法',
      methodFocus: '用 AI 追问法梳理一周工作，找出最耗时的重复性任务',
      practiceTask: '用 AI 追问法完成一次时间审计，找出效率瓶颈',
      passCriteria: '能说清楚最大的效率瓶颈是什么、为什么是瓶颈',
      capabilityEvidence: '时间审计记录 + 瓶颈分析',
      sortOrder: 0,
    },
  })

  // 节点2: hands-on-email-processing
  const wpNode2 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: workplaceScene.id, slug: 'hands-on-email-processing' } },
    update: {},
    create: {
      stageId: workplaceStages.handsOn.id,
      sceneId: workplaceScene.id,
      title: '用 AI 处理日常邮件',
      slug: 'hands-on-email-processing',
      objective: '学会用 AI 辅助邮件分类和草拟回复',
      prerequisites: '已识别邮件处理为效率瓶颈',
      keyConcepts: '邮件分类、AI草拟、回复模板',
      methodFocus: '用 AI 对邮件分类后草拟回复，人工审核后发送',
      practiceTask: '用 AI 处理5封工作邮件',
      passCriteria: '5封邮件都有AI辅助的回复，且人工审核通过',
      capabilityEvidence: '5封邮件的AI辅助回复记录',
      sortOrder: 0,
    },
  })

  // 链接节点 nextNodeId
  await prisma.learningNode.update({ where: { id: wpNode1.id }, data: { nextNodeId: wpNode2.id } })

  console.log('  创建了 2 个学习节点并完成链接')

  // ==================== 职场效率场景 AI 对话示范 ====================
  console.log('💬 创建职场效率场景 AI 对话示范...')

  // 对话示范1: identify-efficiency-bottleneck
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: wpNode1.id,
      toolChoice: 'ChatGPT',
      prompt: '帮我分析我一周的工作，找出最耗时的重复性任务',
      aiFollowUp: '你一周大概处理多少封邮件？多少个会议？文档写作大概占多少时间？',
      userSupplement: '每天大约30封邮件，3个会议，文档写作大概2小时',
      aiOutput: '时间审计结果：1)邮件处理：每天1.5小时（30封×3分钟）→建议用AI辅助分类和草拟回复；2)会议纪要：每次会后30分钟整理→建议用AI录音转文字+要点提取；3)文档写作：2小时/天→建议用AI辅助大纲和初稿。最大瓶颈：邮件处理，因为高频且重复...',
      checkList: '1.是否识别了具体瓶颈 2.是否有数据支撑 3.是否有初步改进方向',
      sortOrder: 0,
    },
  })

  // 对话示范2: hands-on-email-processing
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: wpNode2.id,
      toolChoice: 'ChatGPT',
      prompt: '帮我草拟一封回复：客户询问项目进度，目前项目延期一周，需要说明原因和新的交付时间',
      aiFollowUp: '延期的原因是什么？新的交付时间确认了吗？',
      userSupplement: '原因是需求变更，新交付时间是下周五',
      aiOutput: '邮件草稿：王总您好，感谢您的关注。关于项目进度，因近期需求有调整，交付时间更新为下周五（X月X日）。调整后的方案已同步至项目群，如有疑问随时沟通。此致敬礼。注意：请确认日期和具体需求变更描述...',
      checkList: '1.语气是否专业 2.是否说明了原因 3.是否给出了明确时间',
      sortOrder: 0,
    },
  })

  console.log('  创建了 2 个 AI 对话示范')

  // ==================== 已发布场景3：编程辅助 ====================
  console.log('🎬 创建已发布场景：编程辅助...')

  const programmingScene = await prisma.scene.upsert({
    where: { slug: 'ai-assisted-programming' },
    update: {},
    create: {
      title: '用 AI 辅助编程',
      slug: 'ai-assisted-programming',
      summary: '学会用 AI 辅助代码编写、调试和优化',
      suitableFor: '有基础编程经验想提升效率的开发者',
      notSuitableFor: '完全没有编程基础的人',
      publishStatus: PublishStatus.PUBLISHED,
      isRecommended: false,
      publishedAt: new Date(),
    },
  })

  console.log(`  创建已发布场景: ${programmingScene.title}`)

  // 关联标签
  await prisma.sceneTaxonomy.createMany({
    data: [
      { sceneId: programmingScene.id, taxonomyId: taxonomies.programming.id },
      { sceneId: programmingScene.id, taxonomyId: taxonomies.promptEngineering.id },
      { sceneId: programmingScene.id, taxonomyId: taxonomies.claude.id },
      { sceneId: programmingScene.id, taxonomyId: taxonomies.deepseek.id },
    ],
    skipDuplicates: true,
  })

  // 编程辅助场景的4个空阶段
  const progStageTypes: StageType[] = [StageType.UNDERSTAND, StageType.HANDS_ON, StageType.STABLE_PRODUCTION, StageType.ADVANCE]
  for (let i = 0; i < progStageTypes.length; i++) {
    await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: programmingScene.id, stageType: progStageTypes[i] } },
      update: {},
      create: {
        sceneId: programmingScene.id,
        stageType: progStageTypes[i],
        capabilityStd: '待补充',
        learningFocus: '待补充',
        practiceTask: '待补充',
        capabilityEvidence: '待补充',
        aiIntervention: '待补充',
        sortOrder: i,
      },
    })
  }

  // ==================== 完成 ====================
  console.log('')
  console.log('🎉 Seed 完成！')
  console.log(`  用户: ${users.length}`)
  console.log(`  分类标签: ${Object.keys(taxonomies).length}`)
  console.log(`  AI 工具分类: ${toolCategorySeeds.length}`)
  console.log(`  AI 工具: ${aiToolSeeds.length + 1}`)
  console.log(`  场景: 4 (1 草稿 + 3 已发布)`)
  console.log(`  阶段: 4 (公众号) + 4 (职场效率) + 4 (编程辅助) + 4 (草稿) = 16`)
  console.log(`  学习节点: 8 (公众号) + 2 (职场效率) = 10`)
  console.log(`  AI 对话示范: 8 (公众号) + 2 (职场效率) = 10`)
  console.log(`  工具建议: ${wechatToolGuidances.length} (公众号)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed 失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
