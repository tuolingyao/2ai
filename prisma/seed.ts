// Prisma seed 脚本 — 插入测试数据
import { PrismaClient, UserRole, PublishStatus, StageType, TaxonomyType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始清空数据库...')

  // 按依赖顺序删除
  await prisma.capabilityEvidence.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.aiDialogueExample.deleteMany()
  await prisma.toolGuidance.deleteMany()
  await prisma.learningNode.deleteMany()
  await prisma.stage.deleteMany()
  await prisma.sceneTaxonomy.deleteMany()
  await prisma.mediaAsset.deleteMany()
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
