/*
  Warnings:

  - You are about to drop the `FormTrack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FormTrack";

-- CreateTable
CREATE TABLE "stateForm" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL,

    CONSTRAINT "stateForm_pkey" PRIMARY KEY ("id")
);
