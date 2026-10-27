/**
 * Title and meta description for the catalogue hub, in one place for both renderers.
 *
 * `/products` and `/categories` are rendered twice: once by ProductListingPage.tsx for a browser
 * and once by seoSnapshot.ts for a crawler. Both set their own <title> and description, and they
 * had drifted — the snapshot carried 167 characters on /products and 197 on /categories while
 * the React page carried shorter copy. Google renders roughly 160 and truncates the rest
 * mid-sentence, so the version a crawler actually read was the one being cut, and the two
 * renderers disagreed about what the page was.
 *
 * Same fix as returnPolicy.ts: one module, both importers, no way to change one and forget the
 * other. Keep every description at or under 155 characters, and keep the product nouns and
 * "Mumbai" early so they survive truncation on a narrow SERP.
 */

export type CatalogueMeta = { title: string; description: string };

/** /products — the catalogue hub every product URL should be reachable from. */
export const PRODUCTS_META: CatalogueMeta = {
  title: 'Nickel Strip Price Per Kg | Manufacturer & Exporter India',
  description:
    'Nickel strips, nickel-plated strips and battery tabs manufactured in Mumbai, India. PAN India supply, export to 17+ countries. Bulk and custom quotes.',
};

/** /categories — the same grid, canonicalised to /products, so the copy differs but the page does not. */
export const CATEGORIES_META: CatalogueMeta = {
  title: 'Nickel Strip Categories | Pure Nickel & Plated Strips',
  description:
    'Browse nickel strip categories: pure nickel, nickel-plated strips, battery tabs, busbars and custom coils. Manufactured in Mumbai, supplied PAN India.',
};

export const catalogueMetaFor = (isCategoriesRoute: boolean): CatalogueMeta =>
  isCategoriesRoute ? CATEGORIES_META : PRODUCTS_META;
