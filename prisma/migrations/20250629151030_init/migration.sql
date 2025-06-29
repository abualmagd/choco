/*
  Warnings:

  - Added the required column `data` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `session` ADD COLUMN `data` VARCHAR(191) NOT NULL;
