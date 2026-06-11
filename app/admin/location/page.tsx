import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { LocationForm } from "@/components/admin/LocationForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function LocationPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const location = await prisma.locationSetting.findFirst({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Location & Social
        </h1>
      </div>

      <AdminCard title="Edit Location">
        <LocationForm location={location} />
      </AdminCard>
    </div>
  );
}
