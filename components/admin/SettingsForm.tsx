import type { SiteSetting } from "@prisma/client";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import { updateSiteSettings } from "@/server/actions/settingActions";

type SettingsFormProps = {
  settings?: SiteSetting | null;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  return (
    <form action={updateSiteSettings} className="space-y-4">
      {settings ? <input type="hidden" name="id" value={settings.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Site Name"
          name="siteName"
          defaultValue={settings?.siteName ?? "LUDO Sports Kitchen & Coffee"}
        />
        <Field
          label="Site Tagline"
          name="siteTagline"
          defaultValue={settings?.siteTagline ?? "EAT · WATCH · CONNECT"}
        />
        <Field
          label="WhatsApp Number"
          name="whatsappNumber"
          defaultValue={settings?.whatsappNumber ?? "6282318560003"}
        />
        <Field
          label="Match Section Title"
          name="matchSectionTitle"
          defaultValue={settings?.matchSectionTitle ?? "THIS WEEK MATCH"}
        />
        <Field
          label="Header Booking Button Text"
          name="headerBookingLabel"
          defaultValue={settings?.headerBookingLabel ?? "WhatsApp"}
        />
        <Field
          label="Header Booking URL"
          name="headerBookingUrl"
          defaultValue={settings?.headerBookingUrl ?? ""}
          placeholder="Leave empty to use WhatsApp booking"
          required={false}
        />
        <Field
          label="Event / MICE Button Text"
          name="eventMiceLabel"
          defaultValue={settings?.eventMiceLabel ?? "Event / MICE"}
        />
        <Field
          label="Event / MICE URL"
          name="eventMiceUrl"
          defaultValue={settings?.eventMiceUrl ?? "/event-mice"}
          required={false}
        />
        <Field
          label="Instagram Handle"
          name="instagramHandle"
          defaultValue={settings?.instagramHandle ?? "@ludosportskitchen"}
        />
        <Field
          label="Instagram URL"
          name="instagramUrl"
          defaultValue={
            settings?.instagramUrl ??
            "https://www.instagram.com/ludosportskitchen/"
          }
        />
        <Field
          label="TikTok Handle"
          name="tiktokHandle"
          defaultValue={settings?.tiktokHandle ?? "@ludosportskitchen"}
        />
        <Field
          label="TikTok URL"
          name="tiktokUrl"
          defaultValue={
            settings?.tiktokUrl ?? "https://www.tiktok.com/@ludosportskitchen"
          }
        />
        <Field
          label="Menu URL"
          name="menuUrl"
          defaultValue={
            settings?.menuUrl ??
            "https://drive.google.com/drive/folders/1qvRivb-6awFzYvzaCEP9H0NbM3EIcU9r"
          }
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <Checkbox
          label="Show header booking button"
          name="headerBookingVisible"
          defaultChecked={settings?.headerBookingVisible ?? true}
        />
        <Checkbox
          label="Show Event / MICE button"
          name="eventMiceVisible"
          defaultChecked={settings?.eventMiceVisible ?? true}
        />
      </div>

      <label className="block">
        <FormFieldLabel>Default WhatsApp Message</FormFieldLabel>
        <textarea
          name="defaultWhatsappMessage"
          rows={3}
          defaultValue={
            settings?.defaultWhatsappMessage ??
            "Halo LUDO, saya ingin reservasi meja."
          }
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <label className="block">
        <FormFieldLabel>Footer Copyright</FormFieldLabel>
        <textarea
          name="footerCopyright"
          rows={2}
          defaultValue={
            settings?.footerCopyright ??
            "© 2026 LUDO SPORTS KITCHEN & COFFEE. ALL RIGHTS RESERVED."
          }
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <ConfirmSubmitButton
        title="Save site settings?"
        description="This will update public homepage labels, header buttons, social links, and SEO-related site settings."
        confirmLabel="Save Settings"
      >
        Save Settings
      </ConfirmSubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FormFieldLabel required={required}>{label}</FormFieldLabel>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
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
