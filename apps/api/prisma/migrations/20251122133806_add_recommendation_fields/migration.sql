/*
  Warnings:

  - You are about to drop the column `fundType` on the `funds` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_funds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "cnpj" TEXT,
    "investor_profile" TEXT,
    "cvm_code" TEXT,
    "administrator_name" TEXT,
    "administrator_cnpj" TEXT,
    "manager_name" TEXT,
    "manager_cnpj" TEXT,
    "custodian_name" TEXT,
    "auditor_name" TEXT,
    "fiduciary_agent_name" TEXT,
    "sector_focus" TEXT,
    "eligibility_criteria" TEXT,
    "max_cedente_concentration_pct" REAL,
    "max_sacado_concentration_pct" REAL,
    "sector_concentration_pct" REAL,
    "target_pmt" REAL,
    "key_risks" TEXT,
    "administration_fee" REAL,
    "management_fee" REAL,
    "performance_fee" REAL,
    "other_fees" TEXT,
    "liquidity_type" TEXT,
    "lockup_days" INTEGER,
    "redemption_terms" TEXT,
    "nav_per_share" REAL,
    "aum" REAL,
    "return_12m" REAL,
    "return_ytd" REAL,
    "return_since_inception" REAL,
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
    "fund_type" TEXT NOT NULL DEFAULT 'FIDC',
    "risk_level" TEXT,
    "sector" TEXT,
    "duration_months" INTEGER,
    "min_ticket" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "consultor_id" TEXT,
    CONSTRAINT "funds_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_funds" ("admin_secret_key", "consultor_id", "contract_address", "created_at", "description", "duration_months", "fund_wallet_public_key", "id", "max_supply", "min_ticket", "name", "price", "risk_level", "sector", "status", "symbol", "target_amount", "token_contract_id", "total_issued", "updated_at", "vault_contract_id") SELECT "admin_secret_key", "consultor_id", "contract_address", "created_at", "description", "duration_months", "fund_wallet_public_key", "id", "max_supply", "min_ticket", "name", "price", "risk_level", "sector", "status", "symbol", "target_amount", "token_contract_id", "total_issued", "updated_at", "vault_contract_id" FROM "funds";
DROP TABLE "funds";
ALTER TABLE "new_funds" RENAME TO "funds";
CREATE UNIQUE INDEX "funds_symbol_key" ON "funds"("symbol");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
