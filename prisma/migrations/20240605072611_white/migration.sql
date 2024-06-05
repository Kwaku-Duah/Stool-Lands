/*
  Warnings:

  - You are about to drop the column `uniqueFormId` on the `Assignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueFormID]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignmentId` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Assignment_uniqueFormId_key";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "uniqueFormId",
ADD COLUMN     "isAssigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uniqueFormID" TEXT;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "assignmentId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_uniqueFormID_key" ON "Assignment"("uniqueFormID");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "applicationUnique" FOREIGN KEY ("uniqueFormID") REFERENCES "Application"("uniqueFormID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "organizationUnique" FOREIGN KEY ("uniqueFormID") REFERENCES "OrganizationForm"("uniqueFormID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
