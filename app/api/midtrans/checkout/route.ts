import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";
import { computeOrderTotals } from "@/lib/pricing";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { eventId, packageId, tableId, quantity, customer, member, alaCarteItems } = await req.json();

    if (!eventId || !packageId || !customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate Package
    const eventPackage = await prisma.eventPackage.findUnique({
      where: { id: packageId },
    });
    if (!eventPackage) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }

    const bookingEvent = await prisma.bookingEvent.findUnique({
      where: { id: eventId },
      select: { eventType: true },
    });
    const isSeatBased = bookingEvent?.eventType === "NOBAR_COMMUNITY" && !!tableId;

    // Validate Table if provided
    let eventTable = null;
    if (tableId) {
      eventTable = await prisma.eventTable.findUnique({
        where: { id: tableId },
      });
      if (!eventTable || eventTable.status !== "AVAILABLE") {
        return NextResponse.json({ message: "Table is no longer available" }, { status: 400 });
      }

      if (isSeatBased) {
        const requestedSeats = Math.max(1, Number(quantity) || 1);
        const remainingSeats = eventTable.capacity - eventTable.bookedSeats;
        if (requestedSeats > remainingSeats) {
          return NextResponse.json(
            { message: `Only ${remainingSeats} seat(s) left on table ${eventTable.tableCode}.` },
            { status: 400 },
          );
        }
      }
    }

    // Validate a la carte add-on items (optional)
    const requestedAlaCarte: { packageId: string; quantity: number }[] = Array.isArray(alaCarteItems)
      ? alaCarteItems.filter((i: any) => i?.packageId && Number(i.quantity) > 0)
      : [];

    let alaCarteLines: { eventPackage: { id: string; name: string; price: number }; quantity: number }[] = [];
    if (requestedAlaCarte.length > 0) {
      const alaCartePackages = await prisma.eventPackage.findMany({
        where: { id: { in: requestedAlaCarte.map((i) => i.packageId) } },
      });
      alaCarteLines = requestedAlaCarte.map((item) => {
        const pkg = alaCartePackages.find((p) => p.id === item.packageId);
        if (!pkg) throw new Error("One of the selected menu items is no longer available.");
        return { eventPackage: pkg, quantity: Number(item.quantity) };
      });
    }

    // Verify member credentials (if provided) before touching any pricing/table state
    let discountPercent = 0;
    let memberUsername: string | null = null;
    if (member?.username && member?.password) {
      const memberRecord = await prisma.member.findUnique({
        where: { username: member.username },
      });

      if (!memberRecord || !memberRecord.isActive) {
        return NextResponse.json({ message: "Invalid member username or password" }, { status: 401 });
      }

      const isValid = await bcrypt.compare(member.password, memberRecord.passwordHash);
      if (!isValid) {
        return NextResponse.json({ message: "Invalid member username or password" }, { status: 401 });
      }

      discountPercent = memberRecord.discountPercent;
      memberUsername = memberRecord.username;
    }

    const price = eventPackage.price;
    // Regular booking events lock the whole table (quantity = 1 table).
    // NOBAR_COMMUNITY events are sold per seat, so quantity is the seat count.
    const finalQuantity = isSeatBased
      ? Math.max(1, Number(quantity) || 1)
      : tableId
        ? 1
        : quantity;
    const alaCarteSubtotal = alaCarteLines.reduce(
      (sum, line) => sum + line.eventPackage.price * line.quantity,
      0,
    );
    const subtotal = price * finalQuantity + alaCarteSubtotal;

    // Enforce table minimum charge (if any)
    if (eventTable && eventTable.basePrice > 0 && subtotal < eventTable.basePrice) {
      return NextResponse.json(
        {
          message: `Minimum charge for table ${eventTable.tableCode} is IDR ${eventTable.basePrice.toLocaleString("id-ID")}. Please add more items to your order.`,
        },
        { status: 400 },
      );
    }

    const totals = computeOrderTotals(subtotal, discountPercent);

    // Create Reservation
    const orderId = `LUDO-${Date.now()}-${randomUUID().slice(0, 4)}`;

    if (tableId && isSeatBased) {
      // Seat-based hold: reserve N seats on the table without locking the whole table
      // for other customers, guarded inside a transaction to avoid overselling seats.
      await prisma.$transaction(async (tx) => {
        const currentTable = await tx.eventTable.findUnique({ where: { id: tableId } });
        if (!currentTable || currentTable.status !== "AVAILABLE") {
          throw new Error("Table is no longer available");
        }

        const newBookedSeats = currentTable.bookedSeats + finalQuantity;
        if (newBookedSeats > currentTable.capacity) {
          throw new Error(`Only ${currentTable.capacity - currentTable.bookedSeats} seat(s) left on this table.`);
        }

        await tx.eventTable.update({
          where: { id: tableId },
          data: {
            bookedSeats: newBookedSeats,
            status: newBookedSeats >= currentTable.capacity ? "BOOKED" : "AVAILABLE",
          },
        });
      });
    } else if (tableId) {
      // Lock the whole table temporarily (SELECTED)
      await prisma.eventTable.update({
        where: { id: tableId },
        data: { status: "SELECTED" },
      });
    }

    // Set expiration 15 minutes from now
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    const reservation = await prisma.reservation.create({
      data: {
        id: orderId,
        bookingEventId: eventId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerRequest: customer.request,
        status: "PENDING",
        totalPrice: totals.grandTotal,
        tax: totals.adminFee,
        discountAmount: totals.discountAmount,
        memberUsername,
        expiredAt,
        orderItems: {
          create: [
            {
              eventPackageId: packageId,
              eventTableId: tableId || null,
              quantity: finalQuantity,
              price,
            },
            ...alaCarteLines.map((line) => ({
              eventPackageId: line.eventPackage.id,
              eventTableId: null,
              quantity: line.quantity,
              price: line.eventPackage.price,
            })),
          ],
        },
      },
    });

    // Request Midtrans Snap — item breakdown mirrors Total Belanja + Admin Fee (- discount) = Grand Total
    const itemDetails = [
      {
        id: packageId,
        price: price,
        quantity: finalQuantity,
        name: `${eventPackage.name} ${eventTable ? `(${eventTable.tableCode})` : ""}`.trim(),
      },
      ...alaCarteLines.map((line) => ({
        id: line.eventPackage.id,
        price: line.eventPackage.price,
        quantity: line.quantity,
        name: line.eventPackage.name,
      })),
    ];

    if (totals.discountAmount > 0) {
      itemDetails.push({
        id: "member-discount",
        price: -totals.discountAmount,
        quantity: 1,
        name: `Member Discount (${totals.discountPercent}%)`,
      });
    }

    itemDetails.push({
      id: "admin-fee",
      price: totals.adminFee,
      quantity: 1,
      name: "Admin Fee (3%)",
    });

    const snapToken = await createSnapTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: totals.grandTotal,
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      item_details: itemDetails,
    });

    // Update reservation with snapToken
    await prisma.reservation.update({
      where: { id: orderId },
      data: { snapToken },
    });

    return NextResponse.json({ snapToken, orderId });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
