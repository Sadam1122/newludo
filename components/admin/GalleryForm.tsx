import type { GalleryItem } from "@prisma/client";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FormFieldLabel } from "@/components/admin/FormFieldLabel";
import {
  createGalleryItem,
  updateGalleryItem,
} from "@/server/actions/galleryActions";

export function GalleryForm({
  item,
  nextSortOrder,
}: {
  item?: GalleryItem | null;
  nextSortOrder?: number;
}) {
  const isEditing = Boolean(item);

  return (
    <form
      action={isEditing ? updateGalleryItem : createGalleryItem}
      encType="multipart/form-data"
      className="space-y-4"
    >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      {item?.videoUrl ? (
        <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-white/10 bg-ludo-black">
          <video
            src={`${item.videoUrl}#t=0.001`}
            controls
            muted
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full bg-black object-cover"
            poster={item.thumbnailUrl ?? undefined}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Title" name="title" defaultValue={item?.title ?? ""} />
        <Field
          label="Sort Order"
          name="sortOrder"
          type="number"
          defaultValue={String(item?.sortOrder ?? nextSortOrder ?? 0)}
        />
        <Field
          label="Video URL"
          name="videoUrl"
          defaultValue={item?.videoUrl ?? ""}
          required={false}
          placeholder="/uploads/video.mp4"
        />
        <FileField label="Upload Video" name="videoFile" kind="video" />
        <Field
          label="Thumbnail URL"
          name="thumbnailUrl"
          defaultValue={item?.thumbnailUrl ?? ""}
          required={false}
          placeholder="/uploads/thumbnail.webp"
        />
        <FileField
          label="Upload Thumbnail"
          name="thumbnailFile"
          kind="image"
          value={item?.thumbnailUrl}
        />
      </div>

      <label className="block">
        <FormFieldLabel required={false}>Caption</FormFieldLabel>
        <textarea
          name="caption"
          rows={3}
          defaultValue={item?.caption ?? ""}
          className="w-full min-w-0 rounded border border-white/10 bg-ludo-black px-3 py-2 text-white outline-none focus:border-ludo-gold"
        />
      </label>

      <Checkbox
        label="Active"
        name="isActive"
        defaultChecked={item?.isActive ?? true}
      />

      <ConfirmSubmitButton
        title={isEditing ? "Save gallery video?" : "Create gallery video?"}
        description={
          isEditing
            ? "This will update the selected gallery video and refresh OUR GALLERY on the public homepage."
            : "This will add a new video to OUR GALLERY. Upload a video file or paste a video URL from Media Library."
        }
        confirmLabel={isEditing ? "Save Video" : "Create Video"}
        icon="upload"
      >
        {isEditing ? "Save Video" : "Create Video"}
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

function FileField({
  label,
  name,
  value,
  kind,
}: {
  label: string;
  name: string;
  value?: string | null;
  kind: "image" | "video";
}) {
  return (
    <label className="block">
      <FormFieldLabel required={false}>{label}</FormFieldLabel>
      <input
        name={name}
        type="file"
        accept={
          kind === "video"
            ? "video/mp4,video/webm,video/quicktime"
            : "image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/svg+xml"
        }
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
