-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_assignmentId_fkey";

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "assignmentId" DROP NOT NULL,
ALTER COLUMN "assignmentId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("uniqueFormID") ON DELETE SET NULL ON UPDATE CASCADE;
