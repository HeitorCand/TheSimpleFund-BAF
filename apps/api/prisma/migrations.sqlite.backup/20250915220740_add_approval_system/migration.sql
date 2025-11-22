-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_funds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "contract_address" TEXT,
    "token_contract_id" TEXT,
    "vault_contract_id" TEXT,
    "admin_secret_key" TEXT,
    "max_supply" INTEGER NOT NULL,
    "total_issued" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "target_amount" REAL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "consultor_id" TEXT,
    CONSTRAINT "funds_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_funds" ("admin_secret_key", "contract_address", "created_at", "description", "id", "max_supply", "name", "price", "status", "symbol", "target_amount", "token_contract_id", "total_issued", "updated_at", "vault_contract_id") SELECT "admin_secret_key", "contract_address", "created_at", "description", "id", "max_supply", "name", "price", "status", "symbol", "target_amount", "token_contract_id", "total_issued", "updated_at", "vault_contract_id" FROM "funds";
DROP TABLE "funds";
ALTER TABLE "new_funds" RENAME TO "funds";
CREATE UNIQUE INDEX "funds_symbol_key" ON "funds"("symbol");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "public_key" TEXT,
    "secret_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "email", "id", "password", "public_key", "role", "secret_key", "updated_at") SELECT "created_at", "email", "id", "password", "public_key", "role", "secret_key", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
