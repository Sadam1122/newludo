export type PublicSettings = {
  siteName: string;
  siteTagline: string;
  whatsappNumber: string;
  defaultWhatsappMessage: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  menuUrl: string;
  matchSectionTitle: string;
  headerBookingLabel: string;
  headerBookingUrl: string | null;
  headerBookingVisible: boolean;
  eventMiceLabel: string;
  eventMiceUrl: string;
  eventMiceVisible: boolean;
  footerCopyright: string;
};

export type PublicMatch = {
  id: string;
  displayMode: "TEAM_MATCH" | "GENERAL_EVENT";
  leagueName: string;
  title: string | null;
  categoryLabel: string | null;
  description: string | null;
  eventImage: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  matchDateLabel: string;
  matchTimeLabel: string;
  scheduledAt: string | null;
  status: "BOOK" | "LIMITED" | "FULL_BOOKED" | "CURRENTLY_SHOWING";
  buttonLabel: string;
  subTextTitle: string | null;
  whatsappMessage: string | null;
  showSoldOutStamp: boolean;
  bookingEventId: string | null;
  availableTables: number | null;
  totalTables: number | null;
  hasPackages: boolean;
  isWhatsappOnly: boolean;
  customCtaEnabled: boolean;
  customCtaType: "WHATSAPP" | "VENDOR" | null;
  customCtaText: string | null;
  customCtaColor: string | null;
  customCtaIcon: string | null;
  customCtaUrl: string | null;
};

export type PublicHero = {
  id: string;
  headlineLine1: string;
  headlineHighlight1: string;
  headlineLine2: string;
  headlineHighlight2: string;
  subtitle: string;
  ctaLabel: string;
  ctaWhatsappMessage: string;
  backgroundImage: string | null;
  portraitImage: string | null;
};

export type PublicEvent = {
  id: string;
  category: "LIVE_EVENT" | "BOOKING_EVENT";
  eventType:
    | "REGULER_MATCH"
    | "NOBAR_COMMUNITY"
    | "BIG_MATCH"
    | "SUPER_BIG_MATCH"
    | "IFTAR_2027"
    | "MUSIC"
    | "DELIVERY_ORDER";
  isWhatsappOnly: boolean;
  title: string;
  artistName: string;
  talentLabel: string;
  eventDateLabel: string;
  eventTimeLabel: string;
  scheduledAt: string | null;
  eventTypeLabel: string | null;
  headlineLine1: string;
  headlineHighlight1: string;
  headlineLine2: string;
  headlineHighlight2: string;
  backgroundImage: string | null;
  ctaLabel: string;
  whatsappMessage: string | null;
  availableTables: number | null;
  totalTables: number | null;
};

export type PublicGalleryItem = {
  id: string;
  title: string;
  caption: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
};

export type PublicScheduleItem = {
  id: string;
  source: "match" | "event";
  title: string;
  categoryLabel: string;
  dateLabel: string;
  timeLabel: string;
  scheduledAt: string | null;
  image: string | null;
  description: string | null;
  ctaLabel: string;
  whatsappMessage: string | null;
  status?: PublicMatch["status"];
};

export type PublicLocation = {
  businessName: string;
  address: string;
  mapImage: string | null;
  mapUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
};

export type PublicFAQ = {
  id: string;
  question: string;
  answer: string;
};

export type PublicBrand = {
  id: string;
  titleBeforeHighlight: string;
  titleHighlight: string;
  subtitle: string;
  brandName: string;
  brandLogo: string | null;
  bottomText: string;
};
