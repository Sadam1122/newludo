import bcrypt from "bcrypt";
import { MatchStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const menuUrl =
  "https://drive.google.com/drive/folders/1qvRivb-6awFzYvzaCEP9H0NbM3EIcU9r";
const legacyHeroImage = "/uploads/bg-home.JPG";
const legacyEventImage = "/uploads/bg-section3.JPG";
const heroSportsNightImage = "/uploads/hero-sports-night.png";
const heroFoodMatchImage = "/uploads/hero-food-match.png";
const eventLiveNightImage = "/uploads/event-live-night.png";
const eventDjNightImage = "/uploads/event-dj-night.png";
const brandLogo = "/uploads/coca-cola-logo.svg";
const flags = {
  argentina: "/uploads/flag-argentina.svg",
  brazil: "/uploads/flag-brazil.svg",
  england: "/uploads/flag-england.svg",
  france: "/uploads/flag-france.svg",
  germany: "/uploads/flag-germany.svg",
  netherlands: "/uploads/flag-netherlands.svg",
  portugal: "/uploads/flag-portugal.svg",
  spain: "/uploads/flag-spain.svg",
};

async function main() {
  const passwordHash = await bcrypt.hash("AdminLudo123!", 12);

  await prisma.adminUser.upsert({
    where: { email: "admin@ludo.local" },
    update: {
      passwordHash,
      name: "LUDO Admin",
      role: "ADMIN",
    },
    create: {
      email: "admin@ludo.local",
      passwordHash,
      name: "LUDO Admin",
      role: "ADMIN",
    },
  });

  await prisma.siteSetting.deleteMany();
  await prisma.siteSetting.create({
    data: {
      siteName: "LUDO Sports Kitchen & Coffee",
      siteTagline: "EAT \u00B7 WATCH \u00B7 CONNECT",
      whatsappNumber: "6282318560003",
      defaultWhatsappMessage: "Halo LUDO, saya ingin reservasi meja.",
      instagramHandle: "@ludosportskitchen",
      instagramUrl: "https://www.instagram.com/ludosportskitchen/",
      tiktokHandle: "@ludosportskitchen",
      tiktokUrl: "https://www.tiktok.com/@ludosportskitchen",
      menuUrl,
      footerCopyright:
        "\u00A9 2026 LUDO SPORTS KITCHEN & COFFEE. ALL RIGHTS RESERVED.",
    },
  });

  await prisma.matchCard.deleteMany();
  await prisma.matchCard.createMany({
    data: [
      {
        leagueName: "PILDUN 2026",
        homeTeamName: "England",
        awayTeamName: "Spain",
        homeTeamLogo: flags.england,
        awayTeamLogo: flags.spain,
        matchDateLabel: "FRI",
        matchTimeLabel: "22:00",
        status: MatchStatus.BOOK,
        buttonLabel: "BOOK",
        whatsappMessage:
          "Halo LUDO, saya ingin booking match England vs Spain.",
        sortOrder: 1,
      },
      {
        leagueName: "PILDUN 2026",
        homeTeamName: "Brazil",
        awayTeamName: "Argentina",
        homeTeamLogo: flags.brazil,
        awayTeamLogo: flags.argentina,
        matchDateLabel: "SAT",
        matchTimeLabel: "01:00",
        status: MatchStatus.LIMITED,
        buttonLabel: "ONLY 2 TABLES LEFT",
        whatsappMessage:
          "Halo LUDO, saya ingin booking match Brazil vs Argentina.",
        sortOrder: 2,
      },
      {
        leagueName: "PILDUN 2026",
        homeTeamName: "France",
        awayTeamName: "Germany",
        homeTeamLogo: flags.france,
        awayTeamLogo: flags.germany,
        matchDateLabel: "SAT",
        matchTimeLabel: "22:00",
        status: MatchStatus.FULL_BOOKED,
        buttonLabel: "FULL BOOKED",
        showSoldOutStamp: true,
        sortOrder: 3,
      },
      {
        leagueName: "PILDUN 2026",
        homeTeamName: "Netherlands",
        awayTeamName: "Portugal",
        homeTeamLogo: flags.netherlands,
        awayTeamLogo: flags.portugal,
        matchDateLabel: "SUN",
        matchTimeLabel: "02:00",
        status: MatchStatus.CURRENTLY_SHOWING,
        buttonLabel: "CURRENTLY SHOWING",
        whatsappMessage:
          "Halo LUDO, saya ingin booking match Netherlands vs Portugal.",
        sortOrder: 4,
      },
      {
        leagueName: "PILDUN 2026",
        homeTeamName: "Spain",
        awayTeamName: "Germany",
        homeTeamLogo: flags.spain,
        awayTeamLogo: flags.germany,
        matchDateLabel: "MON",
        matchTimeLabel: "23:00",
        status: MatchStatus.BOOK,
        buttonLabel: "BOOK",
        whatsappMessage:
          "Halo LUDO, saya ingin booking match Spain vs Germany.",
        sortOrder: 5,
      },
      {
        leagueName: "PILDUN 2026",
        homeTeamName: "Brazil",
        awayTeamName: "England",
        homeTeamLogo: flags.brazil,
        awayTeamLogo: flags.england,
        matchDateLabel: "TUE",
        matchTimeLabel: "02:00",
        status: MatchStatus.LIMITED,
        buttonLabel: "LIMITED SEATS",
        whatsappMessage:
          "Halo LUDO, saya ingin booking match Brazil vs England.",
        sortOrder: 6,
      },
    ],
  });

  await prisma.heroSection.deleteMany();
  await prisma.heroSection.createMany({
    data: [
      {
        headlineLine1: "BIG",
        headlineHighlight1: "MATCH,",
        headlineLine2: "BIG",
        headlineHighlight2: "FLAVOR.",
        subtitle: "Nonton seru, makan enak, suasana maksimal.",
        ctaLabel: "BOOK YOUR TABLE NOW",
        ctaWhatsappMessage: "Halo LUDO, saya ingin reservasi meja.",
        backgroundImage: heroSportsNightImage,
      },
      {
        headlineLine1: "WORLD CUP",
        headlineHighlight1: "NIGHT,",
        headlineLine2: "HOT",
        headlineHighlight2: "TABLE.",
        subtitle:
          "Reserve bareng squad, pilih match favorit, nikmati food sharing LUDO.",
        ctaLabel: "RESERVE YOUR SQUAD",
        ctaWhatsappMessage:
          "Halo LUDO, saya ingin reservasi meja untuk nonton Pildun.",
        backgroundImage: heroFoodMatchImage,
      },
    ],
  });

  await prisma.eventBanner.deleteMany();
  await prisma.eventBanner.createMany({
    data: [
      {
        title: "Live Performance",
        artistName: "AGNES MONICA",
        eventDateLabel: "FRIDAY, 25 APRIL",
        eventTimeLabel: "START 9PM TILL DROP",
        eventTypeLabel: "LIVE PERFORMANCE",
        headlineLine1: "FROM",
        headlineHighlight1: "DAYTIME.",
        headlineLine2: "NIGHT",
        headlineHighlight2: "VIBES.",
        backgroundImage: eventLiveNightImage,
        ctaLabel: "RESERVE SEAT",
        whatsappMessage:
          "Halo LUDO, saya ingin reservasi seat untuk event Agnes Monica.",
        sortOrder: 1,
      },
      {
        title: "DJ Night",
        artistName: "LUDO NIGHT",
        eventDateLabel: "SATURDAY, 26 APRIL",
        eventTimeLabel: "START 8PM TILL LATE",
        eventTypeLabel: "DJ NIGHT",
        headlineLine1: "LIVE",
        headlineHighlight1: "BEATS.",
        headlineLine2: "RED",
        headlineHighlight2: "LIGHTS.",
        backgroundImage: eventDjNightImage,
        ctaLabel: "RESERVE NIGHT",
        whatsappMessage:
          "Halo LUDO, saya ingin reservasi seat untuk DJ Night LUDO.",
        sortOrder: 2,
      },
    ],
  });

  await prisma.locationSetting.deleteMany();
  await prisma.locationSetting.create({
    data: {
      businessName: "LUDO Sports Kitchen & Coffee",
      address:
        "Jl. Kiara Artha No.C23 Blok F6B 4, Kec. Batununggal, Kota Bandung, Jawa Barat",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=LUDO%20Sports%20Kitchen%20%26%20Coffee%20Kiara%20Artha%20Bandung",
      instagramHandle: "@ludosportskitchen",
      instagramUrl: "https://www.instagram.com/ludosportskitchen/",
      tiktokHandle: "@ludosportskitchen",
      tiktokUrl: "https://www.tiktok.com/@ludosportskitchen",
    },
  });

  await prisma.fAQItem.deleteMany();
  await prisma.fAQItem.createMany({
    data: [
      {
        question: "Bagaimana cara melakukan reservasi di Ludo?",
        answer:
          "Reservasi dapat dilakukan langsung melalui WhatsApp resmi LUDO. Klik tombol booking, lalu tim kami akan membantu konfirmasi ketersediaan meja.",
        sortOrder: 1,
      },
      {
        question: "Apakah bisa request area atau meja tertentu?",
        answer:
          "Bisa, selama area atau meja yang diminta masih tersedia. Permintaan khusus dapat dituliskan saat menghubungi WhatsApp.",
        sortOrder: 2,
      },
      {
        question:
          "Jika sudah reservasi, apakah bisa pindah meja saat di lokasi?",
        answer:
          "Bisa ditanyakan langsung kepada tim di lokasi. Perpindahan meja menyesuaikan ketersediaan dan kondisi operasional saat itu.",
        sortOrder: 3,
      },
      {
        question: "Apakah bisa mengubah pesanan/menu setelah reservasi?",
        answer:
          "Perubahan pesanan atau menu dapat dikonfirmasi melalui WhatsApp atau langsung kepada tim LUDO, selama masih memungkinkan secara operasional.",
        sortOrder: 4,
      },
      {
        question:
          "Apakah Ludo bisa untuk event seperti gathering atau meeting?",
        answer:
          "Bisa. Untuk gathering, meeting, komunitas, atau event khusus, silakan hubungi WhatsApp LUDO agar tim kami dapat membantu kebutuhan acara.",
        sortOrder: 5,
      },
    ],
  });

  await prisma.brandSection.deleteMany();
  await prisma.brandSection.create({
    data: {
      titleBeforeHighlight: "TRUSTED BY",
      titleHighlight: "LEADING BRANDS",
      subtitle: "Official Brand Partner",
      brandName: "Coca-Cola",
      brandLogo,
      bottomText: "EXCLUSIVE COLLABORATION",
    },
  });

  await prisma.mediaFile.deleteMany({
    where: {
      url: {
        in: [
          legacyHeroImage,
          legacyEventImage,
          heroSportsNightImage,
          heroFoodMatchImage,
          eventLiveNightImage,
          eventDjNightImage,
          brandLogo,
          ...Object.values(flags),
        ],
      },
    },
  });
  await prisma.mediaFile.createMany({
    data: [
      {
        filename: "bg-home.JPG",
        url: legacyHeroImage,
        mimeType: "image/jpeg",
        size: 795961,
      },
      {
        filename: "bg-section3.JPG",
        url: legacyEventImage,
        mimeType: "image/jpeg",
        size: 806757,
      },
      {
        filename: "hero-sports-night.png",
        url: heroSportsNightImage,
        mimeType: "image/png",
        size: 1556402,
      },
      {
        filename: "hero-food-match.png",
        url: heroFoodMatchImage,
        mimeType: "image/png",
        size: 1761720,
      },
      {
        filename: "event-live-night.png",
        url: eventLiveNightImage,
        mimeType: "image/png",
        size: 1467313,
      },
      {
        filename: "event-dj-night.png",
        url: eventDjNightImage,
        mimeType: "image/png",
        size: 1810495,
      },
      {
        filename: "coca-cola-logo.svg",
        url: brandLogo,
        mimeType: "image/svg+xml",
        size: 617,
      },
      {
        filename: "flag-argentina.svg",
        url: flags.argentina,
        mimeType: "image/svg+xml",
        size: 334,
      },
      {
        filename: "flag-brazil.svg",
        url: flags.brazil,
        mimeType: "image/svg+xml",
        size: 388,
      },
      {
        filename: "flag-england.svg",
        url: flags.england,
        mimeType: "image/svg+xml",
        size: 248,
      },
      {
        filename: "flag-france.svg",
        url: flags.france,
        mimeType: "image/svg+xml",
        size: 295,
      },
      {
        filename: "flag-germany.svg",
        url: flags.germany,
        mimeType: "image/svg+xml",
        size: 274,
      },
      {
        filename: "flag-netherlands.svg",
        url: flags.netherlands,
        mimeType: "image/svg+xml",
        size: 278,
      },
      {
        filename: "flag-portugal.svg",
        url: flags.portugal,
        mimeType: "image/svg+xml",
        size: 335,
      },
      {
        filename: "flag-spain.svg",
        url: flags.spain,
        mimeType: "image/svg+xml",
        size: 293,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
