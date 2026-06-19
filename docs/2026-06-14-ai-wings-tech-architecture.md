# AI之翼 技术架构文档

> 本文档定义技术选型、数据模型、API 设计、组件架构与部署方案。
> 产品范围以 `2026-06-14-ai-wings-product-design-v2.md` 为准，验收口径以 `2026-06-14-ai-wings-acceptance-contracts.md` 为准。

## 1. 技术选型

| 层 | 技术 | 理由 |
|---|---|---|
| 前端框架 | Next.js 14+ (App Router) | SSR/SSG 支持、SEO 友好、内容型网站首选 |
| UI 组件库 | Tailwind CSS + shadcn/ui | 轻量可定制、无运行时开销、设计一致性好 |
| 状态管理 | React Server Components + 客户端 Zustand | 服务端优先渲染，客户端仅交互状态用 Zustand |
| 后端框架 | Next.js API Routes (Route Handlers) | 前后端同一项目，部署简单，一套技术栈 |
| ORM | Prisma | 类型安全、迁移管理、与 Next.js 生态契合 |
| 数据库 | PostgreSQL | 关系型内容模型、全文搜索、JSON 字段灵活扩展 |
| 认证 | NextAuth.js (Auth.js) | 支持邮箱/手机登录、OAuth、角色权限扩展 |
| AI 接入 | OpenAI 兼容 API | 统一接口，可切换通义千问、DeepSeek、智谱等国产模型 |
| 富文本编辑 | Tiptap | 后台内容编辑、支持 AI 辅助扩写扩展 |
| 文件存储 | Vercel Blob / S3 兼容存储 | 媒体资源上传与管理 |
| 部署 | Vercel | 零配置 CI/CD、自动预览、边缘网络 |
| 包管理 | pnpm | 速度快、磁盘占用小、monorepo 友好 |
| 代码规范 | ESLint + Prettier + TypeScript strict | 类型安全、代码风格统一 |

## 2. 数据模型

### 2.1 ER 关系概览

```
User ──< UserProgress
User ──< UserFavorite
User ──< CapabilityEvidence

Scene ──< Stage ──< LearningNode ──< AiDialogueExample
Scene ──< ToolGuidance
Scene ──< SceneTaxonomy >── Taxonomy

LearningNode ──< CapabilityEvidence
Stage ──< ToolGuidance

MediaAsset ──> Scene | LearningNode (多态关联)
SiteSetting (全局单例)
```

### 2.2 完整 Schema

