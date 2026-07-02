import { AdminHeader } from "@/components/admin/AdminHeader";
import { EventForm } from "@/components/admin/EventForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdminSession();

  const latestEvent = await prisma.bookingEvent.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const nextSortOrder = latestEvent ? latestEvent.sortOrder + 1 : 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Create Event</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">Add a new Live Event or Booking Event.</p>
      </div>
      <EventForm nextSortOrder={nextSortOrder} />
    </div>
  );
}
