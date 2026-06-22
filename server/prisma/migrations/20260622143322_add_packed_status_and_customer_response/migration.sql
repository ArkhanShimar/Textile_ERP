-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PACKED';

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "customerResponse" TEXT,
ADD COLUMN     "packedAt" TIMESTAMP(3),
ADD COLUMN     "packedBy" TEXT;
