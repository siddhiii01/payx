/*
  Warnings:

  - Added the required column `number` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Balance" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "locked" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "number" TEXT NOT NULL;
