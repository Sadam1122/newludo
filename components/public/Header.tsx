"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { cn } from "@/lib/utils";
import { createWhatsappUrl } from "@/lib/whatsapp";

type HeaderProps = {
  siteName: string;
  tagline: string;
  whatsappNumber: string;
  defaultWhatsappMessage: string;
  menuUrl: string;
  bookingLabel: string;
  bookingUrl: string | null;
  bookingVisible: boolean;
  eventMiceLabel: string;
  eventMiceUrl: string;
  eventMiceVisible: boolean;
};

export function Header({
  siteName,
  tagline,
  whatsappNumber,
  defaultWhatsappMessage,
  menuUrl,
  bookingLabel,
  bookingUrl,
  bookingVisible,
  eventMiceLabel,
  eventMiceUrl,
  eventMiceVisible,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const bookingHref =
    bookingUrl || createWhatsappUrl(whatsappNumber, defaultWhatsappMessage);
  const MenuIcon = open ? X : Menu;

  return (
    <header className="sticky top-0 z-[80] border-b border-[#2A2A2A] bg-[#050505]/95 backdrop-blur-xl">
      <div className="ludo-section-shell relative z-10 flex min-h-[74px] items-center justify-between gap-4 py-3 md:min-h-[78px] md:py-0">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group relative z-20 flex min-w-0 touch-manipulation items-center gap-3 md:gap-4"
          aria-label={siteName}
        >
          <span className="relative block h-11 w-[136px] shrink-0 transition duration-300 group-hover:scale-[1.03] md:h-14 md:w-[168px]">
            <Image
              src="/white-logo.webp"
              alt={siteName}
              fill
              priority
              sizes="(min-width: 768px) 168px, 136px"
              className="object-contain object-left drop-shadow-[0_0_24px_rgba(255,255,255,0.16)]"
            />
          </span>
          <span className="hidden min-w-0 border-l border-white/15 pl-4 lg:block">
            <span className="block text-[0.68rem] font-bold uppercase text-[#F7C600]">
              {tagline}
            </span>
          </span>
        </Link>

        <nav
          className="relative z-30 hidden items-center gap-2 md:flex md:flex-wrap md:justify-end"
          aria-label="Main navigation"
        >
          <HeaderPill href="/">Home</HeaderPill>
          {eventMiceVisible ? (
            <HeaderPill href={eventMiceUrl}>{eventMiceLabel}</HeaderPill>
          ) : null}
          <HeaderPill href={menuUrl} external>
            Our Menu
          </HeaderPill>
          {bookingVisible ? (
            bookingUrl ? (
              <HeaderPill href={bookingHref} variant="green">
                {bookingLabel}
              </HeaderPill>
            ) : (
              <WhatsAppButton
                phoneNumber={whatsappNumber}
                message={defaultWhatsappMessage}
                variant="small"
                className="px-4"
              >
                {bookingLabel}
              </WhatsAppButton>
            )
          ) : null}
          <Link
            href="/admin/login"
            className="relative z-30 inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full border border-[#2A2A2A] px-4 py-2 text-center text-xs font-black uppercase text-[#F8EDE7] transition hover:border-[#EF1F28] hover:text-[#EF1F28]"
          >
            Log In
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="relative z-40 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:border-[#F7C600] hover:text-[#F7C600] md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          <MenuIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#050505]/98 px-4 pb-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] md:hidden">
          <nav
            className="mx-auto grid max-w-md gap-2 pt-4"
            aria-label="Mobile navigation"
          >
            <HeaderPill href="/" onClick={() => setOpen(false)} mobile>
              Home
            </HeaderPill>
            {eventMiceVisible ? (
              <HeaderPill
                href={eventMiceUrl}
                onClick={() => setOpen(false)}
                mobile
              >
                {eventMiceLabel}
              </HeaderPill>
            ) : null}
            <HeaderPill
              href={menuUrl}
              onClick={() => setOpen(false)}
              external
              mobile
            >
              Our Menu
            </HeaderPill>
            {bookingVisible ? (
              bookingUrl ? (
                <HeaderPill
                  href={bookingHref}
                  variant="green"
                  onClick={() => setOpen(false)}
                  mobile
                >
                  {bookingLabel}
                </HeaderPill>
              ) : (
                <WhatsAppButton
                  phoneNumber={whatsappNumber}
                  message={defaultWhatsappMessage}
                  variant="small"
                  className="w-full justify-center px-4"
                >
                  {bookingLabel}
                </WhatsAppButton>
              )
            ) : null}
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="relative z-30 inline-flex min-h-11 touch-manipulation items-center justify-center rounded-full border border-[#2A2A2A] px-4 py-2 text-center text-xs font-black uppercase text-[#F8EDE7] transition hover:border-[#EF1F28] hover:text-[#EF1F28]"
            >
              Log In
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HeaderPill({
  href,
  children,
  variant = "dark",
  external,
  mobile,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "green";
  external?: boolean;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const isExternal = external ?? href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      onClick={onClick}
      className={cn(
        "relative z-30 inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full px-4 py-2 text-center text-xs font-black uppercase transition",
        mobile && "min-h-11 w-full",
        variant === "green"
          ? "bg-[#25D366] text-[#050505] shadow-[0_10px_26px_rgba(37,211,102,0.22)] hover:bg-[#48e583]"
          : "border border-[#2A2A2A] text-[#F8EDE7] hover:border-[#F7C600] hover:text-[#F7C600]",
      )}
    >
      {children}
    </a>
  );
}
