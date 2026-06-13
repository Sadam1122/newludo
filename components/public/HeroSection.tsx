"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { isInteractiveTarget } from "@/components/public/interaction";
import type { PublicHero } from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { cn, shouldBypassImageOptimization } from "@/lib/utils";

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
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
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

  const activePreviewImage = hero.portraitImage ?? hero.backgroundImage;
  const activeHeroLabel = `${hero.headlineLine1} ${hero.headlineHighlight1} ${hero.headlineLine2} ${hero.headlineHighlight2}`;

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
            {slide.backgroundImage || slide.portraitImage ? (
              <>
                {slide.portraitImage ? (
                  <Image
                    src={slide.portraitImage}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover md:hidden"
                    unoptimized={shouldBypassImageOptimization(
                      slide.portraitImage,
                    )}
                  />
                ) : null}
                {slide.backgroundImage || slide.portraitImage ? (
                  <Image
                    src={slide.backgroundImage ?? slide.portraitImage ?? ""}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className={cn(
                      "object-cover",
                      slide.portraitImage && "hidden md:block",
                    )}
                    unoptimized={Boolean(
                      shouldBypassImageOptimization(
                        slide.backgroundImage ?? slide.portraitImage,
                      ),
                    )}
                  />
                ) : null}
              </>
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
            {activePreviewImage ? (
              <button
                type="button"
                onClick={() =>
                  setModalImage({
                    src: activePreviewImage,
                    alt: activeHeroLabel,
                  })
                }
                className="inline-flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 text-sm font-black uppercase text-white backdrop-blur transition hover:border-[#F7C600] hover:text-[#F7C600] sm:w-auto"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                View Image
              </button>
            ) : null}
          </div>
        </div>

        {activePreviewImage ? (
          <button
            type="button"
            onClick={() =>
              setModalImage({
                src: activePreviewImage,
                alt: activeHeroLabel,
              })
            }
            className="absolute bottom-12 right-0 z-20 hidden w-[min(31vw,380px)] overflow-hidden rounded-[26px] border border-white/12 bg-[#111111] text-left shadow-[0_30px_90px_rgba(0,0,0,0.42)] transition hover:-translate-y-1 hover:border-[#F7C600]/60 xl:block"
            aria-label="Open hero image preview"
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={activePreviewImage}
                alt={activeHeroLabel}
                fill
                sizes="380px"
                className="object-cover"
                unoptimized={shouldBypassImageOptimization(activePreviewImage)}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.48)_100%)]" />
              <span className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </button>
        ) : null}

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
      {modalImage ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Hero image preview"
          onClick={() => setModalImage(null)}
        >
          <button
            type="button"
            onClick={() => setModalImage(null)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white transition hover:border-[#F7C600] hover:text-[#F7C600]"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div
            className="relative h-[min(86vh,900px)] w-[min(92vw,1200px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={modalImage.src}
              alt={modalImage.alt}
              fill
              sizes="92vw"
              className="object-contain"
              unoptimized={shouldBypassImageOptimization(modalImage.src)}
            />
          </div>
        </div>
      ) : null}
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
