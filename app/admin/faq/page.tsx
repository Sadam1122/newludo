import { ToggleLeft, ToggleRight } from "lucide-react";

import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminTable } from "@/components/admin/AdminTable";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { FAQForm } from "@/components/admin/FAQForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteFAQ, toggleFAQActive } from "@/server/actions/faqActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function FAQPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const faqs = await prisma.fAQItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">FAQ</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Only public FAQ items are rendered on the homepage.
        </p>
      </div>

      <AdminCard title="Create FAQ">
        <FAQForm />
      </AdminCard>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">All FAQ Items</h2>
          <p className="text-xs font-bold uppercase text-white/45">
            {faqs.filter((faq) => faq.isActive).length} public / {faqs.length}{" "}
            total
          </p>
        </div>

        <AdminTable>
          <thead className="bg-white/[0.055] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {faqs.map((faq) => (
              <tr
                key={faq.id}
                className={cn(
                  "align-top transition",
                  faq.isActive ? "bg-transparent" : "bg-white/[0.025]",
                )}
              >
                <td className="px-4 py-4">
                  <p className="font-black text-white">{faq.question}</p>
                  <p className="mt-1 line-clamp-2 text-white/55">
                    {faq.answer}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-ludo-gold">
                      Edit FAQ
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/10 bg-ludo-black p-4">
                      <FAQForm faq={faq} />
                    </div>
                  </details>
                </td>
                <td className="px-4 py-4 text-white/70">{faq.sortOrder}</td>
                <td className="px-4 py-4">
                  <ActiveStatusBadge
                    active={faq.isActive}
                    activeLabel="Public"
                    inactiveLabel="Hidden"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleFAQActive}>
                      <input type="hidden" name="id" value={faq.id} />
                      <button
                        type="submit"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition",
                          faq.isActive
                            ? "border-ludo-gold/35 bg-ludo-gold/10 text-ludo-gold hover:bg-ludo-gold hover:text-ludo-black"
                            : "border-ludo-green/35 bg-ludo-green/10 text-green-100 hover:bg-ludo-green hover:text-ludo-black",
                        )}
                      >
                        {faq.isActive ? (
                          <ToggleRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                        {faq.isActive ? "Hide" : "Publish"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      action={deleteFAQ}
                      id={faq.id}
                      itemType="FAQ"
                      itemLabel={faq.question}
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
