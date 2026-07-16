import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import createApiApp from "./apiApp.js";
import { renderBlogSnapshot, renderProductSnapshot } from "./seoSnapshot.js";

const knownStaticRoutes = new Set([
  "/",
  "/products",
  "/categories",
  "/cart",
  "/checkout",
  "/login",
  "/about",
  "/contact",
  "/calculator",
  "/blog",
  "/blog/nickel-strips-lithium-batteries",
]);

const isKnownSpaRoute = (pathname: string) => {
  if (knownStaticRoutes.has(pathname)) {
    return true;
  }
  return /^\/product\/[^/]+\/?$/.test(pathname) || /^\/blog\/[^/]+\/?$/.test(pathname);
};

const normalizeRequestPath = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

async function startServer() {
  const app = createApiApp();
  const PORT = Number(process.env.PORT || 3000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api")) {
        return next();
      }
      const acceptsHtml = typeof req.headers.accept === "string" && req.headers.accept.includes("text/html");
      if (!acceptsHtml) {
        return next();
      }

      const requestPath = normalizeRequestPath(req.path);
      if (!isKnownSpaRoute(requestPath)) {
        res.statusCode = 404;
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      }
      next();
    });

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    const indexHtmlTemplate = fs.readFileSync(path.resolve("dist/index.html"), "utf-8");

    app.get("*", async (req, res) => {
      const requestPath = normalizeRequestPath(req.path);

      // Blog/product pages get a real server-rendered content snapshot injected into the
      // HTML response — see seoSnapshot.ts for why (non-JS crawlers can't see the SPA's
      // client-rendered content otherwise). Real browsers still get the normal SPA; React
      // fully replaces this markup on mount.
      const blogMatch = requestPath.match(/^\/blog\/([^/]+)$/);
      const productMatch = requestPath.match(/^\/product\/([^/]+)$/);
      if (blogMatch || productMatch) {
        try {
          const { status, html } = blogMatch
            ? await renderBlogSnapshot(indexHtmlTemplate, decodeURIComponent(blogMatch[1]))
            : await renderProductSnapshot(indexHtmlTemplate, decodeURIComponent(productMatch![1]));
          if (status === 404) {
            res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
          }
          return res.status(status).send(html);
        } catch (error) {
          console.error("Failed to render SEO snapshot, falling back to plain SPA shell", error);
          // Fall through to the default SPA response below.
        }
      }

      const statusCode = isKnownSpaRoute(requestPath) ? 200 : 404;
      if (statusCode === 404) {
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      }
      res.status(statusCode).send(indexHtmlTemplate);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

startServer();