import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/reservationExpiry";
import { reconcilePendingPayments } from "@/lib/paymentReconcile";

/**
 * External cron entry point (e.g. a scheduled hit from Vercel Cron, an OS
 * scheduler, or a monitoring service). Does two things on every tick:
 *
 * 1. Reconciles PENDING reservations against Midtrans directly (catches any
 *    payment whose webhook never arrived/was delayed — this is what makes
 *    the admin "Sync Payment Status" button a true fallback instead of the
 *    only way to unstick a paid-but-still-PENDING reservation).
 * 2. Releases any PENDING reservation whose 15-minute hold has since
 *    expired, now that step 1 has already rescued any that were actually
 *    paid.
 *
 * This supplements the lazy checks on the booking page/checkout — not a
 * replacement for them. Protect with CRON_SECRET in production: set the env
 * var and pass it as either `?secret=` or an `Authorization: Bearer` header.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const provided = searchParams.get("secret") ?? authHeader?.replace("Bearer ", "");
    if (provided !== cronSecret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  const reconciled = await reconcilePendingPayments();
  const releasedCount = await releaseExpiredReservations();

  return NextResponse.json({ ok: true, reconciled, releasedCount });
}
