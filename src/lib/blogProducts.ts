/**
 * The products each article actually discusses, as internal links from the post to the catalogue.
 *
 * Why this exists, from measurement rather than theory. The Search Console export for
 * 2026-07-21 to 2026-10-20 shows 137 clicks across the site, and where they land is lopsided:
 *
 *   blog        32 URLs   95 clicks   69%
 *   homepage     1 URL    18 clicks
 *   calculator   1 URL    12 clicks
 *   landing     17 URLs    7 clicks
 *   product     12 URLs    5 clicks    3.6%
 *
 * The blog ranks well on technical questions — current carrying capacity sits at position 4.8,
 * fuse-type vs plain at 5.0 — while the supplier-intent queries the product pages exist for sit
 * at positions 29 to 48. The authority is real but it stops at the article. blogCta.ts already
 * sends a reader on to a landing page; nothing sends them to a product.
 *
 * So this is not "related posts" decoration. It is the one route from the pages that rank to
 * the pages that convert, and the anchor text is the product's own name, which is what tells a
 * search engine what the destination is for.
 *
 * Mappings are explicit per slug, and each one was checked against the published article rather
 * than guessed from its title: the fuse-type comparison mentions fuse 132 times and honeycomb
 * 18, the copper busbar piece mentions copper 98 times and busbar 84. A post that has not been
 * checked gets no block, because a link to a product the article never mentions is worse for a
 * reader than no link at all. Extend the map as more posts are verified.
 *
 * Names come from PRODUCT_LINKS, which scripts/generate-product-links.ts writes from the
 * database, so the anchor text here cannot drift from the catalogue.
 */

import { PRODUCT_LINKS, type ProductLink } from './productLinks.js';

/** Slug -> product slugs, most relevant first. Checked against the published article. */
const ARTICLE_PRODUCTS: Readonly<Record<string, readonly string[]>> = {
  // Covers fuse necks, honeycomb patterns, and the comparison against busbar and copper.
  'nickel-strip-current-carrying-capacity': [
    'ni-fuse-type-18650-2p-h-type-honeycomb',
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'Copper-Busbar',
  ],
  // The fuse-type comparison, across the cell formats it names: 18650, 21700, 32700.
  'fuse-type-vs-plain-nickel-strip': [
    'ni-fuse-type-18650-2p-h-type-honeycomb',
    'ni-fuse-type-18650-2p-zig-zag-honeycomb',
    'Plain-Nickel-Strips',
    'ni-fuse-type-21700-2p-h-type-double-fuse',
    'ni-fuse-type-32700-2p-zig-zag-honeycomb',
  ],
  // Strip against busbar, so both sides of that comparison are linked.
  'nickel-strip-vs-nickel-busbar-differences': [
    'Copper-Busbar',
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
  ],
  // Nickel against copper for interconnects, across 18650, 21700 and 32650.
  'nickel-strip-vs-copper-busbar-battery-interconnects': [
    'Copper-Busbar',
    'Plain-Nickel-Strips',
    'ni-21700-2p-h-type-v3',
    'ni-32650-2p-h-type',
  ],
  // The 32 mm LiFePO4 formats. The article names all three in its closing section and is the
  // only post written about these cells rather than mentioning them in passing.
  'nickel-strip-32700-32650-lifepo4-battery-pack': [
    'ni-32650-2p-h-type',
    'ni-fuse-type-32700-2p-zig-zag-honeycomb',
    'Plain-Nickel-Strips',
  ],
  // Stationary storage. Busbar sits high here, unlike the 32700 post: the article's argument is
  // that a 48 V pack's series links carry full load current and suit a bolted joint, so it names
  // busbar alongside the strip rather than treating it as the alternative.
  'nickel-strip-solar-inverter-bess-battery-packs': [
    'ni-32650-2p-h-type',
    'Copper-Busbar',
    'Plain-Nickel-Strips',
  ],
};

const BY_SLUG = new Map(PRODUCT_LINKS.map((product) => [product.slug, product]));

export const BLOG_PRODUCTS_HEADING = 'Products covered in this article';

/**
 * The products for an article, or an empty list when the post has not been mapped.
 *
 * A slug in the map that no longer exists in the catalogue is skipped rather than rendered as a
 * dead link — the catalogue is generated from the database and a product can be removed.
 */
export function blogProductsFor(slug: string): ProductLink[] {
  const slugs = ARTICLE_PRODUCTS[slug];
  if (!slugs) return [];
  return slugs.map((s) => BY_SLUG.get(s)).filter((p): p is ProductLink => Boolean(p));
}
