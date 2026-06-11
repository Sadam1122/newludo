import { ToggleLeft, ToggleRight } from "lucide-react";

import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminTable } from "@/components/admin/AdminTable";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { EventForm } from "@/components/admin/EventForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteEvent, toggleEventActive } from "@/server/actions/eventActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const events = await prisma.eventBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Events</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Active events rotate in the public event carousel.
        </p>
      </div>

      <AdminCard title="Create Event">
        <EventForm />
      </AdminCard>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">All Events</h2>
          <p className="text-xs font-bold uppercase text-white/45">
            {events.filter((event) => event.isActive).length} public /{" "}
            {events.length} total
          </p>
        </div>

        <AdminTable>
          <thead className="bg-white/[0.055] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {events.map((event) => (
              <tr
                key={event.id}
                className={cn(
                  "align-top transition",
                  event.isActive ? "bg-transparent" : "bg-white/[0.025]",
                )}
              >
                <td className="px-4 py-4">
                  <p className="font-black text-white">{event.title}</p>
                  <p className="text-white/60">{event.artistName}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-white/35">
                    Sort #{event.sortOrder}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-ludo-gold">
                      Edit event
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/10 bg-ludo-black p-4">
                      <EventForm event={event} />
                    </div>
                  </details>
                </td>
                <td className="px-4 py-4 text-white/70">
                  {event.eventDateLabel} &middot; {event.eventTimeLabel}
                </td>
                <td className="px-4 py-4">
                  <ActiveStatusBadge
                    active={event.isActive}
                    activeLabel="Public"
                    inactiveLabel="Hidden"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleEventActive}>
                      <input type="hidden" name="id" value={event.id} />
                      <button
                        type="submit"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition",
                          event.isActive
                            ? "border-ludo-gold/35 bg-ludo-gold/10 text-ludo-gold hover:bg-ludo-gold hover:text-ludo-black"
                            : "border-ludo-green/35 bg-ludo-green/10 text-green-100 hover:bg-ludo-green hover:text-ludo-black",
                        )}
                      >
                        {event.isActive ? (
                          <ToggleRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                        {event.isActive ? "Hide" : "Publish"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      action={deleteEvent}
                      id={event.id}
                      itemType="event"
                      itemLabel={`${event.title} - ${event.artistName}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
