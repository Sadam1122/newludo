import type { MatchCard } from "@prisma/client";
import { Save } from "lucide-react";

import { createMatch, updateMatch } from "@/server/actions/matchActions";

const statuses = [
  "BOOK",
  "LIMITED",
  "FULL_BOOKED",
  "CURRENTLY_SHOWING",
] as const;

type MatchFormProps = {
  match?: MatchCard;
};

export function MatchForm({ match }: MatchFormProps) {
  const isEditing = Boolean(match);

  return (
    <form action={isEditing ? updateMatch : createMatch} className="space-y-4">
      {match ? <input type="hidden" name="id" value={match.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="League Name"
          name="leagueName"
          defaultValue={match?.leagueName}
        />
        <Field
          label="Home Team"
          name="homeTeamName"
          defaultValue={match?.homeTeamName}
        />
        <Field
          label="Away Team"
          name="awayTeamName"
          defaultValue={match?.awayTeamName}
        />
        <Field
          label="Date Label"
          name="matchDateLabel"
          defaultValue={match?.matchDateLabel}
        />
        <Field
          label="Time Label"
          name="matchTimeLabel"
          defaultValue={match?.matchTimeLabel}
        />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white/75">
            Status
          </span>
          <select
            name="status"
            defaultValue={match?.status ?? "BOOK"}
            className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Button Label"
          name="buttonLabel"
          defaultValue={match?.buttonLabel ?? "BOOK"}
        />
        <Field
          label="Sort Order"
          name="sortOrder"
          type="number"
          defaultValue={String(match?.sortOrder ?? 0)}
        />
        <Field
          label="Home Logo URL"
          name="homeTeamLogo"
          defaultValue={match?.homeTeamLogo ?? ""}
        />
        <FileField
          label="Upload Home Logo"
          name="homeTeamLogoFile"
          value={match?.homeTeamLogo}
        />
        <Field
          label="Away Logo URL"
          name="awayTeamLogo"
          defaultValue={match?.awayTeamLogo ?? ""}
        />
        <FileField
          label="Upload Away Logo"
          name="awayTeamLogoFile"
          value={match?.awayTeamLogo}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white/75">
          WhatsApp Message
        </span>
        <textarea
          name="whatsappMessage"
          rows={3}
          defaultValue={match?.whatsappMessage ?? ""}
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <Checkbox
          label="Active"
          name="isActive"
          defaultChecked={match?.isActive ?? true}
        />
        <Checkbox
          label="Show SOLD OUT stamp"
          name="showSoldOutStamp"
          defaultChecked={match?.showSoldOutStamp ?? false}
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {isEditing ? "Save Match" : "Create Match"}
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
      <span className="mb-2 block text-sm font-semibold text-white/75">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
      />
    </label>
  );
}

function FileField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/75">
        {label}
      </span>
      <input
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="min-h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-ludo-black"
      />
      {value ? (
        <span className="mt-1 block break-all text-xs text-white/45">
          {value}
        </span>
      ) : null}
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
