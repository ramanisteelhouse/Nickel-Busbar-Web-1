import React from 'react';
import { buildImageAlt } from '../lib/utils';
import { PRODUCT_IMAGE_PLACEHOLDER, productImagePath } from '../lib/productImage';
import { localProductImagePath } from '../lib/productImageLocal';
import { getProductKeywordBlock, productImageAltSubject } from '../lib/productSeo';

/**
 * A product photo, addressed through our own domain, with a placeholder for when it does not
 * arrive.
 *
 * Two separate failures are being handled here, and only one of them is the server's job:
 *
 *   1. The stored URL does not fetch. Product photos live in Supabase Storage behind signed
 *      URLs; a token can be revoked, a file re-uploaded under a new name, or the bucket made
 *      private. The /api/product-image route already catches that — it fetches upstream and
 *      redirects to a local placeholder when the fetch fails or returns a non-image.
 *   2. The proxy itself does not answer — a cold start that times out, a 500, an offline
 *      client. Nothing server-side can help, and the browser draws its broken-image icon in a
 *      product grid. `onError` is what covers this, and it is the reason this lives in one
 *      component rather than being repeated at each call site with slightly different markup.
 *
 * `onError` only swaps the source once (`fellBackRef`): pointing src at a placeholder that is
 * itself missing would otherwise re-fire the handler on every reassignment.
 */
export type ProductThumbnailProps = {
  slug?: string | null;
  /** The stored URL. Used only to pick the file extension for the proxy path. */
  image?: string | null;
  name: string;
  /**
   * Bypasses the proxy path. For the homepage showcase, which falls back to stock photography
   * when the catalogue has not loaded — those have no slug and are not ours to proxy, but they
   * should still degrade to the placeholder rather than a broken-image icon.
   */
  src?: string;
  /** Intrinsic size hint. Thumbnails are square everywhere they are used today. */
  size?: number;
  /** Set when the slot is not square, so the intrinsic ratio matches the rendered box. */
  height?: number;
  className?: string;
  /** The grid is below the fold on every page that renders it; the detail hero is not. */
  loading?: 'lazy' | 'eager';
};

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  slug,
  image,
  name,
  src: explicitSrc,
  size = 600,
  height,
  className,
  loading = 'lazy',
}) => {
  const src = explicitSrc || productImagePath(slug, image);
  const fellBackRef = React.useRef(false);

  // Slug lookup rather than the database-backed block: a grid thumbnail is handed only a slug
  // and a name, not the product row. The alt text that matters for Google Images is the detail
  // page's hero, which does resolve the product's own seo_heading; this falls back to the
  // bare product name, as it did for every product without a keyword block before.
  const altText = buildImageAlt(productImageAltSubject(name, getProductKeywordBlock(slug)));

  // A different product means a different src, so a previous failure must not suppress the
  // new image's own error handling.
  React.useEffect(() => {
    fellBackRef.current = false;
  }, [src]);

  return (
    <img
      src={src}
      alt={altText}
      width={size}
      height={height ?? size}
      loading={loading}
      decoding="async"
      className={className}
      onError={(event) => {
        if (fellBackRef.current) return;
        fellBackRef.current = true;
        // The product's own downloaded photo if we have one (scripts/sync-product-images.ts),
        // and only then the generic mark. A buyer scanning a grid of H-type variants needs to
        // tell them apart; a column of identical logos is barely better than broken images.
        event.currentTarget.src = localProductImagePath(slug) ?? PRODUCT_IMAGE_PLACEHOLDER;
      }}
    />
  );
};
