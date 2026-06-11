import { Camera, ExternalLink, MapPin, Music2 } from "lucide-react";

import type { PublicLocation } from "@/components/public/types";

type LocationSectionProps = {
  location: PublicLocation;
};

export function LocationSection({ location }: LocationSectionProps) {
  const embedUrl = createMapEmbedUrl(location);

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] py-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_42%,rgba(239,31,40,0.16),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(247,198,0,0.08),transparent_26%)]" />
      <div className="ludo-section-shell relative z-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch xl:gap-8">
        <div className="relative rounded-[22px] border border-[#2A2A2A] bg-[#0B0B0B] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:rounded-[28px] sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
            Location
          </p>
          <h2 className="font-display mt-3 break-words text-[clamp(2.8rem,12vw,5.5rem)] uppercase leading-[0.9] text-[#F8EDE7] sm:text-[clamp(3.2rem,7vw,5.5rem)] sm:leading-[0.88]">
            {location.businessName}
          </h2>
          <p className="mt-4 max-w-2xl break-words text-sm font-semibold leading-6 text-[#A3A3A3] sm:text-base sm:leading-7">
            {location.address}
          </p>

          <a
            href={location.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative z-20 mt-6 block touch-manipulation overflow-hidden rounded-[22px] border border-[#EF1F28]/35 bg-[#111111] p-1.5 shadow-[0_30px_90px_rgba(239,31,40,0.12)] transition hover:border-[#F7C600]/70 sm:rounded-[26px] sm:p-2"
          >
            <div className="relative min-h-[300px] overflow-hidden rounded-[18px] bg-[#111111] sm:min-h-[390px] sm:rounded-[20px]">
              <iframe
                title={`${location.businessName} Google Maps`}
                src={embedUrl}
                className="pointer-events-none absolute inset-0 h-full w-full border-0 grayscale-[0.28] invert-[0.08] saturate-[0.85] transition duration-500 group-hover:grayscale-0 group-hover:saturate-100"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_42%,rgba(0,0,0,0.68)_100%)]" />
              <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/10" />
              <span className="absolute bottom-4 left-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-[0.68rem] font-black uppercase text-[#050505] shadow-[0_14px_40px_rgba(37,211,102,0.28)] sm:bottom-5 sm:left-5 sm:px-4 sm:text-xs">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">Open Google Maps</span>
              </span>
              <span className="absolute right-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full border border-white/15 bg-black/70 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#F8EDE7] backdrop-blur sm:right-5 sm:top-5 sm:px-4 sm:text-[0.68rem] sm:tracking-[0.18em]">
                Kiara Artha Bandung
              </span>
            </div>
          </a>
        </div>

        <aside className="rounded-[22px] border border-[#2A2A2A] bg-[linear-gradient(145deg,#111111_0%,#050505_56%,#5A0505_100%)] p-4 sm:rounded-[28px] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
            Social
          </p>
          <h2 className="font-display mt-3 break-words text-[clamp(2.9rem,13vw,6.3rem)] uppercase leading-[0.86] text-[#F8EDE7] sm:text-[clamp(3.4rem,8vw,6.3rem)] sm:leading-[0.82]">
            Our Social <span className="text-[#EF1F28]">Media</span>
          </h2>

          <div className="mt-8 space-y-4">
            <SocialLink
              href={location.instagramUrl}
              icon={<Camera className="h-6 w-6" />}
              label="Instagram"
              handle={location.instagramHandle}
            />
            <SocialLink
              href={location.tiktokUrl}
              icon={<Music2 className="h-6 w-6" />}
              label="TikTok"
              handle={location.tiktokHandle}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

function createMapEmbedUrl(location: PublicLocation) {
  const fallbackQuery = `${location.businessName} ${location.address}`;

  try {
    const url = new URL(location.mapUrl);
    const query = url.searchParams.get("query") || fallbackQuery;
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  } catch {
    return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
  }
}

function SocialLink({
  href,
  icon,
  label,
  handle,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  handle: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative z-20 flex touch-manipulation items-center justify-between gap-3 rounded-[18px] border border-[#2A2A2A] bg-black/45 px-3 py-4 transition hover:border-[#F7C600] hover:bg-[#111111] sm:gap-4 sm:rounded-[20px] sm:px-4"
    >
      <span className="flex min-w-0 items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EF1F28] text-white transition group-hover:bg-[#F7C600] group-hover:text-[#050505] sm:h-12 sm:w-12">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-black uppercase tracking-[0.18em] text-[#A3A3A3]">
            {label}
          </span>
          <span className="block truncate text-base font-black text-[#F8EDE7]">
            {handle}
          </span>
        </span>
      </span>
      <ExternalLink
        className="h-5 w-5 shrink-0 text-[#F7C600]"
        aria-hidden="true"
      />
    </a>
  );
}
