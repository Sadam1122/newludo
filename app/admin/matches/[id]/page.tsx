import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { MatchBookingDetailsForm } from "@/components/admin/MatchBookingDetailsForm";
import { PackageManager } from "@/components/admin/PackageManager";
import { TableManager } from "@/components/admin/TableManager";
import { isWhatsappOnlyTemplate } from "@/lib/eventGating";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const matchCategoryLabels: Record<string, string> = {
  REGULER_MATCH: "Reguler Match",
  BIG_MATCH: "Big Match",
  SUPER_BIG_MATCH: "Super Big Match",
  NOBAR_COMMUNITY: "Nobar With Community",
  IFTAR_2027: "Iftar",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function ManageMatchBookingPage({ params, searchParams }: PageProps) {
  await requireAdminSession();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const match = await prisma.matchCard.findUnique({
    where: { id },
    include: {
      bookingEvent: {
        include: {
          packages: { orderBy: { sortOrder: "asc" } },
          tables: { orderBy: [{ tableType: "asc" }, { tableCode: "asc" }] },
        },
      },
    },
  });

  if (!match) {
    notFound();
  }

  const matchTitle =
    match.displayMode === "GENERAL_EVENT"
      ? match.title ?? match.leagueName
      : `${match.homeTeamName ?? "Home"} vs ${match.awayTeamName ?? "Away"}`;

  return (
    <div className="space-y-6">
      <AdminNotice success={resolvedSearchParams?.success} error={resolvedSearchParams?.error} />

      <div className="flex items-center gap-4">
        <Link
          href="/admin/matches"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-sm font-black uppercase text-ludo-gold">Matches</p>
          <h1 className="mt-2 text-3xl font-black text-white">{matchTitle}</h1>
          <p className="mt-2 text-sm font-semibold text-white/50">
            Manage the booking page, tables & packages for this match. Team names, date, and
            category are edited from the{" "}
            <Link href="/admin/matches" className="text-ludo-gold hover:underline">
              Matches list
            </Link>
            .
          </p>
        </div>
      </div>

      <AdminCard title="Match Summary">
        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase text-white/40">Category</p>
            <p className="mt-1 font-bold text-white">
              {matchCategoryLabels[match.matchCategory] ?? match.matchCategory}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-white/40">Date</p>
            <p className="mt-1 font-bold text-white">
              {match.matchDateLabel} &middot; {match.matchTimeLabel}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-white/40">Venue</p>
            <p className="mt-1 font-bold text-white">{match.venueLocation ?? "-"}</p>
          </div>
        </div>
      </AdminCard>

      {isWhatsappOnlyTemplate(match.matchCategory) ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-sm text-zinc-400">
          <b className="text-white">Reguler Match</b> uses a WhatsApp CTA only — table & package
          management is not needed because this match never goes through the payment flow.
        </div>
      ) : !match.bookingEvent ? (
        <div className="rounded-2xl border border-ludo-red/30 bg-ludo-red/10 p-5 text-sm text-red-100">
          No booking event is linked yet. Save the match again from the{" "}
          <Link href="/admin/matches" className="underline">
            Matches list
          </Link>{" "}
          to provision one automatically.
        </div>
      ) : (
        <>
          <MatchBookingDetailsForm matchId={match.id} bookingEvent={match.bookingEvent} />
          <PackageManager
            bookingEventId={match.bookingEvent.id}
            packages={match.bookingEvent.packages}
          />
          <TableManager
            bookingEventId={match.bookingEvent.id}
            tables={match.bookingEvent.tables}
          />
        </>
      )}
    </div>
  );
}
