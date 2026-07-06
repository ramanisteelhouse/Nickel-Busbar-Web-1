import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import createApiApp from "./apiApp.js";

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
    app.get("*", (req, res) => {
      const requestPath = normalizeRequestPath(req.path);
      const statusCode = isKnownSpaRoute(requestPath) ? 200 : 404;
      if (statusCode === 404) {
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      }
      res.status(statusCode).sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

startServer();