```prisma
// ==================== 用户 ====================

enum UserRole {
  USER
  EDITOR
  REVIEWER
  ADMIN
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  avatar        String?
  role          UserRole @default(USER)
  passwordHash  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  progress      UserProgress[]
  favorites     UserFavorite[]
  evidences     CapabilityEvidence[]

  @@map("users")
}

model UserProgress {
  id           String   @id @default(cuid())
  userId       String
  nodeId       String
  status       ProgressStatus @default(NOT_STARTED)
  completedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  node         LearningNode  @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@unique([userId, nodeId])
  @@map("user_progress")
}

enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

model UserFavorite {
  id        String   @id @default(cuid())
  userId    String
  sceneId   String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scene     Scene    @relation(fields: [sceneId], references: [id], onDelete: Cascade)

  @@unique([userId, sceneId])
  @@map("user_favorites")
}

model CapabilityEvidence {
  id        String   @id @default(cuid())
  userId    String
  nodeId    String
  content   String   // 用户提交的能力证据内容
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  node      LearningNode  @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@map("capability_evidences")
}

// ==================== 内容模型 ====================

enum PublishStatus {
  DRAFT
  PREVIEW
  PENDING_REVIEW
  PUBLISHED
  OFFLINE
}

model Scene {
  id              String        @id @default(cuid())
  title           String
  slug            String        @unique
  summary         String        // 场景摘要
  suitableFor     String        // 适合人群
  notSuitableFor  String        // 不适合人群
  coverImage      String?       // 封面图 URL
  sortOrder       Int           @default(0)
  isRecommended   Boolean       @default(false)
  publishStatus   PublishStatus @default(DRAFT)
  // SEO
  seoTitle        String?
  seoDescription  String?
  // 时间
  publishedAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  stages          Stage[]
  toolGuidances   ToolGuidance[]
  taxonomies      SceneTaxonomy[]
  mediaAssets     MediaAsset[]
  favorites       UserFavorite[]

  @@map("scenes")
}

enum StageType {
  UNDERSTAND          // 理解
  HANDS_ON            // 上手
  STABLE_PRODUCTION   // 独立稳定产出
  ADVANCE             // 持续进阶
}

model Stage {
  id              String     @id @default(cuid())
  sceneId         String
  stageType       StageType
  capabilityStd   String     // 能力标准
  learningFocus   String     // 学习重点
  practiceTask    String     // 练习任务
  capabilityEvidence String  // 能力证据要求
  aiIntervention  String     // AI 介入方式
  commonFailure   String?    // 常见未达标原因
  remedialAction  String?    // 补强动作
  sortOrder       Int        @default(0)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  scene           Scene      @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  nodes           LearningNode[]
  toolGuidances   ToolGuidance[]

  @@unique([sceneId, stageType])
  @@map("stages")
}

model LearningNode {
  id              String   @id @default(cuid())
  stageId         String
  sceneId         String   // 冗余字段，方便查询
  title           String
  slug            String
  objective       String   // 当前学习目标
  prerequisites   String?  // 前置条件
  whyFirst        String?  // 为什么先学这个
  keyConcepts     String   // 关键概念
  methodFocus     String   // 方法重点
  practiceTask    String   // 练习任务
  commonMistakes  String?  // 常见错误
  passCriteria    String   // 通关标准
  capabilityEvidence String // 能力证据
  nextNodeId      String?  // 下一步节点
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  stage           Stage    @relation(fields: [stageId], references: [id], onDelete: Cascade)
  scene           Scene    @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  nextNode        LearningNode?  @relation("NodeChain", fields: [nextNodeId], references: [id])
  dialogueExamples AiDialogueExample[]
  toolGuidances   ToolGuidance[]
  mediaAssets     MediaAsset[]
  progress        UserProgress[]
  evidences       CapabilityEvidence[]

  @@unique([sceneId, slug])
  @@map("learning_nodes")
}

model AiDialogueExample {
  id            String       @id @default(cuid())
  nodeId        String
  toolChoice    String       // 工具选择
  prompt        String       // 提示词
  aiFollowUp    String?      // AI 追问
  userSupplement String?     // 用户补充
  aiOutput      String       // AI 输出
  checkList     String       // 检查清单
  sortOrder     Int          @default(0)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  node          LearningNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@map("ai_dialogue_examples")
}

model ToolGuidance {
  id                String   @id @default(cuid())
  sceneId           String
  stageId           String?  // 可关联阶段
  nodeId            String?  // 可关联节点
  currentTool       String   // 当前工具建议
  currentToolUsage  String   // 当前工具怎么学/怎么用
  betterTool        String?  // 更优工具建议
  betterToolUsage   String?  // 更优工具怎么学/怎么用
  migrationTrigger  String?  // 迁移触发条件
  sortOrder         Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  scene             Scene    @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  stage             Stage?   @relation(fields: [stageId], references: [id], onDelete: SetNull)
  node              LearningNode? @relation(fields: [nodeId], references: [id], onDelete: SetNull)

  @@map("tool_guidances")
}

// ==================== 分类与标签 ====================

enum TaxonomyType {
  CATEGORY       // 分类
  TARGET_AUDIENCE // 目标人群
  CAPABILITY_TAG // 能力标签
  TOOL_TAG       // 工具标签
}

model Taxonomy {
  id          String       @id @default(cuid())
  name        String
  type        TaxonomyType
  slug        String
  description String?
  sortOrder   Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  scenes      SceneTaxonomy[]

  @@unique([type, slug])
  @@map("taxonomies")
}

model SceneTaxonomy {
  sceneId     String
  taxonomyId  String

  scene       Scene     @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  taxonomy    Taxonomy  @relation(fields: [taxonomyId], references: [id], onDelete: Cascade)

  @@id([sceneId, taxonomyId])
  @@map("scene_taxonomies")
}

// ==================== 媒体资源 ====================

model MediaAsset {
  id          String   @id @default(cuid())
  url         String   // 文件 URL
  alt         String?  // alt 文本
  purpose     String?  // 用途说明
  sceneId     String?  // 关联场景（可选）
  nodeId      String?  // 关联节点（可选）
  createdAt   DateTime @default(now())

  scene       Scene?        @relation(fields: [sceneId], references: [id], onDelete: SetNull)
  node        LearningNode? @relation(fields: [nodeId], references: [id], onDelete: SetNull)

  @@map("media_assets")
}

// ==================== 站点设置 ====================

model SiteSetting {
  id              String   @id @default(cuid())
  key             String   @unique
  value           String   // JSON 字符串，存储配置值
  description     String?
  updatedAt       DateTime @updatedAt

  @@map("site_settings")
}
```

