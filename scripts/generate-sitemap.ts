import { writeFileSync } from "fs";
import path from "path";

const SITE_URL = "https://www.nickelbusbar.com";

const staticPages: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/categories", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
];

type SitemapUrl = { loc: string; lastmod: string; changefreq: string; priority: string };

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDateStamp = (value?: string | Date | null) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
};

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const urls: SitemapUrl[] = staticPages.map((page) => ({
    loc: `${SITE_URL}${page.path}`,
    lastmod: today,
    changefreq: page.changefreq,
    priority: page.priority,
  }));

  // The DB import is dynamic (and every query below independently guarded) so a missing
  // build-time DB connection never fails the build — it just falls back to static pages.
  try {
    const { query } = await import("../db.js");

    try {
      const products = await query<{ slug: string }>(
        `SELECT slug FROM products WHERE slug IS NOT NULL AND slug <> '' ORDER BY id`
      );
      for (const product of products) {
        urls.push({
          loc: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
          lastmod: today,
          changefreq: "weekly",
          priority: "0.6",
        });
      }
    } catch (error) {
      console.warn("[sitemap] Failed to fetch products; omitting product URLs.", error);
    }

    try {
      const posts = await query<{ slug: string; published_at: string | null }>(
        `SELECT slug, published_at FROM blog_posts
         WHERE status = 'published' AND (published_at IS NULL OR published_at <= now())
           AND slug IS NOT NULL AND slug <> ''
         ORDER BY published_at DESC NULLS LAST`
      );
      for (const post of posts) {
        urls.push({
          loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
          lastmod: toDateStamp(post.published_at),
          changefreq: "monthly",
          priority: "0.7",
        });
      }
    } catch (error) {
      console.warn("[sitemap] Failed to fetch blog posts; omitting blog post URLs.", error);
    }
  } catch (error) {
    console.warn("[sitemap] Database unavailable at build time; generating sitemap with static pages only.", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>\n`;

  writeFileSync(path.resolve(process.cwd(), "public/sitemap.xml"), xml, "utf-8");
  console.log(`[sitemap] Wrote ${urls.length} URL(s) to public/sitemap.xml`);
}

main()
  .catch((error) => {
    console.error("[sitemap] Sitemap generation failed; leaving existing public/sitemap.xml untouched.", error);
  })
  .finally(() => {
    process.exit(0);
  });
