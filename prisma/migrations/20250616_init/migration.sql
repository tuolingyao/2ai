-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'REVIEWER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PREVIEW', 'PENDING_REVIEW', 'PUBLISHED', 'OFFLINE');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('UNDERSTAND', 'HANDS_ON', 'STABLE_PRODUCTION', 'ADVANCE');

-- CreateEnum
CREATE TYPE "TaxonomyType" AS ENUM ('CATEGORY', 'TARGET_AUDIENCE', 'CAPABILITY_TAG', 'TOOL_TAG');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_evidences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capability_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suitableFor" TEXT NOT NULL,
    "notSuitableFor" TEXT NOT NULL,
    "coverImage" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "stageType" "StageType" NOT NULL,
    "capabilityStd" TEXT NOT NULL,
    "learningFocus" TEXT NOT NULL,
    "practiceTask" TEXT NOT NULL,
    "capabilityEvidence" TEXT NOT NULL,
    "aiIntervention" TEXT NOT NULL,
    "commonFailure" TEXT,
    "remedialAction" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_nodes" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "prerequisites" TEXT,
    "whyFirst" TEXT,
    "keyConcepts" TEXT NOT NULL,
    "methodFocus" TEXT NOT NULL,
    "practiceTask" TEXT NOT NULL,
    "commonMistakes" TEXT,
    "passCriteria" TEXT NOT NULL,
    "capabilityEvidence" TEXT NOT NULL,
    "nextNodeId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_dialogue_examples" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "toolChoice" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "aiFollowUp" TEXT,
    "userSupplement" TEXT,
    "aiOutput" TEXT NOT NULL,
    "checkList" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_dialogue_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_guidances" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "stageId" TEXT,
    "nodeId" TEXT,
    "currentTool" TEXT NOT NULL,
    "currentToolUsage" TEXT NOT NULL,
    "betterTool" TEXT,
    "betterToolUsage" TEXT,
    "migrationTrigger" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_guidances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxonomies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TaxonomyType" NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxonomies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scene_taxonomies" (
    "sceneId" TEXT NOT NULL,
    "taxonomyId" TEXT NOT NULL,

    CONSTRAINT "scene_taxonomies_pkey" PRIMARY KEY ("sceneId","taxonomyId")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "purpose" TEXT,
    "sceneId" TEXT,
    "nodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_nodeId_key" ON "user_progress"("userId", "nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_userId_sceneId_key" ON "user_favorites"("userId", "sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "scenes_slug_key" ON "scenes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "stages_sceneId_stageType_key" ON "stages"("sceneId", "stageType");

-- CreateIndex
CREATE UNIQUE INDEX "learning_nodes_sceneId_slug_key" ON "learning_nodes"("sceneId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomies_type_slug_key" ON "taxonomies"("type", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "learning_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_evidences" ADD CONSTRAINT "capability_evidences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_evidences" ADD CONSTRAINT "capability_evidences_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "learning_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_nodes" ADD CONSTRAINT "learning_nodes_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_nodes" ADD CONSTRAINT "learning_nodes_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_nodes" ADD CONSTRAINT "learning_nodes_nextNodeId_fkey" FOREIGN KEY ("nextNodeId") REFERENCES "learning_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_dialogue_examples" ADD CONSTRAINT "ai_dialogue_examples_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "learning_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_guidances" ADD CONSTRAINT "tool_guidances_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_guidances" ADD CONSTRAINT "tool_guidances_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_guidances" ADD CONSTRAINT "tool_guidances_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "learning_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scene_taxonomies" ADD CONSTRAINT "scene_taxonomies_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scene_taxonomies" ADD CONSTRAINT "scene_taxonomies_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "taxonomies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "learning_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
