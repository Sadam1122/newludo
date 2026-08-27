import {
  createWhatsappDestinationUrl,
  createWhatsappUrl,
} from "@/lib/whatsapp";

export const MATCH_CTA_ICON_KEYS = [
  "MessageCircle",
  "Ticket",
  "ExternalLink",
  "CalendarCheck",
  "ShoppingCart",
  "ArrowRight",
] as const;

export type MatchCtaIconKey = (typeof MATCH_CTA_ICON_KEYS)[number];

type MatchCtaInput = {
  buttonLabel: string;
  whatsappMessage: string | null;
  bookingEventId: string | null;
  hasPackages: boolean;
  customCtaEnabled: boolean;
  customCtaType: "WHATSAPP" | "VENDOR" | null;
  customCtaText: string | null;
  customCtaColor: string | null;
  customCtaIcon: string | null;
  customCtaUrl: string | null;
};

export type ResolvedMatchCta = {
  type: "INTERNAL" | "WHATSAPP" | "VENDOR";
  label: string;
  href: string;
  external: boolean;
  color: string | null;
  textColor: "#050505" | "#FFFFFF";
  icon: MatchCtaIconKey | null;
  isCustom: boolean;
};

export function resolveMatchBookingCta(
  match: MatchCtaInput,
  defaultWhatsappNumber: string,
  defaultWhatsappMessage: string,
): ResolvedMatchCta {
  if (match.customCtaEnabled && match.customCtaType && match.customCtaUrl) {
    const href =
      match.customCtaType === "WHATSAPP"
        ? createWhatsappDestinationUrl(
            match.customCtaUrl,
            match.whatsappMessage ?? defaultWhatsappMessage,
          )
        : normalizeExternalHttpUrl(match.customCtaUrl);

    if (href) {
      const color = normalizeHexColor(match.customCtaColor) ?? "#25D366";
      return {
        type: match.customCtaType,
        label: match.customCtaText?.trim() || match.buttonLabel || "BOOK NOW",
        href,
        external: true,
        color,
        textColor: getReadableTextColor(color),
        icon: normalizeMatchCtaIcon(match.customCtaIcon),
        isCustom: true,
      };
    }
  }

  if (match.bookingEventId && match.hasPackages) {
    return {
      type: "INTERNAL",
      label: match.buttonLabel,
      href: `/book/${match.bookingEventId}`,
      external: false,
      color: null,
      textColor: "#FFFFFF",
      icon: null,
      isCustom: false,
    };
  }

  return {
    type: "WHATSAPP",
    label: match.buttonLabel,
    href: createWhatsappUrl(
      defaultWhatsappNumber,
      match.whatsappMessage ?? defaultWhatsappMessage,
    ),
    external: true,
    color: null,
    textColor: "#FFFFFF",
    icon: "MessageCircle",
    isCustom: false,
  };
}

export function normalizeExternalHttpUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname
    ) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

export function normalizeHexColor(value: string | null | undefined) {
  const trimmed = value?.trim().toUpperCase();
  return trimmed && /^#[0-9A-F]{6}$/.test(trimmed) ? trimmed : null;
}

export function normalizeMatchCtaIcon(value: string | null | undefined) {
  return MATCH_CTA_ICON_KEYS.includes(value as MatchCtaIconKey)
    ? (value as MatchCtaIconKey)
    : "ArrowRight";
}

export function getReadableTextColor(hexColor: string): "#050505" | "#FFFFFF" {
  const hex = normalizeHexColor(hexColor) ?? "#25D366";
  const channels = [1, 3, 5].map((index) =>
    Number.parseInt(hex.slice(index, index + 2), 16),
  );
  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 0.45 ? "#050505" : "#FFFFFF";
}
