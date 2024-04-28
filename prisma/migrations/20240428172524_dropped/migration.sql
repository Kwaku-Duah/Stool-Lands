/*
  Warnings:

  - The `formStatus` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `formStatus` column on the `OrganizationForm` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FormState" AS ENUM ('NEW', 'FILLED');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "formStatus",
ADD COLUMN     "formStatus" "FormState" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "OrganizationForm" DROP COLUMN "formStatus",
ADD COLUMN     "formStatus" "FormState" NOT NULL DEFAULT 'NEW';
