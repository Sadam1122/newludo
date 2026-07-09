export const ADMIN_FEE_RATE = 0.03;
// "Tax Service" — only charged on the a la carte portion of an order (the
// whole order on the standalone Delivery Order page, since everything there
// comes from the delivery menu; or just the add-on items on top of a table
// package for Match/other booking events).
export const ALA_CARTE_TAX_SERVICE_RATE = 0.166;

export type OrderTotals = {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  afterDiscount: number;
  alaCarteTaxableAmount: number;
  taxServiceAmount: number;
  adminFee: number;
  grandTotal: number;
};

export function computeOrderTotals(
  subtotal: number,
  discountPercent = 0,
  alaCarteTaxableAmount = 0,
): OrderTotals {
  const safeSubtotal = Math.max(0, subtotal);
  const safeDiscountPercent = Math.min(100, Math.max(0, discountPercent));
  const safeAlaCarteTaxable = Math.min(safeSubtotal, Math.max(0, alaCarteTaxableAmount));

  const discountAmount = Math.round(safeSubtotal * (safeDiscountPercent / 100));
  const afterDiscount = safeSubtotal - discountAmount;
  const taxServiceAmount = Math.round(safeAlaCarteTaxable * ALA_CARTE_TAX_SERVICE_RATE);
  const adminFee = Math.round((afterDiscount + taxServiceAmount) * ADMIN_FEE_RATE);
  const grandTotal = afterDiscount + taxServiceAmount + adminFee;

  return {
    subtotal: safeSubtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    afterDiscount,
    alaCarteTaxableAmount: safeAlaCarteTaxable,
    taxServiceAmount,
    adminFee,
    grandTotal,
  };
}
