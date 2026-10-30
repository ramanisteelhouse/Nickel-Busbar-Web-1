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

  // ---------------------------------------------------------------------------------------
  // Checked 2026-10-30 by counting product terms in each published body and FAQ, boundary-safe
  // so that "explain" is not "plain", "customer" is not "custom" and "confuse" is not "fuse" -
  // an earlier pass without those boundaries over-counted all three and would have produced
  // mappings resting on words the articles never used. Counts quoted below are from that pass.
  //
  // Six posts are deliberately absent, listed under UNMAPPED at the foot of this file.
  // ---------------------------------------------------------------------------------------

  // Zig-zag 4 and H-type 4 across both vehicle cell ranges: 18650/21700 for e-bikes, 32650/32700
  // for e-rickshaws. The article's own argument is that vibration favours zig-zag, so that part
  // leads.
  'nickel-strip-e-rickshaw-e-bike-battery-packs-india': [
    'ni-18650-2p-zig-zag-no-fuse-type',
    'ni-32650-2p-h-type',
    'ni-21700-2p-h-type-v3',
    'ni-fuse-type-32700-2p-zig-zag-honeycomb',
  ],
  // Prices plain stock against patterned: plain 4, H-type 4, zig-zag 3, fuse 3, and no cell
  // format named anywhere - so the links are the forms being priced, not a format.
  'nickel-strip-price-per-kg-india': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'ni-18650-2p-zig-zag-no-fuse-type',
  ],
  // The widest spread of any post, because MOQ is explained across the whole catalogue: 18650 4,
  // 21700 2, 32650 2, 32700 2, H-type 5, zig-zag 4, honeycomb 3, fuse 4, custom 2. A
  // representative four rather than a list of sixteen.
  'nickel-strip-minimum-order-quantity': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'ni-21700-2p-h-type-v3',
    'ni-customizable',
  ],
  // 18650 11 and 21700 16, with 2P/3P/4P three times each: both formats at both ends of the
  // parallel-count range, which is what changing cell format actually costs you.
  '18650-vs-21700-nickel-strip-cell-format': [
    'ni-18650-2p-h-type',
    'ni-21700-2p-h-type-v3',
    'ni-18650-4p-h-type',
    'ni-21700-4p-h-type',
  ],
  // Fuse 10 is the highest in the set outside the fuse comparison itself, with plain 6, H-type 6,
  // zig-zag 4 and honeycomb 3: the article prices a fused pattern against plain stock.
  'nickel-strip-pricing-guide-battery-pack-orders': [
    'Plain-Nickel-Strips',
    'ni-fuse-type-18650-2p-h-type-honeycomb',
    'ni-18650-2p-h-type',
    'ni-customizable',
  ],
  // The pattern comparison, and the counts say so plainly: zig-zag 40, H-type 38, fuse 18,
  // honeycomb 3. Both patterns linked in both their plain and fused forms.
  'zig-zag-vs-h-type-nickel-strip': [
    'ni-18650-2p-zig-zag-no-fuse-type',
    'ni-18650-2p-h-type',
    'ni-fuse-type-18650-2p-zig-zag-honeycomb',
    'ni-fuse-type-18650-2p-h-type-honeycomb',
  ],
  // 4P 31, 2P 26, 3P 20 - the ladder the article is about, on the format it uses throughout
  // (18650 9, 21700 9). Custom 6 is real: it closes on when to go beyond a stock stamping.
  '2p-vs-3p-vs-4p-nickel-strip-interconnect-design': [
    'ni-18650-2p-h-type',
    'ni-18650-3p-h-type',
    'ni-18650-4p-h-type',
    'ni-21700-4p-h-type',
    'ni-customizable',
  ],
  // An alloy comparison rather than a format one: no cell format passes 1, while H-type 6,
  // plain 5, fuse 5 and honeycomb 4 describe the forms the alloy is supplied in.
  'nickel-200-vs-nickel-201-battery-strip': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'ni-fuse-type-18650-2p-h-type-honeycomb',
  ],
  // Custom 5 and busbar 2 in 407 words: the export paperwork is written around bulk plain stock,
  // busbar and made-to-drawing work, which is what actually ships in a container.
  'export-documentation-guide-nickel-strips-india': [
    'Plain-Nickel-Strips',
    'Copper-Busbar',
    'ni-customizable',
  ],
  // Fuse 8 in 494 words, and the defects described are fuse-neck ones. Plain stock is linked as
  // the comparison the article keeps returning to.
  'common-nickel-strip-defects-battery-manufacturing': [
    'ni-fuse-type-18650-2p-h-type-honeycomb',
    'Plain-Nickel-Strips',
  ],
  // Modest but real: 18650 3, 21700 2, 32650 1, busbar 2. Welding parameters are given for the
  // strip being welded, so the links are the stock a reader would be welding.
  'battery-spot-welding-tips-nickel-strip': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'ni-21700-2p-h-type-v3',
  ],
  // H-type 10, 18650 8, busbar 6, custom 6, fuse 6, 21700 4, 32650 3. The busbar links are not
  // incidental: the article hands 0.30-0.50 mm explicitly to "busbar-grade applications".
  'nickel-strip-thickness-guide': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'ni-21700-2p-h-type-v3',
    'Copper-Busbar',
    'ni-customizable',
  ],
  // Busbar 17 and copper 5, because the article covers interconnects and busbars together, and
  // custom 9. It names no cell format at all, so the links are material-level, not format-level.
  'pure-nickel-strip-vs-nickel-plated-steel-strip': [
    'Plain-Nickel-Strips',
    'Copper-Busbar',
    'ni-customizable',
  ],
  // Reads as a catalogue overview for a market, and lists its own range in the body: "Pure Nickel
  // Strips, H-Type Nickel Strips, Fuse Type Nickel Strips, Copper Busbars, and Custom Battery
  // Interconnect Components". Custom 14, busbar 8, copper 4, H-type 2, fuse 2. Linked to match.
  'nickel-strip-manufacturer-uk-battery-industry': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'ni-fuse-type-18650-2p-h-type-honeycomb',
    'Copper-Busbar',
    'ni-customizable',
  ],
  // Same shape as the UK post: custom 12, busbar 8, copper 8, and its own list names "Pure Nickel
  // Strips, Copper Strips, Custom Busbars". 21700 is included as the format EV packs moved to.
  'nickel-strips-for-electric-vehicles': [
    'Plain-Nickel-Strips',
    'Copper-Busbar',
    'ni-customizable',
    'ni-21700-2p-h-type-v3',
  ],
  // Busbar 15 and custom 12 in a post about stamped busbars to drawing - the clearest match in
  // the set. Plain stock trails as the material those busbars are stamped from.
  'sourcing-custom-stamped-nickel-busbars': [
    'Copper-Busbar',
    'ni-customizable',
    'Plain-Nickel-Strips',
  ],
  // 18650 5, 21700 3, and "pure nickel strip" three times: the mistakes are about buying the
  // wrong material and the wrong format, so both are linked.
  '5-nickel-strip-buying-mistakes': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
    'ni-21700-2p-h-type-v3',
  ],
  // A weight chart covering plain stock and H-type patterns: H-type 4, "pure nickel strip" 2.
  // Nothing else in the catalogue is weighed, so nothing else is linked.
  'nickel-strip-weight-per-metre': [
    'Plain-Nickel-Strips',
    'ni-18650-2p-h-type',
  ],
};

