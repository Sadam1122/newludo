"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookingEvent, EventTemplate } from "@prisma/client";
import { Edit2, LayoutGrid, AlertTriangle } from "lucide-react";

import { deleteEvent, toggleEventActive } from "@/server/actions/eventActions";
import { generateEventTables } from "@/server/actions/eventTableActions";
import { ActiveStatusBadge } from "./ActiveStatusBadge";
import { AdminTable } from "./AdminTable";
import { DeleteConfirmButton } from "./DeleteConfirmButton";

type EventWithCounts = BookingEvent & {
  _count: {
    tables: number;
    packages: number;
    reservations: number;
  };
};

export function BookingEventsTable({ events }: { events: EventWithCounts[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-ludo-black p-12 text-center">
        <p className="text-zinc-400">No booking events found.</p>
        <Link
          href="/admin/booking-events/new"
          className="mt-4 inline-block text-sm font-bold text-ludo-gold hover:underline"
        >
          Create your first event
        </Link>
      </div>
    );
  }

  return (
    <AdminTable>
      <thead className="bg-white/[0.04]">
        <tr>
          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-white/50">Poster</th>
          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-white/50">Event Title</th>
          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-white/50">Type</th>
          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-white/50">Details</th>
          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-white/50">Status</th>
          <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-white/50">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10">
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </tbody>
    </AdminTable>
  );
}

function EventRow({ event }: { event: EventWithCounts }) {
  const [isActive, setIsActive] = useState(event.isActive);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggle = async () => {
    const newState = !isActive;
    setIsActive(newState);
    const result = await toggleEventActive(event.id, newState);
    if (result.error) {
      setIsActive(!newState);
      alert(result.error);
    }
  };

  const handleDelete = async (formData: FormData) => {
    const result = await deleteEvent(event.id);
    if (result.error) {
      alert(result.error);
    }
  };

  const handleGenerateTables = async () => {
    if (confirm("Generate tables according to the LUDO Layout (VVIP, VIP, Reguler, Barstool)? This will skip tables that already exist.")) {
      setIsGenerating(true);
      const result = await generateEventTables(event.id);
      setIsGenerating(false);
      
      if (result.error) {
        alert(result.error);
      } else {
        alert(`Successfully generated ${result.count} new tables!`);
      }
    }
  };

  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
      <td className="p-4">
        {event.backgroundImage ? (
          <div className="relative aspect-video w-24 overflow-hidden rounded bg-zinc-900">
            <Image
              src={event.backgroundImage}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-24 items-center justify-center rounded bg-zinc-900 text-xs text-zinc-600">
            No Image
          </div>
        )}
      </td>
      <td className="p-4">
        <p className="font-bold text-white">{event.title}</p>
        <p className="text-xs text-zinc-400">
          {event.eventDateLabel} • {event.eventTimeLabel}
        </p>
      </td>
      <td className="p-4">
        <div className="flex flex-col items-start gap-2">
          <span className="inline-flex rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-300">
            {event.category === "LIVE_EVENT" ? "LIVE EVENT" : "BOOKING EVENT"}
          </span>
          <span className="inline-flex rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/40">
            {event.category === "LIVE_EVENT" 
              ? event.eventTypeLabel || event.title 
              : event.eventType.replace(/_/g, " ")}
          </span>
        </div>
      </td>
      <td className="p-4">
        {event.category === "LIVE_EVENT" ? (
          <span className="text-xs text-zinc-500">WhatsApp Only</span>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">
              <strong className="text-white">{event._count.packages}</strong> Pkgs
            </span>
            <span className="text-xs text-zinc-400">
              <strong className="text-white">{event._count.tables}</strong> Tables
            </span>
            <span className="text-xs text-zinc-400">
              <strong className="text-white">{event._count.reservations}</strong> Resv
            </span>
            {event._count.tables === 0 && (
              <button
                onClick={handleGenerateTables}
                disabled={isGenerating}
                className="mt-2 inline-flex items-center gap-1.5 rounded bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
              >
                <LayoutGrid className="size-3" />
                {isGenerating ? "Generating..." : "Generate Tables"}
              </button>
            )}
          </div>
        )}
      </td>
      <td className="p-4">
        <button onClick={handleToggle} type="button" className="transition-opacity hover:opacity-80">
          <ActiveStatusBadge active={isActive} />
        </button>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/events/${event.id}`}
            className="inline-flex size-8 items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          >
            <Edit2 className="size-4" />
          </Link>
          <DeleteConfirmButton
            action={handleDelete}
            id={event.id}
            itemLabel={event.title}
            itemType="event"
          />
        </div>
      </td>
    </tr>
  );
}
