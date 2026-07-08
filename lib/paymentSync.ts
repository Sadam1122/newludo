import { prisma } from "@/lib/prisma";
import type { MidtransTransactionStatus } from "@/lib/midtrans";
import type { ReservationStatus, TableStatus } from "@prisma/client";

type StatusMapping = {
  reservationStatus: ReservationStatus;
  tableStatus: TableStatus | null;
};

function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus: string | undefined,
): StatusMapping {
  switch (transactionStatus) {
    case "capture":
      if (fraudStatus === "accept") {
        return { reservationStatus: "SUCCESS", tableStatus: "PAID" };
      }
      if (fraudStatus === "deny") {
        return { reservationStatus: "FAILED", tableStatus: "AVAILABLE" };
      }
      // "challenge" or unknown fraud_status: needs manual review, don't move
      // the reservation off PENDING yet — the fraudStatus field still gets
      // persisted so admins can see it needs attention.
      return { reservationStatus: "PENDING", tableStatus: null };
    case "settlement":
      return { reservationStatus: "SUCCESS", tableStatus: "PAID" };
    case "pending":
      return { reservationStatus: "PENDING", tableStatus: "SELECTED" };
    case "deny":
    case "failure":
      return { reservationStatus: "FAILED", tableStatus: "AVAILABLE" };
    case "cancel":
      return { reservationStatus: "CANCELLED", tableStatus: "AVAILABLE" };
    case "expire":
      return { reservationStatus: "EXPIRED", tableStatus: "AVAILABLE" };
    case "refund":
    case "partial_refund":
      // Money was already captured at some point; refunding doesn't
      // automatically free the table back up — that's an operational
      // decision, not an automatic one. Status/table intentionally untouched
      // here; the raw payload is still persisted below for audit.
      return { reservationStatus: "SUCCESS", tableStatus: null };
    default:
      return { reservationStatus: "PENDING", tableStatus: null };
  }
}

/**
 * Single source of truth for turning a Midtrans transaction payload into
 * database writes. Used identically by the webhook (push) and the manual
 * "Sync Payment Status" admin action (pull via getTransactionStatus), so the
 * two code paths can never drift apart.
 */
export async function processMidtransStatusUpdate(
  payload: MidtransTransactionStatus,
) {
  const {
    order_id: orderId,
    transaction_status: transactionStatus,
    fraud_status: fraudStatus,
    payment_type: paymentType,
    transaction_id: transactionId,
    gross_amount: grossAmount,
  } = payload;

  const reservation = await prisma.reservation.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { eventTable: true } },
      bookingEvent: { select: { eventType: true } },
    },
  });

  if (!reservation) {
    return { ok: false as const, message: "Reservation not found" };
  }

  if (grossAmount && Number(grossAmount) !== reservation.totalPrice) {
    console.warn(
      `[midtrans] gross_amount mismatch for ${orderId}: Midtrans=${grossAmount} DB=${reservation.totalPrice}`,
    );
  }

  const { reservationStatus, tableStatus } = mapMidtransStatus(
    transactionStatus,
    fraudStatus,
  );
  const isSeatBased = reservation.bookingEvent?.eventType === "NOBAR_COMMUNITY";

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: orderId },
      data: {
        status: reservationStatus,
        paymentMethod: paymentType ?? reservation.paymentMethod,
        transactionId: transactionId ?? reservation.transactionId,
        fraudStatus: fraudStatus ?? reservation.fraudStatus,
        paymentCallbackData: JSON.stringify(payload),
        paidAt: reservationStatus === "SUCCESS" ? new Date() : reservation.paidAt,
      },
    });

    if (!tableStatus) return;

    if (isSeatBased) {
      // Only release held seats on a terminal failure/cancel/expire. Success
      // and pending don't need any table change — seats were already held
      // at checkout time.
      if (tableStatus === "AVAILABLE") {
        for (const item of reservation.orderItems) {
          if (!item.eventTableId || !item.eventTable) continue;
          const releasedSeats = Math.max(0, item.eventTable.bookedSeats - item.quantity);
          await tx.eventTable.update({
            where: { id: item.eventTableId },
            data: { bookedSeats: releasedSeats, status: "AVAILABLE" },
          });
        }
      }
    } else {
      const tableIds = reservation.orderItems
        .map((item) => item.eventTableId)
        .filter((id): id is string => id !== null);

      if (tableIds.length > 0) {
        await tx.eventTable.updateMany({
          where: { id: { in: tableIds } },
          data: { status: tableStatus },
        });
      }
    }
  });

  return {
    ok: true as const,
    reservationStatus,
    tableStatus,
  };
}
