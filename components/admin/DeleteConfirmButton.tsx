"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { useState } from "react";

type DeleteConfirmButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  itemLabel: string;
  itemType?: string;
};

export function DeleteConfirmButton({
  action,
  id,
  itemLabel,
  itemType = "item",
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-ludo-red/45 bg-ludo-red/10 px-3 text-xs font-black uppercase text-red-100 transition hover:border-ludo-red hover:bg-ludo-red/20"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-title-${id}`}
        >
          <div className="w-full max-w-md rounded-2xl border border-ludo-red/35 bg-[#111111] p-5 shadow-[0_28px_120px_rgba(239,31,40,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ludo-red/15 text-ludo-red">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id={`delete-title-${id}`}
                    className="text-base font-black text-white"
                  >
                    Delete {itemType}?
                  </h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/45">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/65 transition hover:border-white/30 hover:text-white"
                aria-label="Close delete confirmation"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
              <p className="text-sm font-semibold text-white/70">
                You are about to permanently delete:
              </p>
              <p className="mt-2 break-words text-sm font-black text-white">
                {itemLabel}
              </p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-black uppercase text-white transition hover:border-ludo-gold hover:text-ludo-gold"
              >
                Cancel
              </button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-600 sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Yes, delete
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
