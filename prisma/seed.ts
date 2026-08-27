import bcrypt from "bcrypt";
import {
  DeliveryCategory,
  EventCategory,
  EventTemplate,
  MatchCtaType,
  MatchDisplayMode,
  MatchStatus,
  Prisma,
  PrismaClient,
  ReservationStatus,
  TableStatus,
  TableType,
} from "@prisma/client";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { computeOrderTotals } from "../lib/pricing";

const prisma = new PrismaClient();
const uploadDirectory = path.join(process.cwd(), "public", "uploads");

const ADMIN_EMAIL = "admin@ludo.local";
const ADMIN_PASSWORD = "AdminLudo123!";
const MEMBER_PASSWORD = "MemberLudo123!";

const assets = {
  brand: "/Coca-Cola_logo.svg.png",
  eventDj: "/uploads/event-dj-night.png",
  eventLive: "/uploads/event-live-night.png",
  heroFood: "/uploads/hero-food-match.png",
  heroLandscape: "/uploads/hero-1-ls.jpeg",
  heroPortrait: "/uploads/hero-1-pt.jpeg",
  heroSports: "/uploads/hero-sports-night.png",
  legacyHome: "/uploads/bg-home.JPG",
  legacySection: "/uploads/bg-section3.JPG",
  flags: {
    argentina: "/uploads/flag-argentina.svg",
    brazil: "/uploads/flag-brazil.svg",
    england: "/uploads/flag-england.svg",
    france: "/uploads/flag-france.svg",
    germany: "/uploads/flag-germany.svg",
    netherlands: "/uploads/flag-netherlands.svg",
    portugal: "/uploads/flag-portugal.svg",
    spain: "/uploads/flag-spain.svg",
  },
};

type EventKey =
  | "internalMatch"
  | "regularMatch"
  | "community"
  | "bigMatch"
  | "superBigMatch"
  | "iftar"
  | "music"
  | "delivery";

type EventIds = Record<EventKey, string>;

function assertLocalSeedTarget() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Seeder diblokir: NODE_ENV=production. Seeder LUDO hanya boleh dijalankan secara lokal.",
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Seeder diblokir: DATABASE_URL tidak tersedia.");
  }

  let hostname: string;
  try {
    hostname = new URL(databaseUrl).hostname.toLowerCase();
  } catch {
    throw new Error("Seeder diblokir: DATABASE_URL tidak valid.");
  }

  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
  if (!localHosts.has(hostname)) {
    throw new Error(
      "Seeder diblokir: host database bukan localhost. Seeder ini tidak boleh dijalankan ke production/remote database.",
    );
  }
}

function seedId(key: string) {
  const digest = createHash("sha1").update(`ludo-seed:${key}`).digest("hex");
  return `c${digest.slice(0, 24)}`;
}

function daysFromNow(days: number, hour = 20, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
    weekday: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function timeLabel(date: Date) {
  return `${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date)} WIB`;
}

function mimeTypeFor(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".mov": "video/quicktime",
    ".mp4": "video/mp4",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webm": "video/webm",
  };
  return mimeTypes[extension] ?? "application/octet-stream";
}

function fileInfoForUrl(url: string) {
  if (!url.startsWith("/")) return null;
  const filePath = path.join(process.cwd(), "public", url.slice(1));
  if (!existsSync(filePath)) return null;
  const stats = statSync(filePath);
  if (!stats.isFile()) return null;
  return {
    filename: path.basename(filePath),
    mimeType: mimeTypeFor(filePath),
    size: stats.size,
    url,
  };
}

function findGalleryVideos() {
  if (!existsSync(uploadDirectory)) return [];
  return readdirSync(uploadDirectory)
    .filter((filename) => /\.(mp4|webm|mov)$/i.test(filename))
    .sort((first, second) => first.localeCompare(second))
    .slice(0, 3)
    .map((filename) => ({
      filename,
      mimeType: mimeTypeFor(filename),
      size: statSync(path.join(uploadDirectory, filename)).size,
      url: `/uploads/${filename}`,
    }));
}

async function seedAccounts() {
  const [adminPasswordHash, memberPasswordHash] = await Promise.all([
    bcrypt.hash(ADMIN_PASSWORD, 12),
    bcrypt.hash(MEMBER_PASSWORD, 12),
  ]);

  await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "LUDO Demo Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      id: seedId("admin"),
      email: ADMIN_EMAIL,
      name: "LUDO Demo Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const members = [
    {
      benefitNote: "Diskon member Gold berlaku pada paket dan menu tambahan.",
      category: "GOLD",
      discountPercent: 10,
      username: "demo.gold",
    },
    {
      benefitNote: "Member komunitas untuk menguji booking per kursi.",
      category: "COMMUNITY",
      discountPercent: 5,
      username: "demo.community",
    },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { username: member.username },
      update: {
        ...member,
        isActive: true,
        passwordHash: memberPasswordHash,
      },
      create: {
        id: seedId(`member:${member.username}`),
        ...member,
        isActive: true,
        passwordHash: memberPasswordHash,
      },
    });
  }
}

