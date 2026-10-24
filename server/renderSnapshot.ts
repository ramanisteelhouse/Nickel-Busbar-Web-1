import {
  renderBlogSnapshot,
  renderBlogListSnapshot,
  renderProductSnapshot,
  renderProductListSnapshot,
  renderNickelStripsLithiumSnapshot,
  renderStaticRouteSnapshot,
  renderNoindexSnapshot,
  renderLandingSnapshot,
  renderGuideSnapshot,
  renderUnavailableShell,
  isStaticSnapshotRoute,
  isNoindexSnapshotRoute,
  isLandingSnapshotRoute,
  isGuideSnapshotRoute,
} from "../seoSnapshot.js";

/**
 * Which snapshot a path gets, and the headers it is served under — with no Node dependencies,
 * so the Cloudflare Worker can call it too.
 *
 * ssrHandler.ts (Vercel and Netlify) and worker/index.ts (Cloudflare) both go through
 * renderSnapshotResponse. Keeping the decision in one place is what stops a routing change
 * from landing on one host and silently skipping another.
 */

/**
 * How long the CDN may serve a rendered page before revalidating.
 *
 * Without this header Vercel defaults HTML to `max-age=0, must-revalidate`, so every request —
 * including every crawl of every product and blog URL — woke the function and queried Postgres.
 * Measured against the live site that was 0.5–0.8s for a product page and 2.4–2.7s for a blog
 * page, on a site where Search Console reports nine URLs as "Discovered – currently not
 * indexed". Slow responses are one of the things that makes Google spend fewer crawls on a
 * site, and these pages are waiting to be crawled at all.
 *
 * `s-maxage` applies to the CDN only, so the edge answers repeat requests itself. `max-age=0`
 * keeps browsers revalidating, so an editor never sees their own change as stale.
 * `stale-while-revalidate` lets the edge serve the cached copy while it refreshes in the
 * background, which means a CMS edit is picked up within the minute without any visitor ever
 * waiting for a cold render.
 */
const INDEXABLE_CACHE = "public, max-age=0, s-maxage=600, stale-while-revalidate=86400";
/** A 404 may become a real page (a draft being published), so it is cached only briefly. */
const NOT_FOUND_CACHE = "public, max-age=0, s-maxage=60";
/** Cart, checkout, login and the 503 shell: never cached anywhere. */
const NO_STORE = "private, no-store, max-age=0";

/** The snapshot for one path, with the headers it should be served under. Shared by the Node
 * adapter below and the Cloudflare Worker in worker/index.ts, so a routing change cannot apply
 * to one runtime and silently skip the other. */
export async function renderSnapshotResponse(
  pathname: string,
  template: string
): Promise<{ status: number; html: string; location?: string; cacheControl: string; noindex?: boolean }> {
  try {
    const result = await renderForPath(pathname, template);
    if (result.location) {
      return { ...result, cacheControl: INDEXABLE_CACHE };
    }
    if (result.status === 404) {
      return { ...result, cacheControl: NOT_FOUND_CACHE, noindex: true };
    }
    return {
      ...result,
      cacheControl: isNoindexSnapshotRoute(pathname) ? NO_STORE : INDEXABLE_CACHE,
    };
  } catch (error) {
    console.error("SSR snapshot render failed; serving 503 rather than a shell that canonicalises to the homepage", error);
    const { status, html } = renderUnavailableShell(template, pathname);
    return { status, html, cacheControl: NO_STORE };
  }
}

/** Picks and runs the right snapshot renderer for a path. */
async function renderForPath(
  pathname: string,
  template: string
): Promise<{ status: number; html: string; location?: string }> {
  let result: { status: number; html: string; location?: string };

  {
    if (isNoindexSnapshotRoute(pathname)) {
      result = renderNoindexSnapshot(template, pathname);
    } else if (pathname === "/blog/nickel-strips-lithium-batteries") {
      result = await renderNickelStripsLithiumSnapshot(template);
    } else if (pathname === "/products" || pathname === "/categories") {
      result = await renderProductListSnapshot(template, pathname === "/categories");
    } else if (pathname === "/blog") {
      result = await renderBlogListSnapshot(template);
    } else if (isStaticSnapshotRoute(pathname)) {
      result = await renderStaticRouteSnapshot(template, pathname);
    } else if (isLandingSnapshotRoute(pathname)) {
      result = await renderLandingSnapshot(template, pathname);
    } else if (isGuideSnapshotRoute(pathname)) {
      result = renderGuideSnapshot(template, pathname);
    } else {
      const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
      const productMatch = pathname.match(/^\/product\/([^/]+)$/);
      if (blogMatch) {
        result = await renderBlogSnapshot(template, decodeURIComponent(blogMatch[1]));
      } else if (productMatch) {
        result = await renderProductSnapshot(template, decodeURIComponent(productMatch[1]));
      } else {
        result = { status: 200, html: template };
      }
    }

    return result;
  }
}
