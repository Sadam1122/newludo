import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { DeliveryOrderForm } from "@/components/admin/DeliveryOrderForm";
import { PackageManager } from "@/components/admin/PackageManager";
import { requireAdminSession } from "@/lib/auth";
import { getOrCreateDeliveryOrder } from "@/server/actions/deliveryOrderActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function DeliveryOrderAdminPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const deliveryOrder = await getOrCreateDeliveryOrder();

  return (
    <div className="space-y-6">
      <AdminNotice success={params?.success} error={params?.error} />
      <div>
        <p className="text-sm font-bold uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Delivery Order</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          This page is always available via the &quot;Delivery Order&quot; button in the site header. Manage its poster and packages here.
        </p>
      </div>

      <AdminCard title="Delivery Order Page">
        <DeliveryOrderForm deliveryOrder={deliveryOrder} />
      </AdminCard>

      <PackageManager
        bookingEventId={deliveryOrder.id}
        packages={deliveryOrder.packages}
        mode="delivery"
      />
    </div>
  );
}
