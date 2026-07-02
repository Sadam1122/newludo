"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  totalPages: number;
};

export function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2">
      <Link
        href={createPageURL(currentPage - 1)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded border border-white/10 bg-ludo-black text-white hover:bg-white/10 transition",
          currentPage <= 1 && "pointer-events-none opacity-50"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      
      <div className="flex items-center gap-1 mx-2">
        <span className="text-sm font-semibold text-white">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <Link
        href={createPageURL(currentPage + 1)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded border border-white/10 bg-ludo-black text-white hover:bg-white/10 transition",
          currentPage >= totalPages && "pointer-events-none opacity-50"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
