import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { HeroForm } from "@/components/admin/HeroForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function HeroPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const hero = await prisma.heroSection.findFirst({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Hero Section</h1>
      </div>

      <AdminCard title="Edit Hero">
        <HeroForm hero={hero} />
      </AdminCard>
    </div>
  );
}
