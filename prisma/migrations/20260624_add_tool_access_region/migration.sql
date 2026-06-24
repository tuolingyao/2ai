CREATE TYPE "ToolAccessRegion" AS ENUM ('DOMESTIC', 'OVERSEAS');

ALTER TABLE "ai_tools" ADD COLUMN "accessRegion" "ToolAccessRegion" NOT NULL DEFAULT 'OVERSEAS';
