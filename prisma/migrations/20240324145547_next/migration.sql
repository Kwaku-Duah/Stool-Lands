/*
  Warnings:

  - You are about to drop the `Applicants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Applicants";

-- CreateTable
CREATE TABLE "Applicant" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_applicantId_key" ON "Applicant"("applicantId");
