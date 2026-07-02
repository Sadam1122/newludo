import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { EventForm } from "@/components/admin/EventForm";
import { PackageManager } from "@/components/admin/PackageManager";
import { TableManager } from "@/components/admin/TableManager";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const resolvedParams = await params;

  const event = await prisma.bookingEvent.findUnique({
    where: { id: resolvedParams.id },
    include: {
      packages: {
        orderBy: { sortOrder: "asc" },
      },
      tables: {
        orderBy: [{ tableType: "asc" }, { tableCode: "asc" }],
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Edit Event</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">Modify event details and configuration.</p>
      </div>
      <EventForm event={event} />

      {event.category === "BOOKING_EVENT" && (
        <>
          <PackageManager bookingEventId={event.id} packages={event.packages} />
          <TableManager bookingEventId={event.id} tables={event.tables} />
        </>
      )}
    </div>
  );
}
