import {
  CalendarDays,
  Clapperboard,
  HelpCircle,
  Home,
  Image,
  MapPin,
  Settings,
  Shield,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

const quickActions = [
  { href: "/admin/matches", label: "Manage Matches", icon: Trophy },
  { href: "/admin/hero", label: "Edit Hero", icon: Home },
  { href: "/admin/events", label: "Manage Events", icon: CalendarDays },
  { href: "/admin/gallery", label: "Manage Gallery", icon: Clapperboard },
  { href: "/admin/location", label: "Edit Location", icon: MapPin },
  { href: "/admin/faq", label: "Manage FAQ", icon: HelpCircle },
  { href: "/admin/brands", label: "Manage Brands", icon: Shield },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/media", label: "Media Library", icon: Image },
];

export const dynamic = "force-dynamic";

export default async function AdminDashboard({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;

  const [
    totalMatches,
    activeMatches,
    activeEvents,
    totalFAQ,
    mediaFiles,
    activeGalleryItems,
    latestRows,
  ] = await Promise.all([
    prisma.matchCard.count(),
    prisma.matchCard.count({ where: { isActive: true } }),
    prisma.eventBanner.count({ where: { isActive: true } }),
    prisma.fAQItem.count(),
    prisma.mediaFile.count(),
    prisma.galleryItem.count({ where: { isActive: true } }),
    Promise.all([
      prisma.matchCard.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.heroSection.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.eventBanner.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.locationSetting.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.fAQItem.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.brandSection.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.galleryItem.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.siteSetting.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.mediaFile.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]),
  ]);

  const lastUpdated =
    latestRows
      .map((row) => row?.updatedAt)
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />

      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-ludo-gold">
          Content Overview
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          LUDO Website CMS
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminCard title="Total Matches" value={totalMatches} />
        <AdminCard title="Active Matches" value={activeMatches} />
        <AdminCard title="Active Events" value={activeEvents} />
        <AdminCard title="Total FAQ" value={totalFAQ} />
        <AdminCard title="Active Gallery" value={activeGalleryItems} />
        <AdminCard title="Media Files" value={mediaFiles} />
        <AdminCard
          title="Last Updated"
          value={lastUpdated ? lastUpdated.toLocaleString("id-ID") : "-"}
        />
      </div>

      <section className="mt-8 rounded border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-lg font-black text-white">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex min-h-16 items-center gap-3 rounded border border-white/10 bg-ludo-black px-4 text-sm font-bold text-white transition hover:border-ludo-gold hover:text-ludo-gold"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
