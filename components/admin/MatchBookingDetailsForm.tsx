import type { BookingEvent } from "@prisma/client";

import { AdminCard } from "@/components/admin/AdminCard";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { InfoTooltip } from "@/components/admin/InfoTooltip";
import { updateMatchBookingDetails } from "@/server/actions/matchActions";

type Props = {
  matchId: string;
  bookingEvent: BookingEvent;
};

export function MatchBookingDetailsForm({ matchId, bookingEvent }: Props) {
  return (
    <AdminCard title="Booking Page Details">
      <form action={updateMatchBookingDetails} className="space-y-4">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="bookingEventId" value={bookingEvent.id} />

        <label className="block">
          <FormFieldLabel required={false}>
            Gate Open Info
            <InfoTooltip info="Shown as 'Gate Open' on the booking payment page's Event Information card." />
          </FormFieldLabel>
          <input
            type="text"
            name="openGateInfo"
            defaultValue={bookingEvent.openGateInfo ?? "Open Gate at 21:00 WIB"}
            className="h-11 w-full rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
          />
        </label>

        <label className="block">
          <FormFieldLabel required={false}>
            Table Details
            <InfoTooltip info="Shown as 'Table Details' on the booking payment page's Event Information card." />
          </FormFieldLabel>
          <textarea
            name="tableInfo"
            defaultValue={bookingEvent.tableInfo ?? ""}
            placeholder={"TABLE\nVIP Table\nSpecial Package\nBest Spot Nobar (Limited)\n\nRegular Table\nSpecial Package..."}
            className="min-h-[150px] w-full rounded border border-white/10 bg-ludo-black p-3 text-white outline-none focus:border-ludo-gold"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <input
            type="checkbox"
            name="allowAlaCarte"
            defaultChecked={bookingEvent.allowAlaCarte}
            value="true"
            className="mt-0.5 size-5 accent-ludo-gold"
          />
          <span>
            <span className="flex items-center text-sm font-bold text-white">
              Enable À La Carte Menu
              <InfoTooltip info="Allows customers to add food & beverage items from the Delivery Order menu on top of their table package, in the same order." />
            </span>
            <span className="mt-1 block text-xs text-zinc-400">
              Reuses the same menu items managed in the Delivery Order CMS.
            </span>
          </span>
        </label>

        <div className="border-t border-white/10 pt-4">
          <ConfirmSubmitButton
            title="Save booking page details?"
            description="This updates the Event Information card and a la carte setting shown on this match's public booking page."
            confirmLabel="Save"
            icon="save"
          >
            Save Changes
          </ConfirmSubmitButton>
        </div>
      </form>
    </AdminCard>
  );
}
