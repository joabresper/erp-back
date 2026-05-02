-- 1. Agregamos la columna pero permitimos que sea NULA temporalmente
ALTER TABLE "Sale"
ADD COLUMN "amountPaid" DECIMAL(10, 2),
ADD COLUMN "pickupDate" TIMESTAMP,
ADD COLUMN "contactName" VARCHAR(100);

-- 2. Actualizamos los registros existentes para que no tengan valores nulos
UPDATE "Sale" SET "amountPaid" = "totalAmount", "pickupDate" = "invoiceDate" WHERE "amountPaid" IS NULL OR "pickupDate" IS NULL;

-- 3. Ahora que ya no hay nulos, bloqueamos la columna para que sea obligatoria
ALTER TABLE "Sale" ALTER COLUMN "amountPaid" SET NOT NULL;
ALTER TABLE "Sale" ALTER COLUMN "pickupDate" SET NOT NULL;