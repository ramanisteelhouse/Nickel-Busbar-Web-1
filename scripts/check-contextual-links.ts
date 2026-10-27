/**
 * Checks the contextual internal links (src/lib/contextualLinks.ts) without a database or a
 * deploy: it places the links on every page the module knows about and measures the result.
 *
 *     npx tsx scripts/check-contextual-links.ts           # offline
 *     npx tsx scripts/check-contextual-links.ts --live    # also confirm every article exists
 *
 * Fails when a link points at a page that does not exist, a page links to itself or twice to the
 * same place, or a destination ends up with fewer than MIN_INBOUND links from the pages that
 * should reach it, which is the orphan problem this module exists to fix.
 */
import { CONTEXT_SLUGS, contextualLinks, type PageContext } from "../src/lib/contextualLinks.js";
import { GUIDES, guidePath } from "../src/lib/guides.js";
import { LANDING_PAGES } from "../src/lib/landingPages.js";
import { PRODUCT_LINKS } from "../src/lib/productLinks.js";

const MIN_INBOUND = 3;
const LIVE = process.argv.includes("--live");
const SITE = (process.env.SITE_URL || "https://www.nickelbusbar.com").replace(/\/+$/, "");

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

const pages: Array<{ ctx: PageContext; path: string }> = [
  ...PRODUCT_LINKS.map((p) => ({ ctx: { kind: "product", slug: p.slug } as PageContext, path: `/product/${p.slug}` })),
  ...LANDING_PAGES.map((p) => ({ ctx: { kind: "landing", slug: p.slug } as PageContext, path: `/${p.slug}` })),
  ...GUIDES.map((g) => ({ ctx: { kind: "guide", slug: g.slug } as PageContext, path: guidePath(g.slug) })),
  ...CONTEXT_SLUGS.articles.map((slug) => ({ ctx: { kind: "blog", slug } as PageContext, path: `/blog/${slug}` })),
];

const exists = new Set<string>([
  ...PRODUCT_LINKS.map((p) => `/product/${encodeURIComponent(p.slug)}`),
  ...LANDING_PAGES.map((p) => `/${p.slug}`),
  ...GUIDES.map((g) => guidePath(g.slug)),
  ...CONTEXT_SLUGS.articles.map((slug) => `/blog/${slug}`),
]);

if (LIVE) {
  const rows = (await (await fetch(`${SITE}/api/blog-posts?limit=100`)).json()) as Array<{ slug: string }>;
  const live = new Set(rows.map((r) => r.slug));
  // The lithium guide is a page in the code, not a row, so the API will never list it.
  for (const slug of CONTEXT_SLUGS.articles) {
    if (slug !== "nickel-strips-lithium-batteries" && !live.has(slug)) fail(`article /blog/${slug} is not published`);
  }
}

const inbound = new Map<string, Set<string>>();
let totalLinks = 0;
const perKind: Record<string, number[]> = {};

for (const { ctx, path } of pages) {
  const blocks = contextualLinks(ctx);
  const seen = new Set<string>();
  const anchors = new Set<string>();
  let count = 0;
  for (const block of blocks) {
    for (const link of block.links) {
      count++;
      if (!exists.has(link.path)) fail(`${path} links to ${link.path}, which does not exist`);
      if (link.path === path) fail(`${path} links to itself`);
      if (seen.has(link.path)) fail(`${path} links to ${link.path} twice`);
      if (anchors.has(link.anchor.toLowerCase())) fail(`${path} uses the anchor "${link.anchor}" twice`);
      if (link.anchor.trim().length < 12) fail(`${path}: anchor "${link.anchor}" is too short to describe anything`);
      seen.add(link.path);
      anchors.add(link.anchor.toLowerCase());
      (inbound.get(link.path) ?? inbound.set(link.path, new Set()).get(link.path)!).add(path);
    }
  }
  totalLinks += count;
  (perKind[ctx.kind] ||= []).push(count);
  if (!count && ctx.kind !== "landing") fail(`${path} got no links at all`);
}

// Destinations: everything a source can point at. A page nothing points at is the bug.
const destinations = [
  ...CONTEXT_SLUGS.articles.map((s) => `/blog/${s}`),
  ...CONTEXT_SLUGS.guides.map((s) => guidePath(s)),
  ...CONTEXT_SLUGS.categories.map((s) => `/${s}`),
];
const counts = destinations.map((d) => [d, inbound.get(d)?.size ?? 0] as const).sort((a, b) => a[1] - b[1]);
for (const [d, n] of counts) if (n < MIN_INBOUND) fail(`${d} receives only ${n} contextual link(s); needs ${MIN_INBOUND}`);

console.log(`pages with links placed: ${pages.length}, links placed: ${totalLinks}`);
for (const [kind, arr] of Object.entries(perKind)) {
  console.log(`  ${kind.padEnd(8)} ${arr.length} pages, ${Math.min(...arr)}-${Math.max(...arr)} links each (avg ${(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)})`);
}
console.log("\nfewest inbound contextual links (articles, guides, categories):");
for (const [d, n] of counts.slice(0, 8)) console.log(`  ${String(n).padStart(3)}  ${d}`);
console.log(`most: ${counts.slice(-3).map(([d, n]) => `${d} (${n})`).join(", ")}`);

if (problems.length) {
  console.error(`\nFAILED: ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 40)) console.error(`  - ${p}`);
  process.exitCode = 1;
} else {
  console.log("\nPASSED: every link resolves, none is duplicated, and no destination is starved.");
}
