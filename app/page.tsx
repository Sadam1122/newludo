import { BrandSection } from "@/components/public/BrandSection";
import { EventBanner } from "@/components/public/EventBanner";
import { FAQSection } from "@/components/public/FAQSection";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { HeroSection } from "@/components/public/HeroSection";
import { LocationSection } from "@/components/public/LocationSection";
import { MatchSection } from "@/components/public/MatchSection";
import type {
  BrandSection as BrandSectionModel,
  EventBanner as EventBannerModel,
  FAQItem,
  HeroSection as HeroSectionModel,
  LocationSetting,
  MatchCard,
  SiteSetting,
} from "@prisma/client";
import type {
  PublicBrand,
  PublicEvent,
  PublicFAQ,
  PublicHero,
  PublicLocation,
  PublicMatch,
  PublicSettings,
} from "@/components/public/types";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_WHATSAPP_MESSAGE,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: PublicSettings = {
  siteName: "LUDO Sports Kitchen & Coffee",
  siteTagline: "EAT \u00B7 WATCH \u00B7 CONNECT",
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  defaultWhatsappMessage: DEFAULT_WHATSAPP_MESSAGE,
  instagramHandle: "@ludosportskitchen",
  instagramUrl: "https://www.instagram.com/ludosportskitchen/",
  tiktokHandle: "@ludosportskitchen",
  tiktokUrl: "https://www.tiktok.com/@ludosportskitchen",
  menuUrl:
    "https://drive.google.com/drive/folders/1qvRivb-6awFzYvzaCEP9H0NbM3EIcU9r",
  footerCopyright:
    "\u00A9 2026 LUDO SPORTS KITCHEN & COFFEE. ALL RIGHTS RESERVED.",
};

const DEFAULT_HEROES: PublicHero[] = [
  {
    id: "default-hero-1",
    headlineLine1: "BIG",
    headlineHighlight1: "MATCH,",
    headlineLine2: "BIG",
    headlineHighlight2: "FLAVOR.",
    subtitle: "Nonton seru, makan enak, suasana maksimal.",
    ctaLabel: "BOOK YOUR TABLE NOW",
    ctaWhatsappMessage: DEFAULT_WHATSAPP_MESSAGE,
    backgroundImage: "/uploads/hero-sports-night.png",
  },
  {
    id: "default-hero-2",
    headlineLine1: "WORLD CUP",
    headlineHighlight1: "NIGHT,",
    headlineLine2: "HOT",
    headlineHighlight2: "TABLE.",
    subtitle:
      "Reserve bareng squad, pilih match favorit, nikmati food sharing LUDO.",
    ctaLabel: "RESERVE YOUR SQUAD",
    ctaWhatsappMessage:
      "Halo LUDO, saya ingin reservasi meja untuk nonton Pildun.",
    backgroundImage: "/uploads/hero-food-match.png",
  },
];

const DEFAULT_FLAGS = {
  argentina: "/uploads/flag-argentina.svg",
  brazil: "/uploads/flag-brazil.svg",
  england: "/uploads/flag-england.svg",
  france: "/uploads/flag-france.svg",
  germany: "/uploads/flag-germany.svg",
  netherlands: "/uploads/flag-netherlands.svg",
  portugal: "/uploads/flag-portugal.svg",
  spain: "/uploads/flag-spain.svg",
};

