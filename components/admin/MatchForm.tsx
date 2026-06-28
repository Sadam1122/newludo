import type { MatchCard } from "@prisma/client";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { createMatch, updateMatch } from "@/server/actions/matchActions";

const statuses = [
  "BOOK",
  "LIMITED",
  "FULL_BOOKED",
  "CURRENTLY_SHOWING",
] as const;

const displayModes = [
  { value: "TEAM_MATCH", label: "Team Match" },
  { value: "GENERAL_EVENT", label: "General Event / Broadcast" },
] as const;

export function MatchForm({
  match,
  nextSortOrder,
}: {
  match?: MatchCard;
  nextSortOrder?: number;
}) {
  const isEditing = Boolean(match);

  return (
    <form
      action={isEditing ? updateMatch : createMatch}
      encType="multipart/form-data"
      className="space-y-4"
    >
      {match ? <input type="hidden" name="id" value={match.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <FormFieldLabel>Display Mode</FormFieldLabel>
          <select
            name="displayMode"
            defaultValue={match?.displayMode ?? "TEAM_MATCH"}
            className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
          >
            {displayModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="League Name"
          name="leagueName"
          defaultValue={match?.leagueName}
        />
        <Field
          label="General Event Title"
          name="title"
          defaultValue={match?.title ?? ""}
          placeholder="F1 British GP, UFC Fight Night, MotoGP Mandalika"
          required={false}
        />
        <Field
          label="Category / Type"
          name="categoryLabel"
          defaultValue={match?.categoryLabel ?? ""}
          placeholder="F1, MotoGP, UFC, Boxing, Concert"
          required={false}
        />
        <Field
          label="Home Team"
          name="homeTeamName"
          defaultValue={match?.homeTeamName}
          required={false}
        />
        <Field
          label="Away Team"
          name="awayTeamName"
          defaultValue={match?.awayTeamName}
          required={false}
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
        <Field
          label="Scheduled Date & Time"
          name="scheduledAt"
          type="datetime-local"
          defaultValue={toDateTimeLocal(match?.scheduledAt)}
          required={false}
        />
        <label className="block">
          <FormFieldLabel>Status</FormFieldLabel>
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
          defaultValue={String(match?.sortOrder ?? nextSortOrder ?? 0)}
        />
        <Field
          label="Home Logo URL"
          name="homeTeamLogo"
          defaultValue={match?.homeTeamLogo ?? ""}
          required={false}
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
          required={false}
        />
        <FileField
          label="Upload Away Logo"
          name="awayTeamLogoFile"
          value={match?.awayTeamLogo}
        />
        <Field
          label="General Event Image URL"
          name="eventImage"
          defaultValue={match?.eventImage ?? ""}
          required={false}
        />
        <FileField
          label="Upload General Event Image"
          name="eventImageFile"
          value={match?.eventImage}
        />
      </div>

      <label className="block">
        <FormFieldLabel required={false}>
          General Event Description
        </FormFieldLabel>
        <textarea
          name="description"
          rows={3}
          defaultValue={match?.description ?? ""}
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <label className="block">
        <FormFieldLabel required={false}>WhatsApp Message</FormFieldLabel>
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

      <ConfirmSubmitButton
        title={isEditing ? "Save schedule item?" : "Create schedule item?"}
        description={
          isEditing
            ? "This will update the match or broadcast item and refresh the public schedule if it is active."
            : "This will create a new schedule item. Team Match requires home and away teams; General Event can be saved without teams."
        }
        confirmLabel={isEditing ? "Save Item" : "Create Item"}
      >
        {isEditing ? "Save Match" : "Create Match"}
      </ConfirmSubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FormFieldLabel required={required}>{label}</FormFieldLabel>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
      />
    </label>
  );
}

function toDateTimeLocal(value?: Date | string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return offsetDate.toISOString().slice(0, 16);
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
      <FormFieldLabel required={false}>{label}</FormFieldLabel>
      <input
        name={name}
        type="file"
        accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/svg+xml"
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
