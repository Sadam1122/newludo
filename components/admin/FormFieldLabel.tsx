import { Asterisk } from "lucide-react";

type FormFieldLabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

export function FormFieldLabel({
  children,
  required = true,
}: FormFieldLabelProps) {
  return (
    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/75">
      <span>{children}</span>
      {required ? (
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ludo-red/15 text-ludo-red"
          title="Wajib diisi"
          aria-label="Wajib diisi"
        >
          <Asterisk className="h-3 w-3" aria-hidden="true" />
        </span>
      ) : (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white/40">
          Opsional
        </span>
      )}
    </span>
  );
}
