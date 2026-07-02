export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
export const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
export const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const MIDTRANS_APP_URL = process.env.MIDTRANS_APP_URL || (MIDTRANS_IS_PRODUCTION ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com");
const MIDTRANS_API_URL = `${MIDTRANS_APP_URL}/snap/v1/transactions`;

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
