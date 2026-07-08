import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/reservationExpiry";

/**
 * External cron entry point (e.g. a scheduled hit from Vercel Cron, an OS
 * scheduler, or a monitoring service) that releases any PENDING reservation
 * whose 15-minute hold has expired. This is a supplement to the lazy checks
 * on the booking page and checkout — not a replacement for them.
 *
 * Protect with CRON_SECRET in production: set the env var and pass it as
 * either `?secret=` or an `Authorization: Bearer` header.
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

  const releasedCount = await releaseExpiredReservations();
  return NextResponse.json({ ok: true, releasedCount });
}
