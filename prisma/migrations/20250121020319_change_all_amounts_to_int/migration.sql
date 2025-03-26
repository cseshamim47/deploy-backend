/*
  Warnings:

  - You are about to alter the column `day_price` on the `bike` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `seven_day_price` on the `bike` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `fifteen_day_price` on the `bike` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `month_price` on the `bike` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `limit` on the `bike` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `extra` on the `bike` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `deposit` on the `bike` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `amount` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `bike` MODIFY `day_price` INTEGER NOT NULL,
    MODIFY `seven_day_price` INTEGER NOT NULL,
    MODIFY `fifteen_day_price` INTEGER NOT NULL,
    MODIFY `month_price` INTEGER NOT NULL,
    MODIFY `limit` INTEGER NOT NULL,
    MODIFY `extra` INTEGER NOT NULL,
    MODIFY `deposit` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `booking` MODIFY `amount` INTEGER NOT NULL;
