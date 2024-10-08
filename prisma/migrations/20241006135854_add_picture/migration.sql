/*
  Warnings:

  - Added the required column `picture` to the `menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `menu` ADD COLUMN `picture` VARCHAR(191) NOT NULL;
