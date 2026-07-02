import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { MIDTRANS_SERVER_KEY } from "@/lib/midtrans";
import { ReservationStatus, TableStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = payload;

    if (!MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ message: "Server key not configured" }, { status: 500 });
    }

    // Verify signature
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    if (hash !== signature_key) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: order_id },
      include: {
        orderItems: { include: { eventTable: true } },
        bookingEvent: { select: { eventType: true } },
      },
    });

    if (!reservation) {
      return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
    }

    let newStatus: ReservationStatus = reservation.status;
    let newTableStatus: TableStatus | null = null;

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        newStatus = "SUCCESS";
        newTableStatus = "PAID";
      }
    } else if (transaction_status === "settlement") {
      newStatus = "SUCCESS";
      newTableStatus = "PAID";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      newStatus = transaction_status === "expire" ? "EXPIRED" : "FAILED";
      newTableStatus = "AVAILABLE"; // Free up the table
    } else if (transaction_status === "pending") {
      newStatus = "PENDING";
      newTableStatus = "SELECTED";
    }

    // Update reservation
    await prisma.reservation.update({
      where: { id: order_id },
      data: {
        status: newStatus,
        paymentMethod: payment_type,
        paymentCallbackData: JSON.stringify(payload),
      },
    });

    // Update tables if needed
    if (newTableStatus) {
      const isSeatBased = reservation.bookingEvent?.eventType === "NOBAR_COMMUNITY";

      if (isSeatBased) {
        // Seat-based tables track partial fill via bookedSeats; only release seats
        // on cancel/deny/expire. Success/pending don't need any table change since
        // the seats were already held at checkout time.
        if (newTableStatus === "AVAILABLE") {
          for (const item of reservation.orderItems) {
            if (!item.eventTableId || !item.eventTable) continue;
            const releasedSeats = Math.max(0, item.eventTable.bookedSeats - item.quantity);
            await prisma.eventTable.update({
              where: { id: item.eventTableId },
              data: { bookedSeats: releasedSeats, status: "AVAILABLE" },
            });
          }
        }
      } else {
        const tableIds = reservation.orderItems
          .map((item) => item.eventTableId)
          .filter((id): id is string => id !== null);

        if (tableIds.length > 0) {
          await prisma.eventTable.updateMany({
            where: { id: { in: tableIds } },
            data: { status: newTableStatus },
          });
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
