"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadedAsset, saveUploadedImage } from "@/lib/upload";
import { getFormFile, getFormString } from "@/lib/utils";
import { idSchema } from "@/lib/validations";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/media";

export async function uploadMedia(formData: FormData) {
  await requireAdminSession();

  try {
    const file = getFormFile(formData, "file");
    if (!file) throw new Error("Choose an image to upload.");

    await saveUploadedImage(file);
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Image uploaded.");
}

export async function deleteMedia(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const media = await prisma.mediaFile.findUnique({ where: { id } });

    if (!media) throw new Error("Media file not found.");

    await prisma.mediaFile.delete({ where: { id } });
    await deleteUploadedAsset(media.url);
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Image deleted.");
}
