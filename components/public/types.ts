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
  footerCopyright: string;
};

export type PublicMatch = {
  id: string;
  leagueName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  matchDateLabel: string;
  matchTimeLabel: string;
  status: "BOOK" | "LIMITED" | "FULL_BOOKED" | "CURRENTLY_SHOWING";
  buttonLabel: string;
  whatsappMessage: string | null;
  showSoldOutStamp: boolean;
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
};

export type PublicEvent = {
  id: string;
  title: string;
  artistName: string;
  eventDateLabel: string;
  eventTimeLabel: string;
  eventTypeLabel: string | null;
  headlineLine1: string;
  headlineHighlight1: string;
  headlineLine2: string;
  headlineHighlight2: string;
  backgroundImage: string | null;
  ctaLabel: string;
  whatsappMessage: string | null;
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
  titleBeforeHighlight: string;
  titleHighlight: string;
  subtitle: string;
  brandName: string;
  brandLogo: string | null;
  bottomText: string;
};
