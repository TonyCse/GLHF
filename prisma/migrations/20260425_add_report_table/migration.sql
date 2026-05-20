CREATE TABLE `Report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `participantId` INTEGER NOT NULL,
    `motif` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,
    `tournoiId` INTEGER NOT NULL,
    `reporterId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Report_participantId_idx`(`participantId`),
    INDEX `Report_reporterId_idx`(`reporterId`),
    INDEX `Report_tournoiId_idx`(`tournoiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Report`
    ADD CONSTRAINT `Report_participantId_fkey`
    FOREIGN KEY (`participantId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Report`
    ADD CONSTRAINT `Report_reporterId_fkey`
    FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Report`
    ADD CONSTRAINT `Report_tournoiId_fkey`
    FOREIGN KEY (`tournoiId`) REFERENCES `Tournament`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
