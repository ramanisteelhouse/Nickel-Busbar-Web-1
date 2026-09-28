/**
 * Old URLs that were live long enough to be linked and indexed.
 *
 * These are 301s rather than rewrites so the duplicate drops out of the index instead of being
 * served under two URLs. Every host needs them, and each expresses them differently: Vercel in
 * vercel.json, Netlify in the generated _redirects, Cloudflare in the Worker. The list itself
 * lives here so adding one cannot fix two hosts and miss the third.
 *
 * No Node-only imports: this is bundled into the Worker.
 */
export const LEGACY_REDIRECTS: ReadonlyArray<readonly [from: string, to: string]> = [
  ["/blog/Why-99.6-Purity-Matters", "/blog/why-nickel-purity-matters"],
  ["/blog/Manufacturers-Guide", "/blog/sourcing-custom-stamped-nickel-busbars"],
  ["/blog/Nickel-Strip-Manufacturer-for-UK-Battery-Industry", "/blog/nickel-strip-manufacturer-uk-battery-industry"],
  [
    "/blog/Pure-Nickel-Strip-vs-Nickel-Plated-Steel-Strip:-Complete-Comparison",
    "/blog/pure-nickel-strip-vs-nickel-plated-steel-strip",
  ],
  [
    "/blog/Pure-Nickel-Strip-vs-Nickel-Plated-Steel-Strip%3A-Complete-Comparison",
    "/blog/pure-nickel-strip-vs-nickel-plated-steel-strip",
  ],
];

/**
 * The destination for a path, or null. Compared against both the raw and the decoded pathname,
 * because one of these URLs is indexed in both spellings (`%3A` and `:`).
 */
export function legacyRedirectFor(pathname: string): string | null {
  const candidates = new Set<string>([pathname]);
  try {
    candidates.add(decodeURIComponent(pathname));
  } catch {
    // Malformed encoding: the raw form is the only one worth comparing.
  }
  for (const [from, to] of LEGACY_REDIRECTS) {
    if (candidates.has(from)) return to;
  }
  return null;
}
