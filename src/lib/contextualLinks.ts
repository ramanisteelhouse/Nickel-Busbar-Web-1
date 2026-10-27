/**
 * Contextual internal links: from a product, landing page, guide or article to the pages a reader
 * of it would actually want next, with anchor text that says what the destination is.
 *
 * Why this exists, from a crawl of the live snapshots on 2026-10-27 rather than a hunch:
 *
 *   - Three landing pages (the exporter page and both strip-size pages) and one article had no
 *     internal link pointing at them from any page, and five more pages had one or two.
 *   - Product pages linked to other products and the homepage, and to nothing else: no guide, no
 *     article, no category. The sixteen product links on each were the same list twice.
 *   - Landing pages linked to products and to each other (the state pages) but never to a guide
 *     or an article. The four guides had four inbound links each, all from each other and the hub.
 *
 * Links go in one direction only if nobody writes the other. The articles rank and the product
 * pages convert, so the articles and guides already link down to products (blogProducts,
 * blogCta); this module is the route back up and across.
 *
 * How a link is chosen. Every page and every destination carries a few topic tags, and a page
 * links to the destinations that share the most tags with it. That keeps each link defensible,
 * "this page is about fuse-type strip, so it links to the fuse-type comparison", without a
 * hand-written list per page. Ties are broken by a stable hash of the pair, not by list order,
 * so the same few destinations do not collect every link while the rest stay orphaned.
 *
 * What it will not do: a post with no entry in ARTICLE_TOPICS gets no links, the rule blogProducts
 * already follows. A link to something the page does not discuss is worse than no link.
 *
 * Plain data and pure functions, no React and no database: seoSnapshot.ts renders the result as
 * HTML for crawlers and ContextualLinks.tsx renders the same result for readers, so the two
 * cannot disagree. Product slugs come from PRODUCT_LINKS, which is generated from the catalogue,
 * so a removed product is never linked.
 */

import { GUIDES, guidePath } from './guides.js';
import { STATE_LANDING_PAGES } from './landingPages.js';
import { PRODUCT_LINKS } from './productLinks.js';

export type ContextLink = { path: string; anchor: string };
export type ContextBlock = { heading: string; links: ContextLink[] };

export type PageContext =
  | { kind: 'product'; slug: string }
  | { kind: 'landing'; slug: string }
  | { kind: 'guide'; slug: string }
  | { kind: 'blog'; slug: string };

type Topic =
  | 'h-type' | 'zig-zag' | 'fuse' | 'plain' | 'busbar' | 'custom'
  | 'sizing' | 'welding' | 'purity' | 'buying' | 'export' | 'cells'
  | 'storage' | 'ev' | 'material' | 'handling';

type Destination = { path: string; anchor: string; topics: readonly Topic[] };

/** The guides in src/lib/guides.ts. Anchor is the guide's own title, which already says what it is. */
const GUIDE_TOPICS: Readonly<Record<string, readonly Topic[]>> = {
  'what-is-nickel-strip': ['plain', 'buying', 'cells', 'material'],
  'nickel-strip-overheating-causes': ['fuse', 'sizing', 'welding'],
  'how-to-size-nickel-strip-for-battery-pack': ['sizing', 'cells', 'h-type', 'zig-zag'],
  'nickel-strip-current-capacity-diagrams': ['sizing', 'fuse'],
};

const GUIDE_DESTINATIONS: readonly Destination[] = GUIDES.map((guide) => ({
  path: guidePath(guide.slug),
  anchor: guide.title,
  topics: GUIDE_TOPICS[guide.slug] ?? [],
}));

/**
 * The articles, with an anchor written for a reader who has not seen the title. Tags were
 * assigned from what each article is about, not from its slug. The last entry is the one article
 * that is a page in the code rather than a row in the blog table.
 */