/**
 * Posts deliberately left without a block, and why.
 *
 * Each was checked on 2026-10-30 and carries no usable product evidence: not one cell format,
 * pattern, fuse, busbar or plain-stock mention between them beyond a stray single hit. They are
 * about process and paperwork rather than parts, and this file's rule is that a link to a product
 * the article never mentions is worse for a reader than no link at all.
 *
 *   how-to-read-nickel-strip-material-test-certificate  672 words, no product terms
 *   nickel-strip-sample-before-bulk-order               612 words, no product terms
 *   nickel-strip-storage-handling-shelf-life            622 words, no product terms
 *   nickel-strip-surface-finish-guide                   435 words, zero across every term
 *   how-to-choose-nickel-strip-manufacturer-india       422 words, no product terms
 *   why-nickel-purity-matters                           781 words, no product terms
 *
 * The honest fix for these is editorial — give the article a paragraph that names the product it
 * is really about — not a mapping bolted on here.
 */
export const UNMAPPED_BY_DESIGN: readonly string[] = [
  'how-to-read-nickel-strip-material-test-certificate',
  'nickel-strip-sample-before-bulk-order',
  'nickel-strip-storage-handling-shelf-life',
  'nickel-strip-surface-finish-guide',
  'how-to-choose-nickel-strip-manufacturer-india',
  'why-nickel-purity-matters',
];

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
