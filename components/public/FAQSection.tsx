"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import type { PublicFAQ } from "@/components/public/types";
import { cn } from "@/lib/utils";

type FAQSectionProps = {
  faqs: PublicFAQ[];
};

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  const activeOpenId =
    openId && faqs.some((faq) => faq.id === openId) ? openId : null;

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#5A0505_0%,#7A0B0B_42%,#050505_100%)] py-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,31,40,0.24),transparent_44%)]" />
      <div className="ludo-section-shell relative z-10 max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
            Questions
          </p>
          <h2 className="font-display mt-2 text-[clamp(3.2rem,14vw,7.4rem)] uppercase leading-[0.86] text-[#F8EDE7] sm:text-[clamp(4rem,10vw,7.4rem)] sm:leading-[0.82]">
            FAQ
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = activeOpenId === faq.id;

            return (
              <article
                key={faq.id}
                className="relative z-10 overflow-hidden rounded-[22px] border border-[#2A2A2A] bg-[#0B0B0B] shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="relative z-30 flex min-h-16 w-full touch-manipulation items-center justify-between gap-3 px-4 py-4 text-left transition active:bg-[#111111] hover:bg-[#111111] sm:gap-4 sm:px-6 sm:py-5"
                >
                  <span className="min-w-0 break-words text-sm font-black uppercase leading-6 text-[#F8EDE7] sm:text-base">
                    {faq.question}
                  </span>
                  <span className="pointer-events-none flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] text-[#F7C600] sm:h-10 sm:w-10">
                    {isOpen ? (
                      <Minus className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-[#2A2A2A] px-4 py-4 text-sm font-medium leading-7 text-[#A3A3A3] sm:px-6 sm:py-5 sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
