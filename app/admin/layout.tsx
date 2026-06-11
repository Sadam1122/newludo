import type { ReactNode } from "react";

import { AdminChrome } from "@/components/admin/AdminChrome";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  return (
    <AdminChrome userName={session?.user?.name ?? session?.user?.email}>
      {children}
    </AdminChrome>
  );
}
