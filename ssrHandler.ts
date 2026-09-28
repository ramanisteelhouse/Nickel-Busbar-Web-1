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
} from "./seoSnapshot.js";
import { renderSnapshotResponse } from "./server/renderSnapshot.js";

/**
 * The server-rendered crawler snapshot, as a plain Node request listener.
 *
 * This lives outside api/ so both platform adapters can share it: api/render.ts is what Vercel
 * invokes, netlify/functions/render.ts wraps the same function for Netlify. Keeping one
 * implementation means a routing change cannot fix one host and silently skip the other, and it
 * keeps the Vercel path working while the Netlify move is proven.
 */

let templateCache: string | null = null;

/**
 * Loads the built shell that every snapshot is injected into.
 *
 * The path is searched rather than assumed because the two hosts lay functions out differently.
 * Vercel runs with the repo root as cwd and vercel.json's `includeFiles` puts dist/index.html
 * beside it; Netlify bundles the function into its own directory and copies `included_files`
 * relative to the repo root under the task root. Guessing one and being wrong is not a subtle
 * failure — the renderer throws on every request and the whole site serves the 503 shell.
 */
function loadTemplate(): string {
  if (templateCache) return templateCache;

  const candidates = [
    path.join(process.cwd(), "dist", "index.html"),
    // Netlify sets LAMBDA_TASK_ROOT to the bundle root that included_files are copied into.
    process.env.LAMBDA_TASK_ROOT ? path.join(process.env.LAMBDA_TASK_ROOT, "dist", "index.html") : null,
    path.join(process.cwd(), "index.html"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      templateCache = fs.readFileSync(candidate, "utf-8");
      return templateCache;
    } catch {
      // Try the next layout.
    }
  }

  throw new Error(`Could not read the built shell. Looked in: ${candidates.join(", ")}`);
}

/**
 * A `dest` rewrite can leave req.url pointing at the function itself rather than the route the
 * visitor asked for, so the routing table passes `?path=` explicitly for the routes added later.
 * The req.url fallback is what the original /product/* and /blog/* routes have always relied on.
 */
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

/**
 * The Node adapter: Vercel's api/render.ts and Netlify's netlify/functions/render.ts both call
 * this. All of the decisions live in renderSnapshotResponse; this only maps the result onto a
 * ServerResponse.
 */
export default async function handleSsrRequest(req: IncomingMessage, res: ServerResponse) {
  const template = loadTemplate();
  const pathname = resolvePathname(req);
  const result = await renderSnapshotResponse(pathname, template);

  res.setHeader("Cache-Control", result.cacheControl);
  if (result.noindex) res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");

  if (result.location) {
    res.setHeader("Location", result.location);
    res.statusCode = result.status;
    res.end();
    return;
  }

  // Never cache a failure: the edge would keep serving 503 after the cause had cleared.
  if (result.status === 503) res.setHeader("Retry-After", "120");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.statusCode = result.status;
  res.end(result.html);
}
