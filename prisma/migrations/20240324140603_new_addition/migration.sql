/*
  Warnings:

  - A unique constraint covering the columns `[staffId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffId` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "staffId" TEXT;

-- CreateTable
CREATE TABLE "Applicants" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,

    CONSTRAINT "Applicants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicants_email_key" ON "Applicants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Applicants_applicantId_key" ON "Applicants"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_staffId_key" ON "Admin"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "User_staffId_key" ON "User"("staffId");
