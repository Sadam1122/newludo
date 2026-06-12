import type { LocationSetting } from "@prisma/client";
import { Save } from "lucide-react";

import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { updateLocation } from "@/server/actions/locationActions";

type LocationFormProps = {
  location?: LocationSetting | null;
};

export function LocationForm({ location }: LocationFormProps) {
  return (
    <form action={updateLocation} className="space-y-4">
      {location ? <input type="hidden" name="id" value={location.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Business Name"
          name="businessName"
          defaultValue={
            location?.businessName ?? "LUDO Sports Kitchen & Coffee"
          }
        />
        <Field
          label="Instagram Handle"
          name="instagramHandle"
          defaultValue={location?.instagramHandle ?? "@ludosportskitchen"}
        />
        <Field
          label="Instagram URL"
          name="instagramUrl"
          defaultValue={
            location?.instagramUrl ??
            "https://www.instagram.com/ludosportskitchen/"
          }
        />
        <Field
          label="TikTok Handle"
          name="tiktokHandle"
          defaultValue={location?.tiktokHandle ?? "@ludosportskitchen"}
        />
        <Field
          label="TikTok URL"
          name="tiktokUrl"
          defaultValue={
            location?.tiktokUrl ?? "https://www.tiktok.com/@ludosportskitchen"
          }
        />
        <Field
          label="Map URL"
          name="mapUrl"
          defaultValue={
            location?.mapUrl ??
            "https://www.google.com/maps/search/?api=1&query=LUDO%20Sports%20Kitchen%20%26%20Coffee%20Kiara%20Artha%20Bandung"
          }
        />
        <Field
          label="Map Image URL"
          name="mapImage"
          defaultValue={location?.mapImage ?? ""}
          required={false}
        />
        <FileField
          label="Upload Map Image"
          name="mapImageFile"
          value={location?.mapImage}
        />
      </div>

      <label className="block">
        <FormFieldLabel>Address</FormFieldLabel>
        <textarea
          name="address"
          rows={3}
          defaultValue={
            location?.address ??
            "Jl. Kiara Artha No.C23 Blok F6B 4, Kec. Batununggal, Kota Bandung, Jawa Barat"
          }
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        Save Location
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FormFieldLabel required={required}>{label}</FormFieldLabel>
      <input
        name={name}
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
