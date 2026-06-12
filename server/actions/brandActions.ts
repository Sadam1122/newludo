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
import { saveUploadedImage } from "@/lib/upload";
import { brandSchema, idSchema } from "@/lib/validations";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/brands";

async function buildBrandData(formData: FormData) {
  const parsed = brandSchema.parse({
    titleBeforeHighlight: getFormString(formData, "titleBeforeHighlight"),
    titleHighlight: getFormString(formData, "titleHighlight"),
    subtitle: getFormString(formData, "subtitle"),
    brandName: getFormString(formData, "brandName"),
    brandLogo: getFormOptionalString(formData, "brandLogo"),
    bottomText: getFormString(formData, "bottomText"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });

  const file = getFormFile(formData, "brandLogoFile");
  if (file) {
    const media = await saveUploadedImage(file);
    parsed.brandLogo = media.url;
  }

  return parsed;
}

export async function createBrand(formData: FormData) {
  await requireAdminSession();

  try {
    const data = await buildBrandData(formData);
    await prisma.brandSection.create({ data });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Brand partner created.");
}

export async function updateBrand(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const data = await buildBrandData(formData);
    await prisma.brandSection.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Brand partner updated.");
}

export async function deleteBrand(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    await prisma.brandSection.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Brand partner deleted.");
}

export async function toggleBrandActive(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const brand = await prisma.brandSection.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!brand) throw new Error("Brand partner not found.");

    await prisma.brandSection.update({
      where: { id },
      data: { isActive: !brand.isActive },
    });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Brand visibility updated.");
}
