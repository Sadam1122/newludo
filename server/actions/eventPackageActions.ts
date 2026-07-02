"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActionErrorMessage } from "@/server/actions/actionUtils";
import { DeliveryCategory, TableType } from "@prisma/client";
import { getFormFile, getFormOptionalString } from "@/lib/utils";
import { saveUploadedImage } from "@/lib/upload";

const adminPath = "/admin/events";

export async function createEventPackage(formData: FormData) {
  try {
    await requireAdminSession();
    
    const bookingEventId = formData.get("bookingEventId") as string;
    const name = formData.get("name") as string;
    const price = Number(formData.get("price")) || 0;
    const tableType = formData.get("tableType") as TableType;
    const description = getFormOptionalString(formData, "description");
    const categoryRaw = getFormOptionalString(formData, "category");
    const category = categoryRaw ? (categoryRaw as DeliveryCategory) : null;
    const subCategory = getFormOptionalString(formData, "subCategory");

    const posterFile = getFormFile(formData, "posterFile");
    let posterImage: string | null = null;

    if (posterFile) {
      const media = await saveUploadedImage(posterFile);
      posterImage = media.url;
    }

    await prisma.eventPackage.create({
      data: {
        bookingEventId,
        name,
        price,
        tableType,
        description,
        category,
        subCategory,
        posterImage,
      },
    });

    revalidatePath("/");
    revalidatePath(`${adminPath}/${bookingEventId}`);
    revalidatePath("/admin/delivery-order");
    revalidatePath("/delivery-order");
    return { success: true };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function deleteEventPackage(id: string, bookingEventId: string) {
  try {
    await requireAdminSession();
    await prisma.eventPackage.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath(`${adminPath}/${bookingEventId}`);
    revalidatePath("/admin/delivery-order");
    revalidatePath("/delivery-order");
    return { success: true };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
