/*
  Warnings:

  - You are about to alter the column `oldPrice` on the `PriceChange` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `newPrice` on the `PriceChange` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "PriceChange" ALTER COLUMN "oldPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "newPrice" SET DATA TYPE DECIMAL(65,30);
