"use client";

import { useState } from "react";
import Image from "next/image";
import type { BookingEvent } from "@prisma/client";

import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { FormFieldLabel } from "./FormFieldLabel";
import { InfoTooltip } from "./InfoTooltip";
import { updateDeliveryOrder } from "@/server/actions/deliveryOrderActions";

type Props = {
  deliveryOrder: BookingEvent;
};

export function DeliveryOrderForm({ deliveryOrder }: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    deliveryOrder.backgroundImage ?? null,
  );

  return (
    <form
      action={updateDeliveryOrder}
      encType="multipart/form-data"
      className="space-y-6"
    >
      <label className="block">
        <FormFieldLabel>Title</FormFieldLabel>
        <input
          type="text"
          name="title"
          defaultValue={deliveryOrder.title}
          className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
          required
        />
      </label>

      <label className="block">
        <FormFieldLabel required={false}>Description</FormFieldLabel>
        <textarea
          name="description"
          defaultValue={deliveryOrder.description ?? ""}
          placeholder="Short description shown on the Delivery Order page..."
          className="min-h-[100px] w-full rounded border border-white/10 bg-ludo-black p-3 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <label className="block">
        <FormFieldLabel required={false}>
          Poster Image
          <InfoTooltip info="Optimal resolution: 1080x1350px (4:5 ratio) or 1080x1440px (3:4 ratio)." />
        </FormFieldLabel>
        <input
          type="hidden"
          name="backgroundImage"
          defaultValue={deliveryOrder.backgroundImage ?? ""}
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
              setPreviewImage(deliveryOrder.backgroundImage ?? null);
            }
          }}
          className="file:mr-4 file:h-11 file:cursor-pointer file:rounded file:border-0 file:bg-white/10 file:px-4 file:text-sm file:font-bold file:text-white hover:file:bg-white/20"
        />
      </label>

      {previewImage ? (
        <div className="relative aspect-[3/4] w-48 overflow-hidden rounded border border-white/10 bg-zinc-900">
          <Image src={previewImage} alt="Preview" fill className="object-cover" />
        </div>
      ) : null}

      <label className="block">
        <FormFieldLabel required={false}>CTA Button Label</FormFieldLabel>
        <input
          type="text"
          name="ctaLabel"
          defaultValue={deliveryOrder.ctaLabel ?? "Order Now"}
          className="h-11 w-full max-w-xs rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={deliveryOrder.isActive}
          value="true"
          className="size-5 accent-ludo-gold"
        />
        <span className="text-sm font-bold text-white">Publish Delivery Order Page</span>
      </label>

      <div className="border-t border-white/10 pt-6">
        <ConfirmSubmitButton
          title="Save Delivery Order changes?"
          description="This will update the public Delivery Order page and nav button."
          confirmLabel="Save"
          icon="save"
        >
          Save Changes
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}
