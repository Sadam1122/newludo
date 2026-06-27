import type { SiteSetting, GalleryItem, EventMiceSetting } from "@prisma/client";
import type { Metadata } from "next";
import { CheckCircle2, ChevronRight, MessageSquare, MonitorPlay, Users, Calendar, Music, CarFront, UsersRound, HelpCircle, Briefcase, Ticket, Megaphone, PartyPopper, HeartHandshake } from "lucide-react";

import { EventMiceVenueLayout } from "@/components/public/EventMiceVenueLayout";
import { GallerySection } from "@/components/public/GallerySection";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import type {
  PublicGalleryItem,
  PublicSettings,
} from "@/components/public/types";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import {
  DEFAULT_WHATSAPP_MESSAGE,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event / MICE",
  description:
    "Event / MICE, upcoming schedule, table layout, dan reservasi event di LUDO Sports Kitchen & Coffee Bandung.",
  alternates: {
    canonical: absoluteUrl("/event-mice"),
  },
};

const DEFAULT_SETTINGS: PublicSettings = {
  siteName: "LUDO Sports Kitchen & Coffee",
  siteTagline: "EAT \u00B7 WATCH \u00B7 CONNECT",
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  defaultWhatsappMessage: DEFAULT_WHATSAPP_MESSAGE,
  instagramHandle: "@ludosportskitchen",
  instagramUrl: "https://www.instagram.com/ludosportskitchen/",
  tiktokHandle: "@ludosportskitchen",
  tiktokUrl: "https://www.tiktok.com/@ludosportskitchen",
  menuUrl:
    "https://drive.google.com/drive/folders/1qvRivb-6awFzYvzaCEP9H0NbM3EIcU9r",
  matchSectionTitle: "UPCOMING SPORTS SCHEDULE",
  headerBookingLabel: "Book",
  headerBookingUrl: null,
  headerBookingVisible: true,
  eventMiceLabel: "Event / MICE",
  eventMiceUrl: "/event-mice",
  eventMiceVisible: true,
  footerCopyright:
    "\u00A9 2026 LUDO SPORTS KITCHEN & COFFEE. ALL RIGHTS RESERVED.",
};

type EventMiceContent = {
  settings: SiteSetting | null;
  miceSetting: EventMiceSetting | null;
  gallery: GalleryItem[];
};