## 3. API 设计

### 3.1 前台 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/scenes` | 场景列表（支持分页、搜索、分类筛选、排序） |
| GET | `/api/scenes/[slug]` | 场景详情（含四阶段） |
| GET | `/api/scenes/[slug]/nodes/[nodeSlug]` | 学习节点详情 |
| GET | `/api/search?q=&type=&category=` | 搜索（场景/关键词/能力目标/工具） |
| GET | `/api/taxonomies?type=` | 分类与标签列表 |
| POST | `/api/auth/signup` | 注册 |
| POST | `/api/auth/signin` | 登录 |
| GET | `/api/user/progress` | 我的学习进度 |
| POST | `/api/user/progress` | 更新节点进度 |
| GET | `/api/user/favorites` | 我的收藏 |
| POST | `/api/user/favorites` | 收藏/取消收藏 |
| GET | `/api/user/evidences` | 我的能力证据 |
| POST | `/api/user/evidences` | 提交能力证据 |
| PUT | `/api/user/evidences/[id]` | 修改能力证据 |
| DELETE | `/api/user/evidences/[id]` | 删除能力证据 |

### 3.2 后台 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/admin/dashboard` | 仪表盘统计 |
| GET/POST | `/api/admin/scenes` | 场景列表/新建 |
| GET/PUT/DELETE | `/api/admin/scenes/[id]` | 场景详情/编辑/删除 |
| POST | `/api/admin/scenes/[id]/preview` | 生成预览 |
| POST | `/api/admin/scenes/[id]/publish` | 发布 |
| POST | `/api/admin/scenes/[id]/offline` | 下线 |
| POST | `/api/admin/scenes/[id]/duplicate` | 复制场景 |
| GET/POST | `/api/admin/stages` | 阶段列表/新建 |
| GET/PUT/DELETE | `/api/admin/stages/[id]` | 阶段详情/编辑/删除 |
| GET/POST | `/api/admin/nodes` | 节点列表/新建 |
| GET/PUT/DELETE | `/api/admin/nodes/[id]` | 节点详情/编辑/删除 |
| GET/POST | `/api/admin/dialogue-examples` | AI 对话示范列表/新建 |
| GET/PUT/DELETE | `/api/admin/dialogue-examples/[id]` | 对话示范详情/编辑/删除 |
| GET/POST | `/api/admin/tool-guidances` | 工具建议列表/新建 |
| GET/PUT/DELETE | `/api/admin/tool-guidances/[id]` | 工具建议详情/编辑/删除 |
| GET/POST | `/api/admin/taxonomies` | 分类标签列表/新建 |
| GET/PUT/DELETE | `/api/admin/taxonomies/[id]` | 分类标签详情/编辑/删除 |
| GET/POST | `/api/admin/media` | 媒体列表/上传 |
| DELETE | `/api/admin/media/[id]` | 删除媒体 |
| GET/PUT | `/api/admin/settings` | 站点设置读取/更新 |
| POST | `/api/admin/quality-check/[sceneId]` | 内容质量检查 |
| GET | `/api/admin/users` | 用户管理（管理员） |
| PUT | `/api/admin/users/[id]/role` | 修改用户角色 |

### 3.3 AI 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/ai/chat` | AI 对话（用户在节点页与 AI 交互） |
| POST | `/api/admin/ai/expand` | AI 辅助内容扩写（后台编辑用） |

