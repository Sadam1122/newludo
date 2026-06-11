import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ludo-black px-4 py-12">
      <section className="w-full max-w-md rounded border border-white/10 bg-ludo-charcoal p-6 shadow-panel">
        <div className="mb-8">
          <p className="text-xs font-black uppercase text-ludo-gold">
            LUDO Admin CMS
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">Sign in</h1>
          <p className="mt-2 text-sm text-white/55">
            Manage website content, media, matches, events, and settings.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
