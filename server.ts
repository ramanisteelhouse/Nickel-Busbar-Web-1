import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import createApiApp from "./apiApp.js";
import {
  renderBlogSnapshot,
  renderBlogListSnapshot,
  renderProductSnapshot,
  renderProductListSnapshot,
  renderNickelStripsLithiumSnapshot,
  renderStaticRouteSnapshot,
  renderUnavailableShell,
  isStaticSnapshotRoute,
} from "./seoSnapshot.js";

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
    // index:false so a request for "/" falls through to the snapshot handler below instead
    // of being answered with the bare dist/index.html shell - the homepage is the one route
    // express.static would otherwise intercept before any SEO snapshot could run.
    app.use(express.static("dist", { index: false }));
    const indexHtmlTemplate = fs.readFileSync(path.resolve("dist/index.html"), "utf-8");

    app.get("*", async (req, res) => {
      const requestPath = normalizeRequestPath(req.path);

      // Blog/product pages get a real server-rendered content snapshot injected into the
      // HTML response — see seoSnapshot.ts for why (non-JS crawlers can't see the SPA's
      // client-rendered content otherwise). Real browsers still get the normal SPA; React
      // fully replaces this markup on mount.
      const renderSnapshot = () => {
        if (requestPath === "/blog/nickel-strips-lithium-batteries") {
          return renderNickelStripsLithiumSnapshot(indexHtmlTemplate);
        }
        if (requestPath === "/products" || requestPath === "/categories") {
          return renderProductListSnapshot(indexHtmlTemplate, requestPath === "/categories");
        }
        if (requestPath === "/blog") {
          return renderBlogListSnapshot(indexHtmlTemplate);
        }
        if (isStaticSnapshotRoute(requestPath)) {
          return renderStaticRouteSnapshot(indexHtmlTemplate, requestPath);
        }
        const blogMatch = requestPath.match(/^\/blog\/([^/]+)$/);
        if (blogMatch) {
          return renderBlogSnapshot(indexHtmlTemplate, decodeURIComponent(blogMatch[1]));
        }
        const productMatch = requestPath.match(/^\/product\/([^/]+)$/);
        if (productMatch) {
          return renderProductSnapshot(indexHtmlTemplate, decodeURIComponent(productMatch[1]));
        }
        return null;
      };

      try {
        const pending = renderSnapshot();
        if (pending) {
          const { status, html } = await pending;
          if (status === 404) {
            res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
          }
          return res.status(status).send(html);
        }
      } catch (error) {
        console.error("SEO snapshot failed; serving 503 rather than a shell that canonicalises to the homepage", error);
        const { status, html } = renderUnavailableShell(indexHtmlTemplate, requestPath);
        res.setHeader("Retry-After", "120");
        return res.status(status).send(html);
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