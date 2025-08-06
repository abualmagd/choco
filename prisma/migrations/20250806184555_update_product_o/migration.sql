/*
  Warnings:

  - You are about to drop the column `zipCode` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `session` table. All the data in the column will be lost.
  - Added the required column `optionValues` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `address` DROP COLUMN `zipCode`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `optionValues` JSON NOT NULL;

-- AlterTable
ALTER TABLE `productvariant` MODIFY `optionValues` JSON NULL;

-- AlterTable
ALTER TABLE `session` DROP COLUMN `data`;
