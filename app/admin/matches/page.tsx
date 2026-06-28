import { ToggleLeft, ToggleRight } from "lucide-react";

import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminTable } from "@/components/admin/AdminTable";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { MatchForm } from "@/components/admin/MatchForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteMatch, toggleMatchActive } from "@/server/actions/matchActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function MatchesPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const matches = await prisma.matchCard.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const nextSortOrder =
    matches.length > 0 ? Math.max(...matches.map((m) => m.sortOrder)) + 1 : 0;

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Upcoming Matches</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Active matches are displayed in the UPCOMING MATCHES section.
        </p>
      </div>

      <AdminCard title="Create Match">
        <MatchForm nextSortOrder={nextSortOrder} />
      </AdminCard>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">All Matches</h2>
          <p className="text-xs font-bold uppercase text-white/45">
            {matches.filter((match) => match.isActive).length} public /{" "}
            {matches.length} total
          </p>
        </div>

        <AdminTable>
          <thead className="bg-white/[0.055] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {matches.map((match) => (
              <tr
                key={match.id}
                className={cn(
                  "align-top transition",
                  match.isActive ? "bg-transparent" : "bg-white/[0.025]",
                )}
              >
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1 h-3 w-3 shrink-0 rounded-full",
                        match.isActive
                          ? "bg-ludo-green shadow-[0_0_16px_rgba(37,211,102,0.45)]"
                          : "bg-white/25",
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-black text-white">
                        {match.displayMode === "GENERAL_EVENT"
                          ? (match.title ?? match.leagueName)
                          : match.leagueName}
                      </p>
                      <p className="text-white/60">
                        {match.displayMode === "GENERAL_EVENT"
                          ? (match.categoryLabel ?? "General broadcast")
                          : `${match.homeTeamName ?? "Home"} vs ${
                              match.awayTeamName ?? "Away"
                            }`}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase text-white/35">
                        {match.displayMode.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-ludo-gold">
                      Edit match
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/10 bg-ludo-black p-4">
                      <MatchForm match={match} />
                    </div>
                  </details>
                </td>
                <td className="px-4 py-4 text-white/70">
                  {match.matchDateLabel} &middot; {match.matchTimeLabel}
                  {match.scheduledAt ? (
                    <p className="mt-1 text-xs text-white/40">
                      {match.scheduledAt.toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-black",
                      getMatchStatusClass(match.status),
                    )}
                  >
                    {match.status}
                  </span>
                  {match.showSoldOutStamp ? (
                    <span className="ml-2 rounded-full bg-ludo-red px-2.5 py-1 text-xs font-black text-white">
                      SOLD OUT
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <ActiveStatusBadge
                    active={match.isActive}
                    activeLabel="Public"
                    inactiveLabel="Hidden"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleMatchActive}>
                      <input type="hidden" name="id" value={match.id} />
                      <button
                        type="submit"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition",
                          match.isActive
                            ? "border-ludo-gold/35 bg-ludo-gold/10 text-ludo-gold hover:bg-ludo-gold hover:text-ludo-black"
                            : "border-ludo-green/35 bg-ludo-green/10 text-green-100 hover:bg-ludo-green hover:text-ludo-black",
                        )}
                      >
                        {match.isActive ? (
                          <ToggleRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                        {match.isActive ? "Hide" : "Publish"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      action={deleteMatch}
                      id={match.id}
                      itemType="schedule item"
                      itemLabel={
                        match.displayMode === "GENERAL_EVENT"
                          ? (match.title ?? match.leagueName)
                          : `${match.leagueName}: ${
                              match.homeTeamName ?? "Home"
                            } vs ${match.awayTeamName ?? "Away"}`
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}

function getMatchStatusClass(status: string) {
  switch (status) {
    case "BOOK":
      return "border-ludo-green/35 bg-ludo-green/15 text-green-100";
    case "LIMITED":
      return "border-ludo-gold/40 bg-ludo-gold/15 text-ludo-gold";
    case "FULL_BOOKED":
      return "border-ludo-red/45 bg-ludo-red/15 text-red-100";
    case "CURRENTLY_SHOWING":
      return "border-sky-300/35 bg-sky-400/10 text-sky-100";
    default:
      return "border-white/15 bg-white/10 text-white";
  }
}
