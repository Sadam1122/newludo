"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFormFile,
  getFormOptionalString,
  getFormString,
} from "@/lib/utils";
import { locationSchema } from "@/lib/validations";
import { saveUploadedImage } from "@/lib/upload";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/location";

export async function updateLocation(formData: FormData) {
  await requireAdminSession();

  try {
    const id = getFormString(formData, "id");
    const data = locationSchema.parse({
      businessName: getFormString(formData, "businessName"),
      address: getFormString(formData, "address"),
      mapImage: getFormOptionalString(formData, "mapImage"),
      mapUrl: getFormString(formData, "mapUrl"),
      instagramHandle: getFormString(formData, "instagramHandle"),
      instagramUrl: getFormString(formData, "instagramUrl"),
      tiktokHandle: getFormString(formData, "tiktokHandle"),
      tiktokUrl: getFormString(formData, "tiktokUrl"),
    });

    const file = getFormFile(formData, "mapImageFile");
    if (file) {
      const media = await saveUploadedImage(file);
      data.mapImage = media.url;
    }

    if (id) {
      await prisma.locationSetting.update({ where: { id }, data });
    } else {
      await prisma.locationSetting.create({ data });
    }

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Location settings updated.");
}
