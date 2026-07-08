import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminTable } from "@/components/admin/AdminTable";
import { SyncPaymentButton } from "@/components/admin/SyncPaymentButton";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Download, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@prisma/client";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    status?: string;
    table?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: ReservationStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
];

export default async function TransactionDetailsPage({ params, searchParams }: Props) {
  await requireAdminSession();
  const { eventId } = await params;
  const filters = await searchParams;

  const event = await prisma.bookingEvent.findUnique({
    where: { id: eventId },
    include: {
      tables: { select: { id: true, tableCode: true } },
      reservations: {
        where: {
          ...(filters.status ? { status: filters.status as ReservationStatus } : {}),
          ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
          ...(filters.dateFrom || filters.dateTo
            ? {
                createdAt: {
                  ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
                  ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59`) } : {}),
                },
              }
            : {}),
          ...(filters.table
            ? { orderItems: { some: { eventTableId: filters.table } } }
            : {}),
        },
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

  const paymentMethods = await prisma.reservation.findMany({
    where: { bookingEventId: eventId, paymentMethod: { not: null } },
    select: { paymentMethod: true },
    distinct: ["paymentMethod"],
  });

  const buildFilterHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { ...filters, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const qs = next.toString();
    return `/admin/transactions/${eventId}${qs ? `?${qs}` : ""}`;
  };

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

      <section className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
        <form className="flex flex-wrap items-end gap-3" action={`/admin/transactions/${eventId}`}>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-white/50">Status</span>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="h-9 rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-white/50">Table</span>
            <select
              name="table"
              defaultValue={filters.table ?? ""}
              className="h-9 rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
            >
              <option value="">All</option>
              {event.tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tableCode}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-white/50">Payment Method</span>
            <select
              name="paymentMethod"
              defaultValue={filters.paymentMethod ?? ""}
              className="h-9 rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
            >
              <option value="">All</option>
              {paymentMethods.map((p) => (
                <option key={p.paymentMethod} value={p.paymentMethod ?? ""}>
                  {p.paymentMethod}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-white/50">From</span>
            <input
              type="date"
              name="dateFrom"
              defaultValue={filters.dateFrom ?? ""}
              className="h-9 rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-white/50">To</span>
            <input
              type="date"
              name="dateTo"
              defaultValue={filters.dateTo ?? ""}
              className="h-9 rounded border border-white/10 bg-ludo-black px-3 text-sm text-white outline-none focus:border-ludo-gold"
            />
          </label>
          <button
            type="submit"
            className="h-9 rounded bg-ludo-gold px-4 text-xs font-black uppercase text-black hover:bg-ludo-gold/90"
          >
            Apply
          </button>
          <Link
            href={`/admin/transactions/${eventId}`}
            className="h-9 rounded border border-white/15 px-4 text-xs font-black uppercase text-white/70 leading-9 hover:text-white"
          >
            Reset
          </Link>
        </form>
      </section>

      <section className="rounded-xl border border-white/10 bg-black shadow-xl overflow-hidden">
        <AdminTable>
          <thead>
            <tr className="bg-black/40 text-xs uppercase tracking-wider text-white/50">
              <th className="px-4 py-4 font-bold">Order ID</th>
              <th className="px-4 py-4 font-bold">Customer</th>
              <th className="px-4 py-4 font-bold">Table / Package</th>
              <th className="px-4 py-4 font-bold">Total</th>
              <th className="px-4 py-4 font-bold">Status</th>
              <th className="px-4 py-4 font-bold">Payment Detail</th>
              <th className="px-4 py-4 font-bold">Date</th>
              <th className="px-4 py-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {event.reservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                  No transactions match this filter.
                </td>
              </tr>
            ) : (
              event.reservations.map((res) => {
                const item = res.orderItems[0]; // Primary line item; additional a la carte lines are exported in the XLSX report.

                let statusColor = "text-zinc-400 bg-zinc-400/10";
                if (res.status === "SUCCESS") statusColor = "text-ludo-green bg-ludo-green/10 border-ludo-green/20";
                if (res.status === "PENDING") statusColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                if (res.status === "FAILED" || res.status === "EXPIRED" || res.status === "CANCELLED") statusColor = "text-ludo-red bg-ludo-red/10 border-ludo-red/20";

                return (
                  <tr key={res.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] align-top">
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
                      {res.orderItems.length > 1 ? (
                        <div className="text-[10px] text-zinc-600">+{res.orderItems.length - 1} more item(s)</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 font-bold text-ludo-gold">
                      Rp {res.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-1 text-xs font-bold", statusColor)}>
                        {res.status}
                      </span>
                      {res.expiredAt ? (
                        <p className="mt-1 text-[10px] text-zinc-500">
                          Expires: {new Date(res.expiredAt).toLocaleString("id-ID")}
                        </p>
                      ) : null}
                      {res.paidAt ? (
                        <p className="mt-1 text-[10px] text-ludo-green">
                          Paid: {new Date(res.paidAt).toLocaleString("id-ID")}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-400">
                      <div>{res.paymentMethod ?? "-"}</div>
                      {res.transactionId ? (
                        <div className="mt-1 font-mono text-[10px] text-zinc-600">{res.transactionId}</div>
                      ) : null}
                      {res.fraudStatus ? (
                        <div className="mt-1 text-[10px] uppercase text-zinc-500">
                          fraud: {res.fraudStatus}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-400">
                      {new Date(res.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-4">
                      {res.status === "PENDING" ? (
                        <SyncPaymentButton reservationId={res.id} bookingEventId={eventId} />
                      ) : null}
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
