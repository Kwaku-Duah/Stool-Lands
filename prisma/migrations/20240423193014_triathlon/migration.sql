-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentDescription" TEXT,
ADD COLUMN     "paymentDetails" JSONB;
