export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
export const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
export const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const MIDTRANS_APP_URL = process.env.MIDTRANS_APP_URL || (MIDTRANS_IS_PRODUCTION ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com");
const MIDTRANS_API_URL = `${MIDTRANS_APP_URL}/snap/v1/transactions`;

// Core API (different host than the Snap API above) — used to actively pull a
// transaction's current status from Midtrans, for the "Sync Payment Status"
// admin action and for lazy reconciliation when the webhook is late/missed.
const MIDTRANS_CORE_API_URL =
  process.env.MIDTRANS_CORE_API_URL ||
  (MIDTRANS_IS_PRODUCTION ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com");

type TransactionDetails = {
  order_id: string;
  gross_amount: number;
};

type CustomerDetails = {
  first_name: string;
  email: string;
  phone: string;
};

type ItemDetails = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

type MidtransPayload = {
  transaction_details: TransactionDetails;
  customer_details: CustomerDetails;
  item_details?: ItemDetails[];
};

export async function createSnapTransaction(payload: MidtransPayload) {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured.");
  }

  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");

  const response = await fetch(MIDTRANS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_messages?.join(", ") || "Failed to create Midtrans transaction");
  }

  return data.token as string;
}

export type MidtransTransactionStatus = {
  order_id: string;
  transaction_id?: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string;
  status_code: string;
  [key: string]: unknown;
};

/**
 * Actively pulls the current status of a transaction from Midtrans's Core API.
 * Used by the webhook-independent "Sync Payment Status" admin action and by
 * lazy reconciliation, so a missed/delayed webhook never permanently strands
 * a reservation in PENDING.
 */
export async function getTransactionStatus(orderId: string) {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured.");
  }

  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");

  const response = await fetch(`${MIDTRANS_CORE_API_URL}/v2/${encodeURIComponent(orderId)}/status`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.status_message || data.error_messages?.join(", ") || "Failed to fetch Midtrans transaction status");
  }

  return data as MidtransTransactionStatus;
}
