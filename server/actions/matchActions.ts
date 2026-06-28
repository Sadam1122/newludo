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
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/matches";

async function buildMatchData(formData: FormData) {
  const parsed = matchSchema.parse({
    displayMode: getFormString(formData, "displayMode", "TEAM_MATCH"),
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
    await prisma.matchCard.create({ data });
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
    await prisma.matchCard.update({ where: { id }, data });
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
