"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateEventMiceSetting(data: {
  heroHeadline: string;
  heroDescription: string;
  section2Headline: string;
  section2Description: string;
  quoteText: string;
}) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.eventMiceSetting.findFirst();

  if (existing) {
    await prisma.eventMiceSetting.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.eventMiceSetting.create({
      data,
    });
  }

  revalidatePath("/admin/event-mice");
  revalidatePath("/event-mice");
}