const ARTICLES: ReadonlyArray<{ slug: string; anchor: string; topics: readonly Topic[] }> = [
  { slug: 'nickel-strip-solar-inverter-bess-battery-packs', anchor: 'Nickel strip for solar and home inverter battery packs', topics: ['storage', 'busbar', 'cells'] },
  { slug: 'nickel-strip-32700-32650-lifepo4-battery-pack', anchor: 'Nickel strip for 32700 and 32650 LiFePO4 packs: what to order', topics: ['cells', 'storage', 'h-type'] },
  { slug: 'nickel-strip-e-rickshaw-e-bike-battery-packs-india', anchor: 'Nickel strip for e-rickshaw and e-bike battery packs in India', topics: ['ev', 'zig-zag', 'cells'] },
  { slug: 'how-to-read-nickel-strip-material-test-certificate', anchor: 'How to read a nickel strip material test certificate', topics: ['purity', 'buying', 'material'] },
  { slug: 'nickel-strip-sample-before-bulk-order', anchor: 'Testing a nickel strip sample before a bulk order', topics: ['buying', 'purity'] },
  { slug: 'nickel-strip-price-per-kg-india', anchor: 'Nickel strip price per kg in India and what moves it', topics: ['buying'] },
  { slug: 'nickel-strip-minimum-order-quantity', anchor: 'Nickel strip minimum order quantity: sourcing small batches', topics: ['buying'] },
  { slug: '18650-vs-21700-nickel-strip-cell-format', anchor: '18650 vs 21700 nickel strip: what changes with the cell format', topics: ['cells', 'h-type'] },
  { slug: 'nickel-strip-storage-handling-shelf-life', anchor: 'Storing and handling nickel strip to prevent oxidation', topics: ['handling', 'welding'] },
  { slug: 'nickel-strip-vs-nickel-busbar-differences', anchor: 'Nickel strip vs nickel busbar: differences and when to use each', topics: ['busbar', 'plain'] },
  { slug: 'nickel-strip-pricing-guide-battery-pack-orders', anchor: 'What determines nickel strip cost on bulk battery pack orders', topics: ['buying', 'sizing'] },
  { slug: 'zig-zag-vs-h-type-nickel-strip', anchor: 'Zig-zag vs H-type nickel strip: choosing the interconnect pattern', topics: ['zig-zag', 'h-type', 'cells'] },
  { slug: '2p-vs-3p-vs-4p-nickel-strip-interconnect-design', anchor: '2P vs 3P vs 4P nickel strip: how parallel cell count changes the design', topics: ['h-type', 'cells', 'sizing'] },
  { slug: 'nickel-200-vs-nickel-201-battery-strip', anchor: 'Nickel 200 vs Nickel 201 for battery-grade strip', topics: ['purity', 'material', 'welding'] },
  { slug: 'export-documentation-guide-nickel-strips-india', anchor: 'Export documentation for sourcing nickel strip from India', topics: ['export', 'buying'] },
  { slug: 'nickel-strip-surface-finish-guide', anchor: 'Nickel strip surface finish: bright, matte and nickel-plated', topics: ['material', 'welding', 'handling'] },
  { slug: 'common-nickel-strip-defects-battery-manufacturing', anchor: 'Common nickel strip defects and how to avoid them', topics: ['welding', 'purity', 'handling'] },
  { slug: 'how-to-choose-nickel-strip-manufacturer-india', anchor: 'How to choose a nickel strip manufacturer in India: a buyer\'s checklist', topics: ['buying', 'purity'] },
  { slug: 'nickel-strip-vs-copper-busbar-battery-interconnects', anchor: 'Nickel strip vs copper busbar for battery interconnects', topics: ['busbar', 'material'] },
  { slug: 'battery-spot-welding-tips-nickel-strip', anchor: 'Spot welding tips for nickel strip: a clean, low-resistance weld', topics: ['welding', 'handling'] },
  { slug: 'fuse-type-vs-plain-nickel-strip', anchor: 'Fuse-type vs plain nickel strip: when a pack needs a built-in fuse', topics: ['fuse', 'plain', 'sizing'] },
  { slug: 'nickel-strip-current-carrying-capacity', anchor: 'Nickel strip current carrying capacity for safe pack design', topics: ['sizing', 'fuse'] },
  { slug: 'nickel-strip-thickness-guide', anchor: 'Nickel strip thickness guide: choosing the right gauge', topics: ['sizing', 'plain'] },
  { slug: 'pure-nickel-strip-vs-nickel-plated-steel-strip', anchor: 'Pure nickel strip vs nickel-plated steel strip', topics: ['material', 'purity'] },
  { slug: 'nickel-strip-manufacturer-uk-battery-industry', anchor: 'Nickel strip manufacturer for the UK battery industry', topics: ['export', 'purity'] },
  { slug: 'nickel-strips-for-electric-vehicles', anchor: 'Nickel strips for electric vehicle battery packs', topics: ['ev', 'cells', 'purity'] },
  { slug: 'sourcing-custom-stamped-nickel-busbars', anchor: 'Sourcing custom stamped nickel busbars for bulk battery assembly', topics: ['busbar', 'custom'] },
  { slug: 'why-nickel-purity-matters', anchor: 'Why nickel purity matters in energy storage systems', topics: ['purity', 'storage', 'material', 'buying'] },
  { slug: '5-nickel-strip-buying-mistakes', anchor: 'Five nickel strip buying mistakes that cost pack makers money', topics: ['buying', 'purity'] },
  { slug: 'nickel-strip-weight-per-metre', anchor: 'Nickel strip weight per metre: chart, formula and kg-to-metre conversion', topics: ['sizing', 'plain', 'buying'] },
  { slug: 'nickel-strips-lithium-batteries', anchor: 'Nickel strips for lithium-ion batteries: a manufacturer guide', topics: ['ev', 'storage', 'purity', 'cells'] },
];

