import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { NextRequest, NextResponse } from "next/server";

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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return serveUpload(request, context, false);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return serveUpload(request, context, true);
}

async function serveUpload(
  request: NextRequest,
  { params }: RouteContext,
  headOnly: boolean,
) {
  try {
    const { path: pathParts } = await params;
    const filePath = resolveUploadPath(pathParts);
    if (!filePath) return new NextResponse("Not Found", { status: 404 });

    const fileStat = await stat(filePath);
    if (!fileStat.isFile())
      return new NextResponse("Not Found", { status: 404 });

    const mimeType =
      MIME_TYPES[path.extname(filePath).toLowerCase()] ??
      "application/octet-stream";
    const commonHeaders = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": mimeType,
      "Last-Modified": fileStat.mtime.toUTCString(),
    };
    const range = parseRange(request.headers.get("range"), fileStat.size);

    if (range === "invalid") {
      return new NextResponse(null, {
        status: 416,
        headers: {
          ...commonHeaders,
          "Content-Range": `bytes */${fileStat.size}`,
        },
      });
    }

    if (range) {
      const contentLength = range.end - range.start + 1;
      const headers = {
        ...commonHeaders,
        "Content-Length": String(contentLength),
        "Content-Range": `bytes ${range.start}-${range.end}/${fileStat.size}`,
      };
      if (headOnly) return new NextResponse(null, { status: 206, headers });

      const stream = Readable.toWeb(
        createReadStream(filePath, { start: range.start, end: range.end }),
      ) as ReadableStream<Uint8Array>;
      return new NextResponse(stream, { status: 206, headers });
    }

    const headers = {
      ...commonHeaders,
      "Content-Length": String(fileStat.size),
    };
    if (headOnly) return new NextResponse(null, { status: 200, headers });

    const stream = Readable.toWeb(
      createReadStream(filePath),
    ) as ReadableStream<Uint8Array>;
    return new NextResponse(stream, { status: 200, headers });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse("Not Found", { status: 404 });
    }
    console.error("Unable to serve uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function resolveUploadPath(pathParts: string[] | undefined) {
  if (!pathParts?.length) return null;

  const uploadDirectory = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    "uploads",
  );
  const candidate = path.resolve(uploadDirectory, ...pathParts);
  const relative = path.relative(uploadDirectory, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
    return null;
  return candidate;
}

function parseRange(rangeHeader: string | null, fileSize: number) {
  if (!rangeHeader) return null;
  if (fileSize <= 0 || rangeHeader.includes(",")) return "invalid" as const;

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || (!match[1] && !match[2])) return "invalid" as const;

  let start: number;
  let end: number;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0)
      return "invalid" as const;
    start = Math.max(0, fileSize - suffixLength);
    end = fileSize - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : fileSize - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end))
      return "invalid" as const;
    end = Math.min(end, fileSize - 1);
  }

  if (start < 0 || start >= fileSize || end < start) return "invalid" as const;
  return { start, end };
}
