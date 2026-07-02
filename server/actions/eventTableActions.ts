"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildLudoTableLayout } from "@/lib/tableLayout";
import { getActionErrorMessage } from "@/server/actions/actionUtils";
import { TableType } from "@prisma/client";

const adminPath = "/admin/events";

export async function setMinimumChargeByType(
  bookingEventId: string,
  tableType: TableType,
  minimumCharge: number,
) {
  try {
    await requireAdminSession();

    if (!Number.isFinite(minimumCharge) || minimumCharge < 0) {
      throw new Error("Minimum charge must be a valid positive number.");
    }

    const result = await prisma.eventTable.updateMany({
      where: { bookingEventId, tableType },
      data: { basePrice: minimumCharge },
    });

    revalidatePath("/");
    revalidatePath(adminPath);
    revalidatePath(`${adminPath}/${bookingEventId}`);
    return { success: true, count: result.count };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function generateEventTables(bookingEventId: string) {
  try {
    await requireAdminSession();

    const allTables = buildLudoTableLayout();

    let createdCount = 0;
    for (const t of allTables) {
      const existing = await prisma.eventTable.findUnique({
        where: {
          bookingEventId_tableCode: {
            bookingEventId,
            tableCode: t.tableCode,
          },
        },
      });

      if (!existing) {
        await prisma.eventTable.create({
          data: {
            bookingEventId,
            tableCode: t.tableCode,
            capacity: t.capacity,
            tableType: t.tableType,
            status: "AVAILABLE",
          },
        });
        createdCount++;
      }
    }

    revalidatePath("/");
    revalidatePath(adminPath);
    revalidatePath(`${adminPath}/${bookingEventId}`);
    return { success: true, count: createdCount };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
