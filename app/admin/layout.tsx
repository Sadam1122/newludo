import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminChrome } from "@/components/admin/AdminChrome";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin CMS",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <AdminChrome userName={session?.user?.name ?? session?.user?.email}>
      {children}
    </AdminChrome>
  );
}
