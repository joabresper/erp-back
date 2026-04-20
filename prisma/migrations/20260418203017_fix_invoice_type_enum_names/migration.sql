/*
  Warnings:

  - The values [NOTA_CREDITO] on the enum `InvoiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceType_new" AS ENUM ('A', 'B', 'C', 'TICKET', 'CREDIT_NOTE');
ALTER TABLE "public"."Sale" ALTER COLUMN "invoiceType" DROP DEFAULT;
ALTER TABLE "Sale" ALTER COLUMN "invoiceType" TYPE "InvoiceType_new" USING ("invoiceType"::text::"InvoiceType_new");
ALTER TABLE "InvoiceSequence" ALTER COLUMN "type" TYPE "InvoiceType_new" USING ("type"::text::"InvoiceType_new");
ALTER TYPE "InvoiceType" RENAME TO "InvoiceType_old";
ALTER TYPE "InvoiceType_new" RENAME TO "InvoiceType";
DROP TYPE "public"."InvoiceType_old";
ALTER TABLE "Sale" ALTER COLUMN "invoiceType" SET DEFAULT 'TICKET';
COMMIT;