const ARTICLE_DESTINATIONS: readonly Destination[] = ARTICLES.map((article) => ({
  path: `/blog/${article.slug}`,
  anchor: article.anchor,
  topics: article.topics,
}));

const ARTICLE_TOPICS = new Map(ARTICLES.map((article) => [`/blog/${article.slug}`, article.topics]));

/** Category and trade pages worth linking to. The state pages are linked enough already. */
const CATEGORY_DESTINATIONS: readonly (Destination & { slug: string })[] = [
  { slug: 'h-type-nickel-strip', path: '/h-type-nickel-strip', anchor: 'H-type nickel strip for 2P, 3P and 4P battery packs', topics: ['h-type', 'fuse', 'zig-zag', 'cells'] },
  { slug: 'nickel-strip-wholesaler-and-distributor', path: '/nickel-strip-wholesaler-and-distributor', anchor: 'Nickel strip wholesaler and distributor, from a 5 kg order', topics: ['buying', 'plain', 'custom', 'busbar'] },
  { slug: 'nickel-strip-exporter-india', path: '/nickel-strip-exporter-india', anchor: 'Nickel strip and busbar exporter in India', topics: ['export', 'buying', 'busbar'] },
  { slug: 'nickel-strip-for-battery-pack-welding', path: '/nickel-strip-for-battery-pack-welding', anchor: 'Nickel strip for battery pack spot welding', topics: ['welding', 'handling'] },
  { slug: 'nickel-strip-for-lithium-ion-battery-manufacturers', path: '/nickel-strip-for-lithium-ion-battery-manufacturers', anchor: 'Nickel strip for lithium-ion battery manufacturers', topics: ['purity', 'ev', 'storage', 'cells'] },
  { slug: 'nickel-busbar-for-battery-applications', path: '/nickel-busbar-for-battery-applications', anchor: 'Nickel busbar for battery applications', topics: ['busbar', 'custom', 'material'] },
  { slug: 'nickel-strip-manufacturer-in-mumbai', path: '/nickel-strip-manufacturer-in-mumbai', anchor: 'Nickel strip manufacturer and supplier in Mumbai', topics: ['buying', 'export', 'purity', 'busbar'] },
  { slug: 'pure-nickel-strip-0-15mm-x-10mm', path: '/pure-nickel-strip-0-15mm-x-10mm', anchor: '0.15 mm × 10 mm pure nickel strip', topics: ['sizing', 'plain', 'cells', 'h-type'] },
  { slug: 'pure-nickel-strip-0-20mm-x-15mm', path: '/pure-nickel-strip-0-20mm-x-15mm', anchor: '0.20 mm × 15 mm pure nickel strip', topics: ['sizing', 'plain', 'cells'] },
];

const CATEGORY_TOPICS = new Map(CATEGORY_DESTINATIONS.map((page) => [page.slug, page.topics]));
/** The ten state pages: a buyer there is choosing a supplier, so the tags are about buying. */
const STATE_TOPICS: readonly Topic[] = ['buying', 'purity'];

/* ----- Products: topics and anchors are derived from the slug, which is stable. ----- */

type ProductFacts = { slug: string; topics: Topic[]; keys: string[]; anchor: string };

const FIXED_PRODUCT_ANCHORS: Readonly<Record<string, string>> = {
  'Plain-Nickel-Strips': 'Plain pure nickel strip in any width and thickness',
  'Copper-Busbar': 'Copper busbar for battery module connections',
  'ni-customizable': 'Custom nickel strip made to your drawing',
  'ni-custom-custom': 'Custom-cut nickel strip to your size',
};

