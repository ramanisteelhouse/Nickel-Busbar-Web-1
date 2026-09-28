/**
 * Removes files from dist/ that Cloudflare refuses to deploy.
 *
 * `public/_redirects` is generated for Netlify and Vite copies it into dist/. Cloudflare parses
 * any _redirects it finds and rejects Netlify's dialect outright:
 *
 *   Line 10: Valid status codes are 200, 301, 302 (default), 303, 307, or 308. Got 0.   (`301!`)
 *   Line 71: Valid status codes are 200, 301, 302 (default), 303, 307, or 308. Got 404. (`404`)
 *
 * which fails the deploy. The file is not merely invalid here, it is unnecessary: every rule in
 * it points at `/.netlify/functions/...`, and on Cloudflare the Worker does the routing itself
 * (worker/index.ts). Deleting it from the Cloudflare build leaves the Netlify build untouched.
 */
import { existsSync, rmSync } from "fs";
import path from "path";

const removable = ["_redirects"];
let removed = 0;

for (const name of removable) {
  const target = path.resolve(process.cwd(), "dist", name);
  if (existsSync(target)) {
    rmSync(target);
    removed += 1;
    console.log(`[cloudflare] removed dist/${name} (Netlify syntax, and the Worker routes instead)`);
  }
}

if (!removed) console.log("[cloudflare] nothing to remove from dist.");
