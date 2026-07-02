import type { Member } from "@prisma/client";
import { Save } from "lucide-react";

import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { InfoTooltip } from "@/components/admin/InfoTooltip";
import { createMember, updateMember } from "@/server/actions/memberActions";

type MemberFormProps = {
  member?: Member;
};

export function MemberForm({ member }: MemberFormProps) {
  const isEditing = Boolean(member);

  return (
    <form
      action={isEditing ? updateMember : createMember}
      className="space-y-4"
    >
      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Field
          label="Username"
          name="username"
          defaultValue={member?.username ?? ""}
        />
        <label className="block">
          <FormFieldLabel required={!isEditing}>
            Password
            {isEditing ? (
              <InfoTooltip info="Leave blank to keep the current password unchanged." />
            ) : null}
          </FormFieldLabel>
          <input
            name="password"
            type="password"
            placeholder={isEditing ? "Leave blank to keep unchanged" : ""}
            className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
          />
        </label>
        <Field
          label="Discount (%)"
          name="discountPercent"
          type="number"
          defaultValue={String(member?.discountPercent ?? 0)}
        />
      </div>

      <label className="block">
        <FormFieldLabel required={false}>
          Benefit Note
          <InfoTooltip info="Shown to customers as the member benefit description at checkout." />
        </FormFieldLabel>
        <textarea
          name="benefitNote"
          rows={2}
          defaultValue={member?.benefitNote ?? ""}
          placeholder="e.g. Member LUDO dapat potongan harga khusus di setiap pemesanan."
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <Checkbox
        label="Active"
        name="isActive"
        defaultChecked={member?.isActive ?? true}
      />

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {isEditing ? "Save Member" : "Create Member"}
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
