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
import { brandSchema } from "@/lib/validations";
import { saveUploadedImage } from "@/lib/upload";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/brands";

export async function updateBrand(formData: FormData) {
  await requireAdminSession();

  try {
    const id = getFormString(formData, "id");
    const data = brandSchema.parse({
      titleBeforeHighlight: getFormString(formData, "titleBeforeHighlight"),
      titleHighlight: getFormString(formData, "titleHighlight"),
      subtitle: getFormString(formData, "subtitle"),
      brandName: getFormString(formData, "brandName"),
      brandLogo: getFormOptionalString(formData, "brandLogo"),
      bottomText: getFormString(formData, "bottomText"),
      isActive: getFormBoolean(formData, "isActive"),
    });

    const file = getFormFile(formData, "brandLogoFile");
    if (file) {
      const media = await saveUploadedImage(file);
      data.brandLogo = media.url;
    }

    if (id) {
      await prisma.brandSection.update({ where: { id }, data });
    } else {
      await prisma.brandSection.create({ data });
    }

    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Brand section updated.");
}
