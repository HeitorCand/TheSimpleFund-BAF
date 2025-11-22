-- CreateTable
CREATE TABLE "pools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "blend_pool_address" TEXT NOT NULL,
    "asset_address" TEXT NOT NULL,
    "total_deposited" REAL NOT NULL DEFAULT 0,
    "current_balance" REAL NOT NULL DEFAULT 0,
    "yield_earned" REAL NOT NULL DEFAULT 0,
    "apy" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last_yield_update" DATETIME,
    "deposit_tx_hash" TEXT,
    "withdraw_tx_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "fund_id" TEXT NOT NULL,
    CONSTRAINT "pools_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