/** Slug -> what the product is. Nothing here is read from the database. */
function productFacts(slug: string): ProductFacts {
  const s = slug.toLowerCase();
  const format = s.match(/(18650|21700|32650|32700)/)?.[1];
  const parallel = s.match(/(\d)p-/)?.[1];
  // "no-fuse" is in the slug of the plain zig-zag product, so a bare /fuse/ would call it fuse-type.
  const fuse = /fuse|honeycomb/.test(s.replace(/no-fuse/g, ''));
  const h = /h-type/.test(s);
  const zig = /zig-zag/.test(s);

  const topics: Topic[] = [];
  const keys: string[] = [];
  if (fuse) topics.push('fuse');
  if (h) topics.push('h-type');
  if (zig) topics.push('zig-zag');
  if (format) topics.push('cells');
  if (s === 'plain-nickel-strips') topics.push('plain', 'sizing', 'welding', 'buying', 'handling');
  if (s === 'copper-busbar') topics.push('busbar', 'material', 'buying');
  if (s.startsWith('ni-custom')) topics.push('custom');
  if (topics.some((t) => t === 'h-type' || t === 'zig-zag' || t === 'fuse')) topics.push('sizing', 'handling', 'buying');
  // Siblings are ranked on these, separately from the tags above: same pattern, same cell format.
  if (fuse) keys.push('fuse');
  if (h) keys.push('h-type');
  if (zig) keys.push('zig-zag');
  if (format) keys.push(`fmt-${format}`);
  if (parallel) keys.push(`np-${parallel}`);

  let anchor = FIXED_PRODUCT_ANCHORS[slug];
  if (!anchor) {
    const words = [
      parallel ? `${parallel}P` : '',
      fuse ? 'fuse-type' : '',
      h ? 'H-type' : '',
      zig ? 'zig-zag' : '',
      /honeycomb/.test(s) ? 'honeycomb' : '',
      /double-fuse/.test(s) ? 'double-fuse' : '',
      /precision/.test(s) ? 'precision' : '',
    ].filter(Boolean);
    anchor = `${words.join(' ')} nickel strip${format ? ` for ${format} cells` : ''}`.trim();
  }
  return { slug, topics, keys, anchor };
}

const PRODUCT_FACTS: readonly ProductFacts[] = PRODUCT_LINKS.map((product) => productFacts(product.slug));
/** Where a product with no pattern or cell format (plain, busbar, custom) points instead. */
const PRODUCT_FILLERS = ['Plain-Nickel-Strips', 'ni-customizable', 'Copper-Busbar', 'ni-18650-2p-h-type'];

/* ----- Selection ----- */

/** FNV-1a. Stable across runs and machines, which a snapshot cache needs. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const overlap = (a: readonly string[], b: readonly string[]): number => a.filter((x) => b.includes(x)).length;

type Page = { ctx: PageContext; path: string; topics: readonly Topic[] };

/** How many links each kind of page carries, per block. */
const WANTS = {
  product: { products: 4, guides: 2, articles: 4, categories: 2 },
  landing: { products: 0, guides: 2, articles: 4, categories: 3 },
  guide: { products: 0, guides: 0, articles: 4, categories: 3 },
  blog: { products: 0, guides: 2, articles: 0, categories: 2 },
} as const;

const productPath = (slug: string) => `/product/${encodeURIComponent(slug)}`;

/** Every page this module places links on, in the fixed order the assignment is made in. */
function allPages(): Page[] {
  const pages: Page[] = [];
  for (const slug of Object.keys(GUIDE_TOPICS)) {
    pages.push({ ctx: { kind: 'guide', slug }, path: guidePath(slug), topics: GUIDE_TOPICS[slug] });
  }
  for (const article of ARTICLES) {
    pages.push({ ctx: { kind: 'blog', slug: article.slug }, path: `/blog/${article.slug}`, topics: article.topics });
  }
  for (const category of CATEGORY_DESTINATIONS) {
    pages.push({ ctx: { kind: 'landing', slug: category.slug }, path: category.path, topics: category.topics });
  }
  for (const state of STATE_LANDING_PAGES) {
    pages.push({ ctx: { kind: 'landing', slug: state.path.slice(1) }, path: state.path, topics: STATE_TOPICS });
  }
  for (const product of PRODUCT_FACTS) {
    pages.push({ ctx: { kind: 'product', slug: product.slug }, path: productPath(product.slug), topics: product.topics });
  }
  return pages;
}

const linkOf = (d: { path: string; anchor: string }): ContextLink => ({ path: d.path, anchor: d.anchor });

let assignment: Map<string, ContextBlock[]> | null = null;

/**
 * Chooses every page's links in one pass over the whole site, so the load can be shared out.
 *
 * Picking each page's best matches independently sent 48 links to the most general guide and none
 * to eight articles, because a few destinations match nearly everything. Here a destination's
 * score is its topic overlap with the page, less the number of links it has been given so far:
 * relevance still decides what is eligible and dominates the choice, but among equally good
 * matches the least-linked one wins. The result is fixed, since the order and the tie-break are.
 */
