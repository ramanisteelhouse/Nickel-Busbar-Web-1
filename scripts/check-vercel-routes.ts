/**
 * Fails the build when vercel.json does not route a landing page.
 *
 * public/_redirects is generated from LANDING_PATHS, so Netlify self-heals. vercel.json cannot
 * be: Vercel reads it from the repository before it runs the build command, so a file written
 * during prebuild would be ignored for that very deployment. It has to be hand-maintained, and
 * it has drifted before — a page added to landingPages.ts is routed by React Router, so it works
 * in `vite preview` and on a local dev server, while on Vercel the catch-all rule at the bottom
 * of the routes array turns it into a hard 404. Nothing in typecheck or build catches that; the
 * first symptom is a 404 in production on a URL already submitted in the sitemap.
 *
 * So this asserts the one invariant instead: every path the sitemap advertises has a rule that
 * matches it. Run in prebuild, before vite build, so the deployment fails loudly rather than
 * shipping 404s.
 *
 * Matching mirrors Vercel's own semantics: `src` is a regex anchored at both ends, matched
 * against the pathname. Only rules that reach the renderer count — a rule matching a path but
 * sending it to /404.html is the failure being looked for, not a pass.
 */
import { readFileSync } from "fs";
import path from "path";
import { LANDING_PATHS } from "../src/lib/landingPages.js";

type VercelRoute = { src?: string; dest?: string; status?: number; handle?: string };

const configPath = path.resolve(process.cwd(), "vercel.json");
const config = JSON.parse(readFileSync(configPath, "utf-8")) as { routes?: VercelRoute[] };
const routes = config.routes ?? [];

/** Rules that actually serve the page, as opposed to headers-only or the 404 catch-all. */
const serving = routes.filter(
  (route) => route.src && route.dest && !route.status && !route.dest.includes("404")
);

const missing = LANDING_PATHS.filter(
  (landingPath) => !serving.some((route) => new RegExp(`^${route.src}$`).test(landingPath))
);

if (missing.length > 0) {
  console.error(
    `[check-vercel-routes] vercel.json has no rule for ${missing.length} landing page(s).\n` +
      `These are in the sitemap and in the router, so on Vercel they 404:\n` +
      missing.map((p) => `  ${p}`).join("\n") +
      `\n\nAdd a rule above the catch-all, e.g.\n` +
      missing
        .map((p) => `  { "src": "${p}/?", "dest": "/api/render?path=${p}" },`)
        .join("\n")
  );
  process.exit(1);
}

console.log(`[check-vercel-routes] All ${LANDING_PATHS.length} landing paths are routed.`);
