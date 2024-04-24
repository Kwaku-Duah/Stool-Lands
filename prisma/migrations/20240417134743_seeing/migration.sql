/*
  Warnings:

  - You are about to drop the `Form` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Form";

-- CreateTable
CREATE TABLE "FormTrack" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL,

    CONSTRAINT "FormTrack_pkey" PRIMARY KEY ("id")
);
