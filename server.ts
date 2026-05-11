import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import createApiApp from "./apiApp.js";

async function startServer() {
  const app = createApiApp();
  const PORT = Number(process.env.PORT || 3000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

startServer();
