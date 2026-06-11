import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

export function isAllowedImage(file: File) {
  return ALLOWED_MIME_TYPES.has(file.type.toLowerCase()) && file.size <= MAX_FILE_SIZE;
}

export async function saveUploadedImage(file: File) {
  const mimeType = file.type.toLowerCase();
  const extension = ALLOWED_MIME_TYPES.get(mimeType);

  if (!extension) {
    throw new Error("Only jpg, jpeg, png, webp, and svg images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image size must not exceed 5MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const originalName = path.parse(file.name).name || "image";
  const safeBaseName =
    originalName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
  const filename = `${Date.now()}-${randomUUID()}-${safeBaseName}.${extension}`;
  const diskPath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(diskPath, buffer);

  return prisma.mediaFile.create({
    data: {
      filename,
      url: `/uploads/${filename}`,
      mimeType,
      size: file.size,
    },
  });
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
