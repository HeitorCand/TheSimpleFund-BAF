-- AlterTable
ALTER TABLE "cedentes" ADD COLUMN "beneficial_owners" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "city" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "cnae" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "country" TEXT DEFAULT 'BR';
ALTER TABLE "cedentes" ADD COLUMN "credit_policy" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "email" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "fantasy_name" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "guarantees" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "is_pep" BOOLEAN;
ALTER TABLE "cedentes" ADD COLUMN "main_banks" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "operation_description" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "phone" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "postal_code" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "revenue_last_12m" REAL;
ALTER TABLE "cedentes" ADD COLUMN "risk_rating" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "state" TEXT;
ALTER TABLE "cedentes" ADD COLUMN "total_debt" REAL;
ALTER TABLE "cedentes" ADD COLUMN "website" TEXT;

-- AlterTable
ALTER TABLE "sacados" ADD COLUMN "city" TEXT;
ALTER TABLE "sacados" ADD COLUMN "concentration_percent" REAL;
ALTER TABLE "sacados" ADD COLUMN "country" TEXT DEFAULT 'BR';
ALTER TABLE "sacados" ADD COLUMN "credit_limit_fund" REAL;
ALTER TABLE "sacados" ADD COLUMN "default_rate_30d" REAL;
ALTER TABLE "sacados" ADD COLUMN "default_rate_60d" REAL;
ALTER TABLE "sacados" ADD COLUMN "default_rate_90d" REAL;
ALTER TABLE "sacados" ADD COLUMN "email" TEXT;
ALTER TABLE "sacados" ADD COLUMN "exposure" REAL;
ALTER TABLE "sacados" ADD COLUMN "payment_history" TEXT;
ALTER TABLE "sacados" ADD COLUMN "person_type" TEXT;
ALTER TABLE "sacados" ADD COLUMN "phone" TEXT;
ALTER TABLE "sacados" ADD COLUMN "postal_code" TEXT;
ALTER TABLE "sacados" ADD COLUMN "rating" TEXT;
ALTER TABLE "sacados" ADD COLUMN "sector" TEXT;
ALTER TABLE "sacados" ADD COLUMN "size" TEXT;
ALTER TABLE "sacados" ADD COLUMN "state" TEXT;
