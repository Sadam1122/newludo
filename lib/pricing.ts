export const ADMIN_FEE_RATE = 0.03;

export type OrderTotals = {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  afterDiscount: number;
  adminFee: number;
  grandTotal: number;
};

export function computeOrderTotals(
  subtotal: number,
  discountPercent = 0,
): OrderTotals {
  const safeSubtotal = Math.max(0, subtotal);
  const safeDiscountPercent = Math.min(100, Math.max(0, discountPercent));

  const discountAmount = Math.round(safeSubtotal * (safeDiscountPercent / 100));
  const afterDiscount = safeSubtotal - discountAmount;
  const adminFee = Math.round(afterDiscount * ADMIN_FEE_RATE);
  const grandTotal = afterDiscount + adminFee;

  return {
    subtotal: safeSubtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    afterDiscount,
    adminFee,
    grandTotal,
  };
}
