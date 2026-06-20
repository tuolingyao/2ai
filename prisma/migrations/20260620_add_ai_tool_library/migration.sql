DO $$ BEGIN
    CREATE TYPE "ToolPricing" AS ENUM ('FREE', 'FREEMIUM', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ToolDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "ai_tool_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tool_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_tools" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "logoUrl" TEXT,
    "pricing" "ToolPricing" NOT NULL,
    "difficulty" "ToolDifficulty" NOT NULL,
    "bestFor" TEXT NOT NULL,
    "notFor" TEXT,
    "whyRecommended" TEXT NOT NULL,
    "quickStart" TEXT NOT NULL,
    "promptExample" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isTop" BOOLEAN NOT NULL DEFAULT true,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tools_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_tool_scenes" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,

    CONSTRAINT "ai_tool_scenes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_tool_categories_slug_key" ON "ai_tool_categories"("slug");

CREATE UNIQUE INDEX IF NOT EXISTS "ai_tools_slug_key" ON "ai_tools"("slug");

CREATE UNIQUE INDEX IF NOT EXISTS "ai_tool_scenes_toolId_sceneId_key" ON "ai_tool_scenes"("toolId", "sceneId");

DO $$ BEGIN
    ALTER TABLE "ai_tools" ADD CONSTRAINT "ai_tools_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ai_tool_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ai_tool_scenes" ADD CONSTRAINT "ai_tool_scenes_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ai_tool_scenes" ADD CONSTRAINT "ai_tool_scenes_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
