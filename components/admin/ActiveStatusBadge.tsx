import { CheckCircle2, CircleOff } from "lucide-react";

type ActiveStatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function ActiveStatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: ActiveStatusBadgeProps) {
  const Icon = active ? CheckCircle2 : CircleOff;

  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full border border-ludo-green/35 bg-ludo-green/15 px-2.5 py-1 text-xs font-black uppercase text-green-100"
          : "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-xs font-black uppercase text-white/45"
      }
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
