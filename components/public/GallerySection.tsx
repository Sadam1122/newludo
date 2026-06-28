"use client";

import { Play, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import type { PublicGalleryItem } from "@/components/public/types";

type GallerySectionProps = {
  items: PublicGalleryItem[];
};

const ITEMS_PER_PAGE = 3;

export function GallerySection({ items }: GallerySectionProps) {
  const videos = items.filter((item) => item.videoUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const paginatedVideos = videos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (videos.length === 0) return null;

  return (
    <section
      id="gallery"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#050505_0%,#160101_54%,#050505_100%)] py-12 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(239,31,40,0.24),transparent_32%),radial-gradient(circle_at_85%_62%,rgba(247,198,0,0.1),transparent_28%)]" />
      <div className="ludo-section-shell relative z-10">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
              <Video className="h-4 w-4" aria-hidden="true" />
              Event / MICE Gallery
            </p>
            <h2 className="font-display mt-3 text-[clamp(3.2rem,12vw,7.4rem)] uppercase leading-[0.84] text-[#EF1F28]">
              GALLERY
            </h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-7 text-[#A3A3A3]">
            Video suasana LUDO dari CMS upload. Konten bisa diatur aktif,
            urutan, dan caption dari admin.
          </p>
        </div>

        <div
          ref={sectionRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [touch-action:pan-x] lg:grid lg:grid-cols-3 lg:overflow-visible"
        >
          {paginatedVideos.map((item, index) => (
            <article
              key={item.id}
              className="group min-w-[82vw] snap-start overflow-hidden rounded-[26px] border border-white/10 bg-[#0B0B0B] shadow-[0_28px_90px_rgba(0,0,0,0.32)] transition hover:-translate-y-1 hover:border-[#EF1F28]/55 sm:min-w-[46vw] lg:min-w-0"
            >
              <div className="relative bg-black">
                <video
                  src={`${item.videoUrl}#t=0.001`}
                  controls
                  muted
                  playsInline
                  preload={index === 0 ? "metadata" : "none"}
                  poster={item.thumbnailUrl ?? undefined}
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
                <div className="pointer-events-none absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur">
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="break-words text-lg font-black uppercase leading-tight text-[#F8EDE7]">
                  {item.title}
                </h3>
                {item.caption ? (
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-[#A3A3A3]">
                    {item.caption}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:border-[#F7C600] hover:text-[#F7C600] disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition ${
                    currentPage === i + 1
                      ? "bg-[#EF1F28] text-white"
                      : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                  }`}
                  aria-label={`Page ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:border-[#F7C600] hover:text-[#F7C600] disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
