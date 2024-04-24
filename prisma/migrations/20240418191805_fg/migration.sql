/*
  Warnings:

  - A unique constraint covering the columns `[clientReference]` on the table `stateForm` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientReference` to the `stateForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stateForm" ADD COLUMN     "clientReference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stateForm_clientReference_key" ON "stateForm"("clientReference");
