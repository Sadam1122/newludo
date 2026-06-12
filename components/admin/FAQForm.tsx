import type { FAQItem } from "@prisma/client";
import { Save } from "lucide-react";

import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { createFAQ, updateFAQ } from "@/server/actions/faqActions";

type FAQFormProps = {
  faq?: FAQItem;
};

export function FAQForm({ faq }: FAQFormProps) {
  const isEditing = Boolean(faq);

  return (
    <form action={isEditing ? updateFAQ : createFAQ} className="space-y-4">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px]">
        <Field
          label="Question"
          name="question"
          defaultValue={faq?.question ?? ""}
        />
        <Field
          label="Sort Order"
          name="sortOrder"
          type="number"
          defaultValue={String(faq?.sortOrder ?? 0)}
        />
      </div>

      <label className="block">
        <FormFieldLabel>Answer</FormFieldLabel>
        <textarea
          name="answer"
          rows={4}
          defaultValue={faq?.answer ?? ""}
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <Checkbox
        label="Active"
        name="isActive"
        defaultChecked={faq?.isActive ?? true}
      />

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {isEditing ? "Save FAQ" : "Create FAQ"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
}) {
  return (
    <label className="block">
      <FormFieldLabel>{label}</FormFieldLabel>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
      />
    </label>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-white/20 bg-ludo-black accent-ludo-red"
      />
      {label}
    </label>
  );
}
