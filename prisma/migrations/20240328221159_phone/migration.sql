/*
  Warnings:

  - Added the required column `phoneNumber` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "phoneNumber" TEXT NOT NULL;