const DEFAULT_MATCHES: PublicMatch[] = [
  {
    id: "default-match-1",
    leagueName: "PILDUN 2026",
    homeTeamName: "England",
    awayTeamName: "Spain",
    homeTeamLogo: DEFAULT_FLAGS.england,
    awayTeamLogo: DEFAULT_FLAGS.spain,
    matchDateLabel: "FRI",
    matchTimeLabel: "22:00",
    status: "BOOK",
    buttonLabel: "BOOK",
    whatsappMessage: "Halo LUDO, saya ingin booking match England vs Spain.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-2",
    leagueName: "PILDUN 2026",
    homeTeamName: "Brazil",
    awayTeamName: "Argentina",
    homeTeamLogo: DEFAULT_FLAGS.brazil,
    awayTeamLogo: DEFAULT_FLAGS.argentina,
    matchDateLabel: "SAT",
    matchTimeLabel: "01:00",
    status: "LIMITED",
    buttonLabel: "ONLY 2 TABLES LEFT",
    whatsappMessage: "Halo LUDO, saya ingin booking match Brazil vs Argentina.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-3",
    leagueName: "PILDUN 2026",
    homeTeamName: "France",
    awayTeamName: "Germany",
    homeTeamLogo: DEFAULT_FLAGS.france,
    awayTeamLogo: DEFAULT_FLAGS.germany,
    matchDateLabel: "SAT",
    matchTimeLabel: "22:00",
    status: "FULL_BOOKED",
    buttonLabel: "FULL BOOKED",
    whatsappMessage: null,
    showSoldOutStamp: true,
  },
  {
    id: "default-match-4",
    leagueName: "PILDUN 2026",
    homeTeamName: "Netherlands",
    awayTeamName: "Portugal",
    homeTeamLogo: DEFAULT_FLAGS.netherlands,
    awayTeamLogo: DEFAULT_FLAGS.portugal,
    matchDateLabel: "SUN",
    matchTimeLabel: "02:00",
    status: "CURRENTLY_SHOWING",
    buttonLabel: "CURRENTLY SHOWING",
    whatsappMessage:
      "Halo LUDO, saya ingin booking match Netherlands vs Portugal.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-5",
    leagueName: "PILDUN 2026",
    homeTeamName: "Spain",
    awayTeamName: "Germany",
    homeTeamLogo: DEFAULT_FLAGS.spain,
    awayTeamLogo: DEFAULT_FLAGS.germany,
    matchDateLabel: "MON",
    matchTimeLabel: "23:00",
    status: "BOOK",
    buttonLabel: "BOOK",
    whatsappMessage: "Halo LUDO, saya ingin booking match Spain vs Germany.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-6",
    leagueName: "PILDUN 2026",
    homeTeamName: "Brazil",
    awayTeamName: "England",
    homeTeamLogo: DEFAULT_FLAGS.brazil,
    awayTeamLogo: DEFAULT_FLAGS.england,
    matchDateLabel: "TUE",
    matchTimeLabel: "02:00",
    status: "LIMITED",
    buttonLabel: "LIMITED SEATS",
    whatsappMessage: "Halo LUDO, saya ingin booking match Brazil vs England.",
    showSoldOutStamp: false,
  },
];

const DEFAULT_EVENTS: PublicEvent[] = [
  {
    id: "default-event-1",
    title: "Live Performance",
    artistName: "AGNES MONICA",
    eventDateLabel: "FRIDAY, 25 APRIL",
    eventTimeLabel: "START 9PM TILL DROP",
    eventTypeLabel: "LIVE PERFORMANCE",
    headlineLine1: "FROM",
    headlineHighlight1: "DAYTIME.",
    headlineLine2: "NIGHT",
    headlineHighlight2: "VIBES.",
    backgroundImage: "/uploads/event-live-night.png",
    ctaLabel: "RESERVE SEAT",
    whatsappMessage:
      "Halo LUDO, saya ingin reservasi seat untuk event Agnes Monica.",
  },
  {
    id: "default-event-2",
    title: "Match Night",
    artistName: "LUDO CROWD",
    eventDateLabel: "SATURDAY, 26 APRIL",
    eventTimeLabel: "START 8PM TILL LATE",
    eventTypeLabel: "MATCH NIGHT",
    headlineLine1: "BIG",
    headlineHighlight1: "SCREEN.",
    headlineLine2: "LOUD",
    headlineHighlight2: "CROWD.",
    backgroundImage: "/uploads/event-dj-night.png",
    ctaLabel: "RESERVE TABLE",
    whatsappMessage: "Halo LUDO, saya ingin reservasi table untuk match night.",
  },
];

const DEFAULT_LOCATION: PublicLocation = {
  businessName: "LUDO Sports Kitchen & Coffee",
  address:
    "Jl. Kiara Artha No.C23 Blok F6B 4, Kec. Batununggal, Kota Bandung, Jawa Barat",
  mapImage: null,
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=LUDO%20Sports%20Kitchen%20%26%20Coffee%20Kiara%20Artha%20Bandung",
  instagramHandle: "@ludosportskitchen",
  instagramUrl: "https://www.instagram.com/ludosportskitchen/",
  tiktokHandle: "@ludosportskitchen",
  tiktokUrl: "https://www.tiktok.com/@ludosportskitchen",
};

