"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { PublicBrand } from "@/components/public/types";
import { cn } from "@/lib/utils";

type BrandSectionProps = {
  brands: PublicBrand[];
};

const VISIBLE_BRANDS = 3;

export function BrandSection({ brands }: BrandSectionProps) {
  const safeBrands = useMemo(() => brands.filter(Boolean), [brands]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isCarousel = safeBrands.length > VISIBLE_BRANDS;
  const headingBrand = safeBrands[0];

  const visibleBrands = useMemo(() => {
    if (!isCarousel) return safeBrands;

    return Array.from({ length: VISIBLE_BRANDS }, (_, offset) => {
      const index = (activeIndex + offset) % safeBrands.length;
      return safeBrands[index];
    });
  }, [activeIndex, isCarousel, safeBrands]);

  useEffect(() => {
    if (!isCarousel) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeBrands.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [isCarousel, safeBrands.length]);

  if (!headingBrand) return null;

  const visibleCount = visibleBrands.length;
  const layoutWidth =
    visibleCount === 1
      ? "max-w-md"
      : visibleCount === 2
        ? "max-w-3xl"
        : "max-w-5xl";
  const gridColumns =
    visibleCount === 1
      ? "grid-cols-1"
      : visibleCount === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  const move = (direction: 1 | -1) => {
    if (!isCarousel) return;
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) return safeBrands.length - 1;
      return next % safeBrands.length;
    });
  };

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#050505_0%,#5A0505_50%,#000000_100%)] py-14 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(247,198,0,0.14),transparent_34%)]" />
      <div className="ludo-section-shell relative z-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
          {headingBrand.subtitle}
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-3xl break-words text-[clamp(2rem,7vw,4.8rem)] uppercase leading-[0.94] text-[#F8EDE7] sm:text-[clamp(2.8rem,6vw,5.4rem)]">
          {headingBrand.titleBeforeHighlight}{" "}
          <span className="text-[#F7C600]">{headingBrand.titleHighlight}</span>
        </h2>

        <div className={cn("relative mx-auto mt-8 sm:mt-10", layoutWidth)}>
          {isCarousel ? (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:border-[#F7C600] hover:text-[#F7C600] sm:-translate-x-1/2"
                aria-label="Previous brand"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="absolute right-0 top-1/2 z-20 flex h-11 w-11 translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:border-[#F7C600] hover:text-[#F7C600] sm:translate-x-1/2"
                aria-label="Next brand"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div className={cn("grid gap-4", gridColumns)}>
            {visibleBrands.map((brand, index) => (
              <article
                key={`${brand.id}-${activeIndex}-${index}`}
                className={cn(
                  "flex min-h-[138px] flex-col items-center justify-center rounded-[20px] border border-[#2A2A2A] bg-[#050505] px-5 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] transition duration-500",
                  isCarousel && "animate-[brandWheel_520ms_ease-out]",
                )}
              >
                <div className="flex h-16 w-full items-center justify-center sm:h-20">
                  {brand.brandLogo ? (
                    isExternalUrl(brand.brandLogo) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.brandLogo}
                        alt={brand.brandName}
                        className="max-h-14 w-auto object-contain sm:max-h-16"
                      />
                    ) : (
                      <Image
                        src={brand.brandLogo}
                        alt={brand.brandName}
                        width={220}
                        height={90}
                        className="max-h-14 w-auto object-contain sm:max-h-16"
                        unoptimized={brand.brandLogo.endsWith(".svg")}
                      />
                    )
                  ) : (
                    <p className="break-words font-serif text-[clamp(1.9rem,7vw,3.2rem)] font-black italic leading-none text-[#EF1F28]">
                      {brand.brandName}
                    </p>
                  )}
                </div>
                <p className="mt-4 break-words text-xs font-black uppercase tracking-[0.16em] text-[#A3A3A3]">
                  {brand.bottomText}
                </p>
              </article>
            ))}
          </div>
        </div>

        {isCarousel ? (
          <div className="mt-7 flex justify-center gap-2">
            {safeBrands.map((brand, index) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2.5 rounded-full transition",
                  index === activeIndex
                    ? "w-8 bg-[#F7C600]"
                    : "w-2.5 bg-white/30 hover:bg-white/55",
                )}
                aria-label={`Show ${brand.brandName}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}
