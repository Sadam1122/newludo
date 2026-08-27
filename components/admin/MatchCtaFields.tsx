"use client";

import {
  ArrowRight,
  CalendarCheck,
  ExternalLink,
  MessageCircle,
  ShoppingCart,
  Ticket,
} from "lucide-react";
import { useState } from "react";

import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import {
  getReadableTextColor,
  MATCH_CTA_ICON_KEYS,
  type MatchCtaIconKey,
} from "@/lib/bookingCta";

const ICONS = {
  MessageCircle,
  Ticket,
  ExternalLink,
  CalendarCheck,
  ShoppingCart,
  ArrowRight,
} as const;

type Props = {
  defaultEnabled?: boolean;
  defaultType?: "WHATSAPP" | "VENDOR" | null;
  defaultText?: string | null;
  defaultColor?: string | null;
  defaultIcon?: string | null;
  defaultUrl?: string | null;
  fallbackText?: string | null;
};

export function MatchCtaFields({
  defaultEnabled = false,
  defaultType,
  defaultText,
  defaultColor,
  defaultIcon,
  defaultUrl,
  fallbackText,
}: Props) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [type, setType] = useState<"WHATSAPP" | "VENDOR">(
    defaultType ?? "WHATSAPP",
  );
  const [text, setText] = useState(defaultText ?? fallbackText ?? "BOOK NOW");
  const [color, setColor] = useState(defaultColor ?? "#25D366");
  const [icon, setIcon] = useState<MatchCtaIconKey>(
    MATCH_CTA_ICON_KEYS.includes(defaultIcon as MatchCtaIconKey)
      ? (defaultIcon as MatchCtaIconKey)
      : "ArrowRight",
  );
  const [url, setUrl] = useState(defaultUrl ?? "");
  const PreviewIcon = ICONS[icon];
  const validPreviewColor = /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#25D366";

  return (
    <section className="rounded-2xl border border-ludo-gold/25 bg-ludo-gold/[0.055] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-ludo-gold">
            Booking CTA
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/55">
            Leave this off to keep the existing internal booking or WhatsApp
            fallback. Turn it on only when this schedule needs its own WhatsApp
            or ticket-vendor link.
          </p>
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-black/30 px-4 text-sm font-black text-white">
          <input
            name="customCtaEnabled"
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-5 w-5 accent-ludo-gold"
          />
          Use Custom CTA
        </label>
      </div>

      {!enabled ? (
        <>
          <input type="hidden" name="customCtaType" value={type} />
          <input type="hidden" name="customCtaText" value={text} />
          <input type="hidden" name="customCtaColor" value={color} />
          <input type="hidden" name="customCtaIcon" value={icon} />
          <input type="hidden" name="customCtaUrl" value={url} />
          <p className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/50">
            Custom override is off. Existing booking behavior remains active.
          </p>
        </>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-white">
                Destination
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["WHATSAPP", "VENDOR"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 text-sm font-bold text-white"
                  >
                    <input
                      type="radio"
                      name="customCtaType"
                      value={option}
                      checked={type === option}
                      onChange={() => setType(option)}
                      className="h-4 w-4 accent-ludo-gold"
                    />
                    {option === "WHATSAPP" ? "WhatsApp" : "Vendor"}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <FormFieldLabel required={false}>CTA Text</FormFieldLabel>
                <input
                  name="customCtaText"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="BOOK NOW"
                  maxLength={60}
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                />
              </label>

              <label className="block">
                <FormFieldLabel>CTA Icon</FormFieldLabel>
                <select
                  name="customCtaIcon"
                  value={icon}
                  onChange={(event) =>
                    setIcon(event.target.value as MatchCtaIconKey)
                  }
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                >
                  {MATCH_CTA_ICON_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <FormFieldLabel>CTA Color</FormFieldLabel>
                <span className="flex gap-3">
                  <input
                    type="color"
                    value={validPreviewColor}
                    onChange={(event) =>
                      setColor(event.target.value.toUpperCase())
                    }
                    className="h-11 w-14 cursor-pointer rounded border border-white/10 bg-ludo-black p-1"
                    aria-label="Choose CTA color"
                  />
                  <input
                    name="customCtaColor"
                    value={color}
                    onChange={(event) =>
                      setColor(event.target.value.toUpperCase())
                    }
                    pattern="#[0-9A-Fa-f]{6}"
                    placeholder="#25D366"
                    className="h-11 min-w-0 flex-1 rounded border border-white/10 bg-ludo-black px-3 font-mono text-white outline-none focus:border-ludo-gold"
                  />
                </span>
              </label>

              <label className="block sm:col-span-2">
                <FormFieldLabel>
                  {type === "WHATSAPP"
                    ? "WhatsApp Number / Link"
                    : "Vendor Booking URL"}
                </FormFieldLabel>
                <input
                  name="customCtaUrl"
                  type={type === "VENDOR" ? "url" : "text"}
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder={
                    type === "WHATSAPP"
                      ? "+62 823 1856 0003 or https://wa.me/628..."
                      : "https://ticket-vendor.example/event/123"
                  }
                  className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
                  required
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
              CTA Preview
            </p>
            <div className="flex min-h-36 items-center justify-center">
              <span
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-center text-sm font-black uppercase shadow-lg transition"
                style={{
                  backgroundColor: validPreviewColor,
                  color: getReadableTextColor(validPreviewColor),
                }}
              >
                <PreviewIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="break-words">
                  {text.trim() || fallbackText || "BOOK NOW"}
                </span>
              </span>
            </div>
            <p className="text-center text-xs font-semibold text-white/40">
              {type === "WHATSAPP" ? "Opens WhatsApp" : "Opens external vendor"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
