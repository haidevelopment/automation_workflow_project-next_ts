-- Repurpose `Credentials` as managed/encrypted credentials store
-- and migrate existing OAuth tokens (google_export) into `UserCredentials`.

PRAGMA foreign_keys=OFF;

-- Rename old table
ALTER TABLE "Credentials" RENAME TO "Credentials_old";

-- Create new managed Credentials table
CREATE TABLE "Credentials" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastUsedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Credentials_userId_type_name_key" ON "Credentials"("userId", "type", "name");
CREATE INDEX "Credentials_userId_idx" ON "Credentials"("userId");

-- Move legacy OAuth credentials into UserCredentials
INSERT OR REPLACE INTO "UserCredentials"(
  "id",
  "userId",
  "provider",
  "email",
  "accessToken",
  "refreshToken",
  "expiryDate",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  "userId",
  "provider",
  "email",
  "accessToken",
  "refreshToken",
  "expiryDate",
  "createdAt",
  "updatedAt"
FROM "Credentials_old";

-- Drop old table
DROP TABLE "Credentials_old";

PRAGMA foreign_keys=ON;
