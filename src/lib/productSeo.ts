// Search phrases a particular product page should rank for beyond its own product name.
//
// Google indexes the *rendered* page, so a target phrase only earns anything if it appears in
// copy a visitor can actually read. Everything here therefore feeds one visible block that
// both the SSR snapshot (seoSnapshot.ts) and the React page (ProductDetailPage.tsx) render:
// putting a phrase in <meta name="keywords"> alone does nothing at all for Google, and putting
// it only in the crawler snapshot would show search engines text real visitors never see.

export type ProductKeywordBlock = {
  /** Rendered as an <h2> above the copy. Phrased as the search query itself. */
  heading: string;
  /** Overrides the generic product meta description. Supports the same placeholders. */
  metaDescription: string;
  /** Visible copy. `{name}` and `{price}` are filled from the live product record. */
  paragraphs: string[];
  /** Appended to this page's <meta name="keywords">. */
  keywords: string[];
};

export const PRODUCT_KEYWORD_BLOCKS: Record<string, ProductKeywordBlock> = {
  // Already ranks first for "Ni Fuse type 21700"; this targets the commercial query the same
  // product answers. The phrase appears twice (heading + opening sentence) and once in the
  // photo's alt text - enough to be unambiguous, short of the repetition Google reads as
  // stuffing.
  'ni-fuse-type-21700-2p-h-type-double-fuse': {
    heading: 'H Type Nickel Strips Price',
    metaDescription:
      '{name}: double-fuse H type nickel strip for 21700 battery packs. H type nickel strips price {price} per kg from Ramani Steel House, Mumbai.',
    paragraphs: [
      'The H type nickel strips price for {name} is {price} per kg, the standard rate for this double-fuse 21700 strip in pure nickel.',
      'Rates move with thickness, width, pitch and order quantity, so bulk and export lots are quoted separately. Send your pack drawing or cell layout and Ramani Steel House will quote your exact H type nickel strip.',
    ],
    keywords: [
      'H Type Nickel Strips Price',
      'H Type Nickel Strip',
      '21700 H Type Nickel Strip Price',
      'Nickel Fuse Strip Price',
      'Ni Fuse Type 21700',
    ],
  },
};

export function getProductKeywordBlock(slug?: string | null): ProductKeywordBlock | null {
  const cleanSlug = slug?.trim();
  return (cleanSlug && PRODUCT_KEYWORD_BLOCKS[cleanSlug]) || null;
}

/** The `seo_*` columns on public.products. All nullable: a product need not target a phrase. */
export type ProductSeoColumns = {
  slug?: string | null;
  seo_heading?: string | null;
  seo_meta_description?: string | null;
  seo_paragraphs?: string[] | null;
  seo_keywords?: string[] | null;
};

const cleanList = (value: string[] | null | undefined): string[] =>
  Array.isArray(value) ? value.map((entry) => entry?.trim()).filter((entry): entry is string => !!entry) : [];

/**
 * The keyword block for a product, preferring what the database says.
 *
 * The `seo_*` columns are the editable source of truth, so SEO copy can be changed per product
 * without a deploy. PRODUCT_KEYWORD_BLOCKS above stays as the fallback: it covers a product
 * whose columns are empty, and it keeps working on a database where the columns do not exist
 * yet (a `select p.*` simply returns no such fields, and every check below is undefined-safe).
 *
 * A heading is the minimum — it is what the visible <h2> renders — so a row with only stray
 * keywords and no heading falls back rather than publishing a block with no copy in it.
 */
export function resolveProductKeywordBlock(product: ProductSeoColumns): ProductKeywordBlock | null {
  const heading = product.seo_heading?.trim();
  if (!heading) return getProductKeywordBlock(product.slug);

  const paragraphs = cleanList(product.seo_paragraphs);
  const keywords = cleanList(product.seo_keywords);
  const metaDescription = product.seo_meta_description?.trim();
  const fallback = getProductKeywordBlock(product.slug);

  return {
    heading,
    // An empty meta description means "no override"; keywordMetaDescription() returning the
    // generic product description is better than publishing an empty one.
    metaDescription: metaDescription || fallback?.metaDescription || '',
    paragraphs: paragraphs.length ? paragraphs : fallback?.paragraphs ?? [],
    keywords: keywords.length ? keywords : fallback?.keywords ?? [],
  };
}