async function seedSettingsAndCms() {
  const existingSettings = await prisma.siteSetting.findFirst({
    orderBy: { createdAt: "asc" },
  });
  const settingsData = {
    defaultWhatsappMessage:
      "Halo LUDO, saya ingin melakukan reservasi dari website.",
    eventMiceLabel: "Event / MICE",
    eventMiceUrl: "/event-mice",
    eventMiceVisible: true,
    footerCopyright:
      "\u00A9 2026 LUDO SPORTS KITCHEN & COFFEE. ALL RIGHTS RESERVED.",
    headerBookingLabel: "Book via WhatsApp",
    headerBookingUrl: null,
    headerBookingVisible: true,
    instagramHandle: "@ludosportskitchen",
    instagramUrl: "https://www.instagram.com/ludosportskitchen/",
    matchSectionTitle: "UPCOMING SPORTS SCHEDULE",
    menuUrl:
      "https://drive.google.com/drive/folders/1qvRivb-6awFzYvzaCEP9H0NbM3EIcU9r",
    siteName: "LUDO Sports Kitchen & Coffee",
    siteTagline: "EAT \u00B7 WATCH \u00B7 CONNECT",
    tiktokHandle: "@ludosportskitchen",
    tiktokUrl: "https://www.tiktok.com/@ludosportskitchen",
    whatsappNumber: "6282318560003",
  } satisfies Prisma.SiteSettingUncheckedCreateInput;

  if (existingSettings) {
    await prisma.siteSetting.update({
      where: { id: existingSettings.id },
      data: {
        eventMiceVisible: true,
        headerBookingVisible: true,
      },
    });
  } else {
    await prisma.siteSetting.create({
      data: { id: seedId("site-setting"), ...settingsData },
    });
  }

  const heroes = [
    {
      backgroundImage: assets.heroLandscape,
      ctaLabel: "BOOK YOUR TABLE NOW",
      ctaWhatsappMessage: "Halo LUDO, saya ingin reservasi meja.",
      headlineHighlight1: "MATCH,",
      headlineHighlight2: "FLAVOR.",
      headlineLine1: "BIG",
      headlineLine2: "BIG",
      portraitImage: assets.heroPortrait,
      sortOrder: 900,
      subtitle: "Demo aktif: match, booking wizard, member, dan Midtrans.",
    },
    {
      backgroundImage: assets.heroFood,
      ctaLabel: "EXPLORE ALL FEATURES",
      ctaWhatsappMessage:
        "Halo LUDO, saya ingin bertanya tentang event dan reservasi.",
      headlineHighlight1: "NIGHT,",
      headlineHighlight2: "VIBES.",
      headlineLine1: "SPORTS",
      headlineLine2: "LUDO",
      portraitImage: null,
      sortOrder: 901,
      subtitle: "Sample hero kedua untuk menguji carousel desktop dan mobile.",
    },
  ] satisfies Prisma.HeroSectionUncheckedCreateInput[];

  for (const [index, hero] of heroes.entries()) {
    const id = seedId(`hero:${index + 1}`);
    await prisma.heroSection.upsert({
      where: { id },
      update: { ...hero, isActive: true },
      create: { id, ...hero, isActive: true },
    });
  }

  const existingLocation = await prisma.locationSetting.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!existingLocation) {
    await prisma.locationSetting.create({
      data: {
        id: seedId("location"),
        address:
          "Jl. Kiara Artha No.C23 Blok F6B 4, Batununggal, Bandung, Jawa Barat",
        businessName: "LUDO Sports Kitchen & Coffee",
        instagramHandle: "@ludosportskitchen",
        instagramUrl: "https://www.instagram.com/ludosportskitchen/",
        mapImage: assets.legacySection,
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=LUDO%20Sports%20Kitchen%20%26%20Coffee%20Kiara%20Artha%20Bandung",
        tiktokHandle: "@ludosportskitchen",
        tiktokUrl: "https://www.tiktok.com/@ludosportskitchen",
      },
    });
  }

  const faqs = [
    {
      answer:
        "Pilih match atau event, pilih meja, lalu lanjutkan paket, detail pelanggan, konfirmasi, dan pembayaran.",
      question: "Bagaimana mencoba alur booking lengkap?",
    },
    {
      answer:
        "Gunakan akun demo.gold dengan password yang dicetak setelah seeder selesai untuk menguji diskon member.",
      question: "Bagaimana mencoba diskon member?",
    },
    {
      answer:
        "Match demo menyediakan CTA internal, WhatsApp, Vendor, Limited, Currently Showing, dan Full Booked.",
      question: "Jenis CTA apa saja yang tersedia?",
    },
  ];

  for (const [index, faq] of faqs.entries()) {
    const id = seedId(`faq:${index + 1}`);
    const data = { ...faq, isActive: true, sortOrder: 900 + index };
    await prisma.fAQItem.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const brands = [
    {
      bottomText: "SEED DATA \u00B7 ALL FEATURES ACTIVE",
      brandLogo: assets.brand,
      brandName: "Coca-Cola",
      sortOrder: 900,
      subtitle: "Official Brand Partner",
      titleBeforeHighlight: "TRUSTED BY",
      titleHighlight: "LEADING BRANDS",
    },
    {
      bottomText: "SPORTS \u00B7 FOOD \u00B7 COMMUNITY",
      brandLogo: assets.heroSports,
      brandName: "LUDO Community",
      sortOrder: 901,
      subtitle: "Community & Event Partner",
      titleBeforeHighlight: "BUILT FOR",
      titleHighlight: "THE CROWD",
    },
  ] satisfies Prisma.BrandSectionUncheckedCreateInput[];

  for (const [index, brand] of brands.entries()) {
    const id = seedId(`brand:${index + 1}`);
    await prisma.brandSection.upsert({
      where: { id },
      update: { ...brand, isActive: true },
      create: { id, ...brand, isActive: true },
    });
  }

  const miceData = {
    heroDescription:
      "Venue fleksibel untuk meeting, gathering, komunitas, launching, dan private event.",
    heroHeadline: "CREATE YOUR EVENT AT LUDO",
    quoteText: "Good food, big screens, and a flexible venue for every crowd.",
    section2Description:
      "Data contoh ini mengaktifkan halaman Event / MICE agar seluruh form CMS dapat langsung diperiksa.",
    section2Headline: "FROM MEETING TO MATCH NIGHT",
  } satisfies Prisma.EventMiceSettingUncheckedCreateInput;
  const existingMice = await prisma.eventMiceSetting.findFirst();
  if (!existingMice) {
    await prisma.eventMiceSetting.create({
      data: { id: seedId("event-mice"), ...miceData },
    });
  }
}

