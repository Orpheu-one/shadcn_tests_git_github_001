-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `pwd` VARCHAR(191) NOT NULL,
    `frst_name` VARCHAR(191) NOT NULL,
    `lst_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `desc` VARCHAR(191) NULL,
    `role` ENUM('OPERATOR', 'ADMIN', 'D2D', 'SUPERVISOR') NOT NULL DEFAULT 'OPERATOR',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_userId_key`(`userId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` VARCHAR(191) NOT NULL,
    `frst_name` VARCHAR(191) NOT NULL,
    `lst_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NULL,
    `long` DOUBLE NULL,

    UNIQUE INDEX `Client_clientId_key`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `clientId` INTEGER NOT NULL,
    `type` ENUM('SALE', 'CALLBACK') NOT NULL DEFAULT 'SALE',
    `channel` ENUM('REMOTE', 'F2F') NOT NULL DEFAULT 'REMOTE',
    `status` ENUM('PROJECT', 'CLOSED', 'LOST') NOT NULL DEFAULT 'PROJECT',
    `obs` VARCHAR(191) NULL,
    `Scheduled` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `calledback_at` DATETIME(3) NULL,

    UNIQUE INDEX `Event_event_id_key`(`event_id`),
    UNIQUE INDEX `Event_clientId_key`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
