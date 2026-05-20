ALTER TABLE `User`
  ADD COLUMN `passwordResetTokenHash` VARCHAR(191) NULL,
  ADD COLUMN `passwordResetTokenExpiresAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `User_passwordResetTokenHash_key` ON `User`(`passwordResetTokenHash`);
