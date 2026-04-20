-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "invoiceNumber" DROP NOT NULL;

-- CreateTable
CREATE TABLE "InvoiceSecuence" (
    "id" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "prefix" INTEGER NOT NULL DEFAULT 1,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceSecuence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSecuence_type_key" ON "InvoiceSecuence"("type");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSecuence_type_prefix_key" ON "InvoiceSecuence"("type", "prefix");
