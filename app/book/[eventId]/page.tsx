import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/public/BookingForm";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { DEFAULT_WHATSAPP_MESSAGE, DEFAULT_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { releaseExpiredReservations } from "@/lib/reservationExpiry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function BookingPage({ params }: Props) {
  const { eventId } = await params;

  // Lazy cleanup: release any table someone abandoned mid-checkout before we
  // show live availability, so a stale hold never looks unavailable forever.
  await releaseExpiredReservations(eventId);

  const event = await prisma.bookingEvent.findUnique({
    where: { 
      id: eventId,
      category: "BOOKING_EVENT",
    },
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      tables: true,
    },
  });

  if (!event || !event.isActive) {
    notFound();
  }

  // REGULER_MATCH is the "WhatsApp CTA only" template — it never uses the
  // full table + package payment flow, regardless of tables/packages configured.
  const isWhatsappOnly = event.eventType === "REGULER_MATCH";
  const settings = isWhatsappOnly
    ? await prisma.siteSetting.findFirst({ orderBy: { createdAt: "asc" } })
    : null;

  const alaCarteMenu = event.allowAlaCarte && !isWhatsappOnly
    ? await prisma.eventPackage.findMany({
        where: {
          isActive: true,
          category: { not: null },
          bookingEvent: { eventType: "DELIVERY_ORDER" },
        },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return (
    <main className="min-h-screen bg-ludo-black text-white pt-24 pb-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase text-ludo-gold sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 text-zinc-400">
            {event.eventDateLabel} • {event.eventTimeLabel}
          </p>
          <span className="mt-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-bold uppercase tracking-widest text-white">
            {event.eventType.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Poster */}
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

          {/* Right Column: Info Only */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-md shadow-xl h-full">
              <h2 className="mb-6 text-xl font-black text-ludo-gold uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-ludo-gold"></span>
                Event Information
              </h2>
              
              <div className="space-y-6">
                {event.openGateInfo && (
                  <div className="rounded-xl bg-black/40 p-5 border border-white/5">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Gate Open</h3>
                    <p className="text-lg font-black text-white">{event.openGateInfo}</p>
                  </div>
                )}

                {event.tableInfo && (
                  <div className="rounded-xl bg-black/40 p-5 border border-white/5">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Table Details</h3>
                    <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-medium">
                      {event.tableInfo}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Booking Form Section */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {isWhatsappOnly ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="max-w-md text-sm text-zinc-400">
                Untuk reservasi {event.title}, silakan hubungi kami langsung lewat WhatsApp.
              </p>
              <WhatsAppButton
                phoneNumber={settings?.whatsappNumber ?? DEFAULT_WHATSAPP_NUMBER}
                message={
                  event.whatsappMessage ??
                  settings?.defaultWhatsappMessage ??
                  DEFAULT_WHATSAPP_MESSAGE
                }
                variant="solid"
                className="w-full max-w-xs justify-center"
              >
                {event.ctaLabel || "Chat via WhatsApp"}
              </WhatsAppButton>
            </div>
          ) : (
            <BookingForm event={event} alaCarteMenu={alaCarteMenu} />
          )}
        </div>
      </div>
    </main>
  );
}
