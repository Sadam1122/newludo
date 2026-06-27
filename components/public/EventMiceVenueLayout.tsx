"use client";

import Image from "next/image";
import { useState } from "react";
import { Users, MonitorPlay, ConciergeBell, Music, Maximize, Armchair, X } from "lucide-react";

export function EventMiceVenueLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#050505] py-12 sm:py-20" id="layout">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(247,198,0,0.1),transparent_26%),radial-gradient(circle_at_88%_18%,rgba(239,31,40,0.16),transparent_28%)]" />
      
      <div className="ludo-section-shell relative z-10 flex flex-col gap-8 xl:flex-row xl:items-stretch">
        
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-6 xl:w-[340px] shrink-0">
          <div>
            <h2 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] uppercase leading-[0.86] text-white">
              VENUE <span className="text-[#EF1F28] block mt-1">LAYOUT</span>
            </h2>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.15em] text-[#F8EDE7]">
              FLEXIBLE SPACE<br/>FOR EVERY OCCASION
            </p>
            <p className="mt-4 text-xs font-semibold leading-relaxed text-[#A3A3A3]">
              Layout ini dapat disesuaikan untuk berbagai kebutuhan event seperti corporate meeting, gathering, watch party, product launch, hingga private celebration.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex gap-4 items-start rounded-[16px] border border-white/5 bg-black/40 p-4">
              <div className="text-[#EF1F28] mt-0.5"><Users size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#F8EDE7]">FLEXIBLE SETUP</h4>
                <p className="mt-1 text-[11px] font-semibold text-white/50">Menyesuaikan jumlah tamu & kebutuhan acara</p>
              </div>
            </div>
            <div className="flex gap-4 items-start rounded-[16px] border border-white/5 bg-black/40 p-4">
              <div className="text-[#EF1F28] mt-0.5"><MonitorPlay size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#F8EDE7]">MULTIPLE VIEWING</h4>
                <p className="mt-1 text-[11px] font-semibold text-white/50">6 LED TV + 1 Giant TV Wall untuk pengalaman terbaik</p>
              </div>
            </div>
            <div className="flex gap-4 items-start rounded-[16px] border border-white/5 bg-black/40 p-4">
              <div className="text-[#EF1F28] mt-0.5"><ConciergeBell size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#F8EDE7]">F&B PACKAGE</h4>
                <p className="mt-1 text-[11px] font-semibold text-white/50">Pilihan paket makanan & minuman spesial</p>
              </div>
            </div>
            <div className="flex gap-4 items-start rounded-[16px] border border-white/5 bg-black/40 p-4">
              <div className="text-[#EF1F28] mt-0.5"><Music size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#F8EDE7]">LIVE ENTERTAINMENT</h4>
                <p className="mt-1 text-[11px] font-semibold text-white/50">Live music & entertainment siap memeriahkan acara</p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: VENUE MAP IMAGE */}
        <div className="flex-grow w-full relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0B0B0B] p-2 sm:p-4 shadow-[0_28px_100px_rgba(0,0,0,0.36)] flex items-center justify-center group cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <div className="relative w-full rounded-[18px] overflow-hidden flex items-center justify-center">
            <Image
              src="/layout-seat.png"
              alt="LUDO venue map"
              width={1200}
              height={1200}
              sizes="(min-width: 1280px) 50vw, 100vw"
              className="w-full h-auto object-contain transition duration-500 group-hover:scale-[1.02]"
              priority={false}
            />
            <button
              type="button"
              className="absolute bottom-4 right-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition group-hover:border-[#F7C600] group-hover:text-[#F7C600] group-hover:bg-black/80"
              aria-label="View map fullscreen"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: OVERVIEW */}
        <div className="flex flex-col xl:w-[280px] shrink-0 rounded-[24px] border border-[#EF1F28]/30 bg-black/40 p-6 xl:p-8">
          <h3 className="font-display text-2xl sm:text-3xl uppercase leading-none text-white tracking-wider mb-8">
            VENUE<br/>OVERVIEW
          </h3>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EF1F28]/30 text-[#EF1F28]">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Capacity</p>
                <p className="text-xs font-bold text-[#EF1F28]">100-300 <span className="text-white/80">Guests</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EF1F28]/30 text-[#EF1F28]">
                <MonitorPlay size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Viewing Points</p>
                <p className="text-xs font-bold text-[#EF1F28]">6 LED TV <span className="text-white/80 block">+ 1 Giant TV Wall</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EF1F28]/30 text-[#EF1F28]">
                <Maximize size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Area</p>
                <p className="text-xs font-bold text-[#EF1F28]">Indoor <span className="text-white/80">& Semi Outdoor</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EF1F28]/30 text-[#EF1F28]">
                <Armchair size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Seating</p>
                <p className="text-xs font-bold text-[#EF1F28]">Flexible <span className="text-white/80">Layout</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EF1F28]/30 text-[#EF1F28]">
                <ConciergeBell size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">F&B</p>
                <p className="text-xs font-bold text-[#EF1F28]">Custom Package <span className="text-white/80 block">Available</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EF1F28]/30 text-[#EF1F28]">
                <Music size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Entertainment</p>
                <p className="text-xs font-bold text-[#EF1F28]">Live Music <span className="text-white/80">Ready</span></p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <h4 className="font-display text-xl uppercase tracking-widest text-white">LUDO</h4>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Sports Kitchen & Coffee</p>
            <p className="font-handwriting text-sm text-[#EF1F28] italic">Good Food, Good Match,<br/>Good Vibes.</p>
          </div>
        </div>

      </div>

      {/* BOTTOM LEGEND */}
      <div className="ludo-section-shell relative z-10 mt-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-y-4 gap-x-8 rounded-[20px] border border-white/5 bg-[#0B0B0B] px-6 py-5 shadow-xl">
          <div className="text-xs font-black uppercase tracking-widest text-white/40 w-full sm:w-auto mb-2 sm:mb-0">
            CAPACITY GUIDE
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-[#B58B54]"></div>
            <div className="text-[10px] uppercase text-white/50"><span className="block font-bold text-white">Round Table</span> 4 Pax</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-7 rounded-sm bg-[#333333]"></div>
            <div className="text-[10px] uppercase text-white/50"><span className="block font-bold text-white">Sofa Booth</span> 6-9 Pax</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-7 rounded-sm bg-[#5C4033]"></div>
            <div className="text-[10px] uppercase text-white/50"><span className="block font-bold text-white">VIP Sofa</span> 11 Pax</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-7 border border-[#EF1F28]"></div>
            <div className="text-[10px] uppercase text-white/50"><span className="block font-bold text-white">TV Wall</span> Giant Screen</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-6 bg-[#EF1F28]"></div>
            <div className="text-[10px] uppercase text-white/50"><span className="block font-bold text-white">LED TV</span> 6 Units</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-6 rounded-sm bg-[#2B4E2B] opacity-80"></div>
            <div className="text-[10px] uppercase text-white/50"><span className="block font-bold text-white">Semi Outdoor</span> Terrace</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 border border-[#EF1F28]"></div>
            <div className="text-[10px] uppercase text-white/50"><span className="block font-bold text-white">Pillar</span></div>
          </div>
        </div>
      </div>

    </section>

      {/* ZOOM MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white transition hover:border-[#EF1F28] hover:text-[#EF1F28]"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div
            className="relative h-[min(90vh,1000px)] w-[min(96vw,1400px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src="/layout-seat.png"
              alt="LUDO venue map full"
              fill
              sizes="96vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
