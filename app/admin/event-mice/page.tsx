import { prisma } from "@/lib/prisma";
import { EventMiceSettingsForm } from "./EventMiceSettingsForm";

export default async function EventMiceAdminPage() {
  const settings = await prisma.eventMiceSetting.findFirst();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase text-white">
          Event / MICE Settings
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Atur teks dan konten untuk halaman Event / MICE.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-6 shadow-xl">
        <EventMiceSettingsForm initialData={settings} />
      </div>
    </div>
  );
}
