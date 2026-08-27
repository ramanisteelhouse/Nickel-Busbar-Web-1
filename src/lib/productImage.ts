// Product photos are uploaded to Supabase Storage, and Supabase answers every storage object
// with `X-Robots-Tag: none` - a hard "do not index" that Google Images obeys. That one header
// disqualifies a product photo from ever appearing as a search-result thumbnail, however
// correct the Product structured data wrapped around it is. The stored URLs make it worse on
// two further counts: they live on a third-party host (<ref>.supabase.co, not our domain) and
// they carry a signed JWT in the query string, so an image crawler sees a throwaway URL that
// changes every time a link is re-signed.
//
// Product photos are therefore addressed through our own origin instead. The route in
// apiApp.ts streams the same bytes back under headers we control - indexable, long-lived,
// same domain as the page the photo belongs to - behind a URL that is stable, readable and
// carries the product slug where an image crawler can read it.

/** Path prefix of the proxy route in apiApp.ts. The two must stay in step. */
export const PRODUCT_IMAGE_ROUTE = '/api/product-image';

/**
 * Served for products with no photo on record; also where the proxy route redirects when the
 * stored URL will not fetch.
 *
 * Square, because every slot that renders a product photo is square (`aspect-square` in the
 * listing grid, `h-40` cards on the landing pages). The site wordmark used to stand in here and
 * it is 4560x916 — roughly 5:1 — so `object-cover` cropped it to an unreadable band of pixels
 * on any product without a working photo.
 */
export const PRODUCT_IMAGE_PLACEHOLDER = '/img/product-placeholder.webp';

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|webp|avif|gif)(?:$|\?)/i;

// The extension is cosmetic - the proxy sets Content-Type from the upstream response either
// way - but a real extension keeps the URL looking like an image to crawlers and to anything
// that sniffs a format from the name.
function imageExtension(sourceUrl?: string | null): string {
  const match = IMAGE_EXTENSION_PATTERN.exec(sourceUrl || '');
  if (!match) return 'jpg';
  const extension = match[1].toLowerCase();
  return extension === 'jpeg' ? 'jpg' : extension;
}

/** Root-relative URL, for `<img src>` on one of our own pages. */
export function productImagePath(slug?: string | null, sourceUrl?: string | null): string {
  const cleanSlug = slug?.trim();
  if (!cleanSlug) return PRODUCT_IMAGE_PLACEHOLDER;
  return `${PRODUCT_IMAGE_ROUTE}/${encodeURIComponent(cleanSlug)}.${imageExtension(sourceUrl)}`;
}

/**
 * Absolute URL, for og:image and schema.org `image` - both are ignored when handed a
 * relative path.
 */
export function productImageUrl(
  siteUrl: string,
  slug?: string | null,
  sourceUrl?: string | null
): string {
  return `${siteUrl.replace(/\/+$/, '')}${productImagePath(slug, sourceUrl)}`;
}
