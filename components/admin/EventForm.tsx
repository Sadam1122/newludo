"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookingEvent, EventTemplate, EventCategory } from "@prisma/client";
import { Info } from "lucide-react";

import {
  createEvent,
  updateEvent,
} from "@/server/actions/eventActions";
import { AdminCard } from "./AdminCard";
import { AdminNotice } from "./AdminNotice";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { FormFieldLabel } from "./FormFieldLabel";
import { InfoTooltip } from "./InfoTooltip";

type Props = {
  event?: BookingEvent | null;
  nextSortOrder?: number;
};

const toDateTimeLocal = (date?: Date | null) => {
  if (!date) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const templates = [
  "REGULER_MATCH",
  "NOBAR_COMMUNITY",
  "BIG_MATCH",
  "SUPER_BIG_MATCH",
  "IFTAR_2027",
  "MUSIC",
] as const;

export function EventForm({ event, nextSortOrder = 0 }: Props) {
  const isEditing = !!event;
  const action = isEditing
    ? updateEvent.bind(null, event.id)
    : createEvent;

  const [state, formAction] = useActionState(action, null);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate>(
    event?.eventType ?? "REGULER_MATCH"
  );
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>(
    event?.category ?? "BOOKING_EVENT"
  );
  const [previewImage, setPreviewImage] = useState<string | null>(
    event?.backgroundImage ?? null
  );

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <AdminCard title={isEditing ? "Edit Event" : "Create Event"}>
          {state?.error && (
            <div className="mb-6">
              <AdminNotice error={state.error} />
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <FormFieldLabel>Event Category</FormFieldLabel>
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as EventCategory)}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                >
                  <option value="LIVE_EVENT">Live Event (No Booking, WhatsApp only)</option>
                  <option value="BOOKING_EVENT">Booking Event (Full Flow & Payment)</option>
                </select>
              </label>

              <label className="block">
                <FormFieldLabel>Event Title <span className="text-ludo-gold">*</span></FormFieldLabel>
                <input
                  type="text"
                  name="title"
                  defaultValue={event?.title ?? ""}
                  placeholder={selectedCategory === "LIVE_EVENT" ? "E.g. Live Performance Agnes Monica" : "E.g. Nobar England vs Spain"}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  required
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {selectedCategory === "BOOKING_EVENT" ? (
                <label className="block">
                  <FormFieldLabel>Event Template <span className="text-ludo-gold">*</span></FormFieldLabel>
                  <select
                    name="eventType"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as EventTemplate)}
                    className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                    required
                  >
                    {templates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="block">
                  <FormFieldLabel>Custom Event Type Label <span className="text-ludo-gold">*</span></FormFieldLabel>
                  <input
                    type="text"
                    name="eventTypeLabel"
                    defaultValue={event?.eventTypeLabel ?? ""}
                    placeholder="E.g. LIVE MUSIC, NOBAR, etc"
                    className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                    required
                  />
                </label>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <FormFieldLabel>Date Label <span className="text-ludo-gold">*</span></FormFieldLabel>
                <input
                  type="text"
                  name="eventDateLabel"
                  defaultValue={event?.eventDateLabel ?? "TBA"}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  required
                />
              </label>

              <label className="block">
                <FormFieldLabel>Time Label <span className="text-ludo-gold">*</span></FormFieldLabel>
                <input
                  type="text"
                  name="eventTimeLabel"
                  defaultValue={event?.eventTimeLabel ?? "START 10 PM"}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  required
                />
              </label>
            </div>

            <label className="block">
              <FormFieldLabel>Actual Date & Time (Optional, for sorting)</FormFieldLabel>
              <input
                type="datetime-local"
                name="scheduledAt"
                defaultValue={toDateTimeLocal(event?.scheduledAt)}
                className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
              />
            </label>

            {selectedCategory === "BOOKING_EVENT" && (
              <label className="block">
                <FormFieldLabel>Description (Optional)</FormFieldLabel>
                <textarea
                  name="description"
                  defaultValue={event?.description ?? ""}
                  placeholder="Details about the match or event..."
                  className="min-h-[100px] w-full rounded border border-white/10 bg-ludo-black p-3 text-white outline-none focus:border-ludo-gold"
                />
              </label>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <FormFieldLabel>
                  {selectedCategory === "LIVE_EVENT" ? "Artist Name / Highlight" : "Match Name / Highlight"} 
                  {selectedCategory === "LIVE_EVENT" && <span className="text-ludo-gold ml-1">*</span>}
                </FormFieldLabel>
                <input
                  type="text"
                  name="artistName"
                  defaultValue={event?.artistName ?? ""}
                  placeholder={selectedCategory === "LIVE_EVENT" ? "E.g. AGNES MONICA" : "E.g. LUDO CROWD"}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  required={selectedCategory === "LIVE_EVENT"}
                />
              </label>

              <label className="block">
                <FormFieldLabel>Talent / Sub Label (Optional)</FormFieldLabel>
                <input
                  type="text"
                  name="talentLabel"
                  defaultValue={event?.talentLabel ?? ""}
                  placeholder="E.g. Talent, Special Guest, etc"
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                />
              </label>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-white">Banner Typography (Optional)</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <FormFieldLabel>Headline Line 1</FormFieldLabel>
                  <input
                    type="text"
                    name="headlineLine1"
                    defaultValue={event?.headlineLine1 ?? ""}
                    placeholder="E.g. BIG"
                    className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  />
                </label>
                <label className="block">
                  <FormFieldLabel>Headline Highlight 1</FormFieldLabel>
                  <input
                     type="text"
                     name="headlineHighlight1"
                     defaultValue={event?.headlineHighlight1 ?? ""}
                     placeholder="E.g. SCREEN."
                     className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  />
                </label>
                <label className="block">
                  <FormFieldLabel>Headline Line 2</FormFieldLabel>
                  <input
                     type="text"
                     name="headlineLine2"
                     defaultValue={event?.headlineLine2 ?? ""}
                     placeholder="E.g. LOUD"
                     className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  />
                </label>
                <label className="block">
                  <FormFieldLabel>Headline Highlight 2</FormFieldLabel>
                  <input
                     type="text"
                     name="headlineHighlight2"
                     defaultValue={event?.headlineHighlight2 ?? ""}
                     placeholder="E.g. CROWD."
                     className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  />
                </label>
              </div>
            </div>

            <label className="block">
              <FormFieldLabel>
                Event Poster Image (Portrait) <span className="text-ludo-gold">*</span>
                <InfoTooltip info="Optimal resolution: 1080x1350px (4:5 ratio) or 1080x1440px (3:4 ratio). Used for booking page and homepage banner." />
              </FormFieldLabel>
              <input
                type="hidden"
                name="backgroundImage"
                defaultValue={event?.backgroundImage ?? ""}
              />
              <input
                type="file"
                name="bannerFile"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPreviewImage(URL.createObjectURL(file));
                  } else {
                    setPreviewImage(event?.backgroundImage ?? null);
                  }
                }}
                className="file:mr-4 file:h-11 file:cursor-pointer file:rounded file:border-0 file:bg-white/10 file:px-4 file:text-sm file:font-bold file:text-white hover:file:bg-white/20"
                required={!event?.backgroundImage}
              />
            </label>

            {previewImage ? (
              <div className="relative aspect-[3/4] w-48 overflow-hidden rounded border border-white/10 bg-zinc-900">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            {selectedCategory === "BOOKING_EVENT" && (
              <>
                <label className="block">
                  <FormFieldLabel>Open Gate Info</FormFieldLabel>
                  <input
                    type="text"
                    name="openGateInfo"
                    defaultValue={event?.openGateInfo ?? "Open Gate at 21:00 WIB"}
                    className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  />
                </label>

                <label className="block">
                  <FormFieldLabel>Table Information</FormFieldLabel>
                  <textarea
                    name="tableInfo"
                    defaultValue={event?.tableInfo ?? "TABLE\nVIP Table\nSpecial Package\nBest Spot Nobar (Limited)\n\nRegular Table\nSpecial Package..."}
                    className="min-h-[150px] w-full rounded border border-white/10 bg-ludo-black p-3 text-white outline-none focus:border-ludo-gold"
                  />
                  <p className="mt-2 text-xs text-zinc-400">
                    Write detailed table info here. It will be displayed cleanly on the booking page right column.
                  </p>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    name="allowAlaCarte"
                    defaultChecked={event?.allowAlaCarte ?? false}
                    value="true"
                    className="mt-0.5 size-5 accent-ludo-gold"
                  />
                  <span>
                    <span className="flex items-center text-sm font-bold text-white">
                      Enable À La Carte Menu
                      <InfoTooltip info="Allows customers to add food & beverage items from the Delivery Order menu on top of their table package, in the same order." />
                    </span>
                    <span className="mt-1 block text-xs text-zinc-400">
                      Reuses the same menu items managed in the Delivery Order CMS.
                    </span>
                  </span>
                </label>
              </>
            )}

            <div className="grid gap-6 sm:grid-cols-3">
              <label className="block">
                <FormFieldLabel>CTA Button Label</FormFieldLabel>
                <input
                  type="text"
                  name="ctaLabel"
                  defaultValue={event?.ctaLabel ?? "BOOK NOW"}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                />
              </label>

              {selectedCategory === "LIVE_EVENT" && (
                <label className="block sm:col-span-2">
                  <FormFieldLabel>WhatsApp Message Preset (Optional)</FormFieldLabel>
                  <input
                    type="text"
                    name="whatsappMessage"
                    defaultValue={event?.whatsappMessage ?? ""}
                    placeholder="Halo admin LUDO, saya mau reservasi untuk..."
                    className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  />
                </label>
              )}

              <label className="block">
                <FormFieldLabel>Sort Order</FormFieldLabel>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={isEditing ? event.sortOrder : nextSortOrder}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                />
              </label>

              <div className="flex h-[76px] flex-col justify-end">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={event?.isActive ?? true}
                    value="true"
                    className="size-5 accent-ludo-gold"
                  />
                  <span className="text-sm font-bold text-white">
                    Publish Event
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <Link
                href="/admin/events"
                className="text-sm font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </Link>
              <ConfirmSubmitButton
                title={isEditing ? "Save Changes" : "Create Event"}
                description={isEditing ? "Are you sure you want to save these changes?" : "Are you sure you want to create this event?"}
                confirmLabel={isEditing ? "Save" : "Create"}
                icon="save"
              >
                {isEditing ? "Save Changes" : "Create Event"}
              </ConfirmSubmitButton>
            </div>
          </form>
        </AdminCard>
      </div>

      <div className="space-y-6">
        <AdminCard title="Information">
          <ul className="space-y-4 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-ludo-gold" />
              <p>
                <b>REGULER_MATCH</b> hanya menampilkan tombol CTA WhatsApp — tidak ada pemilihan meja/package sama sekali.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-ludo-gold" />
              <p>
                <b>BIG_MATCH</b>, <b>SUPER_BIG_MATCH</b>, <b>IFTAR_2027</b>,
                dan <b>MUSIC</b> menggunakan booking normal yang dapat dikonfigurasi dengan package dan meja.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-ludo-gold" />
              <p>
                <b>NOBAR_COMMUNITY</b> difokuskan untuk pembelian per kursi/kursi satuan.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-ludo-gold" />
              <p>
                <b>DELIVERY ORDER</b> sekarang dikelola otomatis lewat menu <b>Delivery Order</b> di sidebar, bukan lewat form Event ini.
              </p>
            </li>
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}
