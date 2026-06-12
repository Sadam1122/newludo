import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

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
  const bookingHref =
    bookingUrl || createWhatsappUrl(whatsappNumber, defaultWhatsappMessage);

  return (
    <header className="sticky top-0 z-[80] border-b border-[#2A2A2A] bg-[#050505]/95 backdrop-blur-xl">
      <div className="ludo-section-shell relative z-10 flex min-h-[76px] flex-col gap-3 py-3 sm:min-h-[78px] sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link
          href="/"
          className="group relative z-20 flex min-w-0 touch-manipulation items-center justify-center gap-4 sm:justify-start"
          aria-label={siteName}
        >
          <span className="relative block h-11 w-[136px] shrink-0 transition duration-300 group-hover:scale-[1.03] sm:h-14 sm:w-[168px]">
            <Image
              src="/white-logo.webp"
              alt={siteName}
              fill
              priority
              sizes="(min-width: 640px) 168px, 136px"
              className="object-contain object-left drop-shadow-[0_0_24px_rgba(255,255,255,0.16)]"
            />
          </span>
          <span className="hidden min-w-0 border-l border-white/15 pl-4 sm:block">
            <span className="block text-[0.62rem] font-bold uppercase text-[#F7C600] sm:text-[0.68rem]">
              {tagline}
            </span>
          </span>
        </Link>

        <nav
          className="relative z-30 grid w-full grid-cols-2 items-center gap-2 min-[420px]:grid-cols-4 sm:flex sm:w-auto sm:flex-wrap sm:justify-end"
          aria-label="Main navigation"
        >
          <HeaderPill href="/">Home</HeaderPill>
          {eventMiceVisible ? (
            <HeaderPill href={eventMiceUrl}>{eventMiceLabel}</HeaderPill>
          ) : null}
          <a
            href={menuUrl}
            target="_blank"
            rel="noreferrer"
            className="relative z-30 inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full px-2 py-2 text-center text-[0.68rem] font-black uppercase text-[#F8EDE7] transition hover:bg-[#7A0B0B] hover:text-[#F7C600] sm:px-4 sm:text-xs"
          >
            Our Menu
          </a>
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
                className="w-full px-2 sm:w-auto sm:px-4"
              >
                {bookingLabel}
              </WhatsAppButton>
            )
          ) : null}
          <Link
            href="/admin/login"
            className="relative z-30 inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full border border-[#2A2A2A] px-2 py-2 text-center text-[0.68rem] font-black uppercase text-[#F8EDE7] transition hover:border-[#EF1F28] hover:text-[#EF1F28] sm:px-4 sm:text-xs"
          >
            Log In
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeaderPill({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "green";
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(
        "relative z-30 inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full px-2 py-2 text-center text-[0.68rem] font-black uppercase transition sm:px-4 sm:text-xs",
        variant === "green"
          ? "bg-[#25D366] text-[#050505] shadow-[0_10px_26px_rgba(37,211,102,0.22)] hover:bg-[#48e583]"
          : "border border-[#2A2A2A] text-[#F8EDE7] hover:border-[#F7C600] hover:text-[#F7C600]",
      )}
    >
      {children}
    </a>
  );
}
