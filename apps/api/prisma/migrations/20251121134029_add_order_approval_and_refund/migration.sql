-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approval_status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "tx_hash" TEXT,
    "refund_tx_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "investor_id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    CONSTRAINT "orders_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("created_at", "fund_id", "id", "investor_id", "price", "quantity", "status", "total", "tx_hash", "updated_at") SELECT "created_at", "fund_id", "id", "investor_id", "price", "quantity", "status", "total", "tx_hash", "updated_at" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
