/**
 * How long Ramani Steel House has been manufacturing, in one place.
 *
 * The figure appears on the heritage badge, the homepage hero and trust strip, the footer, the
 * "why choose us" list, the H type landing page and the /about crawler snapshot. Five of those
 * had it typed in by hand and two derived it, so changing the number meant finding five
 * strings — and missing the badge, which would have kept computing its own value. Every one of
 * them now reads from here.
 *
 * The count is inclusive: 1974 is the company's first year of manufacturing, so 2026 is its
 * 53rd, and that is the figure the business publishes. Plain subtraction (2026 - 1974 = 52)
 * counts completed anniversaries instead, and produced a number the company does not use.
 *
 * Deliberately free of imports: seoSnapshot.ts, homeContent.ts and landingPages.ts load this
 * inside a Node serverless function, where anything that pulled in React would fail at import.
 */
export const FOUNDED_YEAR = 1974;

/** Years in business, counting the founding year as year one. */
export function countYearsInBusiness(now: Date = new Date()): number {
  return now.getFullYear() - FOUNDED_YEAR + 1;
}

/**
 * Resolved when the module loads. For the data modules that read it once — homeContent,
 * landingPages, the SSR snapshot — that is page load or a serverless cold start, so the value
 * rolls over on its own each January without anyone editing a string.
 */
export const YEARS_IN_BUSINESS = countYearsInBusiness();