const DEFAULT_BRAND: PublicBrand = {
  titleBeforeHighlight: "TRUSTED BY",
  titleHighlight: "LEADING BRANDS",
  subtitle: "Official Brand Partner",
  brandName: "Coca-Cola",
  brandLogo: "/uploads/coca-cola-logo.svg",
  bottomText: "EXCLUSIVE COLLABORATION",
};

const DEFAULT_FAQS: PublicFAQ[] = [
  {
    id: "default-faq-1",
    question: "Bagaimana cara melakukan reservasi di Ludo?",
    answer:
      "Reservasi dapat dilakukan langsung melalui WhatsApp resmi LUDO. Klik tombol booking, lalu tim kami akan membantu konfirmasi ketersediaan meja.",
  },
  {
    id: "default-faq-2",
    question: "Apakah bisa request area atau meja tertentu?",
    answer:
      "Bisa, selama area atau meja yang diminta masih tersedia. Permintaan khusus dapat dituliskan saat menghubungi WhatsApp.",
  },
  {
    id: "default-faq-3",
    question: "Jika sudah reservasi, apakah bisa pindah meja saat di lokasi?",
    answer:
      "Bisa ditanyakan langsung kepada tim di lokasi. Perpindahan meja menyesuaikan ketersediaan dan kondisi operasional saat itu.",
  },
  {
    id: "default-faq-4",
    question: "Apakah bisa mengubah pesanan/menu setelah reservasi?",
    answer:
      "Perubahan pesanan atau menu dapat dikonfirmasi melalui WhatsApp atau langsung kepada tim LUDO, selama masih memungkinkan secara operasional.",
  },
  {
    id: "default-faq-5",
    question: "Apakah Ludo bisa untuk event seperti gathering atau meeting?",
    answer:
      "Bisa. Untuk gathering, meeting, komunitas, atau event khusus, silakan hubungi WhatsApp LUDO agar tim kami dapat membantu kebutuhan acara.",
  },
];

type HomepageContent = readonly [
  SiteSetting | null,
  HeroSectionModel[],
  MatchCard[],
  EventBannerModel[],
  LocationSetting | null,
  FAQItem[],
  BrandSectionModel | null,
];

