"use client";

import { CheckCircle2, Loader2, Save, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  icon?: "save" | "upload";
  className?: string;
};

export function ConfirmSubmitButton({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  icon = "save",
  className,
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();
  const Icon = icon === "upload" ? Upload : Save;

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto",
          className,
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Icon className="h-4 w-4" aria-hidden="true" />
        )}
        {pending ? "Processing..." : children}
      </button>

      <button ref={submitRef} type="submit" className="hidden" tabIndex={-1} />

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-submit-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-ludo-gold/30 bg-[#111111] p-5 shadow-[0_28px_120px_rgba(247,198,0,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ludo-gold/15 text-ludo-gold">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="confirm-submit-title"
                    className="text-base font-black text-white"
                  >
                    {title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/45">
                    Please review before continuing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/65 transition hover:border-white/30 hover:text-white"
                aria-label="Close confirmation"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4 text-sm font-semibold leading-6 text-white/70">
              {description}
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-black uppercase text-white transition hover:border-ludo-gold hover:text-ludo-gold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  submitRef.current?.form?.requestSubmit(submitRef.current);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-600"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
