import { prisma } from "@/lib/prisma";
import { getTransactionStatus } from "@/lib/midtrans";
import { processMidtransStatusUpdate } from "@/lib/paymentSync";

/**
 * Actively pulls the Midtrans status for every still-PENDING reservation
 * that already has a Snap transaction, so a missed/delayed webhook heals
 * itself on the next cron tick instead of needing an admin to click "Sync
 * Payment Status". Each reservation is reconciled independently — one
 * failure (e.g. Midtrans has no record yet because the customer never
 * opened the Snap popup) never blocks the rest of the batch.
 */
export async function reconcilePendingPayments(bookingEventId?: string) {
  const pending = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      snapToken: { not: null },
      ...(bookingEventId ? { bookingEventId } : {}),
    },
    select: { id: true },
  });

  let updated = 0;

  for (const { id } of pending) {
    try {
      const midtransStatus = await getTransactionStatus(id);
      const result = await processMidtransStatusUpdate(midtransStatus);
      if (result.ok && result.reservationStatus !== "PENDING") {
        updated++;
      }
    } catch (error) {
      console.error(`[reconcile] failed to check order_id=${id}:`, error);
    }
  }

  return { checked: pending.length, updated };
}
