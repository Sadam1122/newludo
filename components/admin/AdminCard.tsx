import type { ReactNode } from "react";

type AdminCardProps = {
  title: string;
  value?: string | number;
  children?: ReactNode;
};

export function AdminCard({ title, value, children }: AdminCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-panel">
      <p className="text-xs font-black uppercase tracking-wide text-white/50">
        {title}
      </p>
      {value !== undefined ? (
        <p className="mt-3 text-3xl font-black text-white">{value}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
