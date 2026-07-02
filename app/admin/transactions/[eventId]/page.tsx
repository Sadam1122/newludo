import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Download, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdminSession();
  const { eventId } = await params;

  const event = await prisma.bookingEvent.findUnique({
    where: { id: eventId },
    include: {
      reservations: {
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: {
            include: {
              eventPackage: true,
              eventTable: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/transactions"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <p className="text-sm font-black uppercase text-ludo-gold">Transactions</p>
          <h1 className="mt-2 text-3xl font-black text-white">{event.title}</h1>
          <p className="mt-2 text-sm font-semibold text-white/50">
            View all reservations for {event.eventDateLabel}.
          </p>
        </div>
        <a
          href={`/api/admin/export?eventId=${event.id}`}
          target="_blank"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ludo-green px-6 text-sm font-black uppercase text-black transition hover:scale-105 hover:bg-green-400"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </a>
      </div>

      <section className="rounded-xl border border-white/10 bg-black shadow-xl overflow-hidden">
        <AdminTable>
          <thead>
            <tr className="bg-black/40 text-xs uppercase tracking-wider text-white/50">
              <th className="px-4 py-4 font-bold">Order ID</th>
              <th className="px-4 py-4 font-bold">Customer</th>
              <th className="px-4 py-4 font-bold">Table / Package</th>
              <th className="px-4 py-4 font-bold">Total</th>
              <th className="px-4 py-4 font-bold">Status</th>
              <th className="px-4 py-4 font-bold">Date</th>
            </tr>
          </thead>
          <tbody>
            {event.reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              event.reservations.map((res) => {
                const item = res.orderItems[0]; // Currently assuming 1 item per reservation in UI flow
                
                let statusColor = "text-zinc-400 bg-zinc-400/10";
                if (res.status === "SUCCESS") statusColor = "text-ludo-green bg-ludo-green/10 border-ludo-green/20";
                if (res.status === "PENDING") statusColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                if (res.status === "FAILED" || res.status === "EXPIRED" || res.status === "CANCELLED") statusColor = "text-ludo-red bg-ludo-red/10 border-ludo-red/20";

                return (
                  <tr key={res.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-4 font-mono text-xs text-zinc-400">
                      {res.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-white">{res.customerName}</div>
                      <div className="text-xs text-zinc-500">{res.customerPhone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-white">
                        {item?.eventTable ? `Table ${item.eventTable.tableCode}` : "No Table"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item?.eventPackage?.name || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-ludo-gold">
                      Rp {res.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-1 text-xs font-bold", statusColor)}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-400">
                      {new Date(res.createdAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
