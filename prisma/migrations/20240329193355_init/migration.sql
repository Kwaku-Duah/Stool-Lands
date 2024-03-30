/*
  Warnings:

  - You are about to drop the column `changePassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `confirmPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "changePassword",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "confirmPassword" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "newPassword" TEXT NOT NULL,
ADD COLUMN     "occupation" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
