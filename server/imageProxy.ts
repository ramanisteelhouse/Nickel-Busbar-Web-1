import type { Response as ExpressResponse } from "express";

/**
 * Re-serves an image that lives in Supabase Storage from our own domain, under headers we control.
 *
 * Why this exists: Supabase stamps every stored object with `X-Robots-Tag: none` and
 * `Cache-Control: private, no-cache`, and serves it from a third-party host behind a signed URL.
 * Google obeys the robots header, so an image served straight from storage can never be indexed in
 * Google Images and can never become the thumbnail beside a search result. That is exactly what was
 * wrong with every blog post: all 22 covers that had one pointed at storage, and none of the 29
 * posts audited on 2026-10-24 had an image Google could use.
 *
 * Product photos were fixed this way first (src/lib/productImage.ts has the long version). This is
 * the shared half of that fix, pulled out so products and blog covers cannot drift apart.
 *
 * Callers do the lookup (which stored URL belongs to this slug?) and the validation of that URL;
 * this does the fetch, the safety checks and the response.
 */

/** The extension in the request path is cosmetic: it is stripped back off to recover the slug. */
export const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif|gif)$/i;

// An allow-list keeps the route from being turned into an open proxy for arbitrary
// non-image responses.
const IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

// A Vercel function response is capped at ~4.5MB.
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export type ProxyImageOptions = {
  /** The stored image URL, already confirmed to be http(s). */
  source: string;
  /** Where to send the caller when the upstream cannot be served: a local copy, or a placeholder. */
  fallback: string;
  /** Log prefix, e.g. "product-image" or "blog-image". */
  tag: string;
  /** What is being served (the slug), for the log line. */
  subject: string;
};

export async function proxyRemoteImage(res: ExpressResponse, options: ProxyImageOptions): Promise<void> {
  const { source, fallback, tag, subject } = options;

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(source, { redirect: "follow" });
  } catch (error) {
    console.error(`[${tag}] upstream fetch failed for ${subject}; serving local copy`, error);
    res.redirect(302, fallback);
    return;
  }

  const contentType = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!upstream.ok || !IMAGE_CONTENT_TYPES.has(contentType)) {
    console.error(
      `[${tag}] upstream returned ${upstream.status} ${contentType || "(no type)"} for ${subject}; serving local copy`
    );
    res.redirect(302, fallback);
    return;
  }

  // Falling back to the storage URL for an oversized file loses the indexing benefit for that
  // one image, which beats a 500.
  const declaredLength = Number(upstream.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > IMAGE_MAX_BYTES) {
    console.warn(`[${tag}] ${subject} is ${declaredLength} bytes; serving upstream directly`);
    res.redirect(302, source);
    return;
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  if (body.length > IMAGE_MAX_BYTES) {
    console.warn(`[${tag}] ${subject} is ${body.length} bytes; serving upstream directly`);
    res.redirect(302, source);
    return;
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(body.length));
  // The entire point of the route: the explicit opposite of Supabase's `none`.
  res.setHeader("X-Robots-Tag", "all");
  // The URL is keyed by slug rather than by content, so browsers get a day and the CDN holds it for
  // a year with a week of stale-while-revalidate to absorb a re-upload.
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800");
  // helmet defaults this to same-origin, which would block og:image previews and any legitimate
  // hotlink of an image we are publishing on purpose.
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.end(body);
}
