import type { HeroSection } from "@prisma/client";
import { Save } from "lucide-react";

import { updateHero } from "@/server/actions/heroActions";

type HeroFormProps = {
  hero?: HeroSection | null;
};

export function HeroForm({ hero }: HeroFormProps) {
  return (
    <form action={updateHero} className="space-y-4">
      {hero ? <input type="hidden" name="id" value={hero.id} /> : null}
      {hero?.backgroundImage ? (
        <div className="overflow-hidden rounded border border-white/10 bg-ludo-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.backgroundImage}
            alt="Hero background preview"
            className="h-56 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Headline Line 1"
          name="headlineLine1"
          defaultValue={hero?.headlineLine1 ?? "BIG"}
        />
        <Field
          label="Headline Highlight 1"
          name="headlineHighlight1"
          defaultValue={hero?.headlineHighlight1 ?? "MATCH,"}
        />
        <Field
          label="Headline Line 2"
          name="headlineLine2"
          defaultValue={hero?.headlineLine2 ?? "BIG"}
        />
        <Field
          label="Headline Highlight 2"
          name="headlineHighlight2"
          defaultValue={hero?.headlineHighlight2 ?? "FLAVOR."}
        />
        <Field
          label="CTA Label"
          name="ctaLabel"
          defaultValue={hero?.ctaLabel ?? "BOOK YOUR TABLE NOW"}
        />
        <Field
          label="Background Image URL"
          name="backgroundImage"
          defaultValue={hero?.backgroundImage ?? ""}
        />
        <FileField
          label="Upload Background Image"
          name="backgroundImageFile"
          value={hero?.backgroundImage}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white/75">
          Subtitle
        </span>
        <textarea
          name="subtitle"
          rows={3}
          defaultValue={
            hero?.subtitle ?? "Nonton seru, makan enak, suasana maksimal."
          }
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white/75">
          CTA WhatsApp Message
        </span>
        <textarea
          name="ctaWhatsappMessage"
          rows={3}
          defaultValue={
            hero?.ctaWhatsappMessage ?? "Halo LUDO, saya ingin reservasi meja."
          }
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <Checkbox
        label="Active"
        name="isActive"
        defaultChecked={hero?.isActive ?? true}
      />

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        Save Hero
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/75">
        {label}
      </span>
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
