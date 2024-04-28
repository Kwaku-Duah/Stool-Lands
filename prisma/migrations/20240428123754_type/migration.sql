/*
  Warnings:

  - You are about to drop the `OrgPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrgPayment" DROP CONSTRAINT "OrgPayment_organizationFormId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_applicationId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "OrganizationForm" ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "OrgPayment";

-- DropTable
DROP TABLE "Payment";
