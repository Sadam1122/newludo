import Image from "next/image";

import type { PublicBrand } from "@/components/public/types";

type BrandSectionProps = {
  brand: PublicBrand;
};

export function BrandSection({ brand }: BrandSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#050505_0%,#5A0505_50%,#000000_100%)] py-14 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(247,198,0,0.14),transparent_34%)]" />
      <div className="ludo-section-shell relative z-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
          {brand.subtitle}
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-4xl break-words text-[clamp(3rem,13vw,8.5rem)] uppercase leading-[0.86] text-[#F8EDE7] sm:text-[clamp(4rem,11vw,8.5rem)] sm:leading-[0.8]">
          {brand.titleBeforeHighlight}{" "}
          <span className="text-[#F7C600]">{brand.titleHighlight}</span>
        </h2>

        <div className="mx-auto mt-8 flex min-h-[150px] max-w-xl items-center justify-center rounded-[22px] border border-[#2A2A2A] bg-[#050505] px-5 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:mt-10 sm:min-h-[190px] sm:rounded-[30px] sm:px-6 sm:py-10">
          {brand.brandLogo ? (
            <Image
              src={brand.brandLogo}
              alt={brand.brandName}
              width={440}
              height={180}
              className="max-h-28 w-auto object-contain sm:max-h-36"
              unoptimized={brand.brandLogo.endsWith(".svg")}
            />
          ) : (
            <p className="break-words font-serif text-[clamp(3rem,12vw,7.8rem)] font-black italic leading-none text-[#EF1F28] sm:text-[clamp(3.8rem,12vw,7.8rem)]">
              {brand.brandName}
            </p>
          )}
        </div>

        <p className="mx-auto mt-7 max-w-full break-words text-xs font-black uppercase tracking-[0.18em] text-[#A3A3A3] sm:tracking-[0.32em]">
          {brand.bottomText}
        </p>
      </div>
    </section>
  );
}
