/*
  Warnings:

  - You are about to drop the `InvoiceSecuence` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "InvoiceSecuence";

-- CreateTable
CREATE TABLE "InvoiceSequence" (
    "id" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "prefix" INTEGER NOT NULL DEFAULT 1,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSequence_type_key" ON "InvoiceSequence"("type");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSequence_type_prefix_key" ON "InvoiceSequence"("type", "prefix");
