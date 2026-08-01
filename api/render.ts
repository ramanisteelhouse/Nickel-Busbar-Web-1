import type { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";
import {
  renderBlogSnapshot,
  renderProductSnapshot,
  renderNickelStripsLithiumSnapshot,
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const template = loadTemplate();
  const pathname = (req.url || "/").split("?")[0].replace(/\/+$/, "") || "/";

  try {
    let result: { status: number; html: string };

    if (pathname === "/blog/nickel-strips-lithium-batteries") {
      result = await renderNickelStripsLithiumSnapshot(template);
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

    if (result.status === 404) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = result.status;
    res.end(result.html);
  } catch (error) {
    console.error("SSR snapshot render failed, falling back to plain SPA shell", error);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = 200;
    res.end(template);
  }
}
