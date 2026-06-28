import { ToggleLeft, ToggleRight } from "lucide-react";

import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminTable } from "@/components/admin/AdminTable";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { HeroForm } from "@/components/admin/HeroForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteHero, toggleHeroActive } from "@/server/actions/heroActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function HeroPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const heroes = await prisma.heroSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const nextSortOrder =
    heroes.length > 0 ? Math.max(...heroes.map((h) => h.sortOrder)) + 1 : 0;

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Hero Slides</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Active slides rotate in the public BIG MATCH carousel.
        </p>
      </div>

      <AdminCard title="Create Hero Slide">
        <HeroForm nextSortOrder={nextSortOrder} />
      </AdminCard>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">All Hero Slides</h2>
          <p className="text-xs font-bold uppercase text-white/45">
            {heroes.filter((hero) => hero.isActive).length} public /{" "}
            {heroes.length} total
          </p>
        </div>

        <AdminTable>
          <thead className="bg-white/[0.055] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3">Slide</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {heroes.map((hero) => (
              <tr
                key={hero.id}
                className={cn(
                  "align-top transition",
                  hero.isActive ? "bg-transparent" : "bg-white/[0.025]",
                )}
              >
                <td className="px-4 py-4">
                  <p className="font-black uppercase text-white">
                    {hero.headlineLine1}{" "}
                    <span className="text-ludo-red">
                      {hero.headlineHighlight1}
                    </span>{" "}
                    {hero.headlineLine2}{" "}
                    <span className="text-ludo-gold">
                      {hero.headlineHighlight2}
                    </span>
                  </p>
                  <p className="mt-1 max-w-md text-sm text-white/60">
                    {hero.subtitle}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase text-white/35">
                    CTA: {hero.ctaLabel} &middot; Sort #{hero.sortOrder}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-ludo-gold">
                      Edit slide
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/10 bg-ludo-black p-4">
                      <HeroForm hero={hero} />
                    </div>
                  </details>
                </td>
                <td className="px-4 py-4">
                  {hero.backgroundImage ? (
                    <div className="w-24 overflow-hidden rounded-lg border border-white/10 bg-black md:w-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hero.backgroundImage}
                        alt={`${hero.headlineLine1} hero preview`}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/5] w-24 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black text-center text-xs font-bold uppercase text-white/35 md:w-28">
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <ActiveStatusBadge
                    active={hero.isActive}
                    activeLabel="Public"
                    inactiveLabel="Hidden"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleHeroActive}>
                      <input type="hidden" name="id" value={hero.id} />
                      <button
                        type="submit"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition",
                          hero.isActive
                            ? "border-ludo-gold/35 bg-ludo-gold/10 text-ludo-gold hover:bg-ludo-gold hover:text-ludo-black"
                            : "border-ludo-green/35 bg-ludo-green/10 text-green-100 hover:bg-ludo-green hover:text-ludo-black",
                        )}
                      >
                        {hero.isActive ? (
                          <ToggleRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                        {hero.isActive ? "Hide" : "Publish"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      action={deleteHero}
                      id={hero.id}
                      itemType="hero slide"
                      itemLabel={`${hero.headlineLine1} ${hero.headlineHighlight1} ${hero.headlineLine2} ${hero.headlineHighlight2}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
