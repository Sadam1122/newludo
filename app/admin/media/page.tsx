import { FileIcon } from "lucide-react";

import { AdminNotice } from "@/components/admin/AdminNotice";
import { CopyButton } from "@/components/admin/CopyButton";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteMedia } from "@/server/actions/mediaActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function MediaPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const mediaFiles = await prisma.mediaFile.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Media Library</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Uploads here can be reused in Hero, Events, Location, Brand, and Match
          forms. Videos can be used in Gallery CMS.
        </p>
      </div>

      <MediaUploader />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mediaFiles.map((media) => (
          <article
            key={media.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-[0_20px_70px_rgba(0,0,0,0.22)] transition hover:border-ludo-gold/45"
          >
            <div className="flex aspect-video items-center justify-center bg-ludo-black">
              {media.mimeType.startsWith("video/") ? (
                <video
                  src={media.url}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                />
              ) : media.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.url}
                  alt={media.filename}
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <FileIcon
                  className="h-10 w-10 text-white/30"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="truncate text-sm font-black text-white">
                  {media.filename}
                </p>
                <p className="text-xs text-white/45">
                  {media.mimeType} &middot; {(media.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <p className="break-all rounded-xl bg-ludo-black px-3 py-2 text-xs text-white/60">
                {media.url}
              </p>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={media.url} />
                <DeleteConfirmButton
                  action={deleteMedia}
                  id={media.id}
                  itemType="media file"
                  itemLabel={media.filename}
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
