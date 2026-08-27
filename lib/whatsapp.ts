export const DEFAULT_WHATSAPP_NUMBER = "6282318560003";
export const DEFAULT_WHATSAPP_MESSAGE = "Halo LUDO, saya ingin reservasi meja.";

export function createWhatsappUrl(phoneNumber: string, message: string) {
  const normalizedPhone =
    normalizeWhatsappPhone(phoneNumber) ?? phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function normalizeWhatsappPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed || !/^[\d\s()+.-]+$/.test(trimmed)) return null;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;

  return /^\d{8,15}$/.test(digits) ? digits : null;
}

/**
 * Accepts an international/local phone number or a WhatsApp web URL and
 * returns one canonical wa.me URL. Only known WhatsApp hosts are accepted.
 */
export function normalizeWhatsappDestination(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const rawPhone = normalizeWhatsappPhone(trimmed);
  if (rawPhone) return `https://wa.me/${rawPhone}`;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const isWaMe = host === "wa.me";
  const isWhatsappHost = host === "api.whatsapp.com" || host === "whatsapp.com";
  if (!isWaMe && !isWhatsappHost) return null;

  const phoneSource = isWaMe
    ? (url.pathname.split("/").filter(Boolean)[0] ?? "")
    : (url.searchParams.get("phone") ?? "");
  const phone = normalizeWhatsappPhone(phoneSource);
  if (!phone) return null;

  const message = url.searchParams.get("text")?.trim();
  return message
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${phone}`;
}

export function createWhatsappDestinationUrl(
  value: string,
  fallbackMessage: string,
) {
  const normalized = normalizeWhatsappDestination(value);
  if (!normalized) return null;

  const url = new URL(normalized);
  if (!url.searchParams.has("text") && fallbackMessage.trim()) {
    url.searchParams.set("text", fallbackMessage.trim());
  }
  return url.toString();
}
