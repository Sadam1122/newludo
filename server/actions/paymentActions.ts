"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { getTransactionStatus } from "@/lib/midtrans";
import { processMidtransStatusUpdate } from "@/lib/paymentSync";
import { getActionErrorMessage } from "@/server/actions/actionUtils";

/**
 * Pulls the current status directly from Midtrans and reconciles the local
 * Reservation/EventTable rows through the same logic the webhook uses. This
 * is the admin-facing fix for "webhook never arrived, reservation stuck on
 * PENDING even though Midtrans already shows it as paid".
 */
export async function syncPaymentStatus(reservationId: string, bookingEventId: string) {
  await requireAdminSession();

  try {
    const midtransStatus = await getTransactionStatus(reservationId);
    const result = await processMidtransStatusUpdate(midtransStatus);

    revalidatePath(`/admin/transactions/${bookingEventId}`);
    revalidatePath("/admin/transactions");

    if (!result.ok) {
      return { error: result.message };
    }

    return { success: true, status: result.reservationStatus };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
