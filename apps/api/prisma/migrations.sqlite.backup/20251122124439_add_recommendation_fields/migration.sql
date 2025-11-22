-- CreateTable
CREATE TABLE "fund_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investor_id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fund_interactions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fund_interactions_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "fund_wallet_public_key" TEXT,
    "max_supply" INTEGER NOT NULL,
    "total_issued" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "target_amount" REAL,
    "description" TEXT,
    "fundType" TEXT NOT NULL DEFAULT 'FIDC',
    "risk_level" TEXT,
    "sector" TEXT,
    "duration_months" INTEGER,
    "min_ticket" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "consultor_id" TEXT,
    CONSTRAINT "funds_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_funds" ("admin_secret_key", "consultor_id", "contract_address", "created_at", "description", "fund_wallet_public_key", "id", "max_supply", "name", "price", "status", "symbol", "target_amount", "token_contract_id", "total_issued", "updated_at", "vault_contract_id") SELECT "admin_secret_key", "consultor_id", "contract_address", "created_at", "description", "fund_wallet_public_key", "id", "max_supply", "name", "price", "status", "symbol", "target_amount", "token_contract_id", "total_issued", "updated_at", "vault_contract_id" FROM "funds";
DROP TABLE "funds";
ALTER TABLE "new_funds" RENAME TO "funds";
CREATE UNIQUE INDEX "funds_symbol_key" ON "funds"("symbol");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