AI 接口统一使用 OpenAI 兼容协议，通过环境变量配置模型提供商和 API Key，运行时可切换。

## 4. 组件架构

### 4.1 前台页面组件树

```
app/
├── layout.tsx                    # 全局布局（Header + Footer）
├── page.tsx                      # 首页
├── scenes/
│   ├── page.tsx                  # 场景库
│   └── [slug]/
│       ├── page.tsx              # 场景页
│       └── nodes/
│           └── [nodeSlug]/
│               └── page.tsx      # 学习节点页
├── account/
│   └── page.tsx                  # 用户账户页
├── admin/
│   ├── layout.tsx                # 后台布局（Sidebar + Header）
│   ├── page.tsx                  # 仪表盘
│   ├── scenes/
│   │   ├── page.tsx              # 场景管理列表
│   │   └── [id]/
│   │       └── page.tsx          # 场景编辑
│   ├── nodes/
│   │   └── page.tsx              # 节点管理
│   ├── tools/
│   │   └── page.tsx              # 工具建议管理
│   ├── taxonomies/
│   │   └── page.tsx              # 分类标签管理
│   ├── media/
│   │   └── page.tsx              # 媒体管理
│   └── settings/
│       └── page.tsx              # 站点设置
└── api/                          # API Routes
```

### 4.2 共享组件

| 组件 | 用途 |
|---|---|
| `SceneCard` | 场景卡片（首页、场景库复用） |
| `StageTimeline` | 四阶段时间线（场景页） |
| `StageSection` | 单阶段内容区块 |
| `NodeCard` | 节点入口卡片 |
| `AiDialogue` | AI 对话示范展示 |
| `ToolGuidanceCard` | 工具建议卡片 |
| `SearchBar` | 搜索栏 |
| `FilterPanel` | 筛选面板 |
| `ProgressIndicator` | 学习进度指示器 |
| `EvidenceForm` | 能力证据提交表单 |
| `AdminSceneForm` | 后台场景编辑表单 |
| `AdminNodeForm` | 后台节点编辑表单 |
| `AdminStageForm` | 后台阶段编辑表单 |
| `RichTextEditor` | 富文本编辑器（Tiptap） |
| `MediaUploader` | 媒体上传组件 |
| `PublishStatusBadge` | 发布状态标签 |
| `QualityCheckPanel` | 质量检查面板 |

### 4.3 数据流

```
[Server Component] → Prisma → PostgreSQL
       ↓ (序列化数据)
[Client Component] → Zustand (交互状态) → API Route → Prisma → PostgreSQL
                                           ↓
                                    AI Provider (OpenAI 兼容)
```

- 页面首屏由 Server Component 直接查库渲染，SEO 友好
- 用户交互（收藏、进度、证据提交）通过 API Route 处理
- AI 对话通过 API Route 代理到 AI Provider

## 5. 部署方案

| 项 | 方案 |
|---|---|
| 平台 | Vercel |
| 数据库 | Vercel Postgres（起步）→ 可迁移至独立 PostgreSQL |
| 文件存储 | Vercel Blob |
| 域名 | 自定义域名 + Vercel 自动 HTTPS |
| CI/CD | Vercel Git 集成，push 自动部署，PR 自动预览 |
| 环境 | Production / Preview / Development |
| 环境变量 | `DATABASE_URL`、`NEXTAUTH_SECRET`、`AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL` 等 |

### 5.1 环境变量

```env
# 数据库
DATABASE_URL="postgresql://..."

# 认证
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://aiwings.example.com"

# AI 模型（OpenAI 兼容）
AI_API_KEY="..."
AI_BASE_URL="https://api.deepseek.com/v1"  # 可切换为其他兼容端点
AI_MODEL="deepseek-chat"

# 文件存储
BLOB_READ_WRITE_TOKEN="..."
```

### 5.2 部署流程

1. 代码推送到 `main` 分支 → Vercel 自动构建部署到 Production
2. PR 创建 → Vercel 自动生成 Preview 部署
3. 数据库迁移通过 Prisma Migrate 在构建时执行
4. 媒体文件通过 Vercel Blob 上传，CDN 分发