export default async function HomePage() {
  const [settings, heroes, matches, events, location, faqs, brand] =
    await getHomepageContent();

  const publicSettings: PublicSettings = {
    siteName: settings?.siteName ?? DEFAULT_SETTINGS.siteName,
    siteTagline: settings?.siteTagline ?? DEFAULT_SETTINGS.siteTagline,
    whatsappNumber: settings?.whatsappNumber ?? DEFAULT_SETTINGS.whatsappNumber,
    defaultWhatsappMessage:
      settings?.defaultWhatsappMessage ??
      DEFAULT_SETTINGS.defaultWhatsappMessage,
    instagramHandle:
      settings?.instagramHandle ?? DEFAULT_SETTINGS.instagramHandle,
    instagramUrl: settings?.instagramUrl ?? DEFAULT_SETTINGS.instagramUrl,
    tiktokHandle: settings?.tiktokHandle ?? DEFAULT_SETTINGS.tiktokHandle,
    tiktokUrl: settings?.tiktokUrl ?? DEFAULT_SETTINGS.tiktokUrl,
    menuUrl: settings?.menuUrl ?? DEFAULT_SETTINGS.menuUrl,
    footerCopyright:
      settings?.footerCopyright ?? DEFAULT_SETTINGS.footerCopyright,
  };

  const publicHeroes: PublicHero[] =
    heroes.length > 0
      ? heroes.map((hero) => ({
          id: hero.id,
          headlineLine1: hero.headlineLine1,
          headlineHighlight1: hero.headlineHighlight1,
          headlineLine2: hero.headlineLine2,
          headlineHighlight2: hero.headlineHighlight2,
          subtitle: hero.subtitle,
          ctaLabel: hero.ctaLabel,
          ctaWhatsappMessage: hero.ctaWhatsappMessage,
          backgroundImage: hero.backgroundImage,
        }))
      : DEFAULT_HEROES;

  const publicMatches: PublicMatch[] =
    matches.length > 0
      ? matches.map((match) => ({
          id: match.id,
          leagueName: match.leagueName,
          homeTeamName: match.homeTeamName,
          awayTeamName: match.awayTeamName,
          homeTeamLogo: match.homeTeamLogo,
          awayTeamLogo: match.awayTeamLogo,
          matchDateLabel: match.matchDateLabel,
          matchTimeLabel: match.matchTimeLabel,
          status: match.status,
          buttonLabel: match.buttonLabel,
          whatsappMessage: match.whatsappMessage,
          showSoldOutStamp: match.showSoldOutStamp,
        }))
      : DEFAULT_MATCHES;

  const publicEvents: PublicEvent[] =
    events.length > 0
      ? events.map((event) => ({
          id: event.id,
          title: event.title,
          artistName: event.artistName,
          eventDateLabel: event.eventDateLabel,
          eventTimeLabel: event.eventTimeLabel,
          eventTypeLabel: event.eventTypeLabel,
          headlineLine1: event.headlineLine1,
          headlineHighlight1: event.headlineHighlight1,
          headlineLine2: event.headlineLine2,
          headlineHighlight2: event.headlineHighlight2,
          backgroundImage: event.backgroundImage,
          ctaLabel: event.ctaLabel,
          whatsappMessage: event.whatsappMessage,
        }))
      : DEFAULT_EVENTS;

  const publicLocation: PublicLocation = location
    ? {
        businessName: location.businessName,
        address: location.address,
        mapImage: location.mapImage,
        mapUrl: location.mapUrl,
        instagramHandle: location.instagramHandle,
        instagramUrl: location.instagramUrl,
        tiktokHandle: location.tiktokHandle,
        tiktokUrl: location.tiktokUrl,
      }
    : DEFAULT_LOCATION;

  const publicFaqs: PublicFAQ[] =
    faqs.length > 0
      ? faqs.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        }))
      : DEFAULT_FAQS;

  const publicBrand: PublicBrand = brand
    ? {
        titleBeforeHighlight: brand.titleBeforeHighlight,
        titleHighlight: brand.titleHighlight,
        subtitle: brand.subtitle,
        brandName: brand.brandName,
        brandLogo: brand.brandLogo ?? DEFAULT_BRAND.brandLogo,
        bottomText: brand.bottomText,
      }
    : DEFAULT_BRAND;

  return (
    <main className="min-h-screen bg-[#050505] text-[#F8EDE7]">
      <Header
        siteName={publicSettings.siteName}
        tagline={publicSettings.siteTagline}
        whatsappNumber={publicSettings.whatsappNumber}
        defaultWhatsappMessage={publicSettings.defaultWhatsappMessage}
        menuUrl={publicSettings.menuUrl}
      />
      <MatchSection
        matches={publicMatches}
        whatsappNumber={publicSettings.whatsappNumber}
        defaultMessage={publicSettings.defaultWhatsappMessage}
      />
      <HeroSection
        heroes={publicHeroes}
        siteName={publicSettings.siteName}
        whatsappNumber={publicSettings.whatsappNumber}
      />
      <EventBanner
        events={publicEvents}
        whatsappNumber={publicSettings.whatsappNumber}
        defaultMessage={publicSettings.defaultWhatsappMessage}
      />
      <LocationSection location={publicLocation} />
      <FAQSection faqs={publicFaqs} />
      <BrandSection brand={publicBrand} />
      <Footer copyright={publicSettings.footerCopyright} />
    </main>
  );
}

async function getHomepageContent(): Promise<HomepageContent> {
  try {
    return await Promise.all([
      prisma.siteSetting.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.heroSection.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.matchCard.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.eventBanner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.locationSetting.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.fAQItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.brandSection.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);
  } catch {
    console.warn("Unable to load public CMS content. Rendering fallback data.");
    return [null, [], [], [], null, [], null];
  }
}
