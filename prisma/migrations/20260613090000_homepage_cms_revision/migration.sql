-- Site-wide configurable public labels and header buttons.
ALTER TABLE `SiteSetting`
  ADD COLUMN `matchSectionTitle` VARCHAR(191) NOT NULL DEFAULT 'THIS WEEK MATCH',
  ADD COLUMN `headerBookingLabel` VARCHAR(191) NOT NULL DEFAULT 'WhatsApp',
  ADD COLUMN `headerBookingUrl` VARCHAR(191) NULL,
  ADD COLUMN `headerBookingVisible` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `eventMiceLabel` VARCHAR(191) NOT NULL DEFAULT 'Event / MICE',
  ADD COLUMN `eventMiceUrl` VARCHAR(191) NOT NULL DEFAULT '#events',
  ADD COLUMN `eventMiceVisible` BOOLEAN NOT NULL DEFAULT true;

-- Match cards can now be football-style team matches or general broadcasts.
ALTER TABLE `MatchCard`
  ADD COLUMN `displayMode` ENUM('TEAM_MATCH', 'GENERAL_EVENT') NOT NULL DEFAULT 'TEAM_MATCH',
  ADD COLUMN `title` VARCHAR(191) NULL,
  ADD COLUMN `categoryLabel` VARCHAR(191) NULL,
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `eventImage` VARCHAR(191) NULL,
  ADD COLUMN `scheduledAt` DATETIME(3) NULL,
  MODIFY `homeTeamName` VARCHAR(191) NULL,
  MODIFY `awayTeamName` VARCHAR(191) NULL;

-- Event banners get an explicit schedule and customizable talent label.
ALTER TABLE `EventBanner`
  ADD COLUMN `talentLabel` VARCHAR(191) NOT NULL DEFAULT 'Talent',
  ADD COLUMN `scheduledAt` DATETIME(3) NULL;
