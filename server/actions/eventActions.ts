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
import { eventSchema, idSchema } from "@/lib/validations";
import { saveUploadedImage } from "@/lib/upload";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/events";

async function buildEventData(formData: FormData) {
  const parsed = eventSchema.parse({
    title: getFormString(formData, "title"),
    artistName: getFormString(formData, "artistName"),
    talentLabel: getFormString(formData, "talentLabel", "Talent"),
    eventDateLabel: getFormString(formData, "eventDateLabel"),
    eventTimeLabel: getFormString(formData, "eventTimeLabel"),
    scheduledAt: getFormDate(formData, "scheduledAt"),
    eventTypeLabel: getFormOptionalString(formData, "eventTypeLabel"),
    headlineLine1: getFormString(formData, "headlineLine1"),
    headlineHighlight1: getFormString(formData, "headlineHighlight1"),
    headlineLine2: getFormString(formData, "headlineLine2"),
    headlineHighlight2: getFormString(formData, "headlineHighlight2"),
    backgroundImage: getFormOptionalString(formData, "backgroundImage"),
    ctaLabel: getFormString(formData, "ctaLabel"),
    whatsappMessage: getFormOptionalString(formData, "whatsappMessage"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });

  const file = getFormFile(formData, "backgroundImageFile");
  if (file) {
    const media = await saveUploadedImage(file);
    parsed.backgroundImage = media.url;
  }

  return parsed;
}

export async function createEvent(formData: FormData) {
  await requireAdminSession();

  try {
    const data = await buildEventData(formData);
    await prisma.eventBanner.create({ data });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Event created.");
}

export async function updateEvent(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const data = await buildEventData(formData);
    await prisma.eventBanner.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Event updated.");
}

export async function deleteEvent(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    await prisma.eventBanner.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Event deleted.");
}

export async function toggleEventActive(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const event = await prisma.eventBanner.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!event) throw new Error("Event not found.");

    await prisma.eventBanner.update({
      where: { id },
      data: { isActive: !event.isActive },
    });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Event visibility updated.");
}
