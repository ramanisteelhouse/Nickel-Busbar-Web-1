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

// The .js extension is required, not optional: package.json sets "type": "module", and this
// file is loaded directly by Node (apiApp.ts and seoSnapshot.ts import it as
// ./src/lib/productImage.js) as well as by Vite. Node's ESM resolver does not add extensions,
// so an extensionless specifier here throws ERR_MODULE_NOT_FOUND at import time and takes the
// entire API function down with it. tsc and the Vite build both resolve it either way, so
// neither catches the mistake.
import { localProductImagePath } from './productImageLocal.js';

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

/**
 * Root-relative URL, for `<img src>` on one of our own pages.
 *
 * Prefers the copy downloaded by scripts/sync-product-images.ts, and falls back to the proxy
 * route for anything not synced yet.
 *
 * The proxy streams whatever is in storage, at whatever size it was uploaded — which is
 * originals of 0.5MB to 2.3MB each, rendered into slots no wider than 600px. Twelve of those
 * on one search-results page is roughly 15MB of images, on a site whose SEO audit already
 * flagged total page weight. The synced copies are the same photos at 900px WebP, 44KB to
 * 229KB, served as static assets straight from the CDN rather than through a function.
 *
 * The trade-off is freshness: a photo replaced in the CMS keeps showing the synced copy until
 * `npx tsx scripts/sync-product-images.ts` is run again. Products added since the last sync are
 * unaffected — they have no local copy, so they go through the proxy and are current.
 */
export function productImagePath(slug?: string | null, sourceUrl?: string | null): string {
  const cleanSlug = slug?.trim();
  if (!cleanSlug) return PRODUCT_IMAGE_PLACEHOLDER;
  return (
    localProductImagePath(cleanSlug) ??
    `${PRODUCT_IMAGE_ROUTE}/${encodeURIComponent(cleanSlug)}.${imageExtension(sourceUrl)}`
  );
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
