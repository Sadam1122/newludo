import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

export const idSchema = z.string().min(1, "ID is required");

export const matchStatusSchema = z.enum([
  "BOOK",
  "LIMITED",
  "FULL_BOOKED",
  "CURRENTLY_SHOWING",
]);

export const matchSchema = z.object({
  leagueName: requiredText("League name"),
  homeTeamName: requiredText("Home team"),
  awayTeamName: requiredText("Away team"),
  homeTeamLogo: optionalText,
  awayTeamLogo: optionalText,
  matchDateLabel: requiredText("Date label"),
  matchTimeLabel: requiredText("Time label"),
  status: matchStatusSchema,
  buttonLabel: requiredText("Button label"),
  whatsappMessage: optionalText,
  showSoldOutStamp: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export const heroSchema = z.object({
  headlineLine1: requiredText("Headline line 1"),
  headlineHighlight1: requiredText("Headline highlight 1"),
  headlineLine2: requiredText("Headline line 2"),
  headlineHighlight2: requiredText("Headline highlight 2"),
  subtitle: requiredText("Subtitle"),
  ctaLabel: requiredText("CTA label"),
  ctaWhatsappMessage: requiredText("CTA WhatsApp message"),
  backgroundImage: optionalText,
  isActive: z.boolean(),
});

export const eventSchema = z.object({
  title: requiredText("Title"),
  artistName: requiredText("Artist name"),
  eventDateLabel: requiredText("Event date"),
  eventTimeLabel: requiredText("Event time"),
  eventTypeLabel: optionalText,
  headlineLine1: requiredText("Headline line 1"),
  headlineHighlight1: requiredText("Headline highlight 1"),
  headlineLine2: requiredText("Headline line 2"),
  headlineHighlight2: requiredText("Headline highlight 2"),
  backgroundImage: optionalText,
  ctaLabel: requiredText("CTA label"),
  whatsappMessage: optionalText,
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export const locationSchema = z.object({
  businessName: requiredText("Business name"),
  address: requiredText("Address"),
  mapImage: optionalText,
  mapUrl: z.string().trim().url("Map URL must be valid"),
  instagramHandle: requiredText("Instagram handle"),
  instagramUrl: z.string().trim().url("Instagram URL must be valid"),
  tiktokHandle: requiredText("TikTok handle"),
  tiktokUrl: z.string().trim().url("TikTok URL must be valid"),
});

export const faqSchema = z.object({
  question: requiredText("Question"),
  answer: requiredText("Answer"),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export const brandSchema = z.object({
  titleBeforeHighlight: requiredText("Title before highlight"),
  titleHighlight: requiredText("Title highlight"),
  subtitle: requiredText("Subtitle"),
  brandName: requiredText("Brand name"),
  brandLogo: optionalText,
  bottomText: requiredText("Bottom text"),
  isActive: z.boolean(),
});

export const siteSettingsSchema = z.object({
  siteName: requiredText("Site name"),
  siteTagline: requiredText("Site tagline"),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "WhatsApp number must use international digits only"),
  defaultWhatsappMessage: requiredText("Default WhatsApp message"),
  instagramHandle: requiredText("Instagram handle"),
  instagramUrl: z.string().trim().url("Instagram URL must be valid"),
  tiktokHandle: requiredText("TikTok handle"),
  tiktokUrl: z.string().trim().url("TikTok URL must be valid"),
  menuUrl: z.string().trim().url("Menu URL must be valid"),
  footerCopyright: requiredText("Footer copyright"),
});
