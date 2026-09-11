/**
 * How long Ramani Steel House has been manufacturing, in one place.
 *
 * The figure appears on the heritage badge, the homepage hero and trust strip, the footer, the
 * "why choose us" list, the H type landing page and the /about crawler snapshot. Five of those
 * had it typed in by hand and two derived it, so changing the number meant finding five
 * strings — and missing the badge, which would have kept computing its own value. Every one of
 * them now reads from here.
 *
 * The company was founded in September 1974 and counts its years from that month, so the figure
 * moves on each September rather than each January: September 2026 begins its 53rd year, and 53
 * is what it publishes from then until August 2027. Plain year subtraction (2026 - 1974 = 52)
 * ignored the month and gave a number the company does not use.
 *
 * Deliberately free of imports: seoSnapshot.ts, homeContent.ts and landingPages.ts load this
 * inside a Node serverless function, where anything that pulled in React would fail at import.
 */
export const FOUNDED_YEAR = 1974;

/** September. The year count advances on the first of this month. */
export const FOUNDING_MONTH = 9;

/** India Standard Time is UTC+5:30 with no daylight saving, so a fixed offset is exact. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Years in business as the company counts them.
 *
 * Evaluated in India Standard Time rather than the local clock, because this runs in two places
 * that disagree about the date: the serverless function (UTC) and the visitor's browser (any
 * timezone). On the evening of 31 August in India the server would otherwise already be in
 * September, and the snapshot and the page could show different numbers.
 */
export function countYearsInBusiness(now: Date = new Date()): number {
  const india = new Date(now.getTime() + IST_OFFSET_MS);
  const monthInIndia = india.getUTCMonth() + 1;
  return india.getUTCFullYear() - FOUNDED_YEAR + (monthInIndia >= FOUNDING_MONTH ? 1 : 0);
}

/**
 * Resolved when the module loads. For the data modules that read it once — homeContent,
 * landingPages, the SSR snapshot — that is page load or a serverless cold start, so the value
 * advances on its own each September without anyone editing a string.
 */
export const YEARS_IN_BUSINESS = countYearsInBusiness();
