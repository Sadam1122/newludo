"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminChromeProps = {
  children: ReactNode;
  userName?: string | null;
};

export function AdminChrome({ children, userName }: AdminChromeProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(239,31,40,0.10),transparent_28%),linear-gradient(180deg,#111111,#050505)] text-white">
      <div className="flex">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          <AdminHeader userName={userName} />
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 sm:py-8 xl:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
