import type { EventBanner, MatchCard, SiteSetting } from "@prisma/client";
import type { Metadata } from "next";

import { EventMiceSchedule } from "@/components/public/EventMiceSchedule";
import { EventMiceVenueLayout } from "@/components/public/EventMiceVenueLayout";
import { Footer } from "@/components/public/Footer";
import { GallerySection } from "@/components/public/GallerySection";
import { Header } from "@/components/public/Header";
import type {
  PublicGalleryItem,
  PublicScheduleItem,
  PublicSettings,
} from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { prisma } from "@/lib/prisma";
import { getJakartaStartOfToday, isUpcomingOrUndated } from "@/lib/schedule";
import { absoluteUrl } from "@/lib/seo";
import {
  DEFAULT_WHATSAPP_MESSAGE,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event / MICE",
  description:
    "Event / MICE, upcoming schedule, table layout, dan reservasi event di LUDO Sports Kitchen & Coffee Bandung.",
  alternates: {
    canonical: absoluteUrl("/event-mice"),
  },
  openGraph: {
    title: "Event / MICE | LUDO Sports Kitchen & Coffee",
    description:
      "Lihat upcoming schedule dan layout table untuk event, MICE, nobar, dan live performance di LUDO Bandung.",
    url: absoluteUrl("/event-mice"),
    images: [
      { url: absoluteUrl("/layout-seat.png"), alt: "LUDO table layout" },
    ],
  },
};

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
  matchSectionTitle: "UPCOMING SPORTS SCHEDULE",
  headerBookingLabel: "Book",
  headerBookingUrl: null,
  headerBookingVisible: true,
  eventMiceLabel: "Event / MICE",
  eventMiceUrl: "/event-mice",
  eventMiceVisible: true,
  footerCopyright:
    "\u00A9 2026 LUDO SPORTS KITCHEN & COFFEE. ALL RIGHTS RESERVED.",
};

const fallbackSchedule: PublicScheduleItem[] = [
  {
    id: "fallback-event-mice-1",
    source: "event",
    title: "Private Gathering",
    categoryLabel: "Event / MICE",
    dateLabel: "Available by Request",
    timeLabel: "Flexible Schedule",
    scheduledAt: null,
    image: "/uploads/event-live-night.png",
    description:
      "Reservasi area untuk gathering, meeting, komunitas, dan special event.",
    ctaLabel: "Reserve Event",
    whatsappMessage:
      "Halo LUDO, saya ingin bertanya untuk reservasi Event / MICE.",
  },
];

import type { GalleryItem } from "@prisma/client";

type EventMiceContent = {
  settings: SiteSetting | null;
  matches: MatchCard[];
  events: EventBanner[];
  gallery: GalleryItem[];
};

