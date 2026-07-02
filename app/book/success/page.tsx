import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";

type Props = {
  searchParams: Promise<{ order_id?: string }>;
};

export default async function BookingSuccessPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.order_id;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ludo-black p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-ludo-gold/10 text-ludo-gold">
          <CheckCircle className="size-10" />
        </div>
        
        <h1 className="mb-2 text-2xl font-black uppercase text-white">Booking Recorded</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Your booking request has been successfully recorded. Please check your email or wait for confirmation.
        </p>

        {orderId && (
          <div className="mb-8 rounded-lg bg-black/40 py-3">
            <span className="block text-xs uppercase text-zinc-500">Order ID</span>
            <span className="font-mono text-sm font-bold text-white">{orderId}</span>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#EF1F28,#F7C600)] text-sm font-black uppercase text-white shadow-[0_14px_34px_rgba(239,31,40,0.24)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(247,198,0,0.3)]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
