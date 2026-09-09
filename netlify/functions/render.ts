import serverless from "serverless-http";
import handleSsrRequest from "../../ssrHandler.js";

/**
 * The Netlify adapter for the SSR crawler snapshot.
 *
 * handleSsrRequest is a plain Node request listener, which is exactly what serverless-http
 * accepts, so the same function serves Vercel (api/render.ts) and Netlify with no forked logic.
 *
 * The rewrite table sends the real path through as ?path=, because a Netlify rewrite to a
 * function leaves req.url pointing at /.netlify/functions/render rather than the URL the
 * visitor asked for. ssrHandler prefers that query parameter and falls back to req.url.
 */
export const handler = serverless(handleSsrRequest);
