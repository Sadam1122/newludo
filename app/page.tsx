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
import type { Metadata } from "next";
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
import { getJakartaStartOfToday, isUpcomingOrUndated } from "@/lib/schedule";
import {
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  buildHomepageJsonLd,
  buildSeoDescription,
  seoKeywords,
} from "@/lib/seo";
import {
  DEFAULT_WHATSAPP_MESSAGE,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, heroes, , , location] = await getHomepageContent();
  const siteName = settings?.siteName ?? DEFAULT_SETTINGS.siteName;
  const siteTagline = settings?.siteTagline ?? DEFAULT_SETTINGS.siteTagline;
  const description = buildSeoDescription({
    siteName,
    siteTagline,
    address: location?.address ?? DEFAULT_LOCATION.address,
  });
  const heroImage =
    heroes.find((hero) => hero.backgroundImage)?.backgroundImage ??
    DEFAULT_HEROES.find((hero) => hero.backgroundImage)?.backgroundImage ??
    DEFAULT_OG_IMAGE;

  return {
    title: `${siteName} | Sports Kitchen & Coffee Bandung`,
    description,
    keywords: seoKeywords,
    alternates: {
      canonical: absoluteUrl("/"),
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: absoluteUrl("/"),
      siteName,
      title: `${siteName} | Sports Kitchen & Coffee Bandung`,
      description,
      images: [
        {
          url: absoluteUrl(heroImage),
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Sports Kitchen & Coffee Bandung`,
      description,
      images: [absoluteUrl(heroImage)],
    },
  };
}

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
  matchSectionTitle: "THIS WEEK MATCH",
  headerBookingLabel: "WhatsApp",
  headerBookingUrl: null,
  headerBookingVisible: true,
  eventMiceLabel: "Event / MICE",
  eventMiceUrl: "/event-mice",
  eventMiceVisible: true,
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
    backgroundImage: "/uploads/hero-1-ls.jpeg",
    portraitImage: "/uploads/hero-1-pt.jpeg",
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
    portraitImage: null,
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
    displayMode: "TEAM_MATCH",
    leagueName: "PILDUN 2026",
    title: null,
    categoryLabel: null,
    description: null,
    eventImage: null,
    homeTeamName: "England",
    awayTeamName: "Spain",
    homeTeamLogo: DEFAULT_FLAGS.england,
    awayTeamLogo: DEFAULT_FLAGS.spain,
    matchDateLabel: "FRI",
    matchTimeLabel: "22:00",
    scheduledAt: null,
    status: "BOOK",
    buttonLabel: "BOOK",
    subTextTitle: null,
    whatsappMessage: "Halo LUDO, saya ingin booking match England vs Spain.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-2",
    displayMode: "TEAM_MATCH",
    leagueName: "PILDUN 2026",
    title: null,
    categoryLabel: null,
    description: null,
    eventImage: null,
    homeTeamName: "Brazil",
    awayTeamName: "Argentina",
    homeTeamLogo: DEFAULT_FLAGS.brazil,
    awayTeamLogo: DEFAULT_FLAGS.argentina,
    matchDateLabel: "SAT",
    matchTimeLabel: "01:00",
    scheduledAt: null,
    status: "LIMITED",
    buttonLabel: "ONLY 2 TABLES LEFT",
    subTextTitle: null,
    whatsappMessage: "Halo LUDO, saya ingin booking match Brazil vs Argentina.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-3",
    displayMode: "TEAM_MATCH",
    leagueName: "PILDUN 2026",
    title: null,
    categoryLabel: null,
    description: null,
    eventImage: null,
    homeTeamName: "France",
    awayTeamName: "Germany",
    homeTeamLogo: DEFAULT_FLAGS.france,
    awayTeamLogo: DEFAULT_FLAGS.germany,
    matchDateLabel: "SAT",
    matchTimeLabel: "22:00",
    scheduledAt: null,
    status: "FULL_BOOKED",
    buttonLabel: "FULL BOOKED",
    subTextTitle: null,
    whatsappMessage: null,
    showSoldOutStamp: true,
  },
  {
    id: "default-match-4",
    displayMode: "TEAM_MATCH",
    leagueName: "PILDUN 2026",
    title: null,
    categoryLabel: null,
    description: null,
    eventImage: null,
    homeTeamName: "Netherlands",
    awayTeamName: "Portugal",
    homeTeamLogo: DEFAULT_FLAGS.netherlands,
    awayTeamLogo: DEFAULT_FLAGS.portugal,
    matchDateLabel: "SUN",
    matchTimeLabel: "02:00",
    scheduledAt: null,
    status: "CURRENTLY_SHOWING",
    buttonLabel: "CURRENTLY SHOWING",
    subTextTitle: null,
    whatsappMessage:
      "Halo LUDO, saya ingin booking match Netherlands vs Portugal.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-5",
    displayMode: "TEAM_MATCH",
    leagueName: "PILDUN 2026",
    title: null,
    categoryLabel: null,
    description: null,
    eventImage: null,
    homeTeamName: "Spain",
    awayTeamName: "Germany",
    homeTeamLogo: DEFAULT_FLAGS.spain,
    awayTeamLogo: DEFAULT_FLAGS.germany,
    matchDateLabel: "MON",
    matchTimeLabel: "23:00",
    scheduledAt: null,
    status: "BOOK",
    buttonLabel: "BOOK",
    subTextTitle: null,
    whatsappMessage: "Halo LUDO, saya ingin booking match Spain vs Germany.",
    showSoldOutStamp: false,
  },
  {
    id: "default-match-6",
    displayMode: "GENERAL_EVENT",
    leagueName: "PILDUN 2026",
    title: "MotoGP Watch Party",
    categoryLabel: "MotoGP",
    description:
      "Race night, big screen, cold drinks, and full throttle crowd.",
    eventImage: "/uploads/event-dj-night.png",
    homeTeamName: null,
    awayTeamName: null,
    homeTeamLogo: null,
    awayTeamLogo: null,
    matchDateLabel: "TUE",
    matchTimeLabel: "02:00",
    scheduledAt: null,
    status: "LIMITED",
    buttonLabel: "LIMITED SEATS",
    subTextTitle: null,
    whatsappMessage: "Halo LUDO, saya ingin booking match Brazil vs England.",
    showSoldOutStamp: false,
  },
];

const DEFAULT_EVENTS: PublicEvent[] = [
  {
    id: "default-event-1",
    title: "Live Performance",
    artistName: "AGNES MONICA",
    talentLabel: "Talent",
    eventDateLabel: "FRIDAY, 25 APRIL",
    eventTimeLabel: "START 9PM TILL DROP",
    scheduledAt: null,
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
    talentLabel: "Talent",
    eventDateLabel: "SATURDAY, 26 APRIL",
    eventTimeLabel: "START 8PM TILL LATE",
    scheduledAt: null,
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

const DEFAULT_BRANDS: PublicBrand[] = [
  {
    id: "default-brand-coca-cola",
    titleBeforeHighlight: "TRUSTED BY",
    titleHighlight: "LEADING BRANDS",
    subtitle: "Official Brand Partner",
    brandName: "Coca-Cola",
    brandLogo: "/Coca-Cola_logo.svg.png",
    bottomText: "EXCLUSIVE COLLABORATION",
  },
];

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
  BrandSectionModel[],
];

export default async function HomePage() {
  const [settings, heroes, matches, events, location, faqs, brands] =
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
    matchSectionTitle:
      settings?.matchSectionTitle ?? DEFAULT_SETTINGS.matchSectionTitle,
    headerBookingLabel:
      settings?.headerBookingLabel ?? DEFAULT_SETTINGS.headerBookingLabel,
    headerBookingUrl:
      settings?.headerBookingUrl ?? DEFAULT_SETTINGS.headerBookingUrl,
    headerBookingVisible:
      settings?.headerBookingVisible ?? DEFAULT_SETTINGS.headerBookingVisible,
    eventMiceLabel: settings?.eventMiceLabel ?? DEFAULT_SETTINGS.eventMiceLabel,
    eventMiceUrl: settings?.eventMiceUrl ?? DEFAULT_SETTINGS.eventMiceUrl,
    eventMiceVisible:
      settings?.eventMiceVisible ?? DEFAULT_SETTINGS.eventMiceVisible,
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
          portraitImage: hero.portraitImage,
        }))
      : DEFAULT_HEROES;

  const publicMatches: PublicMatch[] =
    matches.length > 0
      ? matches.map((match) => ({
          id: match.id,
          displayMode: match.displayMode,
          leagueName: match.leagueName,
          title: match.title,
          categoryLabel: match.categoryLabel,
          description: match.description,
          eventImage: match.eventImage,
          homeTeamName: match.homeTeamName,
          awayTeamName: match.awayTeamName,
          homeTeamLogo: match.homeTeamLogo,
          awayTeamLogo: match.awayTeamLogo,
          matchDateLabel: match.matchDateLabel,
          matchTimeLabel: match.matchTimeLabel,
          scheduledAt: match.scheduledAt?.toISOString() ?? null,
          status: match.status,
          buttonLabel: match.buttonLabel,
          subTextTitle: match.subTextTitle,
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
          talentLabel: event.talentLabel,
          eventDateLabel: event.eventDateLabel,
          eventTimeLabel: event.eventTimeLabel,
          scheduledAt: event.scheduledAt?.toISOString() ?? null,
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

  const publicBrands: PublicBrand[] =
    brands.length > 0
      ? brands.map((brand) => ({
          id: brand.id,
          titleBeforeHighlight: brand.titleBeforeHighlight,
          titleHighlight: brand.titleHighlight,
          subtitle: brand.subtitle,
          brandName: brand.brandName,
          brandLogo:
            brand.brandLogo && brand.brandLogo !== "/uploads/coca-cola-logo.svg"
              ? brand.brandLogo
              : "/Coca-Cola_logo.svg.png",
          bottomText: brand.bottomText,
        }))
      : DEFAULT_BRANDS;

  const homepageJsonLd = buildHomepageJsonLd({
    settings: {
      siteName: publicSettings.siteName,
      siteTagline: publicSettings.siteTagline,
      whatsappNumber: publicSettings.whatsappNumber,
      defaultWhatsappMessage: publicSettings.defaultWhatsappMessage,
      instagramUrl: publicSettings.instagramUrl,
      instagramHandle: publicSettings.instagramHandle,
      tiktokUrl: publicSettings.tiktokUrl,
      tiktokHandle: publicSettings.tiktokHandle,
    },
    location: {
      businessName: publicLocation.businessName,
      address: publicLocation.address,
      mapUrl: publicLocation.mapUrl,
      instagramUrl: publicLocation.instagramUrl,
      tiktokUrl: publicLocation.tiktokUrl,
    },
    faqs: publicFaqs,
    image: publicHeroes.find((hero) => hero.backgroundImage)?.backgroundImage,
  });

  return (
    <main className="min-h-screen bg-[#050505] text-[#F8EDE7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header
        siteName={publicSettings.siteName}
        tagline={publicSettings.siteTagline}
        whatsappNumber={publicSettings.whatsappNumber}
        defaultWhatsappMessage={publicSettings.defaultWhatsappMessage}
        menuUrl={publicSettings.menuUrl}
        bookingLabel={publicSettings.headerBookingLabel}
        bookingUrl={publicSettings.headerBookingUrl}
        bookingVisible={publicSettings.headerBookingVisible}
        eventMiceLabel={publicSettings.eventMiceLabel}
        eventMiceUrl={publicSettings.eventMiceUrl}
        eventMiceVisible={publicSettings.eventMiceVisible}
      />
      <MatchSection
        title={publicSettings.matchSectionTitle}
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
      <BrandSection brands={publicBrands} />
      <Footer copyright={publicSettings.footerCopyright} />
    </main>
  );
}

async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const today = getJakartaStartOfToday();
    const result = await Promise.all([
      prisma.siteSetting.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.heroSection.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.matchCard.findMany({
        where: {
          isActive: true,
          OR: [{ scheduledAt: null }, { scheduledAt: { gte: today } }],
        },
        orderBy: [
          { scheduledAt: "asc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.eventBanner.findMany({
        where: {
          isActive: true,
          OR: [{ scheduledAt: null }, { scheduledAt: { gte: today } }],
        },
        orderBy: [
          { scheduledAt: "asc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.locationSetting.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.fAQItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.brandSection.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const [settings, heroes, matches, events, location, faqs, brands] = result;

    return [
      settings,
      heroes,
      sortScheduledItems(
        matches.filter((match) => isUpcomingOrUndated(match.scheduledAt)),
      ),
      sortScheduledItems(
        events.filter((event) => isUpcomingOrUndated(event.scheduledAt)),
      ),
      location,
      faqs,
      brands,
    ];
  } catch {
    console.warn("Unable to load public CMS content. Rendering fallback data.");
    return [null, [], [], [], null, [], []];
  }
}

function sortScheduledItems<
  T extends { scheduledAt: Date | null; sortOrder: number; createdAt: Date },
>(items: T[]) {
  return [...items].sort((first, second) => {
    const firstTime = first.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const secondTime = second.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

    if (firstTime !== secondTime) return firstTime - secondTime;
    if (first.sortOrder !== second.sortOrder)
      return first.sortOrder - second.sortOrder;
    return second.createdAt.getTime() - first.createdAt.getTime();
  });
}
