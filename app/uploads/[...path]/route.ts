import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    if (!pathArray || pathArray.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const filename = pathArray.join("/");
    const safeFilename = filename.replace(/\.\./g, ""); // Prevent directory traversal
    const filePath = path.join(process.cwd(), "public", "uploads", safeFilename);

    try {
      const fileBuffer = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (e) {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
