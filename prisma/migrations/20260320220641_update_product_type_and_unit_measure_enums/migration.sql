/*
  Warnings:

  - The values [KG] on the enum `UnitMeasure` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UnitMeasure_new" AS ENUM ('KILOGRAM', 'LITER', 'UNIT');
ALTER TABLE "public"."Product" ALTER COLUMN "unit" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "unit" TYPE "UnitMeasure_new" USING ("unit"::text::"UnitMeasure_new");
ALTER TYPE "UnitMeasure" RENAME TO "UnitMeasure_old";
ALTER TYPE "UnitMeasure_new" RENAME TO "UnitMeasure";
DROP TYPE "public"."UnitMeasure_old";
ALTER TABLE "Product" ALTER COLUMN "unit" SET DEFAULT 'UNIT';
COMMIT;
