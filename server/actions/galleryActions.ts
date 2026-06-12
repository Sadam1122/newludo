"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage, saveUploadedVideo } from "@/lib/upload";
import {
  getFormBoolean,
  getFormFile,
  getFormNumber,
  getFormOptionalString,
  getFormString,
} from "@/lib/utils";
import { gallerySchema, idSchema } from "@/lib/validations";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/gallery";

async function buildGalleryData(formData: FormData) {
  const parsed = gallerySchema.parse({
    title: getFormString(formData, "title"),
    caption: getFormOptionalString(formData, "caption"),
    videoUrl: getFormString(formData, "videoUrl"),
    thumbnailUrl: getFormOptionalString(formData, "thumbnailUrl"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });

  const videoFile = getFormFile(formData, "videoFile");
  if (videoFile) {
    const media = await saveUploadedVideo(videoFile);
    parsed.videoUrl = media.url;
  }

  if (!parsed.videoUrl) {
    throw new Error("Upload a video file or paste a video URL.");
  }

  const thumbnailFile = getFormFile(formData, "thumbnailFile");
  if (thumbnailFile) {
    const media = await saveUploadedImage(thumbnailFile);
    parsed.thumbnailUrl = media.url;
  }

  return { ...parsed, videoUrl: parsed.videoUrl };
}

export async function createGalleryItem(formData: FormData) {
  await requireAdminSession();

  try {
    const data = await buildGalleryData(formData);
    await prisma.galleryItem.create({ data });
    revalidatePath("/");
    revalidatePath(adminPath);
    revalidatePath("/admin/media");
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Gallery video created.");
}

export async function updateGalleryItem(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const data = await buildGalleryData(formData);
    await prisma.galleryItem.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath(adminPath);
    revalidatePath("/admin/media");
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Gallery video updated.");
}

export async function deleteGalleryItem(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    await prisma.galleryItem.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Gallery video deleted.");
}

export async function toggleGalleryItemActive(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const galleryItem = await prisma.galleryItem.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!galleryItem) throw new Error("Gallery video not found.");

    await prisma.galleryItem.update({
      where: { id },
      data: { isActive: !galleryItem.isActive },
    });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Gallery visibility updated.");
}
