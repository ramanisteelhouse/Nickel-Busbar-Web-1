/**
 * The despatch position published on product pages, in prose and as schema.org markup.
 *
 * This is the companion to returnPolicy.ts and follows the same rule: `seoSnapshot.ts` and
 * `ProductDetailPage.tsx` both publish a Product entity, both read from here, so neither can
 * drift from the other or from the sentence a buyer actually reads on the page.
 *
 * `shippingDetails` is a merchant-listing enhancement. Google lists it as recommended, not
 * required — but it is conditionally strict: *if* an Offer carries `shippingDetails`, then
 * `shippingRate` and `shippingDestination` are required inside it. A half-filled block is worse
 * than none, because it converts a silently-missing recommendation into a reported invalid item.
 *
 * Hence the gate below. The schema builder returns null until the freight figure is known, so
 * the markup cannot ship in a state that fails validation. Filling in one constant turns it on.
 *
 * WHAT IS KNOWN, and where it comes from:
 *   - Destination is India. The price is INR, the return policy is scoped to IN, and the Offer
 *     already sets eligibleRegion IN, because export is quoted separately in USD against an
 *     Incoterm. Shipping has to be scoped the same way or the markup contradicts itself.
 *   - Order-to-delivery is 7 days (DELIVERY_TIME in productSpecs.ts, published on the company's
 *     IndiaMART listing).
 *
 * WHAT IS DATA REQUIRED, and must not be guessed:
 *   - The freight charge. There is no shipping figure anywhere in the codebase or on the live
 *     site. Inventing one — including "0" for free shipping — would publish a price commitment
 *     the business never made, to a buyer who can hold them to it.
 *   - The split of the 7 days into handling and transit. The total is published; the split is
 *     not. schema.org models them as two separate fields and there is no honest way to derive
 *     one from the other, so deliveryTime stays out until both halves are confirmed.
 */

import { DELIVERY_TIME } from './productSpecs.js';

/** Matches APPLICABLE_COUNTRY in returnPolicy.ts and eligibleRegion on the Offer. */
const SHIPPING_DESTINATION_COUNTRY = 'IN';

/** A whole-day range, the only shape schema.org accepts for handling and transit times. */
export type DayRange = { min: number; max: number };

/**
 * The freight charge for a domestic order, in INR. Permanently null — this is a decision, not a
 * gap waiting to be filled.
 *
 * Confirmed by the owner on 2026-10-21: **freight is quoted per order, based on weight and
 * destination.** There is therefore no single figure to publish. schema.org's `shippingRate` is
 * one `MonetaryAmount`, so a per-order quote cannot be expressed honestly, and any number put
 * here would be a price commitment the business never made to a buyer who could hold them to it.
 *
 * So `buildShippingSchema()` returns null and no `shippingDetails` is emitted. That is the
 * correct outcome, not a missing feature: Google treats the block as recommended, but requires
 * `shippingRate` inside it once present, so a placeholder would turn a silently-absent
 * recommendation into a reported invalid item on all 17 product URLs.
 *
 * Do not set this to 0 to "enable" the markup. 0 means delivery is free, which is not the
 * position. If the company ever moves to a flat domestic rate, set that real figure here and the
 * markup and the visible copy both follow automatically.
 */
export const SHIPPING_RATE_INR: number | null = null;

/**
 * The working days between order confirmation and the material leaving the works, and the days
 * in transit after that. Both null, and moot while SHIPPING_RATE_INR is null: `deliveryTime`
 * lives inside `shippingDetails`, which is not emitted at all.
 *
 * They are kept rather than deleted because they are the other half of a flat-rate switch. If
 * freight ever becomes a published figure, these must add up to DELIVERY_TIME — the 7 days
 * already promised to buyers — and must be confirmed, not guessed, because the split varies by
 * destination.
 */
export const HANDLING_TIME_DAYS: DayRange | null = null;
export const TRANSIT_TIME_DAYS: DayRange | null = null;

const quantitativeDays = (range: DayRange) => ({
  '@type': 'QuantitativeValue',
  minValue: range.min,
  maxValue: range.max,
  unitCode: 'DAY',
});

/**
 * The OfferShippingDetails to attach to the Offer, or null while the freight figure is unknown.
 *
 * deliveryTime is added only when both halves of the 7 days are known; shippingRate and
 * shippingDestination carry the block on their own until then, which is what Google requires.
 */
export function buildShippingSchema(): Record<string, unknown> | null {
  if (SHIPPING_RATE_INR === null) return null;

  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: SHIPPING_RATE_INR,
      currency: 'INR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: SHIPPING_DESTINATION_COUNTRY,
    },
    ...(HANDLING_TIME_DAYS && TRANSIT_TIME_DAYS
      ? {
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: quantitativeDays(HANDLING_TIME_DAYS),
            transitTime: quantitativeDays(TRANSIT_TIME_DAYS),
          },
        }
      : {}),
  };
}

/** The heading and sentences rendered on the product page, and in the crawler snapshot. */
export const SHIPPING_HEADING = 'Despatch & delivery';

/**
 * Visible copy. Google requires structured data to be supported by content on the page, so this
 * says exactly what the markup says and no more — the delivery commitment always, the freight
 * charge only once there is a real figure behind it.
 */
export const SHIPPING_LINES: readonly string[] = [
  `Orders are delivered within ${DELIVERY_TIME} of confirmation, anywhere in India.`,
  ...(SHIPPING_RATE_INR === null
    ? ['Freight is quoted with your order, based on weight and destination.']
    : [
        SHIPPING_RATE_INR === 0
          ? 'Delivery is included in the quoted price for domestic orders.'
          : `Freight for domestic orders is ₹${SHIPPING_RATE_INR.toLocaleString('en-IN')}.`,
      ]),
  'Export orders are quoted separately in USD against an agreed Incoterm.',
];
