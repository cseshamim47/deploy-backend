/*
  Warnings:

  - You are about to alter the column `amount` on the `offer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `above_amount` on the `offer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `offer` MODIFY `amount` INTEGER NOT NULL,
    MODIFY `above_amount` INTEGER NOT NULL;
