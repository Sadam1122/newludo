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
import { heroSchema, idSchema } from "@/lib/validations";
import { saveUploadedImage } from "@/lib/upload";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/hero";

async function buildHeroData(formData: FormData) {
  const parsed = heroSchema.parse({
    headlineLine1: getFormString(formData, "headlineLine1"),
    headlineHighlight1: getFormString(formData, "headlineHighlight1"),
    headlineLine2: getFormString(formData, "headlineLine2"),
    headlineHighlight2: getFormString(formData, "headlineHighlight2"),
    subtitle: getFormString(formData, "subtitle"),
    ctaLabel: getFormString(formData, "ctaLabel"),
    ctaWhatsappMessage: getFormString(formData, "ctaWhatsappMessage"),
    backgroundImage: getFormOptionalString(formData, "backgroundImage"),
    portraitImage: getFormOptionalString(formData, "portraitImage"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });

  const file = getFormFile(formData, "backgroundImageFile");
  if (file) {
    const media = await saveUploadedImage(file);
    parsed.backgroundImage = media.url;
  }

  const portraitFile = getFormFile(formData, "portraitImageFile");
  if (portraitFile) {
    const media = await saveUploadedImage(portraitFile);
    parsed.portraitImage = media.url;
  }

  return parsed;
}

export async function createHero(formData: FormData) {
  await requireAdminSession();

  try {
    const data = await buildHeroData(formData);
    await prisma.heroSection.create({ data });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Hero slide created.");
}

export async function updateHero(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const data = await buildHeroData(formData);
    await prisma.heroSection.update({ where: { id }, data });

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Hero slide updated.");
}

export async function deleteHero(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    await prisma.heroSection.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Hero slide deleted.");
}

export async function toggleHeroActive(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const hero = await prisma.heroSection.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!hero) throw new Error("Hero slide not found.");

    await prisma.heroSection.update({
      where: { id },
      data: { isActive: !hero.isActive },
    });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Hero slide visibility updated.");
}
