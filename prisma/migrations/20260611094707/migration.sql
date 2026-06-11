-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSetting` (
    `id` VARCHAR(191) NOT NULL,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'LUDO Sports Kitchen & Coffee',
    `siteTagline` VARCHAR(191) NOT NULL DEFAULT 'EAT · WATCH · CONNECT',
    `whatsappNumber` VARCHAR(191) NOT NULL DEFAULT '6282318560003',
    `defaultWhatsappMessage` VARCHAR(191) NOT NULL DEFAULT 'Halo LUDO, saya ingin reservasi meja.',
    `instagramHandle` VARCHAR(191) NOT NULL DEFAULT '@ludosportskitchen',
    `instagramUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.instagram.com/ludosportskitchen/',
    `tiktokHandle` VARCHAR(191) NOT NULL DEFAULT '@ludosportskitchen',
    `tiktokUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.tiktok.com/@ludosportskitchen',
    `footerCopyright` VARCHAR(191) NOT NULL DEFAULT '© 2026 LUDO SPORTS KITCHEN & COFFEE. ALL RIGHTS RESERVED.',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchCard` (
    `id` VARCHAR(191) NOT NULL,
    `leagueName` VARCHAR(191) NOT NULL,
    `homeTeamName` VARCHAR(191) NOT NULL,
    `awayTeamName` VARCHAR(191) NOT NULL,
    `homeTeamLogo` VARCHAR(191) NULL,
    `awayTeamLogo` VARCHAR(191) NULL,
    `matchDateLabel` VARCHAR(191) NOT NULL,
    `matchTimeLabel` VARCHAR(191) NOT NULL,
    `status` ENUM('BOOK', 'LIMITED', 'FULL_BOOKED', 'CURRENTLY_SHOWING') NOT NULL,
    `buttonLabel` VARCHAR(191) NOT NULL,
    `whatsappMessage` VARCHAR(191) NULL,
    `showSoldOutStamp` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HeroSection` (
    `id` VARCHAR(191) NOT NULL,
    `headlineLine1` VARCHAR(191) NOT NULL DEFAULT 'BIG',
    `headlineHighlight1` VARCHAR(191) NOT NULL DEFAULT 'MATCH,',
    `headlineLine2` VARCHAR(191) NOT NULL DEFAULT 'BIG',
    `headlineHighlight2` VARCHAR(191) NOT NULL DEFAULT 'FLAVOR.',
    `subtitle` VARCHAR(191) NOT NULL DEFAULT 'Nonton seru, makan enak, suasana maksimal.',
    `ctaLabel` VARCHAR(191) NOT NULL DEFAULT 'BOOK YOUR TABLE NOW',
    `ctaWhatsappMessage` VARCHAR(191) NOT NULL DEFAULT 'Halo LUDO, saya ingin reservasi meja.',
    `backgroundImage` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventBanner` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `artistName` VARCHAR(191) NOT NULL,
    `eventDateLabel` VARCHAR(191) NOT NULL,
    `eventTimeLabel` VARCHAR(191) NOT NULL,
    `eventTypeLabel` VARCHAR(191) NULL,
    `headlineLine1` VARCHAR(191) NOT NULL,
    `headlineHighlight1` VARCHAR(191) NOT NULL,
    `headlineLine2` VARCHAR(191) NOT NULL,
    `headlineHighlight2` VARCHAR(191) NOT NULL,
    `backgroundImage` VARCHAR(191) NULL,
    `ctaLabel` VARCHAR(191) NOT NULL,
    `whatsappMessage` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocationSetting` (
    `id` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NOT NULL DEFAULT 'LUDO Sports Kitchen & Coffee',
    `address` VARCHAR(191) NOT NULL DEFAULT 'Jl. Kiara Artha No.C23 Blok F6B 4, Kec. Batununggal, Kota Bandung, Jawa Barat',
    `mapImage` VARCHAR(191) NULL,
    `mapUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.google.com/maps/search/?api=1&query=LUDO%20Sports%20Kitchen%20%26%20Coffee%20Kiara%20Artha%20Bandung',
    `instagramHandle` VARCHAR(191) NOT NULL DEFAULT '@ludosportskitchen',
    `instagramUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.instagram.com/ludosportskitchen/',
    `tiktokHandle` VARCHAR(191) NOT NULL DEFAULT '@ludosportskitchen',
    `tiktokUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.tiktok.com/@ludosportskitchen',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FAQItem` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BrandSection` (
    `id` VARCHAR(191) NOT NULL,
    `titleBeforeHighlight` VARCHAR(191) NOT NULL DEFAULT 'TRUSTED BY',
    `titleHighlight` VARCHAR(191) NOT NULL DEFAULT 'LEADING BRANDS',
    `subtitle` VARCHAR(191) NOT NULL DEFAULT 'Official Brand Partner',
    `brandName` VARCHAR(191) NOT NULL DEFAULT 'Coca-Cola',
    `brandLogo` VARCHAR(191) NULL,
    `bottomText` VARCHAR(191) NOT NULL DEFAULT 'EXCLUSIVE COLLABORATION',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaFile` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
