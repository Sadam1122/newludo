import type { HeroSection } from "@prisma/client";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { createHero, updateHero } from "@/server/actions/heroActions";

type HeroFormProps = {
  hero?: HeroSection | null;
};

export function HeroForm({ hero }: HeroFormProps) {
  const isEditing = Boolean(hero);

  return (
    <form action={isEditing ? updateHero : createHero} className="space-y-4">
      {hero ? <input type="hidden" name="id" value={hero.id} /> : null}
      {hero?.backgroundImage || hero?.portraitImage ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {hero.backgroundImage ? (
            <PreviewImage
              src={hero.backgroundImage}
              label="Landscape / Desktop"
              aspect="aspect-video"
            />
          ) : null}
          {hero.portraitImage ? (
            <PreviewImage
              src={hero.portraitImage}
              label="Portrait / Mobile"
              aspect="aspect-[4/5]"
            />
          ) : null}
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
          label="Sort Order"
          name="sortOrder"
          type="number"
          defaultValue={String(hero?.sortOrder ?? 0)}
        />
        <Field
          label="Landscape / Desktop Image URL"
          name="backgroundImage"
          defaultValue={hero?.backgroundImage ?? ""}
          required={false}
        />
        <FileField
          label="Upload Landscape / Desktop Image"
          name="backgroundImageFile"
          value={hero?.backgroundImage}
        />
        <Field
          label="Portrait / Mobile Image URL"
          name="portraitImage"
          defaultValue={hero?.portraitImage ?? ""}
          required={false}
        />
        <FileField
          label="Upload Portrait / Mobile Image"
          name="portraitImageFile"
          value={hero?.portraitImage}
        />
      </div>

      <label className="block">
        <FormFieldLabel>Subtitle</FormFieldLabel>
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
        <FormFieldLabel>CTA WhatsApp Message</FormFieldLabel>
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

      <ConfirmSubmitButton
        title={isEditing ? "Save hero slide?" : "Create hero slide?"}
        description={
          isEditing
            ? "This will update the selected hero slide and refresh the public homepage carousel if it is active."
            : "This will create a new hero slide. If Active is enabled, it can appear in the public homepage carousel."
        }
        confirmLabel={isEditing ? "Save Hero" : "Create Hero"}
      >
        {isEditing ? "Save Hero" : "Create Hero"}
      </ConfirmSubmitButton>
    </form>
  );
}

function PreviewImage({
  src,
  label,
  aspect,
}: {
  src: string;
  label: string;
  aspect: string;
}) {
  return (
    <div className="overflow-hidden rounded border border-white/10 bg-ludo-black">
      <div className={aspect}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="h-full w-full object-cover" />
      </div>
      <p className="break-all px-3 py-2 text-xs font-semibold text-white/45">
        {label}: {src}
      </p>
    </div>
  );
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
