import type { BrandSection } from "@prisma/client";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { createBrand, updateBrand } from "@/server/actions/brandActions";

export function BrandForm({
  brand,
  nextSortOrder,
}: {
  brand?: BrandSection | null;
  nextSortOrder?: number;
}) {
  const isEditing = Boolean(brand);

  return (
    <form
      action={isEditing ? updateBrand : createBrand}
      encType="multipart/form-data"
      className="space-y-4"
    >
      {brand ? <input type="hidden" name="id" value={brand.id} /> : null}

      {brand?.brandLogo ? (
        <div className="mx-auto flex min-h-28 max-w-xs items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ludo-black px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.brandLogo}
            alt={`${brand.brandName} logo preview`}
            className="max-h-20 w-auto object-contain"
          />
        </div>
      ) : null}

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
          label="Sort Order"
          name="sortOrder"
          type="number"
          defaultValue={String(brand?.sortOrder ?? nextSortOrder ?? 0)}
        />
        <Field
          label="Brand Logo URL"
          name="brandLogo"
          defaultValue={brand?.brandLogo ?? ""}
          required={false}
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

      <ConfirmSubmitButton
        title={isEditing ? "Save brand partner?" : "Create brand partner?"}
        description={
          isEditing
            ? "This will update the selected brand partner and refresh the public sponsor carousel if it is active."
            : "This will add a new brand partner to the CMS. If Active is enabled, it can appear on the public homepage."
        }
        confirmLabel={isEditing ? "Save Brand" : "Create Brand"}
      >
        {isEditing ? "Save Brand" : "Create Brand"}
      </ConfirmSubmitButton>
    </form>
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
