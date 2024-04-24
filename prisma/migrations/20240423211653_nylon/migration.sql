/*
  Warnings:

  - You are about to drop the column `paymentDescription` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDetails` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "paymentDescription",
DROP COLUMN "paymentDetails",
ADD COLUMN     "Channel" TEXT,
ADD COLUMN     "MobileMoneyNumber" TEXT,
ADD COLUMN     "PaymentType" TEXT,
ADD COLUMN     "ProviderDescription" TEXT;
