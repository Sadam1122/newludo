import { prisma } from "@/lib/prisma";

/**
 * Releases PENDING reservations whose 15-minute hold (expiredAt) has passed,
 * reverting their tables/seats back to AVAILABLE. This is the safety net for
 * whenever the Midtrans webhook never arrives (customer abandons before any
 * Midtrans-side status change, notification URL unreachable, etc.) — without
 * it, a table can stay locked forever.
 *
 * Called lazily (booking page load, checkout start) and can also be triggered
 * by an external cron hitting /api/cron/release-expired.
 */
export async function releaseExpiredReservations(bookingEventId?: string) {
  const now = new Date();

  const expired = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiredAt: { lt: now },
      ...(bookingEventId ? { bookingEventId } : {}),
    },
    include: {
      orderItems: { include: { eventTable: true } },
      bookingEvent: { select: { eventType: true } },
    },
  });

  let releasedCount = 0;

  for (const reservation of expired) {
    const isSeatBased = reservation.bookingEvent?.eventType === "NOBAR_COMMUNITY";

    await prisma.$transaction(async (tx) => {
      const current = await tx.reservation.findUnique({
        where: { id: reservation.id },
        select: { status: true },
      });
      // Guard against a webhook/sync racing in between our findMany and now.
      if (current?.status !== "PENDING") return;

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: "EXPIRED" },
      });

      if (isSeatBased) {
        for (const item of reservation.orderItems) {
          if (!item.eventTableId || !item.eventTable) continue;
          const releasedSeats = Math.max(0, item.eventTable.bookedSeats - item.quantity);
          await tx.eventTable.update({
            where: { id: item.eventTableId },
            data: { bookedSeats: releasedSeats, status: "AVAILABLE" },
          });
        }
      } else {
        const tableIds = reservation.orderItems
          .map((item) => item.eventTableId)
          .filter((id): id is string => id !== null);

        if (tableIds.length > 0) {
          await tx.eventTable.updateMany({
            where: { id: { in: tableIds }, status: { in: ["SELECTED", "AVAILABLE"] } },
            data: { status: "AVAILABLE" },
          });
        }
      }
    });

    releasedCount++;
  }

  return releasedCount;
}
