/**
 * The route names the SSR renderer answers for, kept free of every other import.
 *
 * seoSnapshot.ts holds the actual titles, descriptions and bodies, but importing it pulls in
 * db.ts, which throws at module load when there is no connection string. The build-time script
 * that writes Netlify's routing table only needs the names, and it must not be able to fail for
 * want of a database: a build that cannot reach Postgres should still emit a correct routing
 * table, because a missing table means every URL falls through to the 404 rule.
 *
 * seoSnapshot.ts types its records against these unions, so adding a route here without adding
 * its content there is a compile error rather than a blank page.
 */

/**
 * Routes whose content is written into seoSnapshot's STATIC_ROUTE_SEO.
 *
 * "/export-enquiry" is spelled out here rather than imported as EXPORT_PATH, because
 * STATIC_ROUTE_SEO uses it as a computed key and a computed key cannot be part of the union
 * that typechecks that record. The typecheck still binds the two together in the other
 * direction: dropping this entry makes the record's [EXPORT_PATH] a type error.
 */
export const STATIC_SNAPSHOT_ROUTES = ["/", "/about", "/contact", "/calculator", "/export-enquiry"] as const;
export type StaticSnapshotRoute = (typeof STATIC_SNAPSHOT_ROUTES)[number];

/**
 * Routes rendered with a noindex header — a cart or a login has nothing to rank.
 *
 * /review is here for the same reason: it is a form a customer reaches from a link we shared,
 * not a page anyone should find in search. /review/<product-slug> is normalised onto it by
 * noindexSnapshotPath below, so the per-product variants are covered without listing every slug.
 */
export const NOINDEX_SNAPSHOT_ROUTES = ["/cart", "/checkout", "/login", "/review"] as const;
export type NoindexSnapshotRoute = (typeof NOINDEX_SNAPSHOT_ROUTES)[number];

/**
 * The noindex route a path belongs to, or null. /review/ni-32650-2p-h-type is the review form
 * for one product and gets the same treatment as /review itself — without this it would fall
 * through to the untouched SPA shell, which carries the homepage's title, canonical and
 * `robots: index, follow`.
 */
export function noindexSnapshotPath(pathname: string): NoindexSnapshotRoute | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/review" || clean.startsWith("/review/")) return "/review";
  return (NOINDEX_SNAPSHOT_ROUTES as readonly string[]).includes(clean)
    ? (clean as NoindexSnapshotRoute)
    : null;
}

/**
 * Routes the React app serves that have no snapshot of their own.
 *
 * They still need a rewrite rule, because the routing table ends in a catch-all 404 — without
 * an entry here a real page would return 404 to both visitors and crawlers. They rewrite to the
 * renderer, which returns the unmodified shell for a route it does not recognise, and React
 * takes over from there.
 *
 * Empty today: every client route in App.tsx is covered by the lists above, by the
 * /product/* and /blog/* rules, or by LANDING_PATHS. It exists so that adding a page to the
 * router has an obvious home in the routing table.
 */
export const SPA_ONLY_ROUTES: readonly string[] = [];
