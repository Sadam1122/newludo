import { Upload } from "lucide-react";

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
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 sm:w-auto"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload
        </button>
      </div>
      <p className="mt-3 text-xs text-white/45">
        JPG, PNG, WEBP, and SVG up to 5MB.
      </p>
    </form>
  );
}
