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
export function productImageAltSubject(name: string, slug?: string | null): string {
  const block = getProductKeywordBlock(slug);
  return block ? `${name} - ${block.heading}` : name;
}
