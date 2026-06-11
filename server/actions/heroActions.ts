"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFormBoolean,
  getFormFile,
  getFormOptionalString,
  getFormString,
} from "@/lib/utils";
import { heroSchema } from "@/lib/validations";
import { saveUploadedImage } from "@/lib/upload";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/hero";

export async function updateHero(formData: FormData) {
  await requireAdminSession();

  try {
    const id = getFormString(formData, "id");
    const data = heroSchema.parse({
      headlineLine1: getFormString(formData, "headlineLine1"),
      headlineHighlight1: getFormString(formData, "headlineHighlight1"),
      headlineLine2: getFormString(formData, "headlineLine2"),
      headlineHighlight2: getFormString(formData, "headlineHighlight2"),
      subtitle: getFormString(formData, "subtitle"),
      ctaLabel: getFormString(formData, "ctaLabel"),
      ctaWhatsappMessage: getFormString(formData, "ctaWhatsappMessage"),
      backgroundImage: getFormOptionalString(formData, "backgroundImage"),
      isActive: getFormBoolean(formData, "isActive"),
    });

    const file = getFormFile(formData, "backgroundImageFile");
    if (file) {
      const media = await saveUploadedImage(file);
      data.backgroundImage = media.url;
    }

    if (id) {
      await prisma.heroSection.update({ where: { id }, data });
    } else {
      await prisma.heroSection.create({ data });
    }

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Hero section updated.");
}
