import type { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";
import {
  renderBlogSnapshot,
  renderBlogListSnapshot,
  renderProductSnapshot,
  renderProductListSnapshot,
  renderNickelStripsLithiumSnapshot,
  renderStaticRouteSnapshot,
  renderNoindexSnapshot,
  renderLandingSnapshot,
  renderUnavailableShell,
  isStaticSnapshotRoute,
  isNoindexSnapshotRoute,
  isLandingSnapshotRoute,
} from "../seoSnapshot.js";

// On Vercel, vercel.json's filesystem routing serves the static dist/index.html shell
// directly for /product/* and /blog/* — this function is what actually gets invoked
// instead, so crawlers see a real per-page title/canonical/content in the raw HTML
// rather than every product and blog page looking like a duplicate of the homepage.
let templateCache: string | null = null;
function loadTemplate(): string {
  if (!templateCache) {
    templateCache = fs.readFileSync(path.join(process.cwd(), "dist", "index.html"), "utf-8");
  }
  return templateCache;
}

// A `dest` rewrite can leave req.url pointing at the function itself rather than the route the
// visitor asked for, so vercel.json passes `?path=` explicitly for the routes added later. The
// req.url fallback is what the original /product/* and /blog/* routes have always relied on.
function resolvePathname(req: IncomingMessage): string {
  const rawUrl = req.url || "/";
  const queryIndex = rawUrl.indexOf("?");
  if (queryIndex !== -1) {
    const explicit = new URLSearchParams(rawUrl.slice(queryIndex + 1)).get("path");
    if (explicit && explicit.startsWith("/")) {
      return explicit.replace(/\/+$/, "") || "/";
    }
  }
  return rawUrl.split("?")[0].replace(/\/+$/, "") || "/";
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const template = loadTemplate();
  const pathname = resolvePathname(req);

  try {
    let result: { status: number; html: string; location?: string };

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

    // A snapshot renderer can ask for a redirect: a blog post requested under an old or
    // wrongly-cased slug resolves to its canonical URL rather than serving a duplicate.
    if (result.location) {
      res.setHeader("Location", result.location);
      res.statusCode = result.status;
      res.end();
      return;
    }

    if (result.status === 404) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = result.status;
    res.end(result.html);
  } catch (error) {
    console.error("SSR snapshot render failed; serving 503 rather than a shell that canonicalises to the homepage", error);
    const { status, html } = renderUnavailableShell(template, pathname);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Retry-After", "120");
    res.statusCode = status;
    res.end(html);
  }
}
