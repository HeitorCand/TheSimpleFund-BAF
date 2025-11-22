/*
  Warnings:

  - Added the required column `fund_id` to the `cedentes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fund_id` to the `sacados` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cedentes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "address" TEXT,
    "public_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "consultor_id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    CONSTRAINT "cedentes_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cedentes_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_cedentes" ("address", "consultor_id", "created_at", "document", "id", "name", "public_key", "status", "updated_at") SELECT "address", "consultor_id", "created_at", "document", "id", "name", "public_key", "status", "updated_at" FROM "cedentes";
DROP TABLE "cedentes";
ALTER TABLE "new_cedentes" RENAME TO "cedentes";
CREATE TABLE "new_sacados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "address" TEXT,
    "public_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "consultor_id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    CONSTRAINT "sacados_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sacados_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sacados" ("address", "consultor_id", "created_at", "document", "id", "name", "public_key", "status", "updated_at") SELECT "address", "consultor_id", "created_at", "document", "id", "name", "public_key", "status", "updated_at" FROM "sacados";
DROP TABLE "sacados";
ALTER TABLE "new_sacados" RENAME TO "sacados";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
