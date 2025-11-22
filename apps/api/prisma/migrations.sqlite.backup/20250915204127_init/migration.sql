-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "public_key" TEXT,
    "secret_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cedentes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "address" TEXT,
    "public_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "consultor_id" TEXT NOT NULL,
    CONSTRAINT "cedentes_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sacados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "address" TEXT,
    "public_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "consultor_id" TEXT NOT NULL,
    CONSTRAINT "sacados_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "funds" (
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
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "target_amount" REAL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "receivables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "face_value" REAL NOT NULL,
    "due_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_value" REAL,
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "fund_id" TEXT NOT NULL,
    "sacado_id" TEXT NOT NULL,
    CONSTRAINT "receivables_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "receivables_sacado_id_fkey" FOREIGN KEY ("sacado_id") REFERENCES "sacados" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tx_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "investor_id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    CONSTRAINT "orders_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funds_symbol_key" ON "funds"("symbol");
