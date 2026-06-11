import type { ReactNode } from "react";

type AdminTableProps = {
  children: ReactNode;
};

export function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] divide-y divide-white/10 text-left text-sm md:min-w-full [&_td]:align-top [&_th]:whitespace-nowrap">
          {children}
        </table>
      </div>
    </div>
  );
}
