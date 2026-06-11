import type { BrandSection } from "@prisma/client";
import { Save } from "lucide-react";

import { updateBrand } from "@/server/actions/brandActions";

type BrandFormProps = {
  brand?: BrandSection | null;
};

export function BrandForm({ brand }: BrandFormProps) {
  return (
    <form action={updateBrand} className="space-y-4">
      {brand ? <input type="hidden" name="id" value={brand.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Title Before Highlight"
          name="titleBeforeHighlight"
          defaultValue={brand?.titleBeforeHighlight ?? "TRUSTED BY"}
        />
        <Field
          label="Title Highlight"
          name="titleHighlight"
          defaultValue={brand?.titleHighlight ?? "LEADING BRANDS"}
        />
        <Field
          label="Subtitle"
          name="subtitle"
          defaultValue={brand?.subtitle ?? "Official Brand Partner"}
        />
        <Field
          label="Brand Name"
          name="brandName"
          defaultValue={brand?.brandName ?? "Coca-Cola"}
        />
        <Field
          label="Bottom Text"
          name="bottomText"
          defaultValue={brand?.bottomText ?? "EXCLUSIVE COLLABORATION"}
        />
        <Field
          label="Brand Logo URL"
          name="brandLogo"
          defaultValue={brand?.brandLogo ?? ""}
        />
        <FileField
          label="Upload Brand Logo"
          name="brandLogoFile"
          value={brand?.brandLogo}
        />
      </div>

      <Checkbox
        label="Active"
        name="isActive"
        defaultChecked={brand?.isActive ?? true}
      />

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        Save Brand
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
