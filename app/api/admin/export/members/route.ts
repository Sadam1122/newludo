import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStyledSheet, XLSX } from "@/lib/excelExport";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = members.map((member) => ({
      Username: member.username,
      Category: member.category || "-",
      "Discount (%)": member.discountPercent,
      "Benefit Note": member.benefitNote || "-",
      Status: member.isActive ? "Active" : "Disabled",
      "Dibuat": new Date(member.createdAt).toLocaleString("id-ID"),
      "Diperbarui": new Date(member.updatedAt).toLocaleString("id-ID"),
    }));

    const wb = XLSX.utils.book_new();
    const ws = buildStyledSheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Members");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Data_Member_Ludo_${dateStr}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Members Export Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
