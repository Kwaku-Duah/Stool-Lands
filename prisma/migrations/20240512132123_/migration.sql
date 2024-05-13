/*
  Warnings:

  - You are about to drop the column `image` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `orgDocument` table. All the data in the column will be lost.
  - Added the required column `url` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `orgDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "image",
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orgDocument" DROP COLUMN "image",
ADD COLUMN     "url" TEXT NOT NULL;
