import { NextResponse } from "next/server";
import crypto from "crypto";
import { MIDTRANS_SERVER_KEY } from "@/lib/midtrans";
import { processMidtransStatusUpdate } from "@/lib/paymentSync";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const { order_id, status_code, gross_amount, signature_key, transaction_status } = payload;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json({ message: "Malformed notification payload" }, { status: 400 });
    }

    if (!MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ message: "Server key not configured" }, { status: 500 });
    }

    // Verify signature
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    if (hash !== signature_key) {
      console.error(`[midtrans webhook] invalid signature for order_id=${order_id}`);
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    console.log(
      `[midtrans webhook] order_id=${order_id} transaction_status=${transaction_status} fraud_status=${payload.fraud_status ?? "-"} payment_type=${payload.payment_type ?? "-"}`,
    );

    const result = await processMidtransStatusUpdate(payload);

    if (!result.ok) {
      // Reservation not found — acknowledge with 200 so Midtrans doesn't keep
      // retrying a notification we can never resolve, but log it loudly.
      console.error(`[midtrans webhook] ${result.message} for order_id=${order_id}`);
      return NextResponse.json({ status: "ignored", message: result.message });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("[midtrans webhook] unhandled error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
