"use client";

import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { adminNavItems } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
  userName?: string | null;
};

export function AdminHeader({ userName }: AdminHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const MenuIcon = open ? X : Menu;

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#111111]/95 backdrop-blur-xl">
      <header className="flex min-h-16 items-center justify-between px-4 xl:px-8">
        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:border-ludo-gold hover:text-ludo-gold xl:hidden"
            aria-label={
              open ? "Close admin navigation" : "Open admin navigation"
            }
            aria-expanded={open}
          >
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="text-sm font-black">Admin Dashboard</p>
            <p className="text-xs text-white/50">
              {userName ? `Signed in as ${userName}` : "Secure CMS session"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 text-sm font-bold text-white transition hover:border-ludo-red hover:bg-ludo-red/15 hover:text-red-100"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {open ? (
        <nav
          className="grid max-h-[70vh] gap-2 overflow-y-auto border-t border-white/10 bg-[#080808] p-4 xl:hidden"
          aria-label="Mobile admin navigation"
        >
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-black text-white/70 transition hover:border-ludo-gold/50 hover:text-white",
                  isActive &&
                    "border-ludo-red/45 bg-ludo-red/15 text-white shadow-[inset_3px_0_0_#EF1F28]",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 text-white/45",
                    isActive && "text-ludo-gold",
                  )}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
