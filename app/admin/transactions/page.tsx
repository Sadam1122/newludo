import { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Transactions",
};

export const dynamic = "force-dynamic";

export default async function TransactionsListPage() {
  await requireAdminSession();

  const events = await prisma.bookingEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Transactions</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Select an event or match to view its detailed transactions and export reports.
        </p>
      </div>

      <section className="rounded-xl border border-white/10 bg-black shadow-xl overflow-hidden">
        <AdminTable>
          <thead>
            <tr className="bg-black/40 text-xs uppercase tracking-wider text-white/50">
              <th className="px-4 py-4 font-bold">Event / Match</th>
              <th className="px-4 py-4 font-bold">Category</th>
              <th className="px-4 py-4 font-bold">Status</th>
              <th className="px-4 py-4 text-center font-bold">Total Transactions</th>
              <th className="px-4 py-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No events found.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{event.title}</div>
                    <div className="text-xs text-zinc-500">
                      {event.eventDateLabel} • {event.eventTimeLabel}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white uppercase">
                      {event.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ActiveStatusBadge active={event.isActive} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-lg font-bold text-ludo-gold">
                      {event._count.reservations}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/transactions/${event.id}`}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-ludo-gold/30 bg-ludo-gold/10 px-4 text-xs font-black uppercase text-ludo-gold transition hover:bg-ludo-gold hover:text-black"
                    >
                      <Search className="h-4 w-4" />
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
