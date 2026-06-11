import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DEFAULT_WHATSAPP_MESSAGE,
  DEFAULT_WHATSAPP_NUMBER,
  createWhatsappUrl,
} from "@/lib/whatsapp";

type WhatsAppButtonProps = {
  children: ReactNode;
  message?: string;
  phoneNumber?: string;
  className?: string;
  variant?: "solid" | "outline" | "neon" | "small";
};

export function WhatsAppButton({
  children,
  message = DEFAULT_WHATSAPP_MESSAGE,
  phoneNumber = DEFAULT_WHATSAPP_NUMBER,
  className,
  variant = "solid",
}: WhatsAppButtonProps) {
  const href = createWhatsappUrl(phoneNumber, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group relative z-30 inline-flex min-w-0 touch-manipulation items-center justify-center gap-2 rounded-full font-black uppercase tracking-normal transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]",
        variant === "solid" &&
          "min-h-12 bg-[#25D366] px-6 text-sm text-[#050505] shadow-[0_14px_34px_rgba(37,211,102,0.24)] hover:-translate-y-0.5 hover:bg-[#48e583]",
        variant === "outline" &&
          "min-h-11 border border-[#25D366]/65 px-5 text-sm text-[#25D366] hover:bg-[#25D366] hover:text-[#050505]",
        variant === "neon" &&
          "min-h-12 bg-[#EF1F28] px-7 text-sm text-white shadow-[0_0_34px_rgba(239,31,40,0.42)] hover:-translate-y-0.5 hover:bg-[#ff3b43]",
        variant === "small" &&
          "min-h-10 bg-[#25D366] px-4 text-xs text-[#050505] shadow-[0_10px_26px_rgba(37,211,102,0.22)] hover:bg-[#48e583]",
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#25D366] transition group-hover:scale-105">
        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
    </a>
  );
}
