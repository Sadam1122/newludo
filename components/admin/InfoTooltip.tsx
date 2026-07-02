import { HelpCircle } from "lucide-react";

export function InfoTooltip({ info }: { info: string }) {
  return (
    <div className="group relative inline-block ml-1.5 align-middle">
      <HelpCircle className="h-4 w-4 text-zinc-400 transition-colors hover:text-ludo-gold cursor-help" />
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 z-50">
        <div className="rounded border border-white/10 bg-black/95 p-2 text-center text-[0.7rem] leading-snug text-white shadow-xl whitespace-pre-wrap">
          {info}
        </div>
        <div className="absolute left-1/2 top-full -ml-1.5 border-x-[6px] border-t-[6px] border-x-transparent border-t-black/95"></div>
      </div>
    </div>
  );
}
