"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFormBoolean,
  getFormDate,
  getFormFile,
  getFormNumber,
  getFormOptionalString,
  getFormString,
} from "@/lib/utils";
import { idSchema, matchSchema } from "@/lib/validations";
import { saveUploadedImage } from "@/lib/upload";
import { buildLudoTableLayout } from "@/lib/tableLayout";
import { isWhatsappOnlyTemplate } from "@/lib/eventGating";
import type { MatchCard } from "@prisma/client";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/matches";

function buildBookingEventTitle(match: MatchCard) {
  return match.displayMode === "GENERAL_EVENT"
    ? match.title ?? match.leagueName
    : `${match.homeTeamName ?? "Home"} vs ${match.awayTeamName ?? "Away"}`;
}

/**
 * Ensures the BookingEvent backing a match matches its matchCategory:
 * - REGULER_MATCH: no BookingEvent needed (WhatsApp CTA only). Any existing
 *   linked event is left untouched (non-destructive) but is no longer used
 *   for the public CTA once matchCategory says WhatsApp-only.
 * - Anything else: creates a BookingEvent + generates tables on first save,
 *   or updates the eventType in place on an existing linked event so a
 *   category change (e.g. Big Match -> Nobar With Community) never loses
 *   already-configured tables/packages. Tables are also self-healed to pick
 *   up any layout additions (e.g. newly added Table 10/11/19).
 */
async function syncBookingEventForMatch(match: MatchCard) {
  if (isWhatsappOnlyTemplate(match.matchCategory)) {
    return match.bookingEventId;
  }

  if (match.bookingEventId) {
    await prisma.bookingEvent.update({
      where: { id: match.bookingEventId },
      data: { eventType: match.matchCategory },
    });
    await selfHealTables(match.bookingEventId);
    return match.bookingEventId;
  }

  const bookingEvent = await prisma.bookingEvent.create({
    data: {
      category: "BOOKING_EVENT",
      title: buildBookingEventTitle(match),
      eventType: match.matchCategory,
      eventDateLabel: match.matchDateLabel,
      eventTimeLabel: match.matchTimeLabel,
      scheduledAt: match.scheduledAt,
      backgroundImage: match.eventImage,
      ctaLabel: match.buttonLabel || "BOOK NOW",
      isActive: true,
    },
  });

  await selfHealTables(bookingEvent.id);

  await prisma.matchCard.update({
    where: { id: match.id },
    data: { bookingEventId: bookingEvent.id },
  });

  return bookingEvent.id;
}

async function selfHealTables(bookingEventId: string) {
  const layout = buildLudoTableLayout();

  for (const t of layout) {
    const existing = await prisma.eventTable.findUnique({
      where: {
        bookingEventId_tableCode: {
          bookingEventId,
          tableCode: t.tableCode,
        },
      },
    });

    if (!existing) {
      await prisma.eventTable.create({
        data: {
          bookingEventId,
          tableCode: t.tableCode,
          capacity: t.capacity,
          tableType: t.tableType,
          status: "AVAILABLE",
        },
      });
    }
  }
}

async function buildMatchData(formData: FormData) {
  const parsed = matchSchema.parse({
    displayMode: getFormString(formData, "displayMode", "TEAM_MATCH"),
    matchCategory: getFormString(formData, "matchCategory", "BIG_MATCH"),
    leagueName: getFormString(formData, "leagueName"),
    title: getFormOptionalString(formData, "title"),
    categoryLabel: getFormOptionalString(formData, "categoryLabel"),
    description: getFormOptionalString(formData, "description"),
    eventImage: getFormOptionalString(formData, "eventImage"),
    homeTeamName: getFormOptionalString(formData, "homeTeamName"),
    awayTeamName: getFormOptionalString(formData, "awayTeamName"),
    homeTeamLogo: getFormOptionalString(formData, "homeTeamLogo"),
    awayTeamLogo: getFormOptionalString(formData, "awayTeamLogo"),
    matchDateLabel: getFormString(formData, "matchDateLabel"),
    matchTimeLabel: getFormString(formData, "matchTimeLabel"),
    venueLocation: getFormOptionalString(formData, "venueLocation"),
    scheduledAt: getFormDate(formData, "scheduledAt"),
    status: getFormString(formData, "status"),
    buttonLabel: getFormString(formData, "buttonLabel"),
    subTextTitle: getFormOptionalString(formData, "subTextTitle"),
    whatsappMessage: getFormOptionalString(formData, "whatsappMessage"),
    showSoldOutStamp: getFormBoolean(formData, "showSoldOutStamp"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });

  const homeLogoFile = getFormFile(formData, "homeTeamLogoFile");
  const awayLogoFile = getFormFile(formData, "awayTeamLogoFile");
  const eventImageFile = getFormFile(formData, "eventImageFile");

  if (homeLogoFile) {
    const media = await saveUploadedImage(homeLogoFile);
    parsed.homeTeamLogo = media.url;
  }

  if (awayLogoFile) {
    const media = await saveUploadedImage(awayLogoFile);
    parsed.awayTeamLogo = media.url;
  }

  if (eventImageFile) {
    const media = await saveUploadedImage(eventImageFile);
    parsed.eventImage = media.url;
  }

  return parsed;
}

export async function createMatch(formData: FormData) {
  await requireAdminSession();

  try {
    const data = await buildMatchData(formData);
    const match = await prisma.matchCard.create({ data });
    await syncBookingEventForMatch(match);
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Match created.");
}

export async function updateMatch(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const data = await buildMatchData(formData);
    const match = await prisma.matchCard.update({ where: { id }, data });
    await syncBookingEventForMatch(match);

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Match updated.");
}

export async function deleteMatch(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    await prisma.matchCard.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Match deleted.");
}

export async function toggleMatchActive(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const match = await prisma.matchCard.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!match) throw new Error("Match not found.");

    await prisma.matchCard.update({
      where: { id },
      data: { isActive: !match.isActive },
    });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Match visibility updated.");
}