/**
 * The <title> for a product page: the target phrase alone when the product has one.
 *
 * Not `"{name} | {heading}"`. Product names here run to 42 characters ("Ni 18650 2P H-Type
 * Nickel Strip (ASTM B16)"), so pairing them pushed the title to 86 — well past the 50-60
 * characters search engines render, and with the phrase the page is trying to rank for sitting
 * in the half that gets truncated. The headings are 40-51 characters on their own and already
 * contain the substantive part of the name, and the full name still leads the page as its H1.
 */
/** Search engines render roughly this much of a <title> before truncating it. */
const TITLE_MAX = 60;

/**
 * Suffixes for a product with no keyword block, longest first.
 *
 * "Nickel Strips Manufacturer" was the only option before, and on a name like "Ni 18650 2P
 * H-Type Nickel Strip (ASTM B16)" it pushed the title to 71 characters - so the suffix, which
 * is the part carrying the commercial intent, was the part search engines cut off. Trying
 * progressively shorter suffixes keeps a buyer-role word in the visible half of every title.
 *
 * "Exporter" leads because overseas buyers search by role, and it is the role that
 * differentiates: plenty of Indian listings say "manufacturer", far fewer rank for "exporter".
 */
const TITLE_SUFFIXES = [
  ' | Manufacturer, Exporter & Wholesaler',
  ' | Nickel Strip Manufacturer & Exporter',
  ' | Manufacturer & Wholesale Supplier',
  ' | Manufacturer & Exporter',
  ' | Exporter India',
  ' | Exporter',
] as const;

/**
 * Buyer-role words, appended to the keywords list on every product page.
 *
 * B2B buyers search by the role they want to deal with, not only by the product: "nickel strip
 * wholesaler", "nickel strip distributor", "nickel strip dealer". IndiaMART listings rank on
 * these because their titles stack the roles ("Trader - Wholesaler / Distributor from Noida").
 * A <title> only has room for two or three, so the rest are declared here.
 */
export const BUYER_ROLE_KEYWORDS: readonly string[] = [
  'Nickel Strip Manufacturer',
  'Nickel Strip Exporter',
  'Nickel Strip Wholesaler',
  'Nickel Strip Distributor',
  'Nickel Strip Dealer',
  'Nickel Strip Trader',
  'Nickel Strip Supplier',
  'Bulk Nickel Strip Supplier',
];

export function productPageTitle(name: string, block: ProductKeywordBlock | null): string {
  if (!block) {
    const suffix = TITLE_SUFFIXES.find((option) => name.length + option.length <= TITLE_MAX);
    // A name long enough to leave room for nothing still ranks on the name itself, and the
    // page's H1 and copy carry the export framing regardless.
    return suffix ? `${name}${suffix}` : name;
  }
  // Spend whatever is left of the 60 characters on the brand, and drop it on the longer
  // headings rather than push the title into the range that gets truncated.
  const branded = `${block.heading} | Ramani Steel House`;
  return branded.length <= TITLE_MAX ? branded : block.heading;
}

export type ProductKeywordValues = { name: string; price: string | null };

const fill = (text: string, values: ProductKeywordValues) =>
  text.replace(/\{name\}/g, () => values.name).replace(/\{price\}/g, () => values.price ?? '');

/**
 * Fills the placeholders in the visible copy. A product quoted on enquiry has no price to
 * name, so any sentence that depends on one is dropped rather than rendered with a gap in it.
 */
export function fillKeywordParagraphs(
  block: ProductKeywordBlock,
  values: ProductKeywordValues
): string[] {
  return block.paragraphs
    .filter((paragraph) => values.price !== null || !paragraph.includes('{price}'))
    .map((paragraph) => fill(paragraph, values));
}

/**
 * The page's meta description, or null when the template needs a price the product does not
 * have - in which case the caller keeps the generic product description.
 */
export function keywordMetaDescription(
  block: ProductKeywordBlock,
  values: ProductKeywordValues
): string | null {
  if (values.price === null && block.metaDescription.includes('{price}')) return null;
  return fill(block.metaDescription, values).slice(0, 160);
}

/**
 * The subject half of the product photo's alt text - pass it through buildImageAlt() for the
 * brand/location suffix. Google Images reads alt text as the main statement of what a picture
 * shows, so a page with a target phrase says it there too.
 */
export function productImageAltSubject(name: string, block: ProductKeywordBlock | null): string {
  return block ? `${name} - ${block.heading}` : name;
}
