import { ToggleLeft, ToggleRight } from "lucide-react";

import { ActiveStatusBadge } from "@/components/admin/ActiveStatusBadge";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminTable } from "@/components/admin/AdminTable";
import { CopyButton } from "@/components/admin/CopyButton";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { GalleryForm } from "@/components/admin/GalleryForm";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  deleteGalleryItem,
  toggleGalleryItemActive,
} from "@/server/actions/galleryActions";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function GalleryPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const [galleryItems, uploadedVideos] = await Promise.all([
    prisma.galleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.mediaFile.findMany({
      where: { mimeType: { startsWith: "video/" } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div>
      <AdminNotice success={params?.success} error={params?.error} />
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-ludo-gold">CMS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Gallery Videos</h1>
        <p className="mt-2 text-sm font-semibold text-white/50">
          Active videos appear in OUR GALLERY on the public homepage.
        </p>
      </div>

      <AdminCard title="Create Gallery Video">
        <GalleryForm />
      </AdminCard>

      {uploadedVideos.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-white">
              Uploaded Video Files
            </h2>
            <p className="text-xs font-bold uppercase text-white/45">
              Copy URL into Gallery form
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {uploadedVideos.map((media) => (
              <article
                key={media.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-ludo-black"
              >
                <video
                  src={media.url}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full bg-black object-cover"
                />
                <div className="space-y-3 p-4">
                  <p className="truncate text-sm font-black text-white">
                    {media.filename}
                  </p>
                  <p className="break-all rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/60">
                    {media.url}
                  </p>
                  <CopyButton value={media.url} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">All Gallery Videos</h2>
          <p className="text-xs font-bold uppercase text-white/45">
            {galleryItems.filter((item) => item.isActive).length} public /{" "}
            {galleryItems.length} total
          </p>
        </div>

        <AdminTable>
          <thead className="bg-white/[0.055] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {galleryItems.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "align-top transition",
                  item.isActive ? "bg-transparent" : "bg-white/[0.025]",
                )}
              >
                <td className="px-4 py-4">
                  <p className="font-black text-white">{item.title}</p>
                  {item.caption ? (
                    <p className="mt-1 max-w-md text-sm text-white/60">
                      {item.caption}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-semibold uppercase text-white/35">
                    Sort #{item.sortOrder}
                  </p>
                  <p className="mt-2 break-all rounded-xl bg-ludo-black px-3 py-2 text-xs text-white/50">
                    {item.videoUrl}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-ludo-gold">
                      Edit gallery video
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/10 bg-ludo-black p-4">
                      <GalleryForm item={item} />
                    </div>
                  </details>
                </td>
                <td className="px-4 py-4">
                  <div className="w-32 overflow-hidden rounded-lg border border-white/10 bg-black">
                    <video
                      src={item.videoUrl}
                      muted
                      playsInline
                      preload="metadata"
                      poster={item.thumbnailUrl ?? undefined}
                      className="aspect-[9/16] w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <ActiveStatusBadge
                    active={item.isActive}
                    activeLabel="Public"
                    inactiveLabel="Hidden"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleGalleryItemActive}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition",
                          item.isActive
                            ? "border-ludo-gold/35 bg-ludo-gold/10 text-ludo-gold hover:bg-ludo-gold hover:text-ludo-black"
                            : "border-ludo-green/35 bg-ludo-green/10 text-green-100 hover:bg-ludo-green hover:text-ludo-black",
                        )}
                      >
                        {item.isActive ? (
                          <ToggleRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                        )}
                        {item.isActive ? "Hide" : "Publish"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      action={deleteGalleryItem}
                      id={item.id}
                      itemType="gallery video"
                      itemLabel={item.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
