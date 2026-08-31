/**
 * Order tax, for the cart and the checkout.
 *
 * Both pages used to compute `subtotal * 0.18` unconditionally, so an overseas buyer was shown
 * 18% Indian GST added to a quote denominated in their own currency. Exports of goods out of
 * India are zero-rated supplies under the IGST Act — the tax does not belong on an export
 * quotation at all, and showing it inflates every overseas total by 18%.
 *
 * The rule is deliberately simple and destination-based: GST applies when the goods are
 * delivered inside India. Anything else is quoted ex-GST, and the final treatment (LUT/bond, or
 * paid-and-refunded) is settled on the invoice rather than guessed at in the browser.
 */

/** Standard GST rate on nickel strip and busbar (HSN 7505/7506). */
export const GST_RATE = 0.18;

/** The only destination this site charges GST for. */
const GST_COUNTRY = 'IN';

export function isGstApplicable(countryCode?: string | null): boolean {
  return (countryCode ?? '').toUpperCase() === GST_COUNTRY;
}

export type OrderTotals = {
  subtotal: number;
  /** Zero for export destinations. */
  gst: number;
  total: number;
  gstApplicable: boolean;
  /** "GST (18%)" or the export equivalent, for the totals row. */
  gstLabel: string;
};

export function calculateOrderTotals(subtotal: number, countryCode?: string | null): OrderTotals {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const gstApplicable = isGstApplicable(countryCode);
  const gst = gstApplicable ? safeSubtotal * GST_RATE : 0;
  return {
    subtotal: safeSubtotal,
    gst,
    total: safeSubtotal + gst,
    gstApplicable,
    gstLabel: gstApplicable ? `GST (${Math.round(GST_RATE * 100)}%)` : 'GST (export, zero-rated)',
  };
}
