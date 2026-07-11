"use client";

import { useState, useTransition } from "react";
import { EventPackage } from "@prisma/client";
import { PackageX, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { AdminCard } from "./AdminCard";
import { ActiveStatusBadge } from "./ActiveStatusBadge";
import { FormFieldLabel } from "./FormFieldLabel";
import { InfoTooltip } from "./InfoTooltip";
import { DELIVERY_CATEGORIES, DeliveryCategoryKey } from "@/lib/deliveryCategories";
import {
  createEventPackage,
  deleteEventPackage,
  toggleEventPackageSoldOut,
  updateEventPackage,
} from "@/server/actions/eventPackageActions";

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
  const isDelivery = mode === "delivery";

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      startTransition(async () => {
        const result = await deleteEventPackage(id, bookingEventId);
        if (result.error) alert(result.error);
      });
    }
  };

  const handleToggleSoldOut = (id: string) => {
    startTransition(async () => {
      const result = await toggleEventPackageSoldOut(id, bookingEventId);
      if (result.error) alert(result.error);
    });
  };

  return (
    <AdminCard title={`${isDelivery ? "Menu Items" : "Packages"} (${packages.length})`}>
      <div className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <PackageForm bookingEventId={bookingEventId} isDelivery={isDelivery} />
        </div>

        {packages.length > 0 ? (
          <div className="divide-y divide-white/5 border-t border-white/10">
            {packages.map((pkg) => (
              <div key={pkg.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
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
                      <p className="flex items-center gap-2 font-bold text-white">
                        {pkg.name}
                        {!pkg.isActive && <ActiveStatusBadge active={pkg.isActive} />}
                        {pkg.isSoldOut && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-ludo-red/40 bg-ludo-red/15 px-2.5 py-1 text-xs font-black uppercase text-red-100">
                            <PackageX className="h-3.5 w-3.5" aria-hidden="true" />
                            Sold Out
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {isDelivery
                          ? [pkg.category, pkg.subCategory].filter(Boolean).join(" • ")
                          : (pkg.tableType?.replace(/_/g, " ") ?? "No table type")}
                        {" • "}IDR {pkg.price.toLocaleString()}
                      </p>
                      {pkg.description ? (
                        <p className="mt-0.5 max-w-md text-xs text-zinc-500">{pkg.description}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleToggleSoldOut(pkg.id)}
                      disabled={isPending}
                      title={pkg.isSoldOut ? "Mark as available again" : "Mark as sold out"}
                      className={
                        pkg.isSoldOut
                          ? "inline-flex h-9 items-center gap-1.5 rounded-lg border border-ludo-green/35 bg-ludo-green/10 px-3 text-xs font-black uppercase text-green-100 transition hover:bg-ludo-green hover:text-ludo-black disabled:opacity-50"
                          : "inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-black uppercase text-zinc-400 transition hover:border-ludo-red/40 hover:text-red-400 disabled:opacity-50"
                      }
                    >
                      {pkg.isSoldOut ? (
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <PackageX className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {pkg.isSoldOut ? "Restock" : "Sold Out"}
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      disabled={isPending}
                      className="rounded p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-bold uppercase text-ludo-gold">
                    Edit {isDelivery ? "Menu Item" : "Package"}
                  </summary>
                  <div className="mt-3 rounded-lg border border-white/10 bg-ludo-black p-4">
                    <PackageForm bookingEventId={bookingEventId} isDelivery={isDelivery} pkg={pkg} />
                  </div>
                </details>
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

function PackageForm({
  bookingEventId,
  isDelivery,
  pkg,
}: {
  bookingEventId: string;
  isDelivery: boolean;
  pkg?: EventPackage;
}) {
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(pkg);
  const [category, setCategory] = useState<DeliveryCategoryKey>(
    (pkg?.category as DeliveryCategoryKey | undefined) ?? "BEVERAGES",
  );

  const handleSubmit = (formData: FormData) => {
    formData.append("bookingEventId", bookingEventId);
    // Sent on every submit (create AND edit) — the server relies on this to
    // decide whether tableType is required, since delivery mode has no
    // Table Type field in this form at all.
    formData.append("mode", isDelivery ? "delivery" : "event");
    if (pkg) {
      formData.append("id", pkg.id);
    }
    startTransition(async () => {
      const result = isEditing
        ? await updateEventPackage(formData)
        : await createEventPackage(formData);
      if (result.error) alert(result.error);
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <FormFieldLabel>{isDelivery ? "Menu Name" : "Package Name"}</FormFieldLabel>
          <input
            type="text"
            name="name"
            required
            defaultValue={pkg?.name}
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
            defaultValue={pkg?.price ?? 0}
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
                defaultValue={pkg?.subCategory ?? undefined}
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
              defaultValue={pkg?.tableType ?? undefined}
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
          {isEditing && pkg?.posterImage ? (
            <span className="mt-1 block text-[10px] text-zinc-500">
              Leave blank to keep the current poster.
            </span>
          ) : null}
        </label>
      </div>

      <label className="block">
        <FormFieldLabel required={false}>Description (Optional)</FormFieldLabel>
        <textarea
          name="description"
          rows={2}
          defaultValue={pkg?.description ?? ""}
          placeholder={isDelivery ? "Short description of this menu item..." : "Short description of this package..."}
          className="w-full rounded border border-white/10 bg-ludo-black p-2 text-sm text-white outline-none focus:border-ludo-gold"
        />
      </label>

      {isEditing ? (
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-white/75">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={pkg?.isActive ?? true}
              className="h-4 w-4 rounded border-white/20 bg-ludo-black accent-ludo-gold"
            />
            Active (visible to customers)
          </label>
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-white/75">
            <input
              type="checkbox"
              name="isSoldOut"
              defaultChecked={pkg?.isSoldOut ?? false}
              className="h-4 w-4 rounded border-white/20 bg-ludo-black accent-ludo-red"
            />
            Sold Out (visible, but can&apos;t be ordered)
          </label>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded bg-ludo-gold px-4 text-sm font-bold text-black hover:bg-ludo-gold/90 disabled:opacity-50"
        >
          {isEditing ? "Save Changes" : isDelivery ? "Add Menu Item" : "Add Package"}
        </button>
      </div>
    </form>
  );
}
