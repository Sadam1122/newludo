"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { isInteractiveTarget } from "@/components/public/interaction";
import type { PublicMatch } from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { cn } from "@/lib/utils";

type MatchSectionProps = {
  matches: PublicMatch[];
  whatsappNumber: string;
  defaultMessage: string;
};

const statusCopy: Record<PublicMatch["status"], string> = {
  BOOK: "BOOK",
  LIMITED: "LIMITED",
  FULL_BOOKED: "FULL BOOKED",
  CURRENTLY_SHOWING: "CURRENTLY SHOWING",
};

export function MatchSection({
  matches,
  whatsappNumber,
  defaultMessage,
}: MatchSectionProps) {
  const [perPage, setPerPage] = useState(1);
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartedOnInteractive = useRef(false);
  const totalPages = Math.max(1, Math.ceil(matches.length / perPage));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    function updatePerPage() {
      const width = window.innerWidth;
      if (width < 640) {
        setPerPage(1);
      } else if (width < 1024) {
        setPerPage(2);
      } else {
        setPerPage(4);
      }
    }

    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
  }, []);

  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = window.setInterval(() => {
      setPage((current) => {
        const normalized = Math.min(current, totalPages - 1);
        return normalized === totalPages - 1 ? 0 : normalized + 1;
      });
    }, 4600);

    return () => window.clearInterval(interval);
  }, [totalPages]);

  function move(direction: "prev" | "next") {
    setPage((current) => {
      const normalized = Math.min(current, totalPages - 1);

      if (direction === "next") {
        return normalized === totalPages - 1 ? 0 : normalized + 1;
      }

      return normalized === 0 ? totalPages - 1 : normalized - 1;
    });
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartedOnInteractive.current = isInteractiveTarget(event.target);
    if (touchStartedOnInteractive.current) {
      touchStartX.current = null;
      return;
    }

    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
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

  return (
    <section
      id="menu"
      className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#5A0505_0%,#7A0B0B_42%,#050505_100%)] py-12 sm:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,31,40,0.28),transparent_42%)]" />
      <div className="ludo-section-shell relative z-10">
        <div className="mb-7 flex items-center justify-between gap-4">
          <h2 className="font-display ludo-text-shadow max-w-[75%] text-[clamp(3rem,13vw,6.7rem)] uppercase leading-[0.84] text-[#F8EDE7] sm:max-w-none sm:text-[clamp(3.6rem,8vw,6.7rem)]">
            This Week Match
          </h2>
          <div className="hidden gap-3 sm:flex">
            <CarouselButton
              label="Previous matches"
              onClick={() => move("prev")}
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </CarouselButton>
            <CarouselButton label="Next matches" onClick={() => move("next")}>
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </CarouselButton>
          </div>
        </div>

        {matches.length > 0 ? (
          <div
            className="relative z-10 overflow-hidden [touch-action:pan-y]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div
                  key={pageIndex}
                  className={cn(
                    "grid min-w-full gap-5",
                    perPage === 1 && "grid-cols-1",
                    perPage === 2 && "grid-cols-2",
                    perPage === 4 && "grid-cols-4",
                  )}
                >
                  {matches
                    .slice(pageIndex * perPage, pageIndex * perPage + perPage)
                    .map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        whatsappNumber={whatsappNumber}
                        defaultMessage={defaultMessage}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-[#0B0B0B] p-8 text-center">
            <p className="font-display text-5xl uppercase text-[#F7C600]">
              No Match Schedule
            </p>
            <p className="mt-2 text-sm font-semibold text-[#A3A3A3]">
              Tambahkan jadwal match dari Admin CMS.
            </p>
          </div>
        )}

        <div className="relative z-30 mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => move("prev")}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition active:scale-95 hover:border-[#F7C600] hover:text-[#F7C600] sm:hidden"
            aria-label="Previous matches"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              className={cn(
                "h-2.5 touch-manipulation rounded-full transition",
                index === safePage
                  ? "w-9 bg-[#F7C600]"
                  : "w-2.5 bg-white/35 hover:bg-white/65",
              )}
              aria-label={`Show match page ${index + 1}`}
            />
          ))}
          <button
            type="button"
            onClick={() => move("next")}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition active:scale-95 hover:border-[#F7C600] hover:text-[#F7C600] sm:hidden"
            aria-label="Next matches"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

function MatchCard({
  match,
  whatsappNumber,
  defaultMessage,
}: {
  match: PublicMatch;
  whatsappNumber: string;
  defaultMessage: string;
}) {
  const isFull = match.status === "FULL_BOOKED";
  const shouldStamp = isFull || match.showSoldOutStamp;

  return (
    <article className="group relative min-h-[366px] overflow-hidden rounded-[22px] border border-white/10 bg-[#0B0B0B] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34)] transition duration-300 hover:-translate-y-1 hover:border-[#EF1F28]/60 sm:min-h-[386px] sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#EF1F28,#F7C600,#25D366)] opacity-85" />
      {shouldStamp ? <SoldOutStamp /> : null}

      <p className="text-center text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#F7C600]">
        {match.leagueName}
      </p>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:mt-7 sm:gap-3">
        <TeamLogo name={match.homeTeamName} src={match.homeTeamLogo} />
        <span className="font-display text-3xl text-[#EF1F28] sm:text-4xl">
          VS
        </span>
        <TeamLogo name={match.awayTeamName} src={match.awayTeamLogo} />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 text-center sm:mt-6 sm:gap-3">
        <p className="min-w-0 break-words text-xs font-black uppercase leading-tight text-[#F8EDE7] sm:text-sm">
          {match.homeTeamName}
        </p>
        <span className="mt-1 h-7 w-px bg-white/15" />
        <p className="min-w-0 break-words text-xs font-black uppercase leading-tight text-[#F8EDE7] sm:text-sm">
          {match.awayTeamName}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-[#2A2A2A] bg-[#111111] px-3 py-3 text-center sm:mt-7 sm:px-4">
        <p className="text-xs font-bold uppercase text-[#A3A3A3]">
          {statusCopy[match.status]}
        </p>
        <p className="font-display mt-1 text-3xl leading-none text-[#F8EDE7] sm:text-4xl">
          {match.matchDateLabel}{" "}
          <span className="text-[#F7C600]">{match.matchTimeLabel}</span>
        </p>
      </div>

      <div className="relative z-20 mt-5">
        {isFull ? (
          <span className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-[#EF1F28] px-4 text-center text-sm font-black uppercase text-white opacity-85">
            {match.buttonLabel}
          </span>
        ) : (
          <WhatsAppButton
            phoneNumber={whatsappNumber}
            message={match.whatsappMessage ?? defaultMessage}
            variant={match.status === "LIMITED" ? "outline" : "solid"}
            className={cn(
              "w-full",
              match.status === "LIMITED" &&
                "border-[#F7C600] text-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505] focus-visible:outline-[#F7C600]",
            )}
          >
            {match.buttonLabel}
          </WhatsAppButton>
        )}
      </div>
    </article>
  );
}

function CarouselButton({
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
      className="relative z-30 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:border-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505]"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function TeamLogo({ name, src }: { name: string; src?: string | null }) {
  return (
    <div className="mx-auto flex min-w-0 flex-col items-center gap-3">
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#111111] shadow-[inset_0_0_28px_rgba(255,255,255,0.05)] sm:h-20 sm:w-20">
        {src ? (
          <Image
            src={src}
            alt={name}
            width={80}
            height={80}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="font-display text-3xl text-[#F7C600]">
            {initials(name)}
          </span>
        )}
      </div>
    </div>
  );
}

function SoldOutStamp() {
  return (
    <div className="pointer-events-none absolute right-3 top-24 z-10 rotate-[-13deg] rounded-lg border-[3px] border-[#EF1F28] px-3 py-2 text-center shadow-[0_0_24px_rgba(239,31,40,0.32)] sm:border-4 sm:px-4">
      <span className="font-display block text-3xl leading-none text-[#EF1F28] sm:text-4xl">
        SOLD
      </span>
      <span className="font-display block text-3xl leading-none text-[#EF1F28] sm:text-4xl">
        OUT
      </span>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
