"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PublicMatch } from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { cn, shouldBypassImageOptimization } from "@/lib/utils";

type MatchSectionProps = {
  title: string;
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

type ScheduleFilter = "now" | "week" | "upcoming";

const scheduleFilters: Array<{ key: ScheduleFilter; label: string }> = [
  { key: "now", label: "Sedang Berlangsung" },
  { key: "week", label: "Minggu Ini" },
  { key: "upcoming", label: "Akan Datang" },
];

export function MatchSection({
  title,
  matches,
  whatsappNumber,
  defaultMessage,
}: MatchSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>("upcoming");
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const groupedMatches = useMemo(() => buildMatchGroups(matches), [matches]);
  const visibleMatches = groupedMatches[activeFilter];
  const pageCount = Math.max(
    1,
    Math.ceil(visibleMatches.length / cardsPerPage),
  );
  const activePage = Math.min(
    pageCount - 1,
    Math.floor(activeIndex / cardsPerPage),
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const scrollerElement = scroller;

    let animationFrame = 0;
    function updateActiveIndex() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const cards = Array.from(scrollerElement.children) as HTMLElement[];
        if (cards.length === 0) return;

        const center =
          scrollerElement.scrollLeft + scrollerElement.clientWidth / 2;
        const nearestIndex = cards.reduce((nearest, card, index) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const nearestCard = cards[nearest];
          const nearestCenter =
            nearestCard.offsetLeft + nearestCard.offsetWidth / 2;

          return Math.abs(cardCenter - center) <
            Math.abs(nearestCenter - center)
            ? index
            : nearest;
        }, 0);

        setActiveIndex(nearestIndex);
      });
    }

    scrollerElement.addEventListener("scroll", updateActiveIndex, {
      passive: true,
    });
    return () => {
      window.cancelAnimationFrame(animationFrame);
      scrollerElement.removeEventListener("scroll", updateActiveIndex);
    };
  }, [visibleMatches.length]);

  useEffect(() => {
    if (visibleMatches.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        const currentPage = Math.floor(current / cardsPerPage);
        const nextPage = currentPage === pageCount - 1 ? 0 : currentPage + 1;
        const next = nextPage * cardsPerPage;
        scrollToCard(next);
        return next;
      });
    }, 4600);

    return () => window.clearInterval(interval);
  }, [cardsPerPage, visibleMatches.length, pageCount]);

  useEffect(() => {
    function handleResize() {
      setCardsPerPage(getCardsPerPage());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function move(direction: "prev" | "next") {
    if (visibleMatches.length <= 0) return;

    setActiveIndex((current) => {
      const currentPage = Math.floor(
        Math.min(current, visibleMatches.length - 1) / cardsPerPage,
      );

      if (direction === "next") {
        const nextPage = currentPage === pageCount - 1 ? 0 : currentPage + 1;
        const next = nextPage * cardsPerPage;
        scrollToCard(next);
        return next;
      }

      const previousPage = currentPage === 0 ? pageCount - 1 : currentPage - 1;
      const previous = previousPage * cardsPerPage;
      scrollToCard(previous);
      return previous;
    });
  }

  function scrollToCard(index: number) {
    const scroller = scrollerRef.current;
    const card = scroller?.children[index] as HTMLElement | undefined;
    if (!scroller || !card) return;

    scroller.scrollTo({
      left: card.offsetLeft - scroller.offsetLeft,
      behavior: "smooth",
    });
  }

  function changeFilter(filter: ScheduleFilter) {
    setActiveFilter(filter);
    setActiveIndex(0);
    window.requestAnimationFrame(() => scrollToCard(0));
  }

  return (
    <section
      id="menu"
      className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#5A0505_0%,#7A0B0B_42%,#050505_100%)] py-12 sm:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,31,40,0.28),transparent_42%)]" />
      <div className="ludo-section-shell relative z-10">
        <div className="mb-7 max-w-[1180px]">
          <h2 className="font-display ludo-text-shadow max-w-[75%] text-[clamp(3rem,13vw,6.7rem)] uppercase leading-[0.84] text-[#F8EDE7] sm:max-w-none sm:text-[clamp(3.6rem,8vw,6.7rem)]">
            {title}
          </h2>
          {matches.length > 0 ? (
            <div className="mt-5 grid max-w-3xl grid-cols-3 gap-2 rounded-[18px] border border-white/10 bg-black/24 p-2">
              {scheduleFilters.map((filter) => {
                const count = groupedMatches[filter.key].length;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => changeFilter(filter.key)}
                    className={cn(
                      "min-h-11 rounded-xl px-2 text-center text-[0.58rem] font-black uppercase leading-tight transition sm:px-4 sm:text-xs",
                      activeFilter === filter.key
                        ? "bg-[#F7C600] text-[#050505]"
                        : "text-white/62 hover:bg-white/[0.07] hover:text-white",
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
          ) : null}
        </div>

        {matches.length > 0 && visibleMatches.length > 0 ? (
          <div className="relative left-1/2 z-10 w-[min(100vw-0.75rem,1440px)] -translate-x-1/2 px-6 sm:w-[min(100vw-2rem,1440px)] sm:px-10 lg:px-16 xl:w-[min(100vw-3rem,1500px)]">
            <button
              type="button"
              onClick={() => move("prev")}
              className="absolute left-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-black/70 text-white shadow-[0_16px_40px_rgba(0,0,0,0.36)] backdrop-blur transition active:scale-95 hover:border-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505] sm:h-12 sm:w-12"
              aria-label="Previous matches"
            >
              <ChevronLeft
                className="h-5 w-5 sm:h-6 sm:w-6"
                aria-hidden="true"
              />
            </button>
            <div
              ref={scrollerRef}
              className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-0 py-1 [touch-action:pan-x] lg:gap-6"
            >
              {visibleMatches.map((match) => (
                <div
                  key={match.id}
                  className="min-w-full snap-start sm:min-w-[calc(50%-0.625rem)] lg:min-w-[calc(25%-1.125rem)]"
                >
                  <MatchCard
                    match={match}
                    whatsappNumber={whatsappNumber}
                    defaultMessage={defaultMessage}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => move("next")}
              className="absolute right-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-black/70 text-white shadow-[0_16px_40px_rgba(0,0,0,0.36)] backdrop-blur transition active:scale-95 hover:border-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505] sm:h-12 sm:w-12"
              aria-label="Next matches"
            >
              <ChevronRight
                className="h-5 w-5 sm:h-6 sm:w-6"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : matches.length > 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-[#0B0B0B] p-8 text-center">
            <p className="font-display text-5xl uppercase text-[#F7C600]">
              No Schedule In This Filter
            </p>
            <p className="mt-2 text-sm font-semibold text-[#A3A3A3]">
              Jadwal yang sudah lewat otomatis tidak ditampilkan. Coba tab lain
              atau update jadwal dari Admin CMS.
            </p>
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

        {pageCount > 1 ? (
          <div className="relative z-30 mt-7 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, pageIndex) => (
              <button
                key={pageIndex}
                type="button"
                onClick={() => {
                  const index = pageIndex * cardsPerPage;
                  setActiveIndex(index);
                  scrollToCard(index);
                }}
                className={cn(
                  "h-2.5 touch-manipulation rounded-full transition",
                  pageIndex === activePage
                    ? "w-9 bg-[#F7C600]"
                    : "w-2.5 bg-white/35 hover:bg-white/65",
                )}
                aria-label={`Show match page ${pageIndex + 1}`}
              />
            ))}
          </div>
        ) : null}
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
  const isGeneral = match.displayMode === "GENERAL_EVENT";

  return (
    <article className="group relative min-h-[366px] overflow-hidden rounded-[22px] border border-white/10 bg-[#0B0B0B] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34)] transition duration-300 hover:-translate-y-1 hover:border-[#EF1F28]/60 sm:min-h-[386px] sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#EF1F28,#F7C600,#25D366)] opacity-85" />
      {shouldStamp ? <SoldOutStamp /> : null}

      <p className="text-center text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#F7C600]">
        {match.categoryLabel ?? match.leagueName}
      </p>

      {isGeneral ? (
        <GeneralEventContent match={match} />
      ) : (
        <TeamMatchContent match={match} />
      )}

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
            variant="solid"
            className={cn(
              "w-full",
              match.status === "LIMITED" &&
                "!bg-[#F7C600] !text-[#050505] shadow-[0_14px_34px_rgba(247,198,0,0.24)] hover:!bg-[#ffdc32] focus-visible:outline-[#F7C600]",
            )}
          >
            {match.buttonLabel}
          </WhatsAppButton>
        )}
      </div>
    </article>
  );
}

function TeamMatchContent({ match }: { match: PublicMatch }) {
  const homeName = match.homeTeamName ?? "Home";
  const awayName = match.awayTeamName ?? "Away";

  return (
    <>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:mt-7 sm:gap-3">
        <TeamLogo name={homeName} src={match.homeTeamLogo} />
        <span className="font-display text-3xl text-[#EF1F28] sm:text-4xl">
          VS
        </span>
        <TeamLogo name={awayName} src={match.awayTeamLogo} />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 text-center sm:mt-6 sm:gap-3">
        <p className="min-w-0 break-words text-xs font-black uppercase leading-tight text-[#F8EDE7] sm:text-sm">
          {homeName}
        </p>
        <span className="mt-1 h-7 w-px bg-white/15" />
        <p className="min-w-0 break-words text-xs font-black uppercase leading-tight text-[#F8EDE7] sm:text-sm">
          {awayName}
        </p>
      </div>
    </>
  );
}

function GeneralEventContent({ match }: { match: PublicMatch }) {
  return (
    <div className="mt-5">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[150px] overflow-hidden rounded-2xl border border-white/10 bg-[#111111] sm:max-w-[170px]">
        {match.eventImage ? (
          <Image
            src={match.eventImage}
            alt={match.title ?? match.leagueName}
            fill
            sizes="180px"
            className="object-cover"
            unoptimized={shouldBypassImageOptimization(match.eventImage)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#111111,#5A0505)] px-4 text-center">
            <span className="font-display text-4xl uppercase leading-none text-[#F7C600]">
              {initials(match.title ?? match.leagueName)}
            </span>
          </div>
        )}
      </div>
      <h3 className="mt-4 break-words text-center text-base font-black uppercase leading-tight text-[#F8EDE7] sm:text-lg">
        {match.title ?? match.leagueName}
      </h3>
      {match.description ? (
        <p className="mt-2 line-clamp-2 text-center text-xs font-semibold leading-5 text-[#A3A3A3]">
          {match.description}
        </p>
      ) : null}
    </div>
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
            unoptimized={shouldBypassImageOptimization(src)}
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

function getCardsPerPage() {
  if (typeof window === "undefined") {
    return 4;
  }

  if (window.innerWidth < 640) {
    return 1;
  }

  if (window.innerWidth < 1024) {
    return 2;
  }

  return 4;
}

function buildMatchGroups(matches: PublicMatch[]) {
  const today = startOfToday();
  const weekEnd = endOfThisWeek(today);
  const validMatches = matches.filter((match) => !isExpired(match, today));

  return {
    now: validMatches.filter((match) => match.status === "CURRENTLY_SHOWING"),
    week: validMatches.filter((match) => {
      if (!match.scheduledAt) return false;
      const date = new Date(match.scheduledAt);
      return date >= today && date <= weekEnd;
    }),
    upcoming: validMatches.filter((match) => {
      if (match.status === "CURRENTLY_SHOWING") return false;
      if (!match.scheduledAt) return true;
      return new Date(match.scheduledAt) > weekEnd;
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

function isExpired(match: PublicMatch, today: Date) {
  if (!match.scheduledAt) return false;
  const date = new Date(match.scheduledAt);
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
