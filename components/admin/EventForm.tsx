import type { EventBanner } from "@prisma/client";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { createEvent, updateEvent } from "@/server/actions/eventActions";

export function EventForm({
  event,
  nextSortOrder,
}: {
  event?: EventBanner;
  nextSortOrder?: number;
}) {
  const isEditing = Boolean(event);

  return (
    <form
      action={isEditing ? updateEvent : createEvent}
      encType="multipart/form-data"
      className="space-y-4"
    >
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      {event?.backgroundImage ? (
        <div className="mx-auto max-w-sm overflow-hidden rounded border border-white/10 bg-ludo-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.backgroundImage}
            alt="Event image preview"
            className="aspect-[4/5] w-full object-cover"
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
          label="Talent / Artist Name"
          name="artistName"
          defaultValue={event?.artistName ?? ""}
        />
        <Field
          label="Talent Label"
          name="talentLabel"
          defaultValue={event?.talentLabel ?? "Talent"}
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
          label="Scheduled Date & Time"
          name="scheduledAt"
          type="datetime-local"
          defaultValue={toDateTimeLocal(event?.scheduledAt)}
          required={false}
        />
        <Field
          label="Type Label"
          name="eventTypeLabel"
          defaultValue={event?.eventTypeLabel ?? ""}
          required={false}
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
          defaultValue={String(event?.sortOrder ?? nextSortOrder ?? 0)}
        />
        <Field
          label="Background Image URL"
          name="backgroundImage"
          defaultValue={event?.backgroundImage ?? ""}
          required={false}
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
        <FormFieldLabel required={false}>WhatsApp Message</FormFieldLabel>
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

      <ConfirmSubmitButton
        title={isEditing ? "Save event changes?" : "Create this event?"}
        description={
          isEditing
            ? "This will update the selected event and refresh the public event carousel if it is active."
            : "This will add a new event to the CMS. If Active is enabled, it can appear on the public homepage."
        }
        confirmLabel={isEditing ? "Save Event" : "Create Event"}
      >
        {isEditing ? "Save Event" : "Create Event"}
      </ConfirmSubmitButton>
    </form>
  );
}

function toDateTimeLocal(value?: Date | string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return offsetDate.toISOString().slice(0, 16);
}

function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FormFieldLabel required={required}>{label}</FormFieldLabel>
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
      <FormFieldLabel required={false}>{label}</FormFieldLabel>
      <input
        name={name}
        type="file"
        accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/svg+xml"
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
