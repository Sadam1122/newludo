import { notFound, redirect } from "next/navigation";
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
      matches: { select: { id: true } },
    },
  });

  if (!event) {
    notFound();
  }

  // Match-linked events are managed from their own dedicated page so the
  // Events CMS (category/template/headline fields) never collides with
  // match-specific data (teams, match category) edited in the Matches CMS.
  if (event.matches.length > 0) {
    redirect(`/admin/matches/${event.matches[0].id}`);
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Edit Event</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">Modify event details and configuration.</p>
      </div>
      <EventForm event={event} />

      {event.category === "BOOKING_EVENT" && event.eventType !== "REGULER_MATCH" && (
        <>
          <PackageManager bookingEventId={event.id} packages={event.packages} />
          <TableManager bookingEventId={event.id} tables={event.tables} />
        </>
      )}
      {event.eventType === "REGULER_MATCH" && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-sm text-zinc-400">
          <b className="text-white">REGULER MATCH</b> uses a WhatsApp CTA only — table & package
          management is hidden because this event never goes through the payment flow.
        </div>
      )}
    </div>
  );
}
