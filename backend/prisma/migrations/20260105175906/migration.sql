/*
  Warnings:

  - You are about to alter the column `amount` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `locked` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `amount` on the `OnRampTx` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `amount` on the `P2PTransfer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `amount` on the `TransactionLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Balance" ALTER COLUMN "amount" DROP DEFAULT,
ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "locked" DROP DEFAULT,
ALTER COLUMN "locked" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OnRampTx" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "P2PTransfer" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "TransactionLedger" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
