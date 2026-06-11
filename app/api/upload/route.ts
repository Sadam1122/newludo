import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (typeof File === "undefined" || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { ok: false, message: "No image file provided." },
        { status: 400 },
      );
    }

    const media = await saveUploadedImage(file);
    return NextResponse.json({ ok: true, message: "Image uploaded.", media });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to upload image.",
      },
      { status: 400 },
    );
  }
}
