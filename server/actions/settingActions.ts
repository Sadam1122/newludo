"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFormString } from "@/lib/utils";
import { siteSettingsSchema } from "@/lib/validations";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/settings";

export async function updateSiteSettings(formData: FormData) {
  await requireAdminSession();

  try {
    const id = getFormString(formData, "id");
    const data = siteSettingsSchema.parse({
      siteName: getFormString(formData, "siteName"),
      siteTagline: getFormString(formData, "siteTagline"),
      whatsappNumber: getFormString(formData, "whatsappNumber"),
      defaultWhatsappMessage: getFormString(formData, "defaultWhatsappMessage"),
      instagramHandle: getFormString(formData, "instagramHandle"),
      instagramUrl: getFormString(formData, "instagramUrl"),
      tiktokHandle: getFormString(formData, "tiktokHandle"),
      tiktokUrl: getFormString(formData, "tiktokUrl"),
      menuUrl: getFormString(formData, "menuUrl"),
      footerCopyright: getFormString(formData, "footerCopyright"),
    });

    if (id) {
      await prisma.siteSetting.update({ where: { id }, data });
    } else {
      await prisma.siteSetting.create({ data });
    }

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Site settings updated.");
}
