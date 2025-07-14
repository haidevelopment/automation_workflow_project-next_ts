/*
  Warnings:

  - You are about to alter the column `nextRunAt` on the `Workflow` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" TEXT NOT NULL,
    "executionPlan" TEXT,
    "creditsCost" INTEGER NOT NULL DEFAULT 0,
    "cron" TEXT,
    "status" TEXT NOT NULL,
    "lastRunAt" DATETIME,
    "lastRunId" TEXT,
    "lastRunStatus" TEXT,
    "nextRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Workflow" ("createdAt", "creditsCost", "cron", "definition", "description", "executionPlan", "id", "lastRunAt", "lastRunId", "lastRunStatus", "name", "nextRunAt", "status", "updatedAt", "userId") SELECT "createdAt", "creditsCost", "cron", "definition", "description", "executionPlan", "id", "lastRunAt", "lastRunId", "lastRunStatus", "name", "nextRunAt", "status", "updatedAt", "userId" FROM "Workflow";
DROP TABLE "Workflow";
ALTER TABLE "new_Workflow" RENAME TO "Workflow";
CREATE UNIQUE INDEX "Workflow_name_userId_key" ON "Workflow"("name", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
