/*
  Warnings:

  - You are about to drop the column `clientId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `pwd` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `internalId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Client_clientId_key` ON `Client`;

-- AlterTable
ALTER TABLE `Client` DROP COLUMN `clientId`,
    MODIFY `lst_name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Event` MODIFY `obs` TEXT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `pwd`,
    ADD COLUMN `internalId` VARCHAR(4) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Client_phone_key` ON `Client`(`phone`);

-- CreateIndex
CREATE UNIQUE INDEX `Client_email_key` ON `Client`(`email`);

-- CreateIndex
CREATE INDEX `Client_phone_idx` ON `Client`(`phone`);

-- CreateIndex
CREATE INDEX `Event_status_idx` ON `Event`(`status`);

-- CreateIndex
CREATE UNIQUE INDEX `User_internalId_key` ON `User`(`internalId`);

-- CreateIndex
CREATE INDEX `User_internalId_idx` ON `User`(`internalId`);