export default async function EventMicePage() {
  const { settings, miceSetting, gallery } = await getEventMiceContent();
  const publicSettings = toPublicSettings(settings);
  
  const publicGallery: PublicGalleryItem[] = gallery.map((item) => ({
    id: item.id,
    title: item.title,
    caption: item.caption,
    videoUrl: item.videoUrl,
    thumbnailUrl: item.thumbnailUrl,
  }));

  const heroHeadline = miceSetting?.heroHeadline ?? "SPACE FOR EVERY OCCASION";
  const heroDesc = miceSetting?.heroDescription ?? "Host gathering, meeting, watch party, community event, hingga private celebration dengan suasana sportsbar premium di Bandung.\n\nIndoor & semi outdoor venue dengan giant screen, live entertainment, dan pilihan paket F&B yang dapat disesuaikan dengan kebutuhan acara Anda.";
  const s2Headline = miceSetting?.section2Headline ?? "BUILT FOR GATHERINGS, DESIGNED FOR COLLABORATIONS.";
  const s2Desc = miceSetting?.section2Description ?? "Dari meeting hingga brand activation, dari komunitas hingga perayaan spesial—setiap detail acara Anda dapat kami sesuaikan.";
  const quote = miceSetting?.quoteText ?? "YOUR VISION, OUR SPACE. TOGETHER, WE CREATE UNFORGETTABLE EXPERIENCES.";

  return (
    <main className="min-h-screen bg-[#050505] text-[#F8EDE7]">
      <Header
        siteName={publicSettings.siteName}
        tagline={publicSettings.siteTagline}
        whatsappNumber={publicSettings.whatsappNumber}
        defaultWhatsappMessage={publicSettings.defaultWhatsappMessage}
        menuUrl={publicSettings.menuUrl}
        bookingLabel={publicSettings.headerBookingLabel}
        bookingUrl={publicSettings.headerBookingUrl}
        bookingVisible={publicSettings.headerBookingVisible}
        eventMiceLabel={publicSettings.eventMiceLabel}
        eventMiceUrl={publicSettings.eventMiceUrl}
        eventMiceVisible={publicSettings.eventMiceVisible}
      />

      {/* Slide 1 - Hero */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#050505_0%,#5A0505_58%,#000000_100%)] pt-24 pb-12 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(247,198,0,0.16),transparent_28%),radial-gradient(circle_at_22%_62%,rgba(239,31,40,0.24),transparent_34%)]" />
        
        <div className="ludo-section-shell relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#EF1F28] mb-4">
            EVENT / MICE
          </p>
          
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] uppercase leading-[0.85] text-white whitespace-pre-line">
                {heroHeadline.split("/").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="text-[#EF1F28]">/</span>}
                  </span>
                ))}
              </h1>
              
              <div className="mt-8 space-y-4 max-w-xl text-sm font-medium leading-relaxed text-[#D7C8C1] sm:text-base whitespace-pre-line">
                {heroDesc}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <WhatsAppButton
                  phoneNumber={publicSettings.whatsappNumber}
                  message="Halo LUDO, saya ingin bertanya untuk reservasi Event / MICE."
                  variant="solid"
                  className="bg-[#25D366] text-black hover:bg-[#1EBE5A] rounded-full justify-center px-8"
                >
                  RESERVE EVENT / MICE
                </WhatsAppButton>
                <a
                  href="#layout"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-bold uppercase text-white transition hover:border-white hover:bg-white/5"
                >
                  VIEW VENUE LAYOUT <ChevronRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-[24px] border border-[#EF1F28]/30 bg-black/40 p-5 text-center backdrop-blur shadow-[0_8px_30px_rgba(239,31,40,0.15)]">
                  <Users className="w-8 h-8 mx-auto text-[#F7C600] mb-3" />
                  <p className="text-3xl font-display text-[#F7C600]">100-300+</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mt-1">CAPACITY</p>
                  <p className="text-xs text-white/50 mt-3 font-medium">Cocok untuk acara skala kecil hingga besar.</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/40 p-5 text-center backdrop-blur">
                  <MonitorPlay className="w-8 h-8 mx-auto text-white mb-3" />
                  <p className="text-xl font-black uppercase text-white">INDOOR &<br/>SEMI OUTDOOR</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#F7C600] mt-1">FLEXIBLE VENUE</p>
                  <p className="text-xs text-white/50 mt-3 font-medium">Area versatile yang dapat diatur sesuai kebutuhan acara.</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/40 p-5 text-center backdrop-blur">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-white mb-3" />
                  <p className="text-xl font-black uppercase text-white">CUSTOM<br/>PACKAGE</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#F7C600] mt-1">TAILORED EXPERIENCE</p>
                  <p className="text-xs text-white/50 mt-3 font-medium">Paket F&B dan konsep acara yang dapat disesuaikan.</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#EF1F28]/30 bg-black/40 p-6 backdrop-blur">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#EF1F28]" />
                    <span className="text-sm font-bold uppercase tracking-wide">CORPORATE GATHERING</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PartyPopper className="w-5 h-5 text-[#EF1F28]" />
                    <span className="text-sm font-bold uppercase tracking-wide">BIRTHDAY CELEBRATION</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <UsersRound className="w-5 h-5 text-[#EF1F28]" />
                    <span className="text-sm font-bold uppercase tracking-wide">COMMUNITY EVENT</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-[#EF1F28]" />
                    <span className="text-sm font-bold uppercase tracking-wide">PRODUCT LAUNCH</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MonitorPlay className="w-5 h-5 text-[#EF1F28]" />
                    <span className="text-sm font-bold uppercase tracking-wide">WATCH PARTY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-[#EF1F28]" />
                    <span className="text-sm font-bold uppercase tracking-wide">BRAND ACTIVATION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar Features */}
        <div className="absolute bottom-0 w-full border-t border-white/10 bg-black/80 backdrop-blur-md hidden sm:block">
          <div className="ludo-section-shell py-4 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/80">
            <div className="flex items-center gap-2"><MonitorPlay className="w-4 h-4 text-[#EF1F28]" /> GIANT LED SCREEN</div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2"><Music className="w-4 h-4 text-[#EF1F28]" /> LIVE ENTERTAINMENT</div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#EF1F28]" /> FOOD & BEVERAGE PACKAGES</div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2"><CarFront className="w-4 h-4 text-[#EF1F28]" /> EASY PARKING ACCESS</div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#EF1F28]" /> DEDICATED EVENT TEAM</div>
          </div>
        </div>
      </section>

      {/* Slide 2 - Collaboration */}
      <section className="relative isolate overflow-hidden bg-[#0A0A0A] py-16 sm:py-24">
        <div className="ludo-section-shell relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            
            <div>
              <div className="flex items-center gap-4 mb-6">
                <p className="text-sm font-black uppercase tracking-widest text-[#EF1F28]">EVENT / MICE</p>
                <div className="h-px flex-1 bg-[linear-gradient(90deg,#EF1F28,transparent)] opacity-50" />
                <p className="text-sm font-black uppercase tracking-widest text-[#F7C600]">SUITABLE FOR</p>
              </div>
              
              <h2 className="font-display text-[clamp(3rem,8vw,5.5rem)] uppercase leading-[0.85] text-white">
                {s2Headline.split(",").map((part, i, arr) => (
                  <span key={i}>
                    {part}{i < arr.length - 1 ? "," : ""}
                    {i === 0 && <br />}
                    {i === 1 && <span className="text-[#EF1F28]">.</span>}
                  </span>
                ))}
              </h2>
              
              <p className="mt-8 text-base font-medium leading-relaxed text-[#D7C8C1]">
                {s2Desc}
              </p>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-white/10 py-8">
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-white/80" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-white">FLEXIBLE<br/>LAYOUT</p>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-white/80" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-white">F&B<br/>PACKAGES</p>
                </div>
                <div className="text-center">
                  <Megaphone className="w-6 h-6 mx-auto mb-2 text-white/80" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-white">AUDIO VISUAL<br/>SUPPORT</p>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-white/80" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-white">DEDICATED<br/>EVENT TEAM</p>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <WhatsAppButton
                  phoneNumber={publicSettings.whatsappNumber}
                  message="Halo LUDO, saya ingin mendiskusikan rencana event saya."
                  variant="solid"
                  className="bg-[#25D366] text-black hover:bg-[#1EBE5A] rounded-full px-8 py-3 font-bold"
                >
                  DISCUSS YOUR EVENT
                </WhatsAppButton>
                <a
                  href="#layout"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-xs font-bold uppercase text-white transition hover:border-white"
                >
                  CONTACT EVENT TEAM <ChevronRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Event Cards */}
              <EventCard title="CORPORATE MEETING" desc="Rapat, workshop, seminar, hingga training dengan fasilitas lengkap." icon={<Briefcase />} />
              <EventCard title="BRAND ACTIVATION" desc="Aktivasi brand yang berkesan dengan dukungan konsep teknis terbaik." icon={<Megaphone />} />
              <EventCard title="WATCH PARTY" desc="Nonton bareng pertandingan favorit dengan layar besar dan sound premium." icon={<MonitorPlay />} />
              <EventCard title="BIRTHDAY CELEBRATION" desc="Rayakan momen spesial bersama keluarga dan teman-teman." icon={<PartyPopper />} />
              <EventCard title="PRODUCT LAUNCHING" desc="Perkenalkan produk Anda dengan cara yang lebih impactful." icon={<Megaphone />} />
              <EventCard title="COMMUNITY GATHERING" desc="Bangun kebersamaan komunitas dalam suasana yang nyaman." icon={<UsersRound />} />
              <EventCard title="INTIMATE WEDDING" desc="Pernikahan intim yang elegan dan hangat dengan sentuhan personal." icon={<HeartHandshake />} className="col-span-2 sm:col-span-3 lg:col-span-1" />
            </div>

          </div>

          <div className="mt-20 flex items-center justify-center gap-4 text-center">
            <span className="text-4xl text-[#EF1F28]">“</span>
            <p className="text-sm sm:text-base font-black uppercase tracking-[0.15em] text-white/60">
              {quote.split("TOGETHER").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="text-[#EF1F28]">TOGETHER</span>}
                </span>
              ))}
            </p>
            <span className="text-4xl text-[#EF1F28]">”</span>
          </div>
        </div>
      </section>

      {/* Venue Map */}
      <div id="layout">
        <EventMiceVenueLayout />
      </div>

      {/* Gallery */}
      <GallerySection items={publicGallery} />

      <Footer copyright={publicSettings.footerCopyright} />
    </main>
  );
}

