/**
 * Post-deploy smoke check: fetches the deployed site and asserts every route still answers.
 *
 * This exists because of a specific failure. A landing page was added with
 * `import { ... } from './contact'` — no file extension. Vite's bundler resolves that, so the
 * browser build worked and `tsc --noEmit` passed clean, but api/render.ts runs under Node ESM
 * where an extensionless relative specifier does not resolve. seoSnapshot imports landingPages,
 * so *every* server-rendered route returned 500: the homepage, the catalogue, every product and
 * blog URL. Nothing in the local toolchain could have caught it, because nothing local runs the
 * serverless path.
 *
 * The lesson encoded here: only the deployed origin proves a deploy. So this takes a base URL
 * and makes real requests against it.
 *
 * Coverage is one URL per *renderer* rather than every URL in the sitemap. Breakage in this
 * codebase is template-level — a renderer throws, or a shared import fails — so a representative
 * page per code path finds it in seconds, and the sitemap has 57 URLs that would mostly re-test
 * the same two functions.
 *
 *   npm run smoke                              # production
 *   npm run smoke -- https://my-preview.vercel.app
 */

const DEFAULT_BASE = "https://www.nickelbusbar.com";

type Check = {
  path: string;
  /** What this URL exists to prove. Printed on failure so the fix is obvious. */
  covers: string;
  status?: number;
  /** Response must contain each of these. */
  contains?: string[];
  /** Exactly one <link rel="canonical">, and it must be this absolute URL. */
  canonical?: string;
  /** Must carry at least one JSON-LD block. */
  jsonLd?: boolean;
  /** Follow redirects? Off when the redirect itself is the thing under test. */
  redirect?: "follow" | "manual";
  /** For redirects: where it must point. */
  location?: string;
};

const CHECKS: Check[] = [
  { path: "/", covers: "STATIC_ROUTE_SEO + homepage snapshot", canonical: "/", jsonLd: true, contains: ["<h1>"] },
  { path: "/about", covers: "STATIC_ROUTE_SEO", canonical: "/about" },
  { path: "/contact", covers: "STATIC_ROUTE_SEO", canonical: "/contact" },
  { path: "/calculator", covers: "STATIC_ROUTE_SEO + WebApplication offer", canonical: "/calculator", contains: ['"WebApplication"', '"offers"'] },
  { path: "/export-enquiry", covers: "STATIC_ROUTE_SEO", canonical: "/export-enquiry" },
  { path: "/products", covers: "renderProductListSnapshot + product cards", canonical: "/products", contains: ["<img", "/product/"] },
  { path: "/categories", covers: "renderProductListSnapshot (categories variant)", canonical: "/products" },
  { path: "/product/Plain-Nickel-Strips", covers: "renderProductSnapshot + Offer", canonical: "/product/Plain-Nickel-Strips", contains: ['"Product"', '"offers"', "hasMerchantReturnPolicy"] },
  { path: "/blog", covers: "renderBlogListSnapshot", canonical: "/blog" },
  { path: "/blog/why-nickel-purity-matters", covers: "renderBlogSnapshot", canonical: "/blog/why-nickel-purity-matters" },
  { path: "/h-type-nickel-strip", covers: "renderLandingSnapshot (bespoke page)", canonical: "/h-type-nickel-strip" },
  { path: "/nickel-strip-manufacturer-in-mumbai", covers: "renderLandingSnapshot (Mumbai)", canonical: "/nickel-strip-manufacturer-in-mumbai" },
  { path: "/nickel-strip-manufacturer-in-maharashtra", covers: "renderLandingSnapshot (generated state page)", canonical: "/nickel-strip-manufacturer-in-maharashtra" },
  { path: "/merchant-feed.xml", covers: "Merchant Center feed route", contains: ["<g:brand>", "<g:identifier_exists>"] },
  { path: "/sitemap.xml", covers: "build-time sitemap", contains: ["<loc>"] },
  { path: "/robots.txt", covers: "static file serving", contains: ["Sitemap:"] },
  // The 301s from the blog slug rename. A removed redirect turns an indexed URL into a 404,
  // and nothing else in the toolchain would notice.
  { path: "/blog/Manufacturers-Guide", covers: "blog slug 301", status: 301, redirect: "manual", location: "/blog/sourcing-custom-stamped-nickel-busbars" },
  { path: "/blog/Why-99.6-Purity-Matters", covers: "blog slug 301", status: 301, redirect: "manual", location: "/blog/why-nickel-purity-matters" },
  // Case-only variant, resolved in renderBlogSnapshot rather than vercel.json. This is the one
  // that briefly became an infinite redirect loop.
  { path: "/blog/Nickel-Strips-for-Electric-Vehicles", covers: "case-insensitive blog slug 301", status: 301, redirect: "manual", location: "/blog/nickel-strips-for-electric-vehicles" },
  { path: "/this-page-does-not-exist", covers: "404 handling", status: 404 },
];

