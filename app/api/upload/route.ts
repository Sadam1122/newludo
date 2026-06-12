import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { saveUploadedMedia } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (
      typeof File === "undefined" ||
      !(file instanceof File) ||
      file.size === 0
    ) {
      return NextResponse.json(
        { ok: false, message: "No media file provided." },
        { status: 400 },
      );
    }

    const media = await saveUploadedMedia(file);
    return NextResponse.json({ ok: true, message: "Media uploaded.", media });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to upload media.",
      },
      { status: 400 },
    );
  }
}
