"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFormBoolean,
  getFormOptionalString,
  getFormString,
} from "@/lib/utils";
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
      matchSectionTitle: getFormString(formData, "matchSectionTitle"),
      headerBookingLabel: getFormString(formData, "headerBookingLabel"),
      headerBookingUrl: getFormOptionalString(formData, "headerBookingUrl"),
      headerBookingVisible: getFormBoolean(formData, "headerBookingVisible"),
      eventMiceLabel: getFormString(formData, "eventMiceLabel"),
      eventMiceUrl:
        getFormOptionalString(formData, "eventMiceUrl") ?? "/event-mice",
      eventMiceVisible: getFormBoolean(formData, "eventMiceVisible"),
      instagramHandle: getFormString(formData, "instagramHandle"),
      instagramUrl: getFormString(formData, "instagramUrl"),
      tiktokHandle: getFormString(formData, "tiktokHandle"),
      tiktokUrl: getFormString(formData, "tiktokUrl"),
      menuUrl: getFormString(formData, "menuUrl"),
      footerCopyright: getFormString(formData, "footerCopyright"),
    });
    const siteSettingData = {
      ...data,
      eventMiceUrl: data.eventMiceUrl ?? "/event-mice",
    };

    if (id) {
      await prisma.siteSetting.update({ where: { id }, data: siteSettingData });
    } else {
      await prisma.siteSetting.create({ data: siteSettingData });
    }

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Site settings updated.");
}
