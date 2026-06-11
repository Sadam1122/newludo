import type { ReactNode } from "react";

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
        <WhatsAppLogo className="h-4 w-4" />
      </span>
      <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
    </a>
  );
}

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.946L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
      />
    </svg>
  );
}
