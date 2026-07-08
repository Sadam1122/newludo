"use client";

import { useState, useTransition } from "react";
import { EventPackage } from "@prisma/client";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { AdminCard } from "./AdminCard";
import { FormFieldLabel } from "./FormFieldLabel";
import { InfoTooltip } from "./InfoTooltip";
import { DELIVERY_CATEGORIES, DeliveryCategoryKey } from "@/lib/deliveryCategories";
import { createEventPackage, deleteEventPackage } from "@/server/actions/eventPackageActions";

type Props = {
  bookingEventId: string;
  packages: EventPackage[];
  mode?: "event" | "delivery";
};

const tableTypes = [
  "VVIP",
  "VIP",
  "REGULAR_INDOOR",
  "REGULAR_SEMI_OUTDOOR",
  "REGULAR_SEMI_OUTDOOR_2P",
  "BARSTOOL",
  "DELIVERY",
] as const;

export function PackageManager({ bookingEventId, packages, mode = "event" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState<DeliveryCategoryKey>("BEVERAGES");
  const isDelivery = mode === "delivery";

  const handleAdd = (formData: FormData) => {
    formData.append("bookingEventId", bookingEventId);
    if (isDelivery) {
      formData.append("tableType", "DELIVERY");
    }
    startTransition(async () => {
      const result = await createEventPackage(formData);
      if (result.error) alert(result.error);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      startTransition(async () => {
        const result = await deleteEventPackage(id, bookingEventId);
        if (result.error) alert(result.error);
      });
    }
  };

  return (
    <AdminCard title={`${isDelivery ? "Menu Items" : "Packages"} (${packages.length})`}>
      <div className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <form action={handleAdd} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <FormFieldLabel>{isDelivery ? "Menu Name" : "Package Name"}</FormFieldLabel>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={isDelivery ? "e.g. Iced Matcha Latte" : "e.g. FDC Normal, VVIP Package"}
                  className="h-9 w-full rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
                />
              </label>
              <label className="block">
                <FormFieldLabel>Price (IDR)</FormFieldLabel>
                <input
                  type="number"
                  name="price"
                  required
                  defaultValue={0}
                  className="h-9 w-full rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
                />
              </label>

              {isDelivery ? (
                <>
                  <label className="block">
                    <FormFieldLabel>Category</FormFieldLabel>
                    <select
                      name="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DeliveryCategoryKey)}
                      className="h-9 w-full rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
                    >
                      {Object.entries(DELIVERY_CATEGORIES).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <FormFieldLabel>Sub Category</FormFieldLabel>
                    <select
                      name="subCategory"
                      className="h-9 w-full rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
                    >
                      {DELIVERY_CATEGORIES[category].subCategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <label className="block">
                  <FormFieldLabel>Table Type</FormFieldLabel>
                  <select
                    name="tableType"
                    className="h-9 w-full rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
                  >
                    {tableTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <FormFieldLabel>
                  Poster (Optional)
                  <InfoTooltip info="Optimal resolution: 1080x1350px (4:5 ratio) or 1080x1440px (3:4 ratio)." />
                </FormFieldLabel>
                <input
                  type="file"
                  name="posterFile"
                  accept="image/*"
                  className="h-9 w-full file:mr-2 file:h-9 file:cursor-pointer file:rounded file:border-0 file:bg-white/10 file:px-3 file:text-xs file:font-bold file:text-white hover:file:bg-white/20"
                />
              </label>
            </div>

            <label className="block">
              <FormFieldLabel required={false}>Description (Optional)</FormFieldLabel>
              <textarea
                name="description"
                rows={2}
                placeholder={isDelivery ? "Short description of this menu item..." : "Short description of this package..."}
                className="w-full rounded border border-white/10 bg-ludo-black p-2 text-sm text-white outline-none focus:border-ludo-gold"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="h-9 rounded bg-ludo-gold px-4 text-sm font-bold text-black hover:bg-ludo-gold/90 disabled:opacity-50"
              >
                {isDelivery ? "Add Menu Item" : "Add Package"}
              </button>
            </div>
          </form>
        </div>

        {packages.length > 0 ? (
          <div className="divide-y divide-white/5 border-t border-white/10">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  {pkg.posterImage && (
                    <div className="relative h-12 w-12 overflow-hidden rounded bg-zinc-800 shrink-0">
                      <Image
                        src={pkg.posterImage}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">{pkg.name}</p>
                    <p className="text-xs text-zinc-400">
                      {isDelivery
                        ? [pkg.category, pkg.subCategory].filter(Boolean).join(" • ")
                        : pkg.tableType.replace(/_/g, " ")}
                      {" • "}IDR {pkg.price.toLocaleString()}
                    </p>
                    {pkg.description ? (
                      <p className="mt-0.5 max-w-md text-xs text-zinc-500">{pkg.description}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  disabled={isPending}
                  className="rounded p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            {isDelivery ? "No menu items created yet." : "No packages created yet."}
          </p>
        )}
      </div>
    </AdminCard>
  );
}
