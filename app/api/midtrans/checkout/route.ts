import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";
import { computeOrderTotals } from "@/lib/pricing";
import { releaseExpiredReservations } from "@/lib/reservationExpiry";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  let lockedTableId: string | null = null;
  let lockedSeats = 0;
  let isSeatBased = false;

  try {
    const { eventId, packageId, tableId, quantity, customer, member, alaCarteItems } = await req.json();

    if (!eventId || !packageId || !customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Release any stale holds for this event first, so a table someone
    // abandoned 20 minutes ago is available again before we check it.
    await releaseExpiredReservations(eventId);

    // Validate Package
    const eventPackage = await prisma.eventPackage.findUnique({
      where: { id: packageId },
    });
    if (!eventPackage) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }
    if (eventPackage.isSoldOut) {
      return NextResponse.json(
        { message: `${eventPackage.name} is sold out. Please choose another item.` },
        { status: 409 },
      );
    }

    const bookingEvent = await prisma.bookingEvent.findUnique({
      where: { id: eventId },
      select: { eventType: true },
    });
    isSeatBased = bookingEvent?.eventType === "NOBAR_COMMUNITY" && !!tableId;
    const isDeliveryOrder = bookingEvent?.eventType === "DELIVERY_ORDER";

    // Fetch table for pricing/capacity info (not yet a lock; the atomic
    // guarded update below is the real lock).
    let eventTable = null;
    if (tableId) {
      eventTable = await prisma.eventTable.findUnique({ where: { id: tableId } });
      if (!eventTable) {
        return NextResponse.json({ message: "Table not found" }, { status: 404 });
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
        if (pkg.isSoldOut) throw new Error(`${pkg.name} is sold out. Please remove it from your order.`);
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

    // Tax Service (16.6%) only applies to the a la carte portion: the whole
    // order on the standalone Delivery Order page (everything there is a
    // delivery-menu item), or just the add-on items on top of a table
    // package everywhere else.
    const alaCarteTaxableAmount = isDeliveryOrder ? subtotal : alaCarteSubtotal;
    const totals = computeOrderTotals(subtotal, discountPercent, alaCarteTaxableAmount);

    // ---- Atomic table lock (guarded update, no read-then-write race) ----
    if (tableId && isSeatBased) {
      // Raw SQL because the guard compares two columns (bookedSeats + N <= capacity),
      // which Prisma query builder cannot express declaratively. This keeps the
      // check-and-increment atomic at the database level so two concurrent
      // checkouts can never oversell seats on the same table.
      const updated = await prisma.$executeRaw`
        UPDATE EventTable
        SET bookedSeats = bookedSeats + ${finalQuantity},
            status = CASE WHEN bookedSeats + ${finalQuantity} >= capacity THEN 'BOOKED' ELSE 'AVAILABLE' END
        WHERE id = ${tableId}
          AND bookingEventId = ${eventId}
          AND status = 'AVAILABLE'
          AND bookedSeats + ${finalQuantity} <= capacity
      `;
      if (Number(updated) === 0) {
        return NextResponse.json(
          { message: "Not enough seats left on this table. Please refresh and try again." },
          { status: 409 },
        );
      }
      lockedTableId = tableId;
      lockedSeats = finalQuantity;
    } else if (tableId) {
      const updated = await prisma.eventTable.updateMany({
        where: { id: tableId, bookingEventId: eventId, status: "AVAILABLE" },
        data: { status: "SELECTED" },
      });
      if (updated.count === 0) {
        return NextResponse.json(
          { message: "Table is no longer available. Please pick another table." },
          { status: 409 },
        );
      }
      lockedTableId = tableId;
    }

    // Set expiration 15 minutes from now
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);
    const orderId = `LUDO-${Date.now()}-${randomUUID().slice(0, 4)}`;

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
        taxServiceAmount: totals.taxServiceAmount,
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

    // Request Midtrans Snap - item breakdown mirrors Total Belanja + Tax Service + Admin Fee (- discount) = Grand Total
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

    if (totals.taxServiceAmount > 0) {
      itemDetails.push({
        id: "tax-service",
        price: totals.taxServiceAmount,
        quantity: 1,
        name: "Tax Service (16.6%)",
      });
    }

    itemDetails.push({
      id: "admin-fee",
      price: totals.adminFee,
      quantity: 1,
      name: "Admin Fee (3%)",
    });

    let snapToken: string;
    try {
      snapToken = await createSnapTransaction({
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
    } catch (snapError) {
      // Midtrans rejected the transaction - release the lock and drop the
      // reservation instead of leaving the table stuck as SELECTED/held.
      await releaseLock(lockedTableId, isSeatBased, lockedSeats);
      await prisma.reservation.delete({ where: { id: orderId } }).catch(() => {});
      throw snapError;
    }

    // Update reservation with snapToken
    await prisma.reservation.update({
      where: { id: orderId },
      data: { snapToken },
    });

    return NextResponse.json({ snapToken, orderId, expiredAt });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}

async function releaseLock(tableId: string | null, isSeatBased: boolean, seats: number) {
  if (!tableId) return;

  if (isSeatBased) {
    const table = await prisma.eventTable.findUnique({ where: { id: tableId } });
    if (!table) return;
    const releasedSeats = Math.max(0, table.bookedSeats - seats);
    await prisma.eventTable.update({
      where: { id: tableId },
      data: { bookedSeats: releasedSeats, status: "AVAILABLE" },
    });
  } else {
    await prisma.eventTable.updateMany({
      where: { id: tableId, status: "SELECTED" },
      data: { status: "AVAILABLE" },
    });
  }
}
