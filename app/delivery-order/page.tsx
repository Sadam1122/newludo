import type { Metadata } from "next";

import { BookingForm } from "@/components/public/BookingForm";
import { prisma } from "@/lib/prisma";
import { getOrCreateDeliveryOrder } from "@/server/actions/deliveryOrderActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Delivery Order",
};

export default async function DeliveryOrderPage() {
  const singleton = await getOrCreateDeliveryOrder();

  const event = await prisma.bookingEvent.findUnique({
    where: { id: singleton.id },
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      tables: true,
    },
  });

  if (!event || !event.isActive) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ludo-black px-4 text-center text-white">
        <div>
          <h1 className="font-display text-4xl uppercase text-ludo-gold sm:text-5xl">
            Delivery Order
          </h1>
          <p className="mt-4 text-zinc-400">
            Delivery Order is currently unavailable. Please check back later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ludo-black text-white pt-24 pb-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase text-ludo-gold sm:text-5xl">
            {event.title}
          </h1>
          {event.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">{event.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
            <div className="rounded-3xl border-2 border-white/10 bg-white/[0.02] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {event.backgroundImage ? (
                <div className="relative w-full overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.backgroundImage}
                    alt={event.title}
                    className="h-auto w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex w-full aspect-[3/4] items-center justify-center rounded-2xl bg-white/5">
                  <span className="text-white/30 font-bold uppercase">No Poster</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
              <BookingForm event={event} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
