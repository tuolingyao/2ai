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

  console.log(`  创建了 ${toolCategorySeeds.length} 个工具分类`)
  console.log(`  创建了 ${aiToolSeeds.length} 个 AI 工具`)

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
    update: {},
    create: {
      title: '用 AI 运营一个公众号',
      slug: 'ai-wechat-official-account',
      summary: '学会在账号定位、选题、写作、发布、复盘和迭代中具体使用 AI',
      suitableFor: '想用 AI 提升公众号运营效率的自媒体运营者',
      notSuitableFor: '完全不需要内容运营的人',
      publishStatus: PublishStatus.PUBLISHED,
      isRecommended: true,
      publishedAt: new Date(),
    },
  })

  console.log(`  创建已发布场景: ${wechatScene.title}`)

  await prisma.aiToolScene.createMany({
    data: ['notion-ai', 'xiezuocat', 'perplexity', 'canva-ai', 'dify']
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
      update: {},
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.UNDERSTAND,
        capabilityStd: '能说清楚公众号服务谁、解决什么问题、栏目如何持续',
        learningFocus: '账号定位与运营链路理解',
        practiceTask: '用 AI 追问账号定位，输出运营链路说明',
        capabilityEvidence: '一份可检查的运营链路说明',
        aiIntervention: '用 AI 追问账号定位、读者问题、栏目边界和复盘指标',
        commonFailure: '只会复述定位概念，不会结合自己场景',
        remedialAction: '重写成自己的任务描述，举出具体例子',
        sortOrder: 0,
      },
    }),
    handsOn: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: wechatScene.id, stageType: StageType.HANDS_ON } },
      update: {},
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.HANDS_ON,
        capabilityStd: '完成第一篇文章从选题到发布前检查的完整准备',
        learningFocus: '分环节使用 AI 辅助内容产出',
        practiceTask: '用 AI 分环节辅助完成一篇文章准备',
        capabilityEvidence: '一篇文章的完整准备过程',
        aiIntervention: '用 AI 分环节辅助选题校准、资料整理、大纲搭建、正文改写、标题生成和发布检查',
        commonFailure: '照抄AI输出但不理解每步为什么存在',
        remedialAction: '补充每步说明，重新演示一次',
        sortOrder: 1,
      },
    }),
    stableProduction: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: wechatScene.id, stageType: StageType.STABLE_PRODUCTION } },
      update: {},
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.STABLE_PRODUCTION,
        capabilityStd: '围绕同一账号定位连续完成三篇内容并复盘',
        learningFocus: '复用 AI 上下文稳定产出',
        practiceTask: '连续完成三篇内容并记录复盘',
        capabilityEvidence: '三篇内容+复盘记录',
        aiIntervention: '用 AI 复用账号设定、栏目标准和复盘表',
        commonFailure: '只能重复原案例，换输入就不稳',
        remedialAction: '更换输入再做一轮，按清单自查',
        sortOrder: 2,
      },
    }),
    advance: await prisma.stage.upsert({
      where: { sceneId_stageType: { sceneId: wechatScene.id, stageType: StageType.ADVANCE } },
      update: {},
      create: {
        sceneId: wechatScene.id,
        stageType: StageType.ADVANCE,
        capabilityStd: '基于真实数据选择一个瓶颈并升级',
        learningFocus: '用 AI 发现瓶颈并辅助优化',
        practiceTask: '分析三篇内容共性问题，生成升级方案',
        capabilityEvidence: '升级方案+前后对比',
        aiIntervention: '用 AI 分析共性问题，生成可执行升级方案',
        commonFailure: '只有主观感受没有前后证据',
        remedialAction: '补交前后对比与复盘数据',
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
    update: {},
    create: {
      stageId: wechatStages.understand.id,
      sceneId: wechatScene.id,
      title: '明确你的公众号定位',
      slug: 'define-account-positioning',
      objective: '学会用 AI 追问法明确公众号定位',
      prerequisites: '有一个想运营公众号的想法',
      keyConcepts: '目标读者、核心价值、栏目规划',
      methodFocus: 'AI 追问法——让 AI 不断追问来帮你厘清定位',
      practiceTask: '用 AI 追问法完成一份公众号定位说明',
      passCriteria: '能清楚说出公众号服务谁、解决什么问题、有哪些栏目',
      capabilityEvidence: '一份包含目标读者、核心价值和栏目规划的定位说明',
      sortOrder: 0,
    },
  })

  // 节点2: understand-operation-chain
  const node2 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'understand-operation-chain' } },
    update: {},
    create: {
      stageId: wechatStages.understand.id,
      sceneId: wechatScene.id,
      title: '了解公众号运营链路',
      slug: 'understand-operation-chain',
      objective: '理解公众号从定位到复盘的完整运营链路',
      prerequisites: '已完成定位明确',
      keyConcepts: '运营链路、复盘指标、栏目规划',
      methodFocus: '用 AI 梳理完整运营链路',
      practiceTask: '用 AI 输出一份运营链路说明',
      passCriteria: '能说清楚从定位到复盘的完整链路',
      capabilityEvidence: '一份运营链路说明文档',
      sortOrder: 1,
    },
  })

  // 节点3: hands-on-topic-selection
  const node3 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'hands-on-topic-selection' } },
    update: {},
    create: {
      stageId: wechatStages.handsOn.id,
      sceneId: wechatScene.id,
      title: '选题与资料整理',
      slug: 'hands-on-topic-selection',
      objective: '学会用 AI 辅助选题校准和资料整理',
      prerequisites: '已完成公众号定位',
      keyConcepts: '选题卡、热点校准、资料结构化',
      methodFocus: '用 AI 校准选题方向，整理资料为结构化素材',
      practiceTask: '用 AI 完成一篇文章的选题校准和资料整理',
      passCriteria: '能输出一个校准后的选题和结构化素材',
      capabilityEvidence: '选题校准记录 + 结构化素材',
      sortOrder: 0,
    },
  })

  // 节点4: hands-on-outline-writing
  const node4 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'hands-on-outline-writing' } },
    update: {},
    create: {
      stageId: wechatStages.handsOn.id,
      sceneId: wechatScene.id,
      title: '大纲搭建与正文改写',
      slug: 'hands-on-outline-writing',
      objective: '学会用 AI 分环节辅助大纲搭建和正文改写',
      prerequisites: '已完成选题和资料整理',
      keyConcepts: '大纲结构、分段改写、发布检查',
      methodFocus: '不一次性要成稿，分环节让 AI 辅助',
      practiceTask: '用 AI 分环节完成一篇文章的大纲和正文',
      passCriteria: '能输出一篇分环节完成的文章初稿',
      capabilityEvidence: '分环节完成的文章 + 每步说明',
      sortOrder: 1,
    },
  })

  // 节点5: stable-reuse-context
  const node5 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'stable-reuse-context' } },
    update: {},
    create: {
      stageId: wechatStages.stableProduction.id,
      sceneId: wechatScene.id,
      title: '复用上下文稳定产出',
      slug: 'stable-reuse-context',
      objective: '学会复用 AI 上下文和账号设定稳定产出内容',
      prerequisites: '已独立完成一篇文章',
      keyConcepts: '上下文复用、账号设定模板、栏目标准',
      methodFocus: '让 AI 记住你的账号设定和栏目标准，复用产出',
      practiceTask: '用 AI 复用账号设定连续完成两篇内容',
      passCriteria: '两篇内容风格一致，质量稳定',
      capabilityEvidence: '两篇内容 + 复用说明',
      sortOrder: 0,
    },
  })

  // 节点6: stable-data-review
  const node6 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'stable-data-review' } },
    update: {},
    create: {
      stageId: wechatStages.stableProduction.id,
      sceneId: wechatScene.id,
      title: '发布数据复盘',
      slug: 'stable-data-review',
      objective: '学会用 AI 辅助发布数据复盘和调整',
      prerequisites: '已发布至少两篇内容并有数据',
      keyConcepts: '复盘指标、数据对比、调整方向',
      methodFocus: '用 AI 整理数据、发现规律、生成调整建议',
      practiceTask: '用 AI 完成一次三篇内容的复盘',
      passCriteria: '复盘包含数据对比和具体调整方向',
      capabilityEvidence: '复盘报告 + 调整计划',
      sortOrder: 1,
    },
  })

  // 节点7: advance-bottleneck-upgrade
  const node7 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'advance-bottleneck-upgrade' } },
    update: {},
    create: {
      stageId: wechatStages.advance.id,
      sceneId: wechatScene.id,
      title: '发现瓶颈与升级方案',
      slug: 'advance-bottleneck-upgrade',
      objective: '学会用 AI 分析内容共性问题并生成升级方案',
      prerequisites: '已完成三篇以上内容并有复盘数据',
      keyConcepts: '瓶颈分析、升级方案、前后对比',
      methodFocus: '用 AI 分析三篇内容的共性问题，生成可执行升级方案',
      practiceTask: '分析三篇内容共性问题，生成一个升级方案',
      passCriteria: '升级方案有具体前后对比和执行步骤',
      capabilityEvidence: '升级方案 + 前后对比',
      sortOrder: 0,
    },
  })

  // 节点8: advance-migrate-scene
  const node8 = await prisma.learningNode.upsert({
    where: { sceneId_slug: { sceneId: wechatScene.id, slug: 'advance-migrate-scene' } },
    update: {},
    create: {
      stageId: wechatStages.advance.id,
      sceneId: wechatScene.id,
      title: '迁移到更复杂场景',
      slug: 'advance-migrate-scene',
      objective: '学会将公众号运营能力迁移到更复杂的内容场景',
      prerequisites: '已完成升级方案',
      keyConcepts: '能力迁移、场景扩展、工具升级',
      methodFocus: '识别可迁移的核心能力，规划新场景学习路径',
      practiceTask: '选择一个新场景，规划如何迁移现有能力',
      passCriteria: '能说清楚哪些能力可迁移、新场景需要什么新能力',
      capabilityEvidence: '迁移规划 + 新场景学习路径',
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
      prompt: '我想做一个关于职场效率的公众号，帮我追问来厘清我的定位',
      aiFollowUp: '你的目标读者是职场中的哪类人群？是刚入职的新人，还是有3-5年经验的中层？',
      userSupplement: '主要是3-5年经验的职场人，他们面临效率瓶颈但不知道怎么突破',
      aiOutput: '基于你的定位，建议栏目规划：1) 效率工具测评 2) 工作流优化案例 3) AI辅助实践。每个栏目每周一篇，保持节奏...',
      checkList: '1.是否明确了目标读者 2.是否说清了核心价值 3.栏目是否可持续',
      sortOrder: 0,
    },
  })

  // 对话示范2: understand-operation-chain
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node2.id,
      toolChoice: 'DeepSeek',
      prompt: '我已经明确了公众号定位（职场效率），帮我梳理从定位到复盘的完整运营链路',
      aiFollowUp: '你目前有哪些运营环节已经有了固定流程？哪些环节还比较随机？',
      userSupplement: '选题和写作比较随机，发布时间也不固定',
      aiOutput: '你的运营链路建议：1)定位（已完成）→2)选题（建议每周固定选题日）→3)资料整理（30分钟）→4)大纲（15分钟）→5)正文（60分钟）→6)标题封面（15分钟）→7)发布检查（10分钟）→8)数据复盘（每周一次）→回到选题。关键：先把选题和发布时间固定下来...',
      checkList: '1.链路是否完整 2.是否有缺失环节 3.是否有复盘闭环',
      sortOrder: 0,
    },
  })

  // 对话示范3: hands-on-topic-selection
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node3.id,
      toolChoice: 'DeepSeek',
      prompt: '我想写一篇关于"用AI整理会议纪要"的文章，帮我校准选题方向',
      aiFollowUp: '你的读者是哪种会议场景？是日常团队站会、项目复盘会、还是客户沟通会？',
      userSupplement: '主要是项目复盘会，参会者3-5人，时长1小时左右',
      aiOutput: '选题校准建议：1)原选题偏泛，建议聚焦为"项目复盘会后，用AI在10分钟内整理出可执行的Action Item"；2)目标读者：参与项目复盘的团队负责人；3)核心价值：从1小时录音到10分钟Action Item的方法。接下来帮你整理资料框架...',
      checkList: '1.选题是否聚焦 2.是否有明确目标读者 3.是否有核心价值主张',
      sortOrder: 0,
    },
  })

  // 对话示范4: hands-on-outline-writing
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node4.id,
      toolChoice: 'DeepSeek',
      prompt: '帮我搭建一篇"项目复盘AI纪要"的文章大纲，目标是让读者能跟着做',
      aiFollowUp: '你希望文章结构是按步骤走，还是按问题场景走？',
      userSupplement: '按步骤走，从录音到Action Item的完整流程',
      aiOutput: '文章大纲：1)为什么复盘纪要总是难整理（痛点共鸣）2)准备工作：录音转文字的工具选择 3)第一步：用AI提取关键讨论点 4)第二步：用AI生成Action Item列表 5)第三步：用AI补充责任人和截止日期 6)检查清单：一份好的复盘纪要长什么样 7)常见问题：AI漏掉了重要内容怎么办...',
      checkList: '1.大纲是否按步骤展开 2.每步是否有具体操作 3.是否有检查清单',
      sortOrder: 0,
    },
  })

  // 对话示范5: stable-reuse-context
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node5.id,
      toolChoice: 'DeepSeek',
      prompt: '记住我的账号设定：职场效率公众号，栏目有"效率工具测评""工作流优化""AI辅助实践"。帮我按这个标准写一篇"AI辅助实践"栏目的文章',
      aiFollowUp: '你希望这篇文章聚焦哪个具体实践？上次写的是会议纪要，这次换一个？',
      userSupplement: '这次写"用AI做周报"，结构和上次类似',
      aiOutput: '好的，基于你的账号设定和上次的结构，生成文章：标题：每周五分钟，用AI写出领导满意的周报 | AI辅助实践。结构：1)为什么周报总是写不好 2)用AI整理本周工作要点 3)用AI生成结构化周报 4)检查与调整。风格与上一篇保持一致：先痛点、再方法、后检查...',
      checkList: '1.风格是否与上一篇一致 2.是否复用了账号设定 3.质量是否稳定',
      sortOrder: 0,
    },
  })

  // 对话示范6: stable-data-review
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node6.id,
      toolChoice: 'DeepSeek',
      prompt: '我最近三篇文章的数据：第一篇阅读500点赞20，第二篇阅读800点赞35，第三篇阅读600点赞15。帮我复盘',
      aiFollowUp: '三篇文章的标题和发布时间分别是什么？点赞率差异可能和标题或发布时间有关',
      userSupplement: '第一篇"AI整理会议纪要"周二发，第二篇"AI做周报"周三发，第三篇"AI写邮件"周五发',
      aiOutput: '复盘分析：1)阅读量：周三>周二>周五，建议固定周三发布；2)点赞率：第二篇最高(4.4%)，标题更具体；3)第三篇点赞率最低(2.5%)，标题偏泛。调整建议：1)固定周三发布 2)标题保持具体场景+结果 3)"AI写邮件"可改为"用AI在3分钟内回复所有工作邮件"...',
      checkList: '1.是否有数据对比 2.是否有规律发现 3.是否有具体调整方向',
      sortOrder: 0,
    },
  })

  // 对话示范7: advance-bottleneck-upgrade
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node7.id,
      toolChoice: 'DeepSeek',
      prompt: '分析我最近三篇文章的共性问题：标题都有"AI"但点击率在下降，内容质量读者反馈不错但分享率低',
      aiFollowUp: '分享率低可能和文章结尾有关——你的文章结尾通常是什么结构？',
      userSupplement: '结尾比较随意，一般是总结一下就结束了',
      aiOutput: '瓶颈分析：1)标题问题："AI"关键词吸引力下降，建议改为结果导向标题（如"3分钟搞定周报"而非"用AI做周报"）；2)分享率问题：结尾缺少"转发理由"，建议在结尾加入"如果你也有XX困扰，转发给同事一起试试"；3)升级方案：A/B测试两种标题风格，结尾统一加入转发引导。预期：点击率提升20%+，分享率提升30%+...',
      checkList: '1.是否找到具体瓶颈 2.升级方案是否可执行 3.是否有预期效果',
      sortOrder: 0,
    },
  })

  // 对话示范8: advance-migrate-scene
  await prisma.aiDialogueExample.create({
    data: {
      nodeId: node8.id,
      toolChoice: 'DeepSeek',
      prompt: '我已经掌握了公众号运营的AI能力，想迁移到"用AI做短视频脚本"这个新场景，帮我规划迁移路径',
      aiFollowUp: '短视频脚本和公众号文章最大的区别是什么？你觉得哪些能力可以直接复用？',
      userSupplement: '区别是短视频需要画面描述和时间控制，但选题、大纲、复盘这些应该可以复用',
      aiOutput: '迁移规划：1)可迁移能力：选题校准、大纲搭建、复盘分析（约70%能力可直接复用）；2)需新学能力：画面描述写作、时间节奏控制、平台算法理解；3)学习路径：理解（短视频脚本结构）→上手（改写一篇公众号文章为短视频脚本）→稳定产出（连续3个脚本）→进阶（数据复盘+优化）；4)工具建议：当前工具可复用，后期可迁移到视频脚本专用工具...',
      checkList: '1.是否识别可迁移能力 2.是否识别需新学能力 3.是否有学习路径',
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
  console.log(`  AI 工具: ${aiToolSeeds.length}`)
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
