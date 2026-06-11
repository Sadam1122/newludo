"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFormBoolean,
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
    leagueName: getFormString(formData, "leagueName"),
    homeTeamName: getFormString(formData, "homeTeamName"),
    awayTeamName: getFormString(formData, "awayTeamName"),
    homeTeamLogo: getFormOptionalString(formData, "homeTeamLogo"),
    awayTeamLogo: getFormOptionalString(formData, "awayTeamLogo"),
    matchDateLabel: getFormString(formData, "matchDateLabel"),
    matchTimeLabel: getFormString(formData, "matchTimeLabel"),
    status: getFormString(formData, "status"),
    buttonLabel: getFormString(formData, "buttonLabel"),
    whatsappMessage: getFormOptionalString(formData, "whatsappMessage"),
    showSoldOutStamp: getFormBoolean(formData, "showSoldOutStamp"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });

  const homeLogoFile = getFormFile(formData, "homeTeamLogoFile");
  const awayLogoFile = getFormFile(formData, "awayTeamLogoFile");

  if (homeLogoFile) {
    const media = await saveUploadedImage(homeLogoFile);
    parsed.homeTeamLogo = media.url;
  }

  if (awayLogoFile) {
    const media = await saveUploadedImage(awayLogoFile);
    parsed.awayTeamLogo = media.url;
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
