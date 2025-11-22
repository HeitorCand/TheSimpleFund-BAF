-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "public_key" TEXT,
    "secret_key" TEXT,
    "total_invested" REAL NOT NULL DEFAULT 0,
    "investor_badge" TEXT NOT NULL DEFAULT 'NONE',
    "badge_proof_hash" TEXT,
    "last_badge_update" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "email", "id", "password", "public_key", "role", "secret_key", "status", "updated_at") SELECT "created_at", "email", "id", "password", "public_key", "role", "secret_key", "status", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
