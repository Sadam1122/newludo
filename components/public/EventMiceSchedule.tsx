"use client";

import { CalendarDays, Clock, Radio, Sparkles } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { PublicScheduleItem } from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { cn } from "@/lib/utils";

type EventMiceScheduleProps = {
  items: PublicScheduleItem[];
  whatsappNumber: string;
  defaultMessage: string;
};

type ScheduleFilter = "now" | "week" | "upcoming";

const filters: Array<{ key: ScheduleFilter; label: string }> = [
  { key: "now", label: "Sedang Berlangsung" },
  { key: "week", label: "Minggu Ini" },
  { key: "upcoming", label: "Akan Datang" },
];

export function EventMiceSchedule({
  items,
  whatsappNumber,
  defaultMessage,
}: EventMiceScheduleProps) {
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>("upcoming");
  const groups = useMemo(() => buildGroups(items), [items]);
  const activeItems = groups[activeFilter];

  return (
    <section
      id="upcoming-schedule"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#050505_0%,#180202_48%,#050505_100%)] py-12 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(239,31,40,0.28),transparent_34%)]" />
      <div className="ludo-section-shell relative z-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
              Event / MICE
            </p>
            <h1 className="font-display mt-3 max-w-4xl text-[clamp(3.2rem,12vw,7.6rem)] uppercase leading-[0.84] text-[#F8EDE7]">
              UPCOMING <span className="text-[#EF1F28]">SCHEDULE</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#A3A3A3] sm:text-base">
              Jadwal nobar, live performance, watch party, dan reservasi event
              yang masih aktif di LUDO.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[18px] border border-white/10 bg-black/35 p-2">
            {filters.map((filter) => {
              const count = groups[filter.key].length;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    "min-h-11 rounded-xl px-2 text-center text-[0.62rem] font-black uppercase leading-tight transition sm:px-4 sm:text-xs",
                    activeFilter === filter.key
                      ? "bg-[#F7C600] text-[#050505]"
                      : "text-white/58 hover:bg-white/[0.07] hover:text-white",
                  )}
                >
                  {filter.label}
                  <span className="mt-1 block text-[0.62rem] opacity-70">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeItems.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeItems.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                whatsappNumber={whatsappNumber}
                defaultMessage={defaultMessage}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[24px] border border-white/10 bg-[#0B0B0B] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <p className="font-display text-5xl uppercase text-[#F7C600]">
              Belum Ada Jadwal
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#A3A3A3]">
              Jadwal yang sudah melewati tanggal otomatis tidak ditampilkan. Cek
              tab lain atau tambahkan jadwal baru dari CMS.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ScheduleCard({
  item,
  whatsappNumber,
  defaultMessage,
}: {
  item: PublicScheduleItem;
  whatsappNumber: string;
  defaultMessage: string;
}) {
  const isFull = item.status === "FULL_BOOKED";

  return (
    <article className="group relative flex min-h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0B0B0B] shadow-[0_24px_80px_rgba(0,0,0,0.34)] transition hover:-translate-y-1 hover:border-[#EF1F28]/50">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#111111]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            unoptimized={item.image.endsWith(".svg")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#111111,#5A0505)] px-6 text-center">
            <span className="font-display text-6xl uppercase leading-none text-[#F7C600]">
              {initials(item.title)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.82)_100%)]" />
        <span className="absolute left-4 top-4 inline-flex rounded-full border border-[#F7C600]/35 bg-black/62 px-3 py-2 text-[0.66rem] font-black uppercase tracking-[0.16em] text-[#F7C600] backdrop-blur">
          {item.categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#EF1F28]">
          {item.source === "event" ? (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Radio className="h-4 w-4" aria-hidden="true" />
          )}
          {item.source === "event" ? "Event" : "Sports Schedule"}
        </div>

        <h2 className="mt-3 break-words text-xl font-black uppercase leading-tight text-[#F8EDE7] sm:text-2xl">
          {item.title}
        </h2>
        {item.description ? (
          <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#A3A3A3]">
            {item.description}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3">
          <InfoPill icon={<CalendarDays className="h-4 w-4" />}>
            {item.dateLabel}
          </InfoPill>
          <InfoPill icon={<Clock className="h-4 w-4" />}>
            {item.timeLabel}
          </InfoPill>
        </div>

        <div className="mt-auto pt-5">
          {isFull ? (
            <span className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-[#EF1F28] px-4 text-center text-sm font-black uppercase text-white opacity-85">
              {item.ctaLabel}
            </span>
          ) : (
            <WhatsAppButton
              phoneNumber={whatsappNumber}
              message={item.whatsappMessage ?? defaultMessage}
              variant={item.status === "LIMITED" ? "solid" : "neon"}
              className={cn(
                "w-full",
                item.status === "LIMITED" &&
                  "!bg-[#F7C600] !text-[#050505] hover:!bg-[#ffdc32]",
              )}
            >
              {item.ctaLabel}
            </WhatsAppButton>
          )}
        </div>
      </div>
    </article>
  );
}

function InfoPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-black uppercase text-[#F8EDE7]">
      <span className="text-[#F7C600]">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

function buildGroups(items: PublicScheduleItem[]) {
  const today = startOfToday();
  const weekEnd = endOfThisWeek(today);

  const upcomingItems = items.filter((item) => !isExpired(item, today));

  return {
    now: upcomingItems.filter((item) => item.status === "CURRENTLY_SHOWING"),
    week: upcomingItems.filter((item) => {
      if (!item.scheduledAt) return false;
      const date = new Date(item.scheduledAt);
      return date >= today && date <= weekEnd;
    }),
    upcoming: upcomingItems.filter((item) => {
      if (item.status === "CURRENTLY_SHOWING") return false;
      if (!item.scheduledAt) return true;
      return new Date(item.scheduledAt) > weekEnd;
    }),
  };
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfThisWeek(today: Date) {
  const date = new Date(today);
  const day = date.getDay();
  const daysUntilSunday = (7 - day) % 7;
  date.setDate(date.getDate() + daysUntilSunday);
  date.setHours(23, 59, 59, 999);
  return date;
}

function isExpired(item: PublicScheduleItem, today: Date) {
  if (!item.scheduledAt) return false;
  const date = new Date(item.scheduledAt);
  if (Number.isNaN(date.getTime())) return false;
  return date < today;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
