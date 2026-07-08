"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

import { syncPaymentStatus } from "@/server/actions/paymentActions";

type Props = {
  reservationId: string;
  bookingEventId: string;
};

export function SyncPaymentButton({ reservationId, bookingEventId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleSync = () => {
    setLastResult(null);
    startTransition(async () => {
      const result = await syncPaymentStatus(reservationId, bookingEventId);
      if (result.error) {
        setLastResult(`Error: ${result.error}`);
      } else {
        setLastResult(`Synced -> ${result.status}`);
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ludo-gold/30 bg-ludo-gold/10 px-3 text-[11px] font-black uppercase text-ludo-gold transition hover:bg-ludo-gold hover:text-black disabled:opacity-50"
      >
        <RefreshCw className={isPending ? "size-3.5 animate-spin" : "size-3.5"} />
        {isPending ? "Syncing..." : "Sync Payment Status"}
      </button>
      {lastResult ? (
        <span className="text-[10px] font-semibold text-zinc-400">{lastResult}</span>
      ) : null}
    </div>
  );
}
