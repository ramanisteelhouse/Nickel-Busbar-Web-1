import serverless from "serverless-http";
import createApiApp from "../../apiApp.js";

/**
 * The Netlify adapter for the Express API.
 *
 * serverless-http translates Netlify's Lambda-shaped event into the (req, res) pair Express
 * expects, so apiApp.ts stays a plain Express app that also runs under `tsx server.ts` locally
 * and as a Vercel function. Nothing about the routes, middleware or rate limiting changes.
 *
 * The app is constructed at module scope, not per request, so a warm container reuses it — and
 * with it the pg pool. Building it per invocation would open a new pool on every request and
 * exhaust Postgres connections under any real traffic.
 */
const app = createApiApp();

/**
 * Netlify hands the function the full invocation path, e.g.
 * `/.netlify/functions/api/api/enquiries`. The rewrite in public/_redirects deliberately keeps
 * the caller's own `/api` prefix in that path, and basePath strips only Netlify's part, leaving
 * Express to see `/api/enquiries` — exactly the URL its routes are declared against. Without
 * this, every API route would 404 while the function itself reported success.
 */
export const handler = serverless(app, {
  basePath: "/.netlify/functions/api",
});
