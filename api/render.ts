// The Vercel adapter for the SSR crawler snapshot. The implementation lives in ssrHandler.ts so
// Netlify's adapter (netlify/functions/render.ts) runs exactly the same code.
export { default } from "../ssrHandler.js";
