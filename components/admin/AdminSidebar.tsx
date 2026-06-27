"use client";

import {
  CalendarDays,
  Clapperboard,
  HelpCircle,
  Home,
  Image,
  LayoutDashboard,
  MapPin,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/matches", label: "Matches", icon: Trophy },
  { href: "/admin/hero", label: "Hero", icon: Home },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/event-mice", label: "Event / MICE", icon: Ticket },
  { href: "/admin/gallery", label: "Gallery", icon: Clapperboard },
  { href: "/admin/location", label: "Location", icon: MapPin },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/brands", label: "Brands", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/media", label: "Media", icon: Image },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-white/10 bg-[#070707] px-5 py-6 shadow-[12px_0_60px_rgba(0,0,0,0.26)] xl:block">
      <Link href="/admin" className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-ludo-red/40 bg-ludo-red/15 text-ludo-red shadow-[0_0_34px_rgba(239,31,40,0.16)]">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-black uppercase tracking-wide text-white">
            LUDO CMS
          </span>
          <span className="text-xs uppercase text-white/50">
            Sports Kitchen
          </span>
        </span>
      </Link>

      <nav className="space-y-1.5">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-bold text-white/65 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
                isActive &&
                  "border-ludo-red/35 bg-[linear-gradient(90deg,rgba(239,31,40,0.20),rgba(247,198,0,0.07))] text-white shadow-[inset_3px_0_0_#EF1F28]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 text-white/45 transition group-hover:text-ludo-gold",
                  isActive && "text-ludo-gold",
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
