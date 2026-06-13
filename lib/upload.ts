import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/pjpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

const ALLOWED_VIDEO_MIME_TYPES = new Map([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
]);

export function isAllowedImage(file: File) {
  return (
    ALLOWED_IMAGE_MIME_TYPES.has(file.type.toLowerCase()) &&
    file.size <= MAX_IMAGE_FILE_SIZE
  );
}

export function isAllowedVideo(file: File) {
  return (
    ALLOWED_VIDEO_MIME_TYPES.has(file.type.toLowerCase()) &&
    file.size <= MAX_VIDEO_FILE_SIZE
  );
}

export async function saveUploadedImage(file: File) {
  return saveUploadedFile(file, "image");
}

export async function saveUploadedImageAs(file: File, filename: string) {
  return saveUploadedFile(file, "image", filename);
}

export async function saveUploadedVideo(file: File) {
  return saveUploadedFile(file, "video");
}

export async function saveUploadedMedia(file: File) {
  const mimeType = file.type.toLowerCase();
  if (ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    return saveUploadedFile(file, "image");
  }

  if (ALLOWED_VIDEO_MIME_TYPES.has(mimeType)) {
    return saveUploadedFile(file, "video");
  }

  throw new Error(
    "Only JPG, PNG, WEBP, SVG, MP4, WEBM, and MOV files are allowed.",
  );
}

async function saveUploadedFile(
  file: File,
  kind: "image" | "video",
  forcedFilename?: string,
) {
  const mimeType = file.type.toLowerCase();
  const extension =
    kind === "image"
      ? ALLOWED_IMAGE_MIME_TYPES.get(mimeType)
      : ALLOWED_VIDEO_MIME_TYPES.get(mimeType);

  if (!extension) {
    throw new Error(
      kind === "image"
        ? "Only jpg, jpeg, png, webp, and svg images are allowed."
        : "Only mp4, webm, and mov videos are allowed.",
    );
  }

  const maxFileSize =
    kind === "image" ? MAX_IMAGE_FILE_SIZE : MAX_VIDEO_FILE_SIZE;

  if (file.size > maxFileSize) {
    throw new Error(
      kind === "image"
        ? "Image size must not exceed 5MB."
        : "Video size must not exceed 50MB.",
    );
  }

  if (file.size <= 0) {
    throw new Error(`${kind === "image" ? "Image" : "Video"} file is empty.`);
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const originalName = path.parse(file.name).name || kind;
  const safeBaseName =
    originalName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || kind;
  const filename = forcedFilename
    ? sanitizeForcedFilename(forcedFilename)
    : `${Date.now()}-${randomUUID()}-${safeBaseName}.${extension}`;
  const diskPath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(diskPath, buffer);

  if (forcedFilename) {
    await prisma.mediaFile.deleteMany({
      where: { url: `/uploads/${filename}` },
    });
  }

  return prisma.mediaFile.create({
    data: {
      filename,
      url: `/uploads/${filename}`,
      mimeType,
      size: file.size,
    },
  });
}

function sanitizeForcedFilename(filename: string) {
  const baseName = path.basename(filename).toLowerCase();

  if (!/^[a-z0-9][a-z0-9._-]*\.[a-z0-9]+$/.test(baseName)) {
    throw new Error("Invalid upload filename.");
  }

  return baseName;
}

export async function deleteUploadedAsset(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filename = path.basename(url);
  const targetPath = path.join(uploadDir, filename);

  try {
    await unlink(targetPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
