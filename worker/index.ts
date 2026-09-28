import { configureDatabase } from "../db.js";
import { renderSnapshotResponse } from "../server/renderSnapshot.js";
import { legacyRedirectFor } from "../server/legacyRedirects.js";
import {
  getActiveAds,
  getBlogPostBySlug,
  getProductBySlug,
  getProductSuggestions,
  getRelatedProducts,
  listBlogPosts,
  listCategories,
  listProducts,
} from "../server/catalog.js";
import {
  isLandingSnapshotRoute,
  isNoindexSnapshotRoute,
  isStaticSnapshotRoute,
} from "../seoSnapshot.js";

/**
 * The Cloudflare Worker.
 *
 * Cloudflare cannot run the Express app (apiApp.ts) or the Node render function: no Express, no
 * nodemailer, no `fs`. So routing happens here in code instead of in a `_redirects` file — which
 * is also why the Cloudflare build must not ship one. Cloudflare rejects Netlify's syntax
 * outright: `301!` parses as status 0 and `404` is not an allowed redirect status, which is the
 * error that made this build fail.
 *
 * Postgres reaches Supabase through Hyperdrive, which is what makes a TCP database usable from a
 * Worker at all. `configureDatabase` hands the per-request connection string to the pool in
 * db.ts; nothing there reads `process.env`, because a Worker has none at module scope.
 *
 * STAGE 1. The read endpoints the site needs to render are served here. The write endpoints —
 * quotes, enquiries, cart, auth, analytics, the admin blog API — still live only in Express and
 * answer 501 below rather than failing in some confusing way. Until they are ported, this Worker
 * can serve the catalogue and every crawler snapshot, but it cannot take an order, so it is not
 * yet a replacement for the Vercel deployment.
 */

/**
 * Declared locally rather than pulling in @cloudflare/workers-types: that package redeclares
 * Request, Response and friends globally, and this program also compiles the React app against
 * the DOM lib. These two shapes are all the Worker uses.
 */
interface AssetFetcher {
  fetch(input: Request | string | URL): Promise<Response>;
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Env {
  ASSETS: AssetFetcher;
  HYPERDRIVE: { connectionString: string };
}

/** Write endpoints that still live only in Express. Listed so the 501 can name them. */
const UNPORTED_API_PREFIXES = [
  "/api/quotes",
  "/api/enquiries",
  "/api/cart",
  "/api/auth",
  "/api/user",
  "/api/analytics",
  "/api/calls",
  "/api/admin",
  "/api/ai",
  "/api/crm",
  "/api/localization",
  "/merchant-feed.xml",
];

const json = (body: unknown, status = 200, cacheControl = "public, max-age=0, s-maxage=60") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cacheControl },
  });

/** The built shell, fetched once per isolate from the asset store rather than from disk. */
let templateCache: string | null = null;
async function loadTemplate(env: Env, request: Request): Promise<string> {
  if (templateCache) return templateCache;
  const response = await env.ASSETS.fetch(new URL("/index.html", request.url));
  if (!response.ok) throw new Error(`Could not read /index.html from the asset store: ${response.status}`);
  templateCache = await response.text();
  return templateCache;
}

/** True for a path the SSR snapshot owns; anything else is a static file or a 404. */
function isSnapshotRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/products" ||
    pathname === "/categories" ||
    pathname === "/blog" ||
    isStaticSnapshotRoute(pathname) ||
    isNoindexSnapshotRoute(pathname) ||
    isLandingSnapshotRoute(pathname) ||
    /^\/blog\/[^/]+$/.test(pathname) ||
    /^\/product\/[^/]+$/.test(pathname)
  );
}

async function handleApi(pathname: string, url: URL): Promise<Response | null> {
  const number = (value: string | null, fallback: number, min: number, max: number) =>
    Math.min(Math.max(Number(value) || fallback, min), max);

  if (pathname === "/api/health") return json({ ok: true, runtime: "cloudflare-worker" });

  if (pathname === "/api/products") {
    const products = await listProducts({
      category: url.searchParams.get("category"),
      featured: url.searchParams.has("featured"),
      search: url.searchParams.get("search"),
    });
    return json(products ?? []);
  }

  if (pathname === "/api/products/suggestions") {
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) return json([]);
    return json(await getProductSuggestions(q, number(url.searchParams.get("limit"), 8, 1, 20)));
  }

  if (pathname === "/api/categories") return json(await listCategories());
  if (pathname === "/api/ads/active") return json(await getActiveAds());

  if (pathname === "/api/blog-posts") {
    return json(await listBlogPosts(number(url.searchParams.get("limit"), 6, 1, 50)));
  }

  const blogPost = pathname.match(/^\/api\/blog-posts\/([^/]+)$/);
  if (blogPost) {
    let slug = blogPost[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      // Malformed encoding: match on the raw slug rather than failing the request.
    }
    const post = await getBlogPostBySlug(slug);
    return post ? json(post) : json({ error: "Blog post not found" }, 404);
  }

  const related = pathname.match(/^\/api\/products\/([^/]+)\/related$/);
  if (related) {
    const rows = await getRelatedProducts(decodeURIComponent(related[1]));
    return rows === null ? json({ error: "Product not found" }, 404) : json(rows);
  }

  const product = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (product) {
    const row = await getProductBySlug(decodeURIComponent(product[1]));
    return row ? json(row) : json({ error: "Product not found" }, 404);
  }

  if (UNPORTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    // Explicit rather than a 404: this endpoint exists, it is simply not available on this host
    // yet, and a 404 would read to the client as "no such product" or "no such cart".
    return json(
      { error: "This endpoint is not available on the Cloudflare deployment yet.", endpoint: pathname },
      501,
      "no-store"
    );
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    // Hyperdrive supplies the pooled connection string; db.ts holds it for this isolate.
    if (env.HYPERDRIVE?.connectionString) configureDatabase(env.HYPERDRIVE.connectionString);

    const legacy = legacyRedirectFor(pathname);
    if (legacy) {
      return new Response(null, {
        status: 301,
        headers: { Location: `${url.origin}${legacy}`, "Cache-Control": "public, max-age=0, s-maxage=600" },
      });
    }

    if (pathname.startsWith("/api/") || pathname === "/merchant-feed.xml") {
      try {
        const response = await handleApi(pathname, url);
        if (response) return response;
        return json({ error: "Not found" }, 404, "no-store");
      } catch (error) {
        console.error("Worker API request failed", error);
        return json({ error: "Request failed" }, 500, "no-store");
      }
    }

    if (isSnapshotRoute(pathname)) {
      const template = await loadTemplate(env, request);
      const result = await renderSnapshotResponse(pathname, template);
      const headers = new Headers({ "Cache-Control": result.cacheControl });
      if (result.noindex) headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      if (result.location) {
        headers.set("Location", result.location);
        return new Response(null, { status: result.status, headers });
      }
      if (result.status === 503) headers.set("Retry-After", "120");
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(result.html, { status: result.status, headers });
    }

    // A real file (assets, images, the video, robots.txt, sitemap.xml) or nothing.
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;

    // Matching the other hosts: an unknown URL is a real 404, not the SPA shell, so it is never
    // indexed as a soft 404.
    const notFound = await env.ASSETS.fetch(new URL("/404.html", request.url));
    return new Response(await notFound.text(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=60" },
    });
  },
};
