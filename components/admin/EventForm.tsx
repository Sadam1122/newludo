import type { EventBanner } from "@prisma/client";
import { Save } from "lucide-react";

import { createEvent, updateEvent } from "@/server/actions/eventActions";

type EventFormProps = {
  event?: EventBanner;
};

export function EventForm({ event }: EventFormProps) {
  const isEditing = Boolean(event);

  return (
    <form action={isEditing ? updateEvent : createEvent} className="space-y-4">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      {event?.backgroundImage ? (
        <div className="overflow-hidden rounded border border-white/10 bg-ludo-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.backgroundImage}
            alt="Event image preview"
            className="h-56 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Title"
          name="title"
          defaultValue={event?.title ?? "Live Performance"}
        />
        <Field
          label="Artist Name"
          name="artistName"
          defaultValue={event?.artistName ?? ""}
        />
        <Field
          label="Date Label"
          name="eventDateLabel"
          defaultValue={event?.eventDateLabel ?? ""}
        />
        <Field
          label="Time Label"
          name="eventTimeLabel"
          defaultValue={event?.eventTimeLabel ?? ""}
        />
        <Field
          label="Type Label"
          name="eventTypeLabel"
          defaultValue={event?.eventTypeLabel ?? ""}
        />
        <Field
          label="CTA Label"
          name="ctaLabel"
          defaultValue={event?.ctaLabel ?? "RESERVE SEAT"}
        />
        <Field
          label="Sort Order"
          name="sortOrder"
          type="number"
          defaultValue={String(event?.sortOrder ?? 0)}
        />
        <Field
          label="Background Image URL"
          name="backgroundImage"
          defaultValue={event?.backgroundImage ?? ""}
        />
        <FileField
          label="Upload Event Image"
          name="backgroundImageFile"
          value={event?.backgroundImage}
        />
        <Field
          label="Headline Line 1"
          name="headlineLine1"
          defaultValue={event?.headlineLine1 ?? "FROM"}
        />
        <Field
          label="Headline Highlight 1"
          name="headlineHighlight1"
          defaultValue={event?.headlineHighlight1 ?? "DAYTIME."}
        />
        <Field
          label="Headline Line 2"
          name="headlineLine2"
          defaultValue={event?.headlineLine2 ?? "NIGHT"}
        />
        <Field
          label="Headline Highlight 2"
          name="headlineHighlight2"
          defaultValue={event?.headlineHighlight2 ?? "VIBES."}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white/75">
          WhatsApp Message
        </span>
        <textarea
          name="whatsappMessage"
          rows={3}
          defaultValue={event?.whatsappMessage ?? ""}
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <Checkbox
        label="Active"
        name="isActive"
        defaultChecked={event?.isActive ?? true}
      />

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {isEditing ? "Save Event" : "Create Event"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/75">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
      />
    </label>
  );
}

function FileField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/75">
        {label}
      </span>
      <input
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="min-h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-ludo-black"
      />
      {value ? (
        <span className="mt-1 block break-all text-xs text-white/45">
          {value}
        </span>
      ) : null}
    </label>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-white/20 bg-ludo-black accent-ludo-red"
      />
      {label}
    </label>
  );
}
