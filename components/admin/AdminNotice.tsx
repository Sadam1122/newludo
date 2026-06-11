"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

type AdminNoticeProps = {
  success?: string;
  error?: string;
};

export function AdminNotice({ success, error }: AdminNoticeProps) {
  const [open, setOpen] = useState(Boolean(success || error));
  if (!success && !error) return null;
  if (!open) return null;

  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-notice-title"
    >
      <div
        className={
          isError
            ? "w-full max-w-md rounded-2xl border border-ludo-red/45 bg-[#111111] p-5 text-red-100 shadow-[0_28px_120px_rgba(239,31,40,0.22)]"
            : "w-full max-w-md rounded-2xl border border-ludo-green/45 bg-[#111111] p-5 text-green-100 shadow-[0_28px_120px_rgba(37,211,102,0.16)]"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={
                isError
                  ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ludo-red/15 text-ludo-red"
                  : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ludo-green/15 text-ludo-green"
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="admin-notice-title" className="text-base font-black">
                {isError ? "Action failed" : "Action completed"}
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/45">
                CMS notification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/65 transition hover:border-white/30 hover:text-white"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4 text-sm font-semibold leading-6 text-white/78">
          {error ?? success}
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={
              isError
                ? "inline-flex h-10 items-center justify-center rounded-lg bg-ludo-red px-5 text-sm font-black uppercase text-white transition hover:bg-red-600"
                : "inline-flex h-10 items-center justify-center rounded-lg bg-ludo-green px-5 text-sm font-black uppercase text-ludo-black transition hover:bg-green-300"
            }
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
