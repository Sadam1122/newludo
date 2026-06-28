import { ToggleLeft, ToggleRight } from "lucide-react";

import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminTable } from "@/components/admin/AdminTable";
import { BrandForm } from "@/components/admin/BrandForm";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteBrand, toggleBrandActive } from "@/server/actions/brandActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function BrandsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const brands = await prisma.brandSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const nextSortOrder =
    brands.length > 0 ? Math.max(...brands.map((b) => b.sortOrder)) + 1 : 0;

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Brand Partners</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Active brands rotate in the infinite marquee on the homepage.
        </p>
      </div>

      <AdminCard title="Add Brand Partner">
        <BrandForm nextSortOrder={nextSortOrder} />
      </AdminCard>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">All Brand Partners</h2>
          <p className="text-xs font-bold uppercase text-white/45">
            {brands.filter((brand) => brand.isActive).length} public /{" "}
            {brands.length} total
          </p>
        </div>

        <AdminTable>
          <thead className="bg-white/[0.055] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {brands.map((brand) => (
              <tr
                key={brand.id}
                className={cn(
                  "align-top transition",
                  brand.isActive ? "bg-transparent" : "bg-white/[0.025]",
                )}
              >
                <td className="px-4 py-4">
                  <p className="font-black text-white">{brand.brandName}</p>
                  <p className="mt-1 text-sm text-white/60">{brand.subtitle}</p>
                  <p className="mt-2 text-xs font-semibold uppercase text-white/35">
                    {brand.titleBeforeHighlight} {brand.titleHighlight} &middot;
                    Sort #{brand.sortOrder}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-ludo-gold">
                      Edit brand
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/10 bg-ludo-black p-4">
                      <BrandForm brand={brand} />
                    </div>
                  </details>
                </td>
                <td className="px-4 py-4">
                  {brand.brandLogo ? (
                    <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brand.brandLogo}
                        alt={`${brand.brandName} logo preview`}
                        className="max-h-full w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black px-2 text-center text-xs font-bold uppercase text-white/35">
                      {brand.brandName}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <ActiveStatusBadge
                    active={brand.isActive}
                    activeLabel="Public"
                    inactiveLabel="Hidden"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleBrandActive}>
                      <input type="hidden" name="id" value={brand.id} />
                      <button
                        type="submit"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition",
                          brand.isActive
                            ? "border-ludo-gold/35 bg-ludo-gold/10 text-ludo-gold hover:bg-ludo-gold hover:text-ludo-black"
                            : "border-ludo-green/35 bg-ludo-green/10 text-green-100 hover:bg-ludo-green hover:text-ludo-black",
                        )}
                      >
                        {brand.isActive ? (
                          <ToggleRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                        {brand.isActive ? "Hide" : "Publish"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      action={deleteBrand}
                      id={brand.id}
                      itemType="brand partner"
                      itemLabel={brand.brandName}
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
