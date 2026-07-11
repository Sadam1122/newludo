"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActionErrorMessage } from "@/server/actions/actionUtils";
import { DeliveryCategory, TableType } from "@prisma/client";
import { getFormBoolean, getFormFile, getFormOptionalString } from "@/lib/utils";
import { saveUploadedImage } from "@/lib/upload";

const adminPath = "/admin/events";

const VALID_TABLE_TYPES = new Set<string>(Object.values(TableType));

/**
 * Delivery Order menu items and event/table packages share the EventPackage
 * model, but only table packages need a tableType. `mode` (sent explicitly
 * by PackageManager on every submit, not inferred from field presence) keeps
 * that validation split so a delivery item never gets forced into a bogus
 * table type, and an event package can never silently save without one.
 */
function resolveTableType(formData: FormData, mode: string): { tableType: TableType | null } | { error: string } {
  if (mode === "delivery") {
    return { tableType: null };
  }

  const raw = formData.get("tableType");
  if (typeof raw !== "string" || !VALID_TABLE_TYPES.has(raw)) {
    return { error: "Please select a valid Table Type for this package." };
  }
  return { tableType: raw as TableType };
}

export async function createEventPackage(formData: FormData) {
  try {
    await requireAdminSession();

    const bookingEventId = formData.get("bookingEventId") as string;
    const mode = formData.get("mode") === "delivery" ? "delivery" : "event";
    const name = formData.get("name") as string;
    const price = Number(formData.get("price")) || 0;
    const description = getFormOptionalString(formData, "description");
    const categoryRaw = getFormOptionalString(formData, "category");
    const category = categoryRaw ? (categoryRaw as DeliveryCategory) : null;
    const subCategory = getFormOptionalString(formData, "subCategory");

    const tableTypeResult = resolveTableType(formData, mode);
    if ("error" in tableTypeResult) {
      return { error: tableTypeResult.error };
    }

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
        tableType: tableTypeResult.tableType,
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

export async function updateEventPackage(formData: FormData) {
  try {
    await requireAdminSession();

    const id = formData.get("id") as string;
    const bookingEventId = formData.get("bookingEventId") as string;
    const mode = formData.get("mode") === "delivery" ? "delivery" : "event";
    const name = formData.get("name") as string;
    const price = Number(formData.get("price")) || 0;
    const description = getFormOptionalString(formData, "description");
    const categoryRaw = getFormOptionalString(formData, "category");
    const category = categoryRaw ? (categoryRaw as DeliveryCategory) : null;
    const subCategory = getFormOptionalString(formData, "subCategory");
    const isActive = getFormBoolean(formData, "isActive");
    const isSoldOut = getFormBoolean(formData, "isSoldOut");

    const tableTypeResult = resolveTableType(formData, mode);
    if ("error" in tableTypeResult) {
      return { error: tableTypeResult.error };
    }

    const posterFile = getFormFile(formData, "posterFile");
    let posterImage: string | undefined;

    if (posterFile) {
      const media = await saveUploadedImage(posterFile);
      posterImage = media.url;
    }

    await prisma.eventPackage.update({
      where: { id },
      data: {
        name,
        price,
        tableType: tableTypeResult.tableType,
        description,
        category,
        subCategory,
        isActive,
        isSoldOut,
        ...(posterImage ? { posterImage } : {}),
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

export async function toggleEventPackageSoldOut(id: string, bookingEventId: string) {
  try {
    await requireAdminSession();

    const pkg = await prisma.eventPackage.findUnique({
      where: { id },
      select: { isSoldOut: true },
    });
    if (!pkg) throw new Error("Item not found.");

    await prisma.eventPackage.update({
      where: { id },
      data: { isSoldOut: !pkg.isSoldOut },
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