const base = (process.argv[2] || process.env.SMOKE_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
const UA = "Mozilla/5.0 (compatible; nickelbusbar-smoke/1.0)";

const failures: string[] = [];
const fail = (check: Check, message: string) => {
  failures.push(`${check.path}\n      ${message}\n      covers: ${check.covers}`);
};

const run = async (check: Check) => {
  const url = `${base}${check.path}`;
  const expected = check.status ?? 200;

  let res: Response;
  try {
    res = await fetch(url, { redirect: check.redirect ?? "follow", headers: { "User-Agent": UA } });
  } catch (error) {
    fail(check, `request failed: ${(error as Error).message}`);
    return;
  }

  if (res.status !== expected) {
    fail(check, `expected HTTP ${expected}, got ${res.status}`);
    return;
  }

  if (check.location) {
    const got = res.headers.get("location") ?? "";
    if (!got.endsWith(check.location)) fail(check, `Location should end with ${check.location}, got ${got || "(none)"}`);
    return;
  }

  if (expected >= 300 && expected < 400) return;

  const body = await res.text();

  if (expected === 200 && body.length < 500) {
    fail(check, `body is only ${body.length} bytes — page is probably empty`);
    return;
  }

  for (const needle of check.contains ?? []) {
    if (!body.includes(needle)) fail(check, `body does not contain ${JSON.stringify(needle)}`);
  }

  if (check.canonical) {
    const found = [...body.matchAll(/<link rel="canonical"[^>]*href="([^"]*)"/g)].map((m) => m[1]);
    // More than one canonical is the audit finding that started all of this.
    if (found.length !== 1) fail(check, `expected exactly 1 canonical, found ${found.length}${found.length ? `: ${found.join(", ")}` : ""}`);
    else if (found[0] !== `${DEFAULT_BASE}${check.canonical}`) fail(check, `canonical is ${found[0]}, expected ${DEFAULT_BASE}${check.canonical}`);
  }

  if (check.jsonLd && !/<script type="application\/ld\+json"/.test(body)) {
    fail(check, "no JSON-LD block found");
  }

  if (check.path.endsWith(".xml") || check.path.endsWith(".txt")) return;

  const title = body.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) fail(check, "no <title>");
};

console.log(`Smoke checking ${base} — ${CHECKS.length} routes\n`);
// Sequential rather than parallel: a burst of concurrent requests can cold-start several
// serverless instances at once and time one out, which reads as a failure that is not real.
for (const check of CHECKS) {
  await run(check);
  process.stdout.write(".");
}
console.log("\n");

if (failures.length) {
  console.error(`FAILED — ${failures.length} of ${CHECKS.length} checks\n`);
  for (const f of failures) console.error(`  ✗ ${f}\n`);
  process.exit(1);
}

console.log(`All ${CHECKS.length} checks passed.`);
