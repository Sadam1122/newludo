import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { uploadMedia } from "@/server/actions/mediaActions";

export function MediaUploader() {
  return (
    <form
      action={uploadMedia}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
    >
      <label className="mb-2 block text-sm font-semibold text-white/80">
        Upload Image
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          required
          className="min-h-11 min-w-0 flex-1 rounded border border-white/10 bg-white/10 px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-bold file:text-ludo-black"
        />
        <ConfirmSubmitButton
          title="Upload this image?"
          description="This image will be saved to the media library and can be reused in CMS forms. Make sure the selected file is JPG, PNG, WEBP, or SVG and under 5MB."
          confirmLabel="Upload Image"
          icon="upload"
        >
          Upload
        </ConfirmSubmitButton>
      </div>
      <p className="mt-3 text-xs text-white/45">
        JPG, PNG, WEBP, and SVG up to 5MB.
      </p>
    </form>
  );
}
