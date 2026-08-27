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
import { bookingEventSchema, idSchema } from "@/lib/validations";
import { saveUploadedImage } from "@/lib/upload";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/events";

async function buildEventData(formData: FormData) {
  const parsed = bookingEventSchema.parse({
    category: getFormString(formData, "category"),
    title: getFormString(formData, "title"),
    eventType: getFormString(formData, "eventType"),
    eventTypeLabel: getFormOptionalString(formData, "eventTypeLabel"),
    artistName: getFormOptionalString(formData, "artistName"),
    talentLabel: getFormOptionalString(formData, "talentLabel"),
    eventDateLabel: getFormString(formData, "eventDateLabel"),
    eventTimeLabel: getFormString(formData, "eventTimeLabel"),
    scheduledAt: getFormDate(formData, "scheduledAt"),
    description: getFormOptionalString(formData, "description"),
    whatsappMessage: getFormOptionalString(formData, "whatsappMessage"),
    headlineLine1: getFormOptionalString(formData, "headlineLine1"),
    headlineHighlight1: getFormOptionalString(formData, "headlineHighlight1"),
    headlineLine2: getFormOptionalString(formData, "headlineLine2"),
    headlineHighlight2: getFormOptionalString(formData, "headlineHighlight2"),
    backgroundImage: getFormOptionalString(formData, "backgroundImage"),
    posterImage: getFormOptionalString(formData, "posterImage"),
    openGateInfo: getFormOptionalString(formData, "openGateInfo") || "Open Gate at 21:00 WIB",
    tableInfo: getFormOptionalString(formData, "tableInfo"),
    ctaLabel: getFormString(formData, "ctaLabel", "BOOK NOW"),
    allowAlaCarte: getFormBoolean(formData, "allowAlaCarte"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });

  const bannerFile = getFormFile(formData, "bannerFile");
  if (bannerFile) {
    const media = await saveUploadedImage(bannerFile);
    parsed.backgroundImage = media.url;
  }

  return parsed;
}

export async function createEvent(prevState: unknown, formData: FormData) {
  try {
    await requireAdminSession();
    const data = await buildEventData(formData);

    await prisma.bookingEvent.create({ data });

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }

  redirectWithMessage(adminPath, "success", "Event created successfully");
}

export async function updateEvent(id: string, prevState: unknown, formData: FormData) {
  try {
    await requireAdminSession();
    const validId = idSchema.parse(id);
    const data = await buildEventData(formData);

    await prisma.bookingEvent.update({
      where: { id: validId },
      data,
    });

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }

  redirectWithMessage(adminPath, "success", "Event updated successfully");
}

export async function deleteEvent(id: string) {
  try {
    await requireAdminSession();
    const validId = idSchema.parse(id);
    await prisma.bookingEvent.delete({ where: { id: validId } });

    revalidatePath("/");
    revalidatePath(adminPath);
    return { success: true };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function toggleEventActive(id: string, isActive: boolean) {
  try {
    await requireAdminSession();
    const validId = idSchema.parse(id);

    await prisma.bookingEvent.update({
      where: { id: validId },
      data: { isActive },
    });

    revalidatePath("/");
    revalidatePath(adminPath);
    return { success: true };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
