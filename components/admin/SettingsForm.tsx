import type { SiteSetting } from "@prisma/client";
import { Save } from "lucide-react";

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

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white/75">
          Default WhatsApp Message
        </span>
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
        <span className="mb-2 block text-sm font-semibold text-white/75">
          Footer Copyright
        </span>
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

      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        Save Settings
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/75">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-11 w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 text-white outline-none focus:border-ludo-gold"
      />
    </label>
  );
}
