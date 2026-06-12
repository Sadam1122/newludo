"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Music2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { isInteractiveTarget } from "@/components/public/interaction";
import type { PublicEvent } from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { cn } from "@/lib/utils";

type EventBannerProps = {
  events: PublicEvent[];
  whatsappNumber: string;
  defaultMessage: string;
};

export function EventBanner({
  events,
  whatsappNumber,
  defaultMessage,
}: EventBannerProps) {
  const slides = events.length > 0 ? events : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartedOnInteractive = useRef(false);
  const event = slides[activeIndex] ?? slides[0];

  function move(direction: "prev" | "next") {
    if (slides.length <= 1) return;

    setActiveIndex((current) => {
      if (direction === "next") {
        return current === slides.length - 1 ? 0 : current + 1;
      }

      return current === 0 ? slides.length - 1 : current - 1;
    });
  }

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        current === slides.length - 1 ? 0 : current + 1,
      );
    }, 5800);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartedOnInteractive.current = isInteractiveTarget(event.target);
    if (touchStartedOnInteractive.current) {
      touchStartX.current = null;
      return;
    }

    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartedOnInteractive.current) {
      touchStartedOnInteractive.current = false;
      touchStartX.current = null;
      return;
    }

    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = touchStartX.current - endX;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 42) return;
    move(deltaX > 0 ? "next" : "prev");
  }

  if (!event) return null;

  return (
    <section
      id="events"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#050505_0%,#5A0505_48%,#050505_100%)] py-12 [touch-action:pan-y] sm:py-20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(239,31,40,0.34),transparent_40%)]" />
      <div className="ludo-section-shell relative z-10">
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => move("prev")}
              className="absolute -left-3 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-[0_16px_44px_rgba(0,0,0,0.38)] backdrop-blur transition hover:border-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505] md:flex lg:-left-14"
              aria-label="Previous event"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => move("next")}
              className="absolute -right-3 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-[0_16px_44px_rgba(0,0,0,0.38)] backdrop-blur transition hover:border-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505] md:flex lg:-right-14"
              aria-label="Next event"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
        <article className="relative isolate overflow-hidden rounded-[22px] border border-[#EF1F28]/30 bg-[#0B0B0B] shadow-[0_32px_110px_rgba(239,31,40,0.22)] sm:rounded-[30px]">
          <div
            className="pointer-events-none absolute inset-0 flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="relative h-full min-w-full">
                {slide.backgroundImage ? (
                  <Image
                    src={slide.backgroundImage}
                    alt={slide.title}
                    fill
                    sizes="(min-width: 1024px) 1180px, 100vw"
                    className="object-cover opacity-58"
                    unoptimized={slide.backgroundImage.endsWith(".svg")}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(125deg,#0B0B0B_0%,#7A0B0B_52%,#000000_100%)]" />
                )}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.62)_46%,rgba(90,5,5,0.76)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(247,198,0,0.18),transparent_22%),radial-gradient(circle_at_56%_76%,rgba(239,31,40,0.42),transparent_34%)]" />

          <div className="relative z-10 grid min-h-[560px] gap-7 px-4 py-9 sm:gap-9 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12 lg:py-14">
            <div>
              <p className="mb-4 inline-flex max-w-full rounded-full border border-[#EF1F28]/45 bg-[#EF1F28]/15 px-3 py-2 text-[0.64rem] font-black uppercase tracking-[0.16em] text-[#F8EDE7] sm:mb-5 sm:px-4 sm:text-[0.7rem] sm:tracking-[0.24em]">
                {event.eventTypeLabel ?? event.title}
              </p>
              <h2 className="font-display ludo-text-shadow break-words text-[clamp(3.1rem,14vw,9.2rem)] uppercase leading-[0.84] text-[#F8EDE7] sm:text-[clamp(4rem,11vw,9.2rem)] sm:leading-[0.79]">
                {event.headlineLine1}{" "}
                <span className="text-[#EF1F28]">
                  {event.headlineHighlight1}
                </span>
                <br />
                {event.headlineLine2}{" "}
                <span className="text-[#F7C600]">
                  {event.headlineHighlight2}
                </span>
              </h2>
            </div>

            <div className="rounded-[20px] border border-white/12 bg-black/58 p-4 backdrop-blur-md sm:rounded-[24px] sm:p-7">
              <p className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#F7C600] sm:text-xs sm:tracking-[0.24em]">
                <Music2 className="h-4 w-4" aria-hidden="true" />
                {event.eventTypeLabel ?? event.title}
              </p>
              <h3 className="font-display mt-4 break-words text-[clamp(3.2rem,14vw,7.5rem)] uppercase leading-[0.84] text-[#EF1F28] sm:text-[clamp(4rem,9vw,7.5rem)] sm:leading-[0.82]">
                {event.artistName}
              </h3>

              {event.backgroundImage ? (
                <div className="relative mx-auto mt-5 aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-[18px] border border-white/10 bg-[#111111] shadow-[0_22px_70px_rgba(0,0,0,0.38)] sm:max-w-[360px] sm:rounded-[20px]">
                  <Image
                    key={`${event.id}-preview`}
                    src={event.backgroundImage}
                    alt={event.title}
                    fill
                    sizes="(min-width: 1024px) 360px, 82vw"
                    className="object-cover"
                    unoptimized={event.backgroundImage.endsWith(".svg")}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.62)_100%)]" />
                </div>
              ) : null}

              <div className="mt-6 space-y-3 sm:mt-7">
                <InfoRow
                  icon={<UserRound className="h-5 w-5" />}
                  label={event.talentLabel}
                >
                  {event.artistName}
                </InfoRow>
                <InfoRow
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Date"
                >
                  {event.eventDateLabel}
                </InfoRow>
                <InfoRow icon={<Clock className="h-5 w-5" />} label="Time">
                  {event.eventTimeLabel}
                </InfoRow>
              </div>

              <div className="relative z-30 mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
                <WhatsAppButton
                  phoneNumber={whatsappNumber}
                  message={event.whatsappMessage ?? defaultMessage}
                  variant="neon"
                  className="w-full sm:w-auto"
                >
                  {event.ctaLabel}
                </WhatsAppButton>
                <div className="flex gap-2 md:hidden">
                  <MobileArrow
                    label="Previous event"
                    onClick={() => move("prev")}
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </MobileArrow>
                  <MobileArrow label="Next event" onClick={() => move("next")}>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </MobileArrow>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2 sm:bottom-6">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2.5 touch-manipulation rounded-full transition",
                  index === activeIndex
                    ? "w-9 bg-[#EF1F28]"
                    : "w-2.5 bg-white/40 hover:bg-white/70",
                )}
                aria-label={`Show event ${index + 1}`}
              />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function MobileArrow({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-30 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:border-[#F7C600] hover:text-[#F7C600]"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 sm:px-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EF1F28]/20 text-[#EF1F28] sm:h-10 sm:w-10">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#A3A3A3]">
          {label}
        </span>
        <span className="block break-words text-sm font-black uppercase text-[#F8EDE7] sm:text-base">
          {children}
        </span>
      </span>
    </div>
  );
}
