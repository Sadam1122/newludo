ALTER TABLE `HeroSection` ADD COLUMN `portraitImage` TEXT NULL;

UPDATE `HeroSection`
SET
  `backgroundImage` = '/uploads/hero-1-ls.jpeg',
  `portraitImage` = '/uploads/hero-1-pt.jpeg'
ORDER BY `sortOrder` ASC, `createdAt` ASC
LIMIT 1;
