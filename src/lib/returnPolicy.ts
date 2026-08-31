/**
 * The returns position published on product pages, in prose and as schema.org markup.
 *
 * Google Search Console reports "Missing field hasMerchantReturnPolicy (in offers)" on every
 * product URL. It is a merchant-listing enhancement, not a validity error: without it the page
 * still earns Product rich results, it just cannot show a returns annotation.
 *
 * The commercial position is that nickel strip is slit to order, so change-of-mind returns are
 * not accepted, while material that fails its test certificate or arrives off-specification is
 * replaced. Those are two different things and schema.org only models the first:
 * `MerchantReturnPolicy` describes a *return* window, and there is none. The replacement
 * commitment is a warranty, which the Offer vocabulary has no field for, so it is published as
 * page copy rather than being forced into a return-policy shape it does not fit.
 *
 * Both are stated here, in one place, because Google requires structured data to be supported
 * by content visible on the page — the markup and the sentence a buyer reads have to agree.
 * `seoSnapshot.ts` and `ProductDetailPage.tsx` both publish a Product entity and both read from
 * here, so neither can drift from the other or from the visible text.
 */

/** Prices are INR and the offer URL is the Indian site; export orders are quoted separately. */
const APPLICABLE_COUNTRY = 'IN';

/**
 * `MerchantReturnNotPermitted` needs no window, fee or shipping fields — Google requires the
 * rest of MerchantReturnPolicy only for categories that actually accept a return.
 */
export const RETURN_POLICY_SCHEMA = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: APPLICABLE_COUNTRY,
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
} as const;

/** The heading and sentences rendered on the product page, and in the crawler snapshot. */
export const RETURN_POLICY_HEADING = 'Returns & material guarantee';

export const RETURN_POLICY_LINES = [
  'Nickel strip and busbar are slit to the width, thickness and temper of each order, so change-of-mind returns are not accepted.',
  'Material that fails its test certificate, or is supplied off-specification, is replaced at our cost. Raise it with your sales contact quoting the batch number on the material test certificate.',
] as const;
