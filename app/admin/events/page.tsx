import { Plus } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { BookingEventsTable } from "@/components/admin/BookingEventsTable";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;

  const events = await prisma.bookingEvent.findMany({
    where: {
      eventType: { not: "DELIVERY_ORDER" },
      matches: { none: {} },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tables: true, packages: true, reservations: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Events</h1>
          <p className="mt-2 text-sm font-semibold text-white/50">Manage your Live Events and Booking Events.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-ludo-gold px-4 text-sm font-black text-ludo-black transition hover:bg-ludo-gold/90 hover:shadow-[0_0_20px_rgba(247,198,0,0.3)]"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create Event
        </Link>
      </div>
      <BookingEventsTable events={events} />
    </div>
  );
}
