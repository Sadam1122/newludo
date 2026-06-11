"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { isInteractiveTarget } from "@/components/public/interaction";
import type { PublicHero } from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { cn } from "@/lib/utils";

type HeroSectionProps = {
  heroes: PublicHero[];
  siteName: string;
  whatsappNumber: string;
};

export function HeroSection({
  heroes,
  siteName,
  whatsappNumber,
}: HeroSectionProps) {
  const slides = useMemo(() => (heroes.length > 0 ? heroes : []), [heroes]);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartedOnInteractive = useRef(false);
  const hero = slides[activeIndex] ?? slides[0];

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
    }, 5200);

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

  if (!hero) return null;

  return (
    <section
      className="relative isolate min-h-[520px] overflow-hidden bg-[#050505] [touch-action:pan-y] md:min-h-[560px] lg:min-h-[650px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="pointer-events-none absolute inset-0 flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="relative h-full min-w-full">
            {slide.backgroundImage ? (
              <Image
                src={slide.backgroundImage}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                unoptimized={slide.backgroundImage.endsWith(".svg")}
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(112deg,#050505_0%,#111111_32%,#4a0505_68%,#000000_100%)]" />
            )}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,rgba(0,0,0,0.88)_34%,rgba(0,0,0,0.2)_62%,rgba(0,0,0,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_48%,rgba(247,198,0,0.18),transparent_24%),radial-gradient(circle_at_20%_0%,rgba(239,31,40,0.32),transparent_32%)]" />

      <button
        type="button"
        onClick={() => move("prev")}
        className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:border-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505] md:flex"
        aria-label="Previous hero slide"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => move("next")}
        className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:border-[#F7C600] hover:bg-[#F7C600] hover:text-[#050505] md:flex"
        aria-label="Next hero slide"
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="ludo-section-shell relative z-10 flex min-h-[520px] items-center py-12 md:min-h-[560px] md:py-14 lg:min-h-[650px]">
        <div className="w-full max-w-[760px]">
          <p className="mb-4 inline-flex max-w-full rounded-full border border-[#F7C600]/40 bg-black/35 px-3 py-2 text-[0.64rem] font-black uppercase tracking-[0.16em] text-[#F7C600] sm:mb-5 sm:px-4 sm:text-[0.7rem] sm:tracking-[0.22em]">
            {siteName}
          </p>
          <h1 className="font-display ludo-text-shadow max-w-[860px] break-words text-[clamp(3.15rem,15vw,10rem)] uppercase leading-[0.82] text-[#F8EDE7] sm:text-[clamp(4.4rem,12vw,10rem)] sm:leading-[0.78]">
            {hero.headlineLine1}{" "}
            <span className="text-[#EF1F28]">{hero.headlineHighlight1}</span>
            <br />
            {hero.headlineLine2}{" "}
            <span className="text-[#F7C600]">{hero.headlineHighlight2}</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-[#F8EDE7]/78 sm:text-base sm:leading-7 md:text-xl">
            {hero.subtitle}
          </p>
          <div className="relative z-30 mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
            <WhatsAppButton
              phoneNumber={whatsappNumber}
              message={hero.ctaWhatsappMessage}
              className="w-full sm:w-auto sm:min-w-[220px]"
            >
              {hero.ctaLabel}
            </WhatsAppButton>
            <div className="flex gap-2 md:hidden">
              <MobileArrow
                label="Previous hero slide"
                onClick={() => move("prev")}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </MobileArrow>
              <MobileArrow label="Next hero slide" onClick={() => move("next")}>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </MobileArrow>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2.5 touch-manipulation rounded-full transition",
                index === activeIndex
                  ? "w-9 bg-[#F7C600]"
                  : "w-2.5 bg-white/40 hover:bg-white/70",
              )}
              aria-label={`Show hero slide ${index + 1}`}
            />
          ))}
        </div>
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
