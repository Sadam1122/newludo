import { NextResponse } from "next/server";
import { formatJakartaDateStamp, formatJakartaDateTime } from "@/lib/dateFormat";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStyledSheet, XLSX } from "@/lib/excelExport";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
    }

    const event = await prisma.bookingEvent.findUnique({
      where: { id: eventId },
      include: {
        reservations: {
          orderBy: { createdAt: "desc" },
          include: {
            orderItems: {
              include: {
                eventPackage: true,
                eventTable: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const reservations = event.reservations;

    // 1. Sheet: Summary
    const totalTransactions = reservations.length;
    const totalSuccess = reservations.filter((r) => r.status === "SUCCESS").length;
    const totalPending = reservations.filter((r) => r.status === "PENDING").length;
    const totalFailed = reservations.filter(
      (r) => r.status === "FAILED" || r.status === "EXPIRED" || r.status === "CANCELLED"
    ).length;
    const totalRevenuePaid = reservations
      .filter((r) => r.status === "SUCCESS")
      .reduce((sum, r) => sum + r.totalPrice, 0);

    // Get all tables for the event to calculate booked/available
    const allTables = await prisma.eventTable.findMany({
      where: { bookingEventId: eventId },
    });
    const totalTables = allTables.length;
    const totalTablesBooked = allTables.filter((t) => t.status === "PAID" || t.status === "BOOKED").length;
    const totalTablesAvailable = allTables.filter((t) => t.status === "AVAILABLE").length;

    const summaryData = [
      { Label: "Nama Event", Value: event.title },
      { Label: "Event ID", Value: event.id },
      { Label: "Tanggal Event", Value: `${event.eventDateLabel} ${event.eventTimeLabel}` },
      { Label: "Total Transaksi", Value: totalTransactions },
      { Label: "Total Transaksi Sukses", Value: totalSuccess },
      { Label: "Total Pending", Value: totalPending },
      { Label: "Total Failed/Expired/Cancelled", Value: totalFailed },
      { Label: "Total Revenue Paid", Value: `Rp ${totalRevenuePaid.toLocaleString()}` },
      { Label: "Total Meja Booked/Paid", Value: totalTablesBooked },
      { Label: "Total Meja Available", Value: totalTablesAvailable },
      { Label: "Waktu Export", Value: formatJakartaDateTime(new Date()) },
    ];

    // 2. Sheet: Detail Transaksi
    const detailData = reservations.map((res) => {
      const item = res.orderItems[0];
      return {
        "Transaction ID": res.transactionId || "-",
        "Order ID": res.id,
        "Match/Event ID": event.id,
        "Nama Event": event.title,
        "Package": item?.eventPackage?.name || "-",
        "Table Code": item?.eventTable?.tableCode || "-",
        "Table Category": item?.eventTable?.tableType || "-",
        "Table Capacity": item?.eventTable?.capacity || "-",
        "Nama Customer": res.customerName,
        "Nomor WhatsApp": res.customerPhone,
        "Email": res.customerEmail,
        "Total Harga": res.totalPrice,
        "Tax Service": res.taxServiceAmount,
        "Status Order": res.status,
        "Payment Method": res.paymentMethod || "-",
        "Fraud Status": res.fraudStatus || "-",
        "Waktu Booking": formatJakartaDateTime(res.createdAt),
        "Waktu Expired": res.expiredAt ? formatJakartaDateTime(res.expiredAt) : "-",
        "Waktu Payment Success": res.paidAt ? formatJakartaDateTime(res.paidAt) : "-",
        "Catatan": res.customerRequest || "-",
      };
    });

    // 2b. Sheet: Detail Items (every order line, including a la carte add-ons
    // that the primary Detail Transaksi sheet above only shows the first of)
    const itemDetailData = reservations.flatMap((res) =>
      res.orderItems.map((item) => ({
        "Order ID": res.id,
        "Status Order": res.status,
        "Nama Customer": res.customerName,
        "Item": item.eventPackage?.name || "-",
        "Table Code": item.eventTable?.tableCode || "-",
        "Quantity": item.quantity,
        "Harga Satuan": item.price,
        "Subtotal": item.price * item.quantity,
        "Catatan Item": item.note || "-",
      })),
    );

    // 3. Sheet: Rekap Per Package
    const packageStats: Record<string, { count: number; paid: number; pending: number; rev: number }> = {};
    reservations.forEach((res) => {
      const pkgName = res.orderItems[0]?.eventPackage?.name || "No Package";
      if (!packageStats[pkgName]) {
        packageStats[pkgName] = { count: 0, paid: 0, pending: 0, rev: 0 };
      }
      packageStats[pkgName].count++;
      if (res.status === "SUCCESS") {
        packageStats[pkgName].paid++;
        packageStats[pkgName].rev += res.totalPrice;
      } else if (res.status === "PENDING") {
        packageStats[pkgName].pending++;
      }
    });

    const packageData = Object.entries(packageStats).map(([name, stat]) => ({
      "Nama Package": name,
      "Jumlah Order": stat.count,
      "Jumlah Paid": stat.paid,
      "Jumlah Pending": stat.pending,
      "Total Revenue": stat.rev,
    }));

    // 4. Sheet: Rekap Per Table
    const tableData = allTables.map((table) => {
      // Find latest successful or pending reservation for this table
      const res = reservations.find((r) => r.orderItems.some((item) => item.eventTableId === table.id));
      const totalTxForTable = reservations.filter((r) => r.orderItems.some((item) => item.eventTableId === table.id)).length;
      return {
        "Table Code": table.tableCode,
        "Category": table.tableType,
        "Capacity": table.capacity,
        "Status Table": table.status,
        "Nama Customer": table.status === "PAID" || table.status === "BOOKED" ? res?.customerName || "-" : "-",
        "Status Payment": res?.status || "-",
        "Total Transaksi": totalTxForTable,
      };
    });

    // 5. Sheet: Rekap Payment Status
    const paymentStats: Record<string, { count: number; total: number }> = {};
    reservations.forEach((res) => {
      if (!paymentStats[res.status]) {
        paymentStats[res.status] = { count: 0, total: 0 };
      }
      paymentStats[res.status].count++;
      paymentStats[res.status].total += res.totalPrice;
    });

    const paymentData = Object.entries(paymentStats).map(([status, stat]) => ({
      "Status Payment": status,
      "Jumlah Transaksi": stat.count,
      "Total Nominal": stat.total,
    }));

    // Generate Excel File
    const wb = XLSX.utils.book_new();

    const wsSummary = buildStyledSheet(summaryData);
    const wsDetail = buildStyledSheet(detailData);
    const wsItems = buildStyledSheet(itemDetailData);
    const wsPackage = buildStyledSheet(packageData);
    const wsTable = buildStyledSheet(tableData);
    const wsPayment = buildStyledSheet(paymentData);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Transaksi");
    XLSX.utils.book_append_sheet(wb, wsItems, "Detail Items");
    XLSX.utils.book_append_sheet(wb, wsPackage, "Rekap Per Package");
    XLSX.utils.book_append_sheet(wb, wsTable, "Rekap Per Table");
    XLSX.utils.book_append_sheet(wb, wsPayment, "Rekap Payment Status");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    // Sanitize event title for filename
    const safeTitle = event.title.replace(/[^a-zA-Z0-9]/g, "_");
    const dateStr = formatJakartaDateStamp();
    const filename = `Rekap_Transaksi_Ludo_${safeTitle}_${dateStr}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
