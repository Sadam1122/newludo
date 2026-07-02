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
import { saveUploadedImage } from "@/lib/upload";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/delivery-order";
const publicPath = "/delivery-order";

export async function getOrCreateDeliveryOrder() {
  const existing = await prisma.bookingEvent.findFirst({
    where: { eventType: "DELIVERY_ORDER" },
    include: {
      packages: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (existing) return existing;

  return prisma.bookingEvent.create({
    data: {
      category: "BOOKING_EVENT",
      title: "Delivery Order",
      eventType: "DELIVERY_ORDER",
      eventDateLabel: "Available Now",
      eventTimeLabel: "24/7",
      ctaLabel: "Order Now",
      isActive: true,
    },
    include: {
      packages: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function updateDeliveryOrder(formData: FormData) {
  await requireAdminSession();

  try {
    const current = await getOrCreateDeliveryOrder();

    const posterFile = getFormFile(formData, "bannerFile");
    let backgroundImage = getFormOptionalString(formData, "backgroundImage");
    if (posterFile) {
      const media = await saveUploadedImage(posterFile);
      backgroundImage = media.url;
    }

    await prisma.bookingEvent.update({
      where: { id: current.id },
      data: {
        title: getFormString(formData, "title", "Delivery Order"),
        description: getFormOptionalString(formData, "description"),
        backgroundImage,
        ctaLabel: getFormString(formData, "ctaLabel", "Order Now"),
        isActive: getFormBoolean(formData, "isActive"),
      },
    });

    revalidatePath("/");
    revalidatePath(adminPath);
    revalidatePath(publicPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Delivery Order updated.");
}
