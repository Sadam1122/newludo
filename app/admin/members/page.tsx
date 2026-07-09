import { Download, ToggleLeft, ToggleRight } from "lucide-react";

import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminTable } from "@/components/admin/AdminTable";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { MemberForm } from "@/components/admin/MemberForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { deleteMember, toggleMemberActive } from "@/server/actions/memberActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
          <h1 className="mt-2 text-3xl font-black text-white">Members</h1>
          <p className="mt-2 text-sm font-semibold text-white/50">
            Manually issue member credentials and their personal discount. Customers enter these at checkout to unlock the discount.
          </p>
        </div>
        <a
          href="/api/admin/export/members"
          target="_blank"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ludo-green px-6 text-sm font-black uppercase text-black transition hover:scale-105 hover:bg-green-400"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </a>
      </div>

      <AdminCard title="Create Member">
        <MemberForm />
      </AdminCard>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">All Members</h2>
          <p className="text-xs font-bold uppercase text-white/45">
            {members.filter((m) => m.isActive).length} active / {members.length} total
          </p>
        </div>

        <AdminTable>
          <thead className="bg-white/[0.055] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {members.map((member) => (
              <tr
                key={member.id}
                className={cn(
                  "align-top transition",
                  member.isActive ? "bg-transparent" : "bg-white/[0.025]",
                )}
              >
                <td className="px-4 py-4">
                  <p className="font-black text-white">{member.username}</p>
                  {member.benefitNote ? (
                    <p className="mt-1 line-clamp-2 text-white/55">{member.benefitNote}</p>
                  ) : null}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-ludo-gold">
                      Edit Member
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/10 bg-ludo-black p-4">
                      <MemberForm member={member} />
                    </div>
                  </details>
                </td>
                <td className="px-4 py-4 text-white/70">{member.category || "-"}</td>
                <td className="px-4 py-4 text-white/70">{member.discountPercent}%</td>
                <td className="px-4 py-4">
                  <ActiveStatusBadge
                    active={member.isActive}
                    activeLabel="Active"
                    inactiveLabel="Disabled"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleMemberActive}>
                      <input type="hidden" name="id" value={member.id} />
                      <button
                        type="submit"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition",
                          member.isActive
                            ? "border-ludo-gold/35 bg-ludo-gold/10 text-ludo-gold hover:bg-ludo-gold hover:text-ludo-black"
                            : "border-ludo-green/35 bg-ludo-green/10 text-green-100 hover:bg-ludo-green hover:text-ludo-black",
                        )}
                      >
                        {member.isActive ? (
                          <ToggleRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                        {member.isActive ? "Disable" : "Enable"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      action={deleteMember}
                      id={member.id}
                      itemType="member"
                      itemLabel={member.username}
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
