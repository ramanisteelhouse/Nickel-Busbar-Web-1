/**
 * The Google Merchant Center product feed, built from the live catalogue.
 *
 * Merchant Center reported "Missing value: gtin" and "Missing value: brand" on every item in
 * the PRODUCTS SOURCE 2 feed. Neither is a fault in the website — the product pages already
 * publish `brand` in their Product structured data — so the errors come from the feed file
 * itself, which is maintained outside this repository and had no such columns.
 *
 * Generating the feed from the database instead means it cannot drift from the catalogue, and
 * the two attributes are correct by construction:
 *
 *   brand              Ramani Steel House manufactures its own goods, so the brand is its own.
 *   identifier_exists  `no`. This is what clears the GTIN error. Nickel strip is slit to order
 *                      and carries no GS1 barcode; Google's rule for a manufacturer that has
 *                      not been assigned a GTIN is to declare that rather than invent one.
 *                      If GS1 numbers are ever bought, supply `g:gtin` and drop this.
 *   mpn                The slug, which is the stable per-product identifier this site already
 *                      uses as `sku` in its structured data and in its URLs.
 *
 * RSS 2.0 with the `g:` namespace rather than a spreadsheet: Merchant Center refetches a URL on
 * a schedule, so the feed stays current without anyone re-uploading a file.
 */

export const MERCHANT_BRAND = 'Ramani Steel House';

/** What a feed row needs from the products table. */
export type MerchantFeedProduct = {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | string | null;
  stock?: number | null;
  image?: string | null;
  category_name?: string | null;
  seo_meta_description?: string | null;
};

const escapeXml = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Strips the `{name}` / `{price}` placeholders the SEO columns use. A description is plain
 * text to Merchant Center — an unfilled placeholder would be published verbatim.
 */
const stripPlaceholders = (value: string) => value.replace(/\{(?:name|price)\}/g, '').replace(/\s+/g, ' ').trim();

/** Merchant Center caps titles at 150 characters and descriptions at 5000. */
const clamp = (value: string, limit: number) =>
  value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`;

export type BuildMerchantFeedOptions = {
  siteUrl: string;
  /** Absolute image URL per product; the caller owns the proxying rules. */
  imageUrl: (product: MerchantFeedProduct) => string;
  title?: string;
  description?: string;
};

/**
 * Items with no price are omitted rather than sent at zero.
 *
 * Enquiry-only products have no rate to advertise, and Merchant Center rejects a row whose
 * price is missing or zero. Dropping them keeps the feed clean instead of trading one item
 * error for another — the same reasoning that omits the Offer node from their structured data.
 */
export function buildMerchantFeed(
  products: MerchantFeedProduct[],
  { siteUrl, imageUrl, title = `${MERCHANT_BRAND} — Nickel Strip & Busbar`, description = 'Nickel strip, nickel busbar and battery tab products manufactured in Mumbai, India.' }: BuildMerchantFeedOptions
): string {
  const items = products
    .filter((product) => {
      const price = Number(product.price);
      return !!product.slug && !!product.name && Number.isFinite(price) && price > 0;
    })
    .map((product) => {
      const slug = String(product.slug);
      const price = Number(product.price);
      const rawDescription =
        stripPlaceholders(product.seo_meta_description || '') ||
        stripPlaceholders(product.description || '') ||
        `${product.name} manufactured by ${MERCHANT_BRAND}, Mumbai, India.`;

      const fields = [
        ['g:id', slug],
        ['title', clamp(String(product.name), 150)],
        ['description', clamp(rawDescription, 5000)],
        ['link', `${siteUrl}/product/${encodeURIComponent(slug)}`],
        ['g:image_link', imageUrl(product)],
        ['g:condition', 'new'],
        ['g:availability', Number(product.stock) > 0 ? 'in_stock' : 'out_of_stock'],
        // Merchant Center wants the ISO code in the value, and prices here are quoted in INR
        // per kg regardless of the currency a visitor's browser is shown.
        ['g:price', `${price.toFixed(2)} INR`],
        ['g:brand', MERCHANT_BRAND],
        ['g:mpn', slug],
        ['g:identifier_exists', 'no'],
        ...(product.category_name ? [['g:product_type', String(product.category_name)]] : []),
      ] as [string, string][];

      const body = fields
        .map(([tag, value]) => `    <${tag}>${escapeXml(value)}</${tag}>`)
        .join('\n');
      return `  <item>\n${body}\n  </item>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(title)}</title>
  <link>${escapeXml(siteUrl)}</link>
  <description>${escapeXml(description)}</description>
${items.join('\n')}
</channel>
</rss>
`;
}