export default async function EventMicePage() {
  const { settings, matches, events, gallery } = await getEventMiceContent();
  const publicSettings = toPublicSettings(settings);
  const scheduleItems = [
    ...events.map(mapEventToSchedule),
    ...matches.map(mapMatchToSchedule),
  ]
    .filter((item) => isUpcomingOrUndated(item.scheduledAt))
    .sort(comparePublicSchedule);
  const visibleSchedule =
    scheduleItems.length > 0 ? scheduleItems : fallbackSchedule;
  
  const publicGallery: PublicGalleryItem[] = gallery.map((item) => ({
    id: item.id,
    title: item.title,
    caption: item.caption,
    videoUrl: item.videoUrl,
    thumbnailUrl: item.thumbnailUrl,
  }));

  return (
    <main className="min-h-screen bg-[#050505] text-[#F8EDE7]">
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

      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#050505_0%,#5A0505_58%,#000000_100%)] py-14 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(247,198,0,0.16),transparent_28%),radial-gradient(circle_at_22%_62%,rgba(239,31,40,0.24),transparent_34%)]" />
        <div className="ludo-section-shell relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-[#F7C600]">
              LUDO Sports Kitchen & Coffee
            </p>
            <h1 className="font-display mt-4 text-[clamp(4rem,14vw,10rem)] uppercase leading-[0.78] text-[#F8EDE7]">
              EVENT <span className="text-[#EF1F28]">/</span>
              <br />
              MICE
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-[#D7C8C1] sm:text-base">
              Reserve table, plan komunitas, gathering, meeting, watch party,
              atau live event dengan suasana sportsbar premium di Bandung.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton
                phoneNumber={publicSettings.whatsappNumber}
                message="Halo LUDO, saya ingin bertanya untuk reservasi Event / MICE."
                variant="solid"
              >
                Reserve Event / MICE
              </WhatsAppButton>
              <a
                href="#layout"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 px-5 text-sm font-black uppercase text-white transition hover:border-[#F7C600] hover:text-[#F7C600]"
              >
                View Table Layout
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/34 p-4 shadow-[0_28px_110px_rgba(0,0,0,0.38)] backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Schedule" value={visibleSchedule.length} />
              <Stat label="This Week" value={countThisWeek(visibleSchedule)} />
              <Stat
                label="Now Live"
                value={
                  visibleSchedule.filter(
                    (item) => item.status === "CURRENTLY_SHOWING",
                  ).length
                }
              />
            </div>
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold leading-7 text-[#A3A3A3]">
              Semua jadwal di halaman ini mengikuti data CMS. Jadwal yang sudah
              lewat tanggal otomatis tidak muncul di public page.
            </p>
          </div>
        </div>
      </section>

      <EventMiceSchedule
        items={visibleSchedule}
        whatsappNumber={publicSettings.whatsappNumber}
        defaultMessage={publicSettings.defaultWhatsappMessage}
      />

      <div id="layout">
        <EventMiceVenueLayout />
      </div>

      <GallerySection items={publicGallery} />

      <Footer copyright={publicSettings.footerCopyright} />
    </main>
  );
}

async function getEventMiceContent(): Promise<EventMiceContent> {
  const today = getJakartaStartOfToday();

  const [settings, matches, events, gallery] = await Promise.all([
    prisma.siteSetting.findFirst({ orderBy: { createdAt: "asc" } }),
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
    prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return { settings, matches, events, gallery };
}

function toPublicSettings(settings: SiteSetting | null): PublicSettings {
  return {
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
}

function mapEventToSchedule(event: EventBanner): PublicScheduleItem {
  return {
    id: `event-${event.id}`,
    source: "event",
    title: event.artistName,
    categoryLabel: event.eventTypeLabel ?? event.title,
    dateLabel: event.eventDateLabel,
    timeLabel: event.eventTimeLabel,
    scheduledAt: event.scheduledAt?.toISOString() ?? null,
    image: event.backgroundImage,
    description: `${event.title} - ${event.talentLabel}: ${event.artistName}`,
    ctaLabel: event.ctaLabel,
    whatsappMessage: event.whatsappMessage,
  };
}

function mapMatchToSchedule(match: MatchCard): PublicScheduleItem {
  const isGeneral = match.displayMode === "GENERAL_EVENT";
  const title = isGeneral
    ? match.title || match.leagueName
    : `${match.homeTeamName ?? "Home"} vs ${match.awayTeamName ?? "Away"}`;

  return {
    id: `match-${match.id}`,
    source: "match",
    title,
    categoryLabel: match.categoryLabel ?? match.leagueName,
    dateLabel: match.matchDateLabel,
    timeLabel: match.matchTimeLabel,
    scheduledAt: match.scheduledAt?.toISOString() ?? null,
    image: isGeneral
      ? match.eventImage
      : match.homeTeamLogo || match.awayTeamLogo,
    description: isGeneral
      ? match.description
      : `${match.leagueName} live screening at LUDO.`,
    ctaLabel: match.buttonLabel,
    whatsappMessage: match.whatsappMessage,
    status: match.status,
  };
}

function comparePublicSchedule(
  first: PublicScheduleItem,
  second: PublicScheduleItem,
) {
  const firstTime = first.scheduledAt
    ? new Date(first.scheduledAt).getTime()
    : Number.MAX_SAFE_INTEGER;
  const secondTime = second.scheduledAt
    ? new Date(second.scheduledAt).getTime()
    : Number.MAX_SAFE_INTEGER;

  if (firstTime !== secondTime) return firstTime - secondTime;
  return first.title.localeCompare(second.title);
}

function countThisWeek(items: PublicScheduleItem[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(today.getDate() + ((7 - today.getDay()) % 7));
  end.setHours(23, 59, 59, 999);

  return items.filter((item) => {
    if (!item.scheduledAt) return false;
    const date = new Date(item.scheduledAt);
    return date >= today && date <= end;
  }).length;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] px-4 py-5 text-center">
      <p className="font-display text-5xl leading-none text-[#F7C600]">
        {value}
      </p>
      <p className="mt-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#A3A3A3]">
        {label}
      </p>
    </div>
  );
}
