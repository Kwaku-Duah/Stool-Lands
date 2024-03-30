/*
  Warnings:

  - You are about to drop the column `staffId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Applicant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "User_staffId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "staffId";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Applicant";
