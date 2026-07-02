"use client";

import { useState } from "react";
import Image from "next/image";
import { EventTable } from "@prisma/client";
import { cn } from "@/lib/utils";
import { X, ZoomIn } from "lucide-react";

type Props = {
  tables: EventTable[];
  selectedTable: EventTable | null;
  onSelectTable: (table: EventTable) => void;
  perSeat?: boolean;
};

export function SeatMap({ tables, selectedTable, onSelectTable, perSeat = false }: Props) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Group tables by category
  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.tableType]) {
      acc[table.tableType] = [];
    }
    acc[table.tableType].push(table);
    return acc;
  }, {} as Record<string, EventTable[]>);

  const categories = Object.keys(groupedTables);

  return (
    <div className="space-y-6">
      {/* 1. Layout Image Section */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] p-4">
          <h3 className="font-bold text-white">Denah Meja / Seat Layout</h3>
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
          >
            <ZoomIn className="h-4 w-4" />
            Perbesar Gambar
          </button>
        </div>
        <div 
          className="relative aspect-[16/9] w-full cursor-zoom-in overflow-hidden bg-black/50"
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src="/layout-seat-v2.png"
            alt="LUDO Seat Layout"
            fill
            className="object-contain transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>
      </div>

      {/* 2. Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-ludo-green"></div>
          <span className="text-xs font-bold text-white">Tersedia (Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
          <span className="text-xs font-bold text-white">Sedang Dipilih (Waiting Payment)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-ludo-red"></div>
          <span className="text-xs font-bold text-white">Penuh (Booked/Paid)</span>
        </div>
      </div>

      {/* 3. Table Buttons Grouped */}
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-black uppercase text-ludo-gold border-b border-white/10 pb-2">
              Kategori {category.replace(/_/g, " ")}
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              {groupedTables[category].map((table) => {
                const isSelected = selectedTable?.id === table.id;
                let bgColor = "bg-ludo-green";
                let textColor = "text-white";
                let cursor = "cursor-pointer hover:scale-105";

                if (table.status === "SELECTED") {
                  bgColor = "bg-yellow-400";
                  textColor = "text-black";
                  cursor = "cursor-not-allowed opacity-60";
                } else if (table.status === "BOOKED" || table.status === "PAID" || table.status === "LOCKED") {
                  bgColor = "bg-ludo-red";
                  textColor = "text-white";
                  cursor = "cursor-not-allowed opacity-60";
                }

                if (isSelected) {
                  bgColor = "bg-white";
                  textColor = "text-black";
                  cursor = "cursor-pointer scale-105 ring-4 ring-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]";
                }

                const isClickable = table.status === "AVAILABLE";

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={!isClickable && !isSelected}
                    onClick={() => {
                      if (isClickable) onSelectTable(table);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl p-3 shadow-lg transition-all",
                      bgColor,
                      textColor,
                      cursor
                    )}
                  >
                    <span className="text-sm font-black">{table.tableCode}</span>
                    <span className="mt-1 text-[10px] uppercase opacity-80">
                      {perSeat
                        ? `${table.capacity - table.bookedSeats}/${table.capacity} Seats Left`
                        : `${table.capacity} Pax`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-ludo-red md:right-8 md:top-8 md:h-14 md:w-14"
          >
            <X className="h-5 w-5 md:h-7 md:w-7" />
          </button>
          <div className="relative h-[95vh] w-[95vw]">
            <Image
              src="/layout-seat-v2.png"
              alt="LUDO Seat Layout Zoomed"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
