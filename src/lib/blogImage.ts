/**
 * The image a blog post shows, shares and tells Google about: one answer, used everywhere.
 *
 * The problem this solves. A post's cover is stored as a Supabase signed URL, and the page, the
 * og:image tag, the Article structured data and the blog index all used that URL directly. Supabase
 * serves every object with `X-Robots-Tag: none`, so Google obeys it and never indexes the image or
 * uses it as the thumbnail beside a search result: all 22 posts that had a cover were affected, and
 * seven more had no image tagged at all. 69% of the site's search clicks land on blog posts.
 *
 * So a post's image is addressed through our own origin instead, in order of preference:
 *   1. a cover already on our own domain (kept as it is)
 *   2. an optimised local copy saved by scripts/sync-blog-covers.ts  (/img/blog-covers/<slug>.webp)
 *   3. the /api/blog-image proxy, which re-serves the stored cover with indexable headers; this is
 *      what a post published after the last sync gets, so a new post is never without a thumbnail
 *   4. no cover on record: a photo of the product the article discusses, then the brand card
 *
 * Plain data and functions, no React, and `.js` on relative imports: seoSnapshot.ts loads this in
 * the Node function.
 */
import { LOCAL_BLOG_COVER_SLUGS } from './blogCoverLocal.js';
import { blogProductsFor } from './blogProducts.js';
import { productImagePath } from './productImage.js';

export const BLOG_IMAGE_ROUTE = '/api/blog-image';
export const BLOG_COVER_DIR = '/img/blog-covers';
/** The brand share card (1200x630). Last resort, and the default for pages with no photo of their own. */
export const SHARE_IMAGE_PATH = '/img/og-image.png';

const SITE_ORIGIN = /^https?:\/\/(?:www\.)?nickelbusbar\.com(?=\/|$)/i;

/**
 * A representative product photo for posts that were published without a cover.
 *
 * Six posts (the e-rickshaw, test-certificate, sample, price, buying-mistakes and weight guides)
 * were published with no image at all, so they had nothing to show in a search result. This gives
 * each the photo of a product the article is genuinely about until it is given a cover of its own.
 * It is a stopgap, not a design: a post that has a cover never reaches this, and the real fix is to
 * upload a 1000x1000 cover when publishing. Every slug here is a product in the catalogue.
 */
const STOPGAP_TOPIC_PHOTO: Readonly<Record<string, string>> = {
  // The article recommends zig-zag for vibration, so that is the photo that matches it.
  'nickel-strip-e-rickshaw-e-bike-battery-packs-india': 'ni-18650-2p-zig-zag-no-fuse-type',
  'how-to-read-nickel-strip-material-test-certificate': 'Plain-Nickel-Strips',
  'nickel-strip-sample-before-bulk-order': 'ni-18650-2p-h-type',
  'nickel-strip-price-per-kg-india': 'Plain-Nickel-Strips',
  '5-nickel-strip-buying-mistakes': 'ni-18650-2p-h-type',
  'nickel-strip-weight-per-metre': 'Plain-Nickel-Strips',
};

export type BlogCover = {
  /** Root-relative path on our own origin. */
  path: string;
  /**
   * `cover` is the post's own image, `topic` a photo of a product it discusses, `brand` the share
   * card. A `brand` image is fine for og:image but looks wrong as an article's lead picture, so
   * pages only show the image when this is not `brand`.
   */
  kind: 'cover' | 'topic' | 'brand';
};

const extensionOf = (url: string): string => {
  const match = /\.(jpe?g|png|webp|avif|gif)(?:$|\?)/i.exec(url);
  if (!match) return 'jpg';
  const ext = match[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
};

export function blogCover(slug?: string | null, sourceUrl?: string | null): BlogCover {
  const cleanSlug = (slug ?? '').trim();
  const source = (sourceUrl ?? '').trim();

  // Already ours: nothing to proxy.
  if (source.startsWith('/') && !source.startsWith('//')) return { path: source, kind: 'cover' };
  if (SITE_ORIGIN.test(source)) return { path: source.replace(SITE_ORIGIN, '') || '/', kind: 'cover' };

  if (cleanSlug && LOCAL_BLOG_COVER_SLUGS.has(cleanSlug)) {
    return { path: `${BLOG_COVER_DIR}/${cleanSlug}.webp`, kind: 'cover' };
  }
  if (cleanSlug && source) {
    return { path: `${BLOG_IMAGE_ROUTE}/${encodeURIComponent(cleanSlug)}.${extensionOf(source)}`, kind: 'cover' };
  }

  // No cover on record. A product the article is about is a better thumbnail than a logo card.
  const topicSlug = STOPGAP_TOPIC_PHOTO[cleanSlug] ?? (cleanSlug ? blogProductsFor(cleanSlug)[0]?.slug : undefined);
  if (topicSlug) return { path: productImagePath(topicSlug), kind: 'topic' };
  return { path: SHARE_IMAGE_PATH, kind: 'brand' };
}