async function seedMediaAndGallery() {
  const imageUrls = [
    assets.brand,
    assets.eventDj,
    assets.eventLive,
    assets.heroFood,
    assets.heroLandscape,
    assets.heroPortrait,
    assets.heroSports,
    assets.legacyHome,
    assets.legacySection,
    ...Object.values(assets.flags),
  ];

  for (const url of imageUrls) {
    const file = fileInfoForUrl(url);
    if (!file) continue;
    const existing = await prisma.mediaFile.findFirst({ where: { url } });
    if (existing) {
      await prisma.mediaFile.update({ where: { id: existing.id }, data: file });
    } else {
      await prisma.mediaFile.create({
        data: { id: seedId(`media:${url}`), ...file },
      });
    }
  }

  const localVideos = findGalleryVideos();
  const videos =
    localVideos.length > 0
      ? localVideos
      : [
          {
            filename: "flower.mp4",
            mimeType: "video/mp4",
            size: 0,
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          },
        ];

  for (const video of localVideos) {
    const existing = await prisma.mediaFile.findFirst({
      where: { url: video.url },
    });
    if (existing) {
      await prisma.mediaFile.update({
        where: { id: existing.id },
        data: video,
      });
    } else {
      await prisma.mediaFile.create({
        data: { id: seedId(`media:${video.url}`), ...video },
      });
    }
  }

  const thumbnails = [assets.heroSports, assets.eventLive, assets.eventDj];
  for (const [index, video] of videos.entries()) {
    const id = seedId(`gallery-video:${index + 1}`);
    const data = {
      caption:
        index === 0
          ? "Video match night untuk menguji autoplay muted, inline playback, dan pause saat off-screen."
          : "Video gallery aktif untuk menguji carousel dan manual playback fallback.",
      isActive: true,
      sortOrder: 900 + index,
      thumbnailUrl: thumbnails[index % thumbnails.length],
      title:
        index === 0
          ? "Match Night Highlights"
          : `LUDO Video Showcase ${index + 1}`,
      videoUrl: video.url,
    };
    await prisma.galleryItem.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  return {
    localVideoCount: localVideos.length,
    seededVideoCount: videos.length,
    usedRemoteFallback: localVideos.length === 0,
  };
}

async function seedEvents(): Promise<EventIds> {
  const schedules = {
    internalMatch: daysFromNow(2, 20, 30),
    regularMatch: daysFromNow(3, 19, 30),
    community: daysFromNow(4, 20),
    bigMatch: daysFromNow(5, 21),
    superBigMatch: daysFromNow(6, 22),
    iftar: daysFromNow(7, 17, 30),
    music: daysFromNow(8, 20),
  };

  const eventSeeds: Array<{
    data: Prisma.BookingEventUncheckedCreateInput;
    key: Exclude<EventKey, "delivery">;
  }> = [
    {
      key: "internalMatch",
      data: {
        allowAlaCarte: true,
        artistName: "LIVERPOOL VS BARCELONA",
        backgroundImage: assets.heroSports,
        category: EventCategory.BOOKING_EVENT,
        ctaLabel: "BOOK INTERNAL",
        description:
          "Backing event for the internal Match Card CTA and complete Midtrans booking wizard.",
        eventDateLabel: dateLabel(schedules.internalMatch),
        eventTimeLabel: timeLabel(schedules.internalMatch),
        eventType: EventTemplate.BIG_MATCH,
        eventTypeLabel: "INTERNAL BOOKING DEMO",
        headlineHighlight1: "MATCH",
        headlineHighlight2: "TABLE.",
        headlineLine1: "BIG",
        headlineLine2: "BOOK YOUR",
        isActive: true,
        openGateInfo: "Open Gate 19:00 WIB",
        posterImage: assets.heroSports,
        scheduledAt: schedules.internalMatch,
        sortOrder: 900,
        tableInfo:
          "Pilih meja, paket, menu tambahan, login member, lalu review sebelum Midtrans.",
        talentLabel: "Fixture",
        title: "Liverpool vs Barcelona \u00B7 Internal Booking Demo",
      },
    },
    {
      key: "regularMatch",
      data: {
        allowAlaCarte: false,
        artistName: "WEEKLY MATCH",
        backgroundImage: assets.legacyHome,
        category: EventCategory.LIVE_EVENT,
        ctaLabel: "CHAT VIA WHATSAPP",
        description:
          "REGULER_MATCH demo: WhatsApp-only booking without tables or Midtrans.",
        eventDateLabel: dateLabel(schedules.regularMatch),
        eventTimeLabel: timeLabel(schedules.regularMatch),
        eventType: EventTemplate.REGULER_MATCH,
        eventTypeLabel: "REGULER MATCH",
        headlineHighlight1: "MATCH.",
        headlineHighlight2: "CHAT.",
        headlineLine1: "REGULER",
        headlineLine2: "WHATSAPP",
        isActive: true,
        scheduledAt: schedules.regularMatch,
        sortOrder: 901,
        talentLabel: "Booking Type",
        title: "Reguler Match \u00B7 WhatsApp Demo",
        whatsappMessage:
          "Halo LUDO, saya ingin reservasi Reguler Match dari data seeder.",
      },
    },
    {
      key: "community",
      data: {
        allowAlaCarte: true,
        artistName: "LUDO COMMUNITY",
        backgroundImage: assets.eventLive,
        category: EventCategory.BOOKING_EVENT,
        ctaLabel: "BOOK PER SEAT",
        description:
          "Per-seat booking demo with remaining-seat capacity and member discount.",
        eventDateLabel: dateLabel(schedules.community),
        eventTimeLabel: timeLabel(schedules.community),
        eventType: EventTemplate.NOBAR_COMMUNITY,
        eventTypeLabel: "NOBAR COMMUNITY",
        headlineHighlight1: "TOGETHER.",
        headlineHighlight2: "SEAT.",
        headlineLine1: "WATCH",
        headlineLine2: "BOOK A",
        isActive: true,
        openGateInfo: "Open Gate 18:30 WIB",
        scheduledAt: schedules.community,
        sortOrder: 902,
        tableInfo:
          "Harga paket dihitung per kursi. Kapasitas tersisa tampil pada pilihan meja.",
        talentLabel: "Community",
        title: "Nobar Community \u00B7 Per Seat Demo",
      },
    },
    {
      key: "bigMatch",
      data: {
        allowAlaCarte: true,
        artistName: "DERBY NIGHT",
        backgroundImage: assets.heroFood,
        category: EventCategory.BOOKING_EVENT,
        ctaLabel: "BOOK BIG MATCH",
        description: "Whole-table Big Match booking demo.",
        eventDateLabel: dateLabel(schedules.bigMatch),
        eventTimeLabel: timeLabel(schedules.bigMatch),
        eventType: EventTemplate.BIG_MATCH,
        eventTypeLabel: "BIG MATCH",
        headlineHighlight1: "DERBY.",
        headlineHighlight2: "FLAVOR.",
        headlineLine1: "BIG",
        headlineLine2: "BIG",
        isActive: true,
        scheduledAt: schedules.bigMatch,
        sortOrder: 903,
        talentLabel: "Fixture",
        title: "Big Match \u00B7 Whole Table Demo",
      },
    },
    {
      key: "superBigMatch",
      data: {
        allowAlaCarte: true,
        artistName: "EL CLASICO",
        backgroundImage: assets.legacySection,
        category: EventCategory.BOOKING_EVENT,
        ctaLabel: "BOOK PREMIUM TABLE",
        description: "Premium table and package demo for SUPER_BIG_MATCH.",
        eventDateLabel: dateLabel(schedules.superBigMatch),
        eventTimeLabel: timeLabel(schedules.superBigMatch),
        eventType: EventTemplate.SUPER_BIG_MATCH,
        eventTypeLabel: "SUPER BIG MATCH",
        headlineHighlight1: "CLASICO.",
        headlineHighlight2: "TABLE.",
        headlineLine1: "EL",
        headlineLine2: "PREMIUM",
        isActive: true,
        scheduledAt: schedules.superBigMatch,
        sortOrder: 904,
        talentLabel: "Fixture",
        title: "Super Big Match \u00B7 Premium Demo",
      },
    },
    {
      key: "iftar",
      data: {
        allowAlaCarte: true,
        artistName: "IFTAR TOGETHER",
        backgroundImage: assets.eventLive,
        category: EventCategory.BOOKING_EVENT,
        ctaLabel: "BOOK IFTAR",
        description: "Iftar event template with table packages and add-ons.",
        eventDateLabel: dateLabel(schedules.iftar),
        eventTimeLabel: timeLabel(schedules.iftar),
        eventType: EventTemplate.IFTAR_2027,
        eventTypeLabel: "IFTAR 2027",
        headlineHighlight1: "TOGETHER.",
        headlineHighlight2: "TABLE.",
        headlineLine1: "BREAK FAST",
        headlineLine2: "SHARE A",
        isActive: true,
        openGateInfo: "Open Gate 16:30 WIB",
        scheduledAt: schedules.iftar,
        sortOrder: 905,
        talentLabel: "Special Event",
        title: "Iftar 2027 \u00B7 Package Demo",
      },
    },
    {
      key: "music",
      data: {
        allowAlaCarte: true,
        artistName: "THE LUDO ALL STARS",
        backgroundImage: assets.eventDj,
        category: EventCategory.BOOKING_EVENT,
        ctaLabel: "BOOK MUSIC NIGHT",
        description:
          "Music template demo with normal table, package, member, and Midtrans behavior.",
        eventDateLabel: dateLabel(schedules.music),
        eventTimeLabel: timeLabel(schedules.music),
        eventType: EventTemplate.MUSIC,
        eventTypeLabel: "LIVE MUSIC",
        headlineHighlight1: "MUSIC.",
        headlineHighlight2: "VIBES.",
        headlineLine1: "LIVE",
        headlineLine2: "LATE NIGHT",
        isActive: true,
        openGateInfo: "Open Gate 19:00 WIB",
        posterImage: assets.eventDj,
        scheduledAt: schedules.music,
        sortOrder: 906,
        tableInfo: "Semua area dapat dipesan sesuai paket yang tersedia.",
        talentLabel: "Performer",
        title: "Music Night \u00B7 Full Booking Demo",
      },
    },
  ];

  const eventIds = {} as EventIds;
  for (const eventSeed of eventSeeds) {
    const id = seedId(`event:${eventSeed.key}`);
    await prisma.bookingEvent.upsert({
      where: { id },
      update: eventSeed.data,
      create: { ...eventSeed.data, id },
    });
    eventIds[eventSeed.key] = id;
  }

  const existingDelivery = await prisma.bookingEvent.findFirst({
    where: { eventType: EventTemplate.DELIVERY_ORDER },
    orderBy: { createdAt: "asc" },
  });
  if (existingDelivery) {
    await prisma.bookingEvent.update({
      where: { id: existingDelivery.id },
      data: { allowAlaCarte: true, isActive: true },
    });
    eventIds.delivery = existingDelivery.id;
  } else {
    const id = seedId("event:delivery");
    await prisma.bookingEvent.create({
      data: {
        id,
        allowAlaCarte: true,
        artistName: "LUDO KITCHEN",
        backgroundImage: assets.heroFood,
        category: EventCategory.BOOKING_EVENT,
        ctaLabel: "ORDER NOW",
        description: "Seeded delivery menu with food and beverage categories.",
        eventDateLabel: "AVAILABLE DAILY",
        eventTimeLabel: "10:00 - 22:00 WIB",
        eventType: EventTemplate.DELIVERY_ORDER,
        eventTypeLabel: "DELIVERY ORDER",
        headlineHighlight1: "KITCHEN.",
        headlineHighlight2: "DOOR.",
        headlineLine1: "LUDO",
        headlineLine2: "TO YOUR",
        isActive: true,
        sortOrder: 999,
        talentLabel: "Kitchen",
        title: "LUDO Delivery Order",
      },
    });
    eventIds.delivery = id;
  }

  return eventIds;
}

async function seedPackages(eventIds: EventIds) {
  const seeds: Array<{
    data: Omit<Prisma.EventPackageUncheckedCreateInput, "bookingEventId">;
    eventKey: EventKey;
    key: string;
  }> = [
    ...wholeTablePackages("internalMatch", "Internal Match", 0),
    {
      eventKey: "community",
      key: "vvip-seat",
      data: packageData("VVIP Community Seat", 175_000, TableType.VVIP, 1),
    },
    {
      eventKey: "community",
      key: "indoor-seat",
      data: packageData(
        "Indoor Community Seat",
        125_000,
        TableType.REGULAR_INDOOR,
        2,
      ),
    },
    {
      eventKey: "community",
      key: "bar-seat",
      data: packageData(
        "Barstool Community Seat",
        95_000,
        TableType.BARSTOOL,
        3,
      ),
    },
    ...wholeTablePackages("bigMatch", "Big Match", 10),
    {
      eventKey: "superBigMatch",
      key: "vvip",
      data: packageData("Super VVIP Table", 2_500_000, TableType.VVIP, 1),
    },
    {
      eventKey: "superBigMatch",
      key: "vip",
      data: packageData("Super VIP Table", 1_500_000, TableType.VIP, 2),
    },
    {
      eventKey: "iftar",
      key: "indoor",
      data: packageData(
        "Iftar Indoor Package",
        650_000,
        TableType.REGULAR_INDOOR,
        1,
      ),
    },
    {
      eventKey: "iftar",
      key: "outdoor",
      data: packageData(
        "Iftar Semi Outdoor Package",
        650_000,
        TableType.REGULAR_SEMI_OUTDOOR,
        2,
      ),
    },
    ...wholeTablePackages("music", "Music Night", 20),
    {
      eventKey: "delivery",
      key: "coffee",
      data: deliveryPackageData(
        "LUDO Signature Coffee",
        38_000,
        DeliveryCategory.BEVERAGES,
        "Coffee",
        1,
      ),
    },
    {
      eventKey: "delivery",
      key: "lychee-tea",
      data: deliveryPackageData(
        "Lychee Tea",
        32_000,
        DeliveryCategory.BEVERAGES,
        "Tea",
        2,
      ),
    },
    {
      eventKey: "delivery",
      key: "fried-rice",
      data: deliveryPackageData(
        "Nasi Goreng LUDO",
        58_000,
        DeliveryCategory.FOOD,
        "Main Course",
        3,
      ),
    },
    {
      eventKey: "delivery",
      key: "wings",
      data: deliveryPackageData(
        "LUDO Chicken Wings",
        85_000,
        DeliveryCategory.FOOD,
        "Sharing",
        4,
      ),
    },
    {
      eventKey: "delivery",
      key: "sold-out",
      data: {
        ...deliveryPackageData(
          "Sold Out Feature Sample",
          75_000,
          DeliveryCategory.FOOD,
          "Limited",
          5,
        ),
        isSoldOut: true,
      },
    },
  ];

  const packageIds = new Map<string, string>();
  for (const seed of seeds) {
    const id = seedId(`package:${seed.eventKey}:${seed.key}`);
    const data = { ...seed.data, bookingEventId: eventIds[seed.eventKey] };
    await prisma.eventPackage.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    packageIds.set(`${seed.eventKey}:${seed.key}`, id);
  }

  return packageIds;
}

function packageData(
  name: string,
  price: number,
  tableType: TableType,
  sortOrder: number,
) {
  return {
    category: null,
    description: `${name} seeded for ${tableType.replaceAll("_", " ")} booking tests.`,
    isActive: true,
    isSoldOut: false,
    name,
    posterImage: assets.heroFood,
    price,
    sortOrder,
    subCategory: null,
    tableType,
  } satisfies Omit<Prisma.EventPackageUncheckedCreateInput, "bookingEventId">;
}

function deliveryPackageData(
  name: string,
  price: number,
  category: DeliveryCategory,
  subCategory: string,
  sortOrder: number,
) {
  return {
    category,
    description: `${name} seeded for Delivery Order and \u00E0-la-carte tests.`,
    isActive: true,
    isSoldOut: false,
    name,
    posterImage: assets.heroFood,
    price,
    sortOrder,
    subCategory,
    tableType: null,
  } satisfies Omit<Prisma.EventPackageUncheckedCreateInput, "bookingEventId">;
}

function wholeTablePackages(
  eventKey: "internalMatch" | "bigMatch" | "music",
  prefix: string,
  sortOffset: number,
) {
  const definitions = [
    ["vvip", "VVIP Table", 1_800_000, TableType.VVIP],
    ["vip", "VIP Table", 1_100_000, TableType.VIP],
    ["indoor", "Indoor Table", 550_000, TableType.REGULAR_INDOOR],
    ["outdoor2", "Outdoor 2 Pax", 325_000, TableType.REGULAR_SEMI_OUTDOOR_2P],
    ["outdoor4", "Outdoor 4 Pax", 550_000, TableType.REGULAR_SEMI_OUTDOOR],
    ["barstool", "Barstool", 150_000, TableType.BARSTOOL],
  ] as const;

  return definitions.map(([key, label, price, tableType], index) => ({
    eventKey,
    key,
    data: packageData(
      `${prefix} ${label}`,
      price + sortOffset * 1_000,
      tableType,
      index + 1,
    ),
  }));
}

async function seedTables(eventIds: EventIds) {
  const tableSeeds: Array<{
    basePrice: number;
    bookedSeats?: number;
    capacity: number;
    code: string;
    eventKey: Exclude<EventKey, "regularMatch" | "delivery">;
    status?: TableStatus;
    type: TableType;
  }> = [
    ...wholeTableSeeds("internalMatch", true),
    {
      basePrice: 175_000,
      bookedSeats: 3,
      capacity: 11,
      code: "Vvip 1",
      eventKey: "community",
      type: TableType.VVIP,
    },
    {
      basePrice: 175_000,
      bookedSeats: 9,
      capacity: 9,
      code: "Vvip 2",
      eventKey: "community",
      status: TableStatus.BOOKED,
      type: TableType.VVIP,
    },
    {
      basePrice: 125_000,
      capacity: 4,
      code: "Table 10",
      eventKey: "community",
      type: TableType.REGULAR_INDOOR,
    },
    {
      basePrice: 95_000,
      capacity: 1,
      code: "A",
      eventKey: "community",
      type: TableType.BARSTOOL,
    },
    ...wholeTableSeeds("bigMatch"),
    {
      basePrice: 2_500_000,
      capacity: 11,
      code: "Vvip 1",
      eventKey: "superBigMatch",
      type: TableType.VVIP,
    },
    {
      basePrice: 1_500_000,
      capacity: 6,
      code: "Vip 12",
      eventKey: "superBigMatch",
      type: TableType.VIP,
    },
    {
      basePrice: 650_000,
      capacity: 4,
      code: "Table 10",
      eventKey: "iftar",
      type: TableType.REGULAR_INDOOR,
    },
    {
      basePrice: 650_000,
      capacity: 4,
      code: "Table 31",
      eventKey: "iftar",
      type: TableType.REGULAR_SEMI_OUTDOOR,
    },
    ...wholeTableSeeds("music"),
  ];

  const tableIds = new Map<string, string>();
  for (const seed of tableSeeds) {
    const id = seedId(`table:${seed.eventKey}:${seed.code}`);
    const data = {
      basePrice: seed.basePrice,
      bookedSeats: seed.bookedSeats ?? 0,
      bookingEventId: eventIds[seed.eventKey],
      capacity: seed.capacity,
      status: seed.status ?? TableStatus.AVAILABLE,
      tableCode: seed.code,
      tableType: seed.type,
    };
    await prisma.eventTable.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    tableIds.set(`${seed.eventKey}:${seed.code}`, id);
  }

  return tableIds;
}

function wholeTableSeeds(
  eventKey: "internalMatch" | "bigMatch" | "music",
  includeTransactionStates = false,
) {
  return [
    {
      basePrice: 1_800_000,
      capacity: 11,
      code: "Vvip 1",
      eventKey,
      type: TableType.VVIP,
    },
    {
      basePrice: 1_800_000,
      capacity: 9,
      code: "Vvip 2",
      eventKey,
      status: includeTransactionStates
        ? TableStatus.SELECTED
        : TableStatus.AVAILABLE,
      type: TableType.VVIP,
    },
    {
      basePrice: 1_100_000,
      capacity: 6,
      code: "Vip 12",
      eventKey,
      status: includeTransactionStates
        ? TableStatus.PAID
        : TableStatus.AVAILABLE,
      type: TableType.VIP,
    },
    {
      basePrice: 1_800_000,
      capacity: 11,
      code: "Vvip 3",
      eventKey,
      status: includeTransactionStates
        ? TableStatus.LOCKED
        : TableStatus.AVAILABLE,
      type: TableType.VVIP,
    },
    {
      basePrice: 550_000,
      capacity: 4,
      code: "Table 10",
      eventKey,
      type: TableType.REGULAR_INDOOR,
    },
    {
      basePrice: 150_000,
      capacity: 1,
      code: "A",
      eventKey,
      type: TableType.BARSTOOL,
    },
    {
      basePrice: 325_000,
      capacity: 2,
      code: "Table 32",
      eventKey,
      type: TableType.REGULAR_SEMI_OUTDOOR_2P,
    },
    {
      basePrice: 550_000,
      capacity: 4,
      code: "Table 31",
      eventKey,
      type: TableType.REGULAR_SEMI_OUTDOOR,
    },
  ];
}

async function seedMatches(eventIds: EventIds) {
  const schedules = [
    daysFromNow(2, 20, 30),
    daysFromNow(3, 21),
    daysFromNow(4, 19),
    daysFromNow(5, 22),
    daysFromNow(0, 20),
  ];
  const seeds: Prisma.MatchCardUncheckedCreateInput[] = [
    {
      awayTeamLogo: assets.flags.spain,
      awayTeamName: "Barcelona",
      bookingEventId: eventIds.internalMatch,
      buttonLabel: "BOOK INTERNAL",
      categoryLabel: "INTERNAL BOOKING",
      customCtaEnabled: false,
      displayMode: MatchDisplayMode.TEAM_MATCH,
      homeTeamLogo: assets.flags.england,
      homeTeamName: "Liverpool",
      isActive: true,
      leagueName: "CHAMPIONS NIGHT",
      matchCategory: EventTemplate.BIG_MATCH,
      matchDateLabel: dateLabel(schedules[0]),
      matchTimeLabel: timeLabel(schedules[0]),
      scheduledAt: schedules[0],
      sortOrder: 900,
      status: MatchStatus.BOOK,
      subTextTitle: "Full wizard + Midtrans",
      venueLocation: "LUDO Main Hall",
    },
    {
      awayTeamLogo: assets.flags.argentina,
      awayTeamName: "Argentina",
      buttonLabel: "WHATSAPP",
      categoryLabel: "CUSTOM CTA",
      customCtaColor: "#25D366",
      customCtaEnabled: true,
      customCtaIcon: "MessageCircle",
      customCtaText: "RESERVE VIA WA",
      customCtaType: MatchCtaType.WHATSAPP,
      customCtaUrl: "+62 823-1856-0003",
      displayMode: MatchDisplayMode.TEAM_MATCH,
      homeTeamLogo: assets.flags.brazil,
      homeTeamName: "Brazil",
      isActive: true,
      leagueName: "INTERNATIONAL FRIENDLY",
      matchCategory: EventTemplate.REGULER_MATCH,
      matchDateLabel: dateLabel(schedules[1]),
      matchTimeLabel: timeLabel(schedules[1]),
      scheduledAt: schedules[1],
      sortOrder: 901,
      status: MatchStatus.BOOK,
      subTextTitle: "Custom WhatsApp override",
    },
    {
      buttonLabel: "BUY TICKET",
      categoryLabel: "MUSIC + SPORTS",
      customCtaColor: "#F7C600",
      customCtaEnabled: true,
      customCtaIcon: "Ticket",
      customCtaText: "BUY DEMO TICKET",
      customCtaType: MatchCtaType.VENDOR,
      customCtaUrl: "https://example.com/",
      description:
        "General-event match card with a safe external Vendor CTA override.",
      displayMode: MatchDisplayMode.GENERAL_EVENT,
      eventImage: assets.eventDj,
      isActive: true,
      leagueName: "SPECIAL EVENT",
      matchCategory: EventTemplate.MUSIC,
      matchDateLabel: dateLabel(schedules[2]),
      matchTimeLabel: timeLabel(schedules[2]),
      scheduledAt: schedules[2],
      sortOrder: 902,
      status: MatchStatus.LIMITED,
      subTextTitle: "Custom Vendor override",
      title: "LUDO Music & Match Party",
    },
    {
      awayTeamLogo: assets.flags.germany,
      awayTeamName: "Germany",
      buttonLabel: "FULL BOOKED",
      categoryLabel: "SOLD OUT STATE",
      customCtaEnabled: false,
      displayMode: MatchDisplayMode.TEAM_MATCH,
      homeTeamLogo: assets.flags.france,
      homeTeamName: "France",
      isActive: true,
      leagueName: "EUROPE NIGHT",
      matchCategory: EventTemplate.REGULER_MATCH,
      matchDateLabel: dateLabel(schedules[3]),
      matchTimeLabel: timeLabel(schedules[3]),
      scheduledAt: schedules[3],
      showSoldOutStamp: true,
      sortOrder: 903,
      status: MatchStatus.FULL_BOOKED,
    },
    {
      buttonLabel: "CURRENTLY SHOWING",
      categoryLabel: "LIVE STATE",
      customCtaEnabled: false,
      description: "Currently-showing state for Match Card UI testing.",
      displayMode: MatchDisplayMode.GENERAL_EVENT,
      eventImage: assets.eventLive,
      isActive: true,
      leagueName: "LIVE AT LUDO",
      matchCategory: EventTemplate.REGULER_MATCH,
      matchDateLabel: "TODAY",
      matchTimeLabel: timeLabel(schedules[4]),
      scheduledAt: schedules[4],
      sortOrder: 904,
      status: MatchStatus.CURRENTLY_SHOWING,
      title: "Live Match Screening Now",
      whatsappMessage:
        "Halo LUDO, apakah masih ada tempat untuk live screening sekarang?",
    },
  ];

  for (const [index, seed] of seeds.entries()) {
    const id = seedId(`match:${index + 1}`);
    await prisma.matchCard.upsert({
      where: { id },
      update: seed,
      create: { ...seed, id },
    });
  }
}

async function seedReservations(
  eventIds: EventIds,
  packageIds: Map<string, string>,
  tableIds: Map<string, string>,
) {
  const packagePrices = {
    barstool: 150_000,
    indoor: 550_000,
    outdoor2: 325_000,
    vip: 1_100_000,
    vvip: 1_800_000,
    wings: 85_000,
  };
  const pendingTotals = computeOrderTotals(packagePrices.vvip);
  const successTotals = computeOrderTotals(
    packagePrices.vip + packagePrices.wings,
    10,
    packagePrices.wings,
  );
  const failedTotals = computeOrderTotals(packagePrices.indoor);
  const expiredTotals = computeOrderTotals(packagePrices.barstool);
  const cancelledTotals = computeOrderTotals(packagePrices.outdoor2);

  const reservations = [
    {
      key: "pending",
      data: {
        bookingEventId: eventIds.internalMatch,
        customerEmail: "pending.seed@ludo.local",
        customerName: "Seed Pending Customer",
        customerPhone: "6281111110001",
        customerRequest: "Demo pending reservation and selected table.",
        discountAmount: pendingTotals.discountAmount,
        expiredAt: daysFromNow(7, 23, 59),
        memberUsername: null,
        paymentMethod: null,
        status: ReservationStatus.PENDING,
        tax: pendingTotals.adminFee,
        taxServiceAmount: pendingTotals.taxServiceAmount,
        totalPrice: pendingTotals.grandTotal,
      },
      items: [
        {
          key: "package",
          eventPackageId: packageIds.get("internalMatch:vvip")!,
          eventTableId: tableIds.get("internalMatch:Vvip 2")!,
          price: packagePrices.vvip,
          quantity: 1,
        },
      ],
    },
    {
      key: "success",
      data: {
        bookingEventId: eventIds.internalMatch,
        customerEmail: "success.seed@ludo.local",
        customerName: "Seed Successful Member",
        customerPhone: "6281111110002",
        customerRequest: "Demo paid reservation with member and add-on.",
        discountAmount: successTotals.discountAmount,
        expiredAt: daysFromNow(1),
        fraudStatus: "accept",
        memberUsername: "demo.gold",
        paidAt: daysFromNow(-1, 19),
        paymentCallbackData: JSON.stringify({
          source: "seed",
          status_code: "200",
        }),
        paymentMethod: "qris",
        status: ReservationStatus.SUCCESS,
        tax: successTotals.adminFee,
        taxServiceAmount: successTotals.taxServiceAmount,
        totalPrice: successTotals.grandTotal,
        transactionId: "MIDTRANS-SEED-SUCCESS",
      },
      items: [
        {
          key: "package",
          eventPackageId: packageIds.get("internalMatch:vip")!,
          eventTableId: tableIds.get("internalMatch:Vip 12")!,
          price: packagePrices.vip,
          quantity: 1,
        },
        {
          key: "addon",
          eventPackageId: packageIds.get("delivery:wings")!,
          eventTableId: null,
          note: "Extra spicy seed note",
          price: packagePrices.wings,
          quantity: 1,
        },
      ],
    },
    {
      key: "failed",
      data: {
        bookingEventId: eventIds.internalMatch,
        customerEmail: "failed.seed@ludo.local",
        customerName: "Seed Failed Payment",
        customerPhone: "6281111110003",
        discountAmount: failedTotals.discountAmount,
        expiredAt: daysFromNow(-1),
        fraudStatus: "deny",
        paymentCallbackData: JSON.stringify({
          source: "seed",
          status_code: "202",
        }),
        paymentMethod: "bank_transfer",
        status: ReservationStatus.FAILED,
        tax: failedTotals.adminFee,
        taxServiceAmount: failedTotals.taxServiceAmount,
        totalPrice: failedTotals.grandTotal,
        transactionId: "MIDTRANS-SEED-FAILED",
      },
      items: [
        {
          key: "package",
          eventPackageId: packageIds.get("internalMatch:indoor")!,
          eventTableId: null,
          price: packagePrices.indoor,
          quantity: 1,
        },
      ],
    },
    {
      key: "expired",
      data: {
        bookingEventId: eventIds.internalMatch,
        customerEmail: "expired.seed@ludo.local",
        customerName: "Seed Expired Reservation",
        customerPhone: "6281111110004",
        discountAmount: expiredTotals.discountAmount,
        expiredAt: daysFromNow(-2),
        paymentMethod: null,
        status: ReservationStatus.EXPIRED,
        tax: expiredTotals.adminFee,
        taxServiceAmount: expiredTotals.taxServiceAmount,
        totalPrice: expiredTotals.grandTotal,
      },
      items: [
        {
          key: "package",
          eventPackageId: packageIds.get("internalMatch:barstool")!,
          eventTableId: null,
          price: packagePrices.barstool,
          quantity: 1,
        },
      ],
    },
    {
      key: "cancelled",
      data: {
        bookingEventId: eventIds.internalMatch,
        customerEmail: "cancelled.seed@ludo.local",
        customerName: "Seed Cancelled Reservation",
        customerPhone: "6281111110005",
        discountAmount: cancelledTotals.discountAmount,
        expiredAt: daysFromNow(-1),
        paymentMethod: "gopay",
        status: ReservationStatus.CANCELLED,
        tax: cancelledTotals.adminFee,
        taxServiceAmount: cancelledTotals.taxServiceAmount,
        totalPrice: cancelledTotals.grandTotal,
        transactionId: "MIDTRANS-SEED-CANCELLED",
      },
      items: [
        {
          key: "package",
          eventPackageId: packageIds.get("internalMatch:outdoor2")!,
          eventTableId: null,
          price: packagePrices.outdoor2,
          quantity: 1,
        },
      ],
    },
  ] satisfies Array<{
    data: Prisma.ReservationUncheckedCreateInput;
    items: Array<{
      eventPackageId: string;
      eventTableId: string | null;
      key: string;
      note?: string;
      price: number;
      quantity: number;
    }>;
    key: string;
  }>;

  for (const reservation of reservations) {
    const id = `LUDO-SEED-${reservation.key.toUpperCase()}`;
    await prisma.reservation.upsert({
      where: { id },
      update: reservation.data,
      create: { id, ...reservation.data },
    });

    for (const item of reservation.items) {
      const itemId = seedId(`order:${reservation.key}:${item.key}`);
      const itemData = {
        eventPackageId: item.eventPackageId,
        eventTableId: item.eventTableId,
        note: "note" in item ? item.note : undefined,
        price: item.price,
        quantity: item.quantity,
      };
      await prisma.orderItem.upsert({
        where: { id: itemId },
        update: { ...itemData, reservationId: id },
        create: { id: itemId, ...itemData, reservationId: id },
      });
    }
  }
}

async function seedSummary(mediaSummary: {
  localVideoCount: number;
  seededVideoCount: number;
  usedRemoteFallback: boolean;
}) {
  const [
    activeHeroes,
    activeMatches,
    activeEvents,
    packages,
    tables,
    reservations,
    activeMembers,
    activeGallery,
  ] = await Promise.all([
    prisma.heroSection.count({ where: { isActive: true } }),
    prisma.matchCard.count({ where: { isActive: true } }),
    prisma.bookingEvent.count({ where: { isActive: true } }),
    prisma.eventPackage.count({ where: { isActive: true } }),
    prisma.eventTable.count(),
    prisma.reservation.count(),
    prisma.member.count({ where: { isActive: true } }),
    prisma.galleryItem.count({ where: { isActive: true } }),
  ]);

  console.log(
    "\nLUDO comprehensive seed completed (non-destructive upsert).\n",
  );
  console.table({
    activeEvents,
    activeGallery,
    activeHeroes,
    activeMatches,
    activeMembers,
    packages,
    reservations,
    tables,
  });
  console.log(`Admin   : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Member  : demo.gold / ${MEMBER_PASSWORD} (10% discount)`);
  console.log(`Member  : demo.community / ${MEMBER_PASSWORD} (5% discount)`);
  console.log(
    `Gallery : ${mediaSummary.seededVideoCount} seeded video item(s)`,
  );
  if (mediaSummary.usedRemoteFallback) {
    console.warn(
      "No local video was found in public/uploads; the gallery seed uses the MDN CC0 sample-video fallback.",
    );
  } else {
    console.log(
      `Gallery : using ${mediaSummary.localVideoCount} local video file(s) from public/uploads`,
    );
  }
  console.log("Run this seed again safely with: npm run db:seed\n");
}

async function main() {
  assertLocalSeedTarget();
  await seedAccounts();
  await seedSettingsAndCms();
  const mediaSummary = await seedMediaAndGallery();
  const eventIds = await seedEvents();
  const packageIds = await seedPackages(eventIds);
  const tableIds = await seedTables(eventIds);
  await seedMatches(eventIds);
  await seedReservations(eventIds, packageIds, tableIds);
  await seedSummary(mediaSummary);
}

main()
  .catch((error) => {
    console.error("LUDO seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
