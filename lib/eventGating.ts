import type { EventTemplate } from "@prisma/client";

/**
 * REGULER_MATCH is the single "WhatsApp CTA only" template shared by both
 * BookingEvent.eventType and MatchCard.matchCategory. Centralized here so the
 * rule lives in exactly one place instead of being re-implemented per file.
 */
export function isWhatsappOnlyTemplate(template: EventTemplate | null | undefined) {
  return template === "REGULER_MATCH";
}
