"use client";

import { useState, useTransition } from "react";
import { EventTable, TableStatus, TableType } from "@prisma/client";
import { AdminCard } from "./AdminCard";
import { InfoTooltip } from "./InfoTooltip";
import { cn } from "@/lib/utils";
import { setMinimumChargeByType } from "@/server/actions/eventTableActions";

type Props = {
  bookingEventId: string;
  tables: EventTable[];
};

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "SELECTED":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "BOOKED":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "PAID":
      return "bg-ludo-gold/10 text-ludo-gold border-ludo-gold/20";
    case "LOCKED":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  }
};

export function TableManager({ bookingEventId, tables }: Props) {
  if (tables.length === 0) {
    return (
      <AdminCard title="Table Management">
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
          No tables generated for this event yet. Use the &quot;Generate Tables&quot; button on the listing page.
        </div>
      </AdminCard>
    );
  }

  // Group tables by type
  const grouped = tables.reduce((acc, table) => {
    if (!acc[table.tableType]) {
      acc[table.tableType] = [];
    }
    acc[table.tableType].push(table);
    return acc;
  }, {} as Record<TableType, EventTable[]>);

  // Define order of display
  const displayOrder: TableType[] = [
    "VVIP",
    "VIP",
    "REGULAR_INDOOR",
    "BARSTOOL",
    "REGULAR_SEMI_OUTDOOR_2P",
    "REGULAR_SEMI_OUTDOOR",
    "DELIVERY",
  ];

  return (
    <AdminCard title={`Table Management (${tables.length} Total)`}>
      <div className="space-y-8">
        {displayOrder.map((type) => {
          const typeTables = grouped[type];
          if (!typeTables || typeTables.length === 0) return null;

          return (
            <div key={type}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase text-white">
                  {type.replace(/_/g, " ")}
                </h3>
                <MinimumChargeControl
                  bookingEventId={bookingEventId}
                  tableType={type}
                  currentValue={typeTables[0]?.basePrice ?? 0}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {typeTables
                  .sort((a, b) => a.tableCode.localeCompare(b.tableCode, undefined, { numeric: true }))
                  .map((table) => (
                    <div
                      key={table.id}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-colors",
                        getStatusColor(table.status)
                      )}
                    >
                      <span className="text-xs font-bold">{table.tableCode}</span>
                      <span className="text-[10px] opacity-70">{table.capacity} Pax</span>
                      {table.basePrice > 0 && (
                        <span className="mt-1 text-[9px] font-bold opacity-80">
                          Min. IDR {table.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

function MinimumChargeControl({
  bookingEventId,
  tableType,
  currentValue,
}: {
  bookingEventId: string;
  tableType: TableType;
  currentValue: number;
}) {
  const [value, setValue] = useState(String(currentValue));
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    const amount = Number(value);
    startTransition(async () => {
      const result = await setMinimumChargeByType(bookingEventId, tableType, amount);
      if (result?.error) alert(result.error);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center text-xs font-bold text-zinc-400">
        Minimum Charge
        <InfoTooltip info="Customer must spend at least this amount (package + a la carte) to book this table type. Applies to all tables of this type in this event." />
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-28 rounded border border-white/10 bg-ludo-black px-2 text-xs text-white outline-none focus:border-ludo-gold"
      />
      <button
        type="button"
        onClick={handleApply}
        disabled={isPending}
        className="h-8 rounded bg-ludo-gold px-3 text-xs font-bold text-black hover:bg-ludo-gold/90 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Apply"}
      </button>
    </div>
  );
}
