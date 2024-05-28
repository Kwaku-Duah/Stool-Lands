/*
  Warnings:

  - You are about to drop the column `organizationLogo` on the `OrganizationForm` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `orgDocument` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_applicationId_fkey";

-- AlterTable
ALTER TABLE "OrganizationForm" DROP COLUMN "organizationLogo";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "changePassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "orgDocument" DROP COLUMN "type";

-- DropTable
DROP TABLE "Document";

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "appNumber" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