function EventCard({ title, desc, icon, className = "" }: { title: string, desc: string, icon: React.ReactNode, className?: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-black p-4 transition hover:border-[#EF1F28]/50 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#EF1F28]/10 opacity-0 transition group-hover:opacity-100" />
      <div className="relative z-10 flex flex-col h-full items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#EF1F28]">
          {icon}
        </div>
        <h3 className="mb-2 text-[11px] font-black uppercase tracking-wider text-white">
          {title}
        </h3>
        <p className="text-[10px] font-medium leading-relaxed text-white/50">
          {desc}
        </p>
      </div>
    </div>
  )
}


async function getEventMiceContent(): Promise<EventMiceContent> {
  const [settings, miceSetting, gallery] = await Promise.all([
    prisma.siteSetting.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.eventMiceSetting.findFirst(),
    prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return { settings, miceSetting, gallery };
}

function toPublicSettings(settings: SiteSetting | null): PublicSettings {
  return {
    siteName: settings?.siteName ?? DEFAULT_SETTINGS.siteName,
    siteTagline: settings?.siteTagline ?? DEFAULT_SETTINGS.siteTagline,
    whatsappNumber: settings?.whatsappNumber ?? DEFAULT_SETTINGS.whatsappNumber,
    defaultWhatsappMessage:
      settings?.defaultWhatsappMessage ??
      DEFAULT_SETTINGS.defaultWhatsappMessage,
    instagramHandle:
      settings?.instagramHandle ?? DEFAULT_SETTINGS.instagramHandle,
    instagramUrl: settings?.instagramUrl ?? DEFAULT_SETTINGS.instagramUrl,
    tiktokHandle: settings?.tiktokHandle ?? DEFAULT_SETTINGS.tiktokHandle,
    tiktokUrl: settings?.tiktokUrl ?? DEFAULT_SETTINGS.tiktokUrl,
    menuUrl: settings?.menuUrl ?? DEFAULT_SETTINGS.menuUrl,
    matchSectionTitle:
      settings?.matchSectionTitle ?? DEFAULT_SETTINGS.matchSectionTitle,
    headerBookingLabel:
      settings?.headerBookingLabel ?? DEFAULT_SETTINGS.headerBookingLabel,
    headerBookingUrl:
      settings?.headerBookingUrl ?? DEFAULT_SETTINGS.headerBookingUrl,
    headerBookingVisible:
      settings?.headerBookingVisible ?? DEFAULT_SETTINGS.headerBookingVisible,
    eventMiceLabel: settings?.eventMiceLabel ?? DEFAULT_SETTINGS.eventMiceLabel,
    eventMiceUrl: settings?.eventMiceUrl ?? DEFAULT_SETTINGS.eventMiceUrl,
    eventMiceVisible:
      settings?.eventMiceVisible ?? DEFAULT_SETTINGS.eventMiceVisible,
    footerCopyright:
      settings?.footerCopyright ?? DEFAULT_SETTINGS.footerCopyright,
  };
}