function buildAssignment(): Map<string, ContextBlock[]> {
  const load = new Map<string, number>();
  const result = new Map<string, ContextBlock[]>();

  const choose = <T extends { path: string }>(
    from: readonly T[],
    relevance: (item: T) => number,
    page: Page,
    limit: number,
    taken: Set<string>
  ): T[] => {
    const chosen = from
      .filter((item) => item.path !== page.path && !taken.has(item.path))
      .map((item) => ({ item, relevance: relevance(item) }))
      .filter((entry) => entry.relevance > 0)
      .map((entry) => ({ ...entry, rank: entry.relevance * 2 - (load.get(entry.item.path) ?? 0) }))
      .sort((a, b) => b.rank - a.rank || hash(`${page.path}|${a.item.path}`) - hash(`${page.path}|${b.item.path}`))
      .slice(0, limit)
      .map((entry) => entry.item);
    for (const item of chosen) {
      taken.add(item.path);
      load.set(item.path, (load.get(item.path) ?? 0) + 1);
    }
    return chosen;
  };

  const productDestinations = PRODUCT_FACTS.map((p) => ({ ...p, path: productPath(p.slug) }));

  for (const page of allPages()) {
    const wants = WANTS[page.ctx.kind];
    const taken = new Set<string>();
    const blocks: ContextBlock[] = [];
    const topicScore = (d: { topics: readonly Topic[] }) => overlap(d.topics, page.topics);

    if (wants.products && page.ctx.kind === 'product') {
      const me = productFacts(page.ctx.slug);
      let siblings = choose(productDestinations, (p) => overlap(p.keys, me.keys), page, wants.products, taken);
      if (siblings.length < 3) {
        const fill = productDestinations
          .filter((p) => PRODUCT_FILLERS.includes(p.slug) && p.path !== page.path && !taken.has(p.path))
          .slice(0, 4 - siblings.length);
        for (const p of fill) taken.add(p.path);
        siblings = [...siblings, ...fill];
      }
      if (siblings.length) blocks.push({ heading: 'Compare other patterns and cell formats', links: siblings.map(linkOf) });
    }
    if (wants.guides) {
      const guides = choose<Destination>(GUIDE_DESTINATIONS, topicScore, page, wants.guides, taken);
      if (guides.length) blocks.push({ heading: 'Guides to read before you order', links: guides.map(linkOf) });
    }
    if (wants.articles) {
      const articles = choose<Destination>(ARTICLE_DESTINATIONS, topicScore, page, wants.articles, taken);
      if (articles.length) blocks.push({ heading: 'Related articles', links: articles.map(linkOf) });
    }
    if (wants.categories) {
      const categories = choose<Destination>(CATEGORY_DESTINATIONS, topicScore, page, wants.categories, taken);
      if (categories.length) blocks.push({ heading: 'Related categories', links: categories.map(linkOf) });
    }
    result.set(page.path, blocks);
  }
  return result;
}

/** Routes match case-insensitively (/product/plain-nickel-strips works), so the lookup does too. */
const PRODUCT_SLUG_BY_LOWERCASE = new Map(PRODUCT_LINKS.map((product) => [product.slug.toLowerCase(), product.slug]));

const pathOf = (ctx: PageContext): string => {
  const lower = ctx.slug.toLowerCase();
  switch (ctx.kind) {
    case 'product': return productPath(PRODUCT_SLUG_BY_LOWERCASE.get(lower) ?? ctx.slug);
    case 'landing': return `/${lower}`;
    case 'guide': return guidePath(lower);
    case 'blog': return `/blog/${lower}`;
  }
};

/**
 * The blocks of links for one page, in the order they should render. `exclude` is for links the
 * page already carries (its call to action, the products it names), so none appears twice.
 * Returns an empty list for a page this module has not been told about, which is how a new blog
 * post behaves until it has been read and given topics.
 */
export function contextualLinks(ctx: PageContext, exclude: readonly string[] = []): ContextBlock[] {
  assignment ??= buildAssignment();
  const blocks = assignment.get(pathOf(ctx)) ?? [];
  if (!exclude.length) return blocks;
  const skip = new Set(exclude);
  return blocks
    .map((block) => ({ ...block, links: block.links.filter((link) => !skip.has(link.path)) }))
    .filter((block) => block.links.length);
}

/** The slugs this module knows, for the checks in scripts/check-contextual-links.ts. */
export const CONTEXT_SLUGS = {
  guides: Object.keys(GUIDE_TOPICS),
  articles: ARTICLES.map((article) => article.slug),
  categories: CATEGORY_DESTINATIONS.map((page) => page.slug),
  products: PRODUCT_LINKS.map((product) => product.slug),
};
