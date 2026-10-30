import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { LANDING_PAGES, LANDING_PATHS } from "../src/lib/landingPages.js";
import { productImageUrl } from "../src/lib/productImage.js";
import { GUIDES, GUIDES_PATH, guidePath } from "../src/lib/guides.js";
import { blogProductsFor } from "../src/lib/blogProducts.js";
import { contextualLinks } from "../src/lib/contextualLinks.js";

const SITE_URL = "https://www.nickelbusbar.com";

const staticPages: Array<{ path: string; changefreq: string; priority: string; lastmod?: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  // /categories is deliberately absent: it serves the same grid as /products and now
  // canonicalises there, so submitting it would ask Google to index a known duplicate.
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  // High priority: this is the conversion page for both PAN India bulk buyers and overseas
  // importers, and the only URL carrying the export documentation / HS code / Incoterm content.
  { path: "/export-enquiry", changefreq: "monthly", priority: "0.8" },
  { path: "/calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  // Guides live in the codebase (src/lib/guides.ts). lastmod is the guide's own date: stamping
  // them with the build date would tell Google they change on every deploy.
  { path: GUIDES_PATH, changefreq: "monthly", priority: "0.7", lastmod: GUIDES.reduce((latest, g) => (g.dateModified > latest ? g.dateModified : latest), "") },
  ...GUIDES.map((guide) => ({ path: guidePath(guide.slug), changefreq: "monthly", priority: "0.7", lastmod: guide.dateModified })),
  { path: "/blog/nickel-strips-lithium-batteries", changefreq: "monthly", priority: "0.7" },
  // Category and state landing pages. /h-type-nickel-strip is priority 0.9: it is the page
  // that exists because "H type nickel strip manufacturer in India" was landing on the
  // homepage, and it needs to be crawled before the state set.
  ...LANDING_PATHS.map((path) => ({
    path,
    changefreq: "monthly",
    priority: path === "/h-type-nickel-strip" ? "0.9" : "0.7",
  })),
];

/**
 * lastmod must mean "the content changed". Stamping every page with the build date told Bing (and
 * through it Copilot) that 39 of 72 URLs changed on every deploy, which is how a search engine
 * learns to ignore the field. The ledger records a hash of each page's real content and the date
 * that hash was first seen; an unchanged page keeps its old date. A page with no ledger entry is
 * dated from the last git commit that touched its source (full clones only), else today.
 */
const LEDGER_PATH = path.resolve(process.cwd(), "scripts/sitemap-lastmod.json");
type Ledger = Record<string, { hash: string; lastmod: string; v?: number }>;

/**
 * The hash shape a given kind of page uses, carried per entry rather than globally.
 *
 * Widening a hash rewrites every hash of that shape at once, and the ledger would read that as
 * every one of those pages changing today — the "39 of 72 URLs changed" signal this file exists
 * to avoid. When an entry's recorded version differs, the new hash is taken as the baseline and
 * the existing lastmod is kept, so nothing is falsely re-dated and the next real change is still
 * caught.
 *
 * It is per call site, not one constant for the file, and that distinction is load-bearing: a
 * global version was applied to static and landing pages whose shape had not changed at all,
 * which made them skip the hash comparison and revert to whatever date the committed ledger
 * held. That silently undid a real change — the landing-page thumbnails, correctly dated the day
 * they shipped, went backwards by three days. Only bump the kind whose shape you actually
 * changed.
 *
 *   v1  content only — static, landing, guides
 *   v2  content plus the per-page rendering inputs (product block, contextual links), so a code
 *       change that alters what the page renders moves lastmod as a database edit would
 */
const HASH_V_RENDER_INPUTS = 2;

/**
 * Source-file hashes became newline-normalised, so every one of them changed value without any
 * page changing content. Re-baselining keeps the last date we have reason to believe, rather
 * than announcing that seven pages changed on the day the normalisation shipped — which is the
 * false signal this whole mechanism exists to suppress.
 *
 * Only the source-file branch carries it. Landing pages hash a data object, which never had the
 * line-ending problem, and bumping their version would throw away the thumbnail date they are
 * correctly reporting.
 */
const HASH_V_NORMALISED_SOURCES = 2;
const ledger: Ledger = existsSync(LEDGER_PATH) ? JSON.parse(readFileSync(LEDGER_PATH, "utf-8")) : {};
const nextLedger: Ledger = {};

const hashOf = (value: unknown) =>
  createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex").slice(0, 16);
/**
 * Newlines are normalised before hashing. The repo sets core.autocrlf=true, so a Windows working
 * tree holds CRLF while Vercel checks the same commit out as LF — different bytes, different
 * hash, for identical content. The ledger is written on one and read on the other, so every page
 * hashed from source files mismatched on every Vercel build and was stamped with the build date:
 * /about, /contact, /blog and /products were each claiming to change daily. Comparing content
 * rather than line endings is what makes the date mean anything.
 */
const readSources = (files: string[]) =>
  files
    .map((file) => (existsSync(file) ? readFileSync(file, "utf-8") : ""))
    .join("\n")
    .replace(/\r\n/g, "\n");
const todayStamp = () => new Date().toISOString().slice(0, 10);

function gitDate(files: string[]): string | null {
  if (files.length === 0) return null;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...files], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

/**
 * `seed` is the date to use for a page the ledger has never seen, in place of the git date or
 * today. Blog posts pass their published/updated date: without it, the first build after this
 * file started tracking them would stamp all 30 with today and claim the whole blog changed at
 * once.
 */
function stamp(
  key: string,
  content: unknown,
  sourceFiles: string[] = [],
  options: { seed?: string; version?: number } = {}
): string {
  const version = options.version ?? 1;
  const hash = hashOf(content);
  const previous = ledger[key];
  const lastmod = !previous
    ? options.seed ?? gitDate(sourceFiles) ?? todayStamp()
    : (previous.v ?? 1) !== version
      ? previous.lastmod
      : previous.hash === hash
        ? previous.lastmod
        : todayStamp();
  nextLedger[key] = { hash, lastmod, v: version };
  return lastmod;
}

/** Both are YYYY-MM-DD, so the later one is just the larger string. */
const laterOf = (a: string, b: string) => (a > b ? a : b);

type SitemapImage = { loc: string; title: string };

type SitemapUrl = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  /**
   * Photos on this page, submitted to Google Images through the image namespace declared on
   * the urlset. Google will index an image it finds by crawling the page anyway, but a photo
   * that appears only after React mounts is not in the HTML an image crawler reads, and the
   * sitemap is the supported way to declare one regardless.
   */
  images?: SitemapImage[];
};

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
  let degraded = false;
  const today = new Date().toISOString().slice(0, 10);
  const landingByPath = new Map(LANDING_PAGES.map((page) => [`/${page.slug}`, page]));
  const pageSources: Record<string, string[]> = {
    "/": ["src/pages/HomePage.tsx", "src/lib/homeContent.ts"],
    "/products": ["src/pages/ProductListingPage.tsx", "src/lib/catalogueMeta.ts"],
    "/about": ["src/pages/AboutPage.tsx"],
    "/contact": ["src/pages/ContactPage.tsx", "src/lib/contact.ts"],
    "/export-enquiry": ["src/pages/ExportEnquiryPage.tsx"],
    "/calculator": ["src/pages/CalculatorPage.tsx"],
    "/blog": ["src/pages/BlogListingPage.tsx"],
    "/blog/nickel-strips-lithium-batteries": ["src/lib/lithiumArticle.ts", "src/pages/BlogNickelStripsLithiumPage.tsx"],
  };
  const urls: SitemapUrl[] = staticPages.map((page) => {
    const landing = landingByPath.get(page.path);
    const sources = pageSources[page.path] ?? [];
    const lastmod =
      page.lastmod ??
      (landing
        ? stamp(page.path, landing, ["src/lib/landingPages.ts"])
        : stamp(page.path, readSources(sources), sources, { version: HASH_V_NORMALISED_SOURCES }));
    return { loc: `${SITE_URL}${page.path}`, lastmod, changefreq: page.changefreq, priority: page.priority };
  });

  // The DB import is dynamic (and every query below independently guarded) so a missing
  // build-time DB connection never fails the build — it just falls back to static pages.
  try {
    const { query } = await import("../db.js");

    try {
      // The whole row is hashed except `image` (a signed URL that changes on every read), `stock`
      // (a running count, not page copy) and the id/created_at bookkeeping columns.
      const products = await query<{ slug: string; name: string | null; image: string | null; [key: string]: unknown }>(
        `SELECT * FROM products WHERE slug IS NOT NULL AND slug <> '' ORDER BY id`
      );
      for (const product of products) {
        const { image: _image, stock: _stock, id: _id, created_at: _createdAt, ...content } = product;
        urls.push({
          loc: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
          lastmod: stamp(
            `/product/${product.slug}`,
            // Same reasoning as the blog posts below: the contextual links a product page
            // renders are decided in code, so a change there has to register as a change.
            { content, links: contextualLinks({ kind: "product", slug: product.slug }) },
            ["src/pages/ProductDetailPage.tsx"],
            { version: HASH_V_RENDER_INPUTS }
          ),
          changefreq: "weekly",
          priority: "0.6",
          // productImageUrl resolves to the synced WebP on our own origin, never the signed
          // Supabase URL held in `image`: storage answers every object with X-Robots-Tag:
          // none, so an image crawler sent there would be told not to index the very photo
          // this entry exists to submit.
          images: [
            {
              loc: productImageUrl(SITE_URL, product.slug, product.image),
              title: product.name?.trim() || product.slug,
            },
          ],
        });
      }
    } catch (error) {
      console.warn("[sitemap] Failed to fetch products; omitting product URLs.", error);
      degraded = true;
    }

    try {
      const posts = await query<{
        slug: string;
        published_at: string | null;
        updated_at: string | null;
        cover_image_url: string | null;
        [key: string]: unknown;
      }>(
        `SELECT * FROM blog_posts
         WHERE status = 'published' AND (published_at IS NULL OR published_at <= now())
           AND slug IS NOT NULL AND slug <> ''
         -- id breaks ties so the generated sitemap is byte-stable between builds when
         -- several posts share a NULL published_at.
         ORDER BY published_at DESC NULLS LAST, id DESC`
      );
      for (const post of posts) {
        // Excluded from the hash: cover_image_url is a signed Supabase URL whose token is
        // re-issued on read, so hashing it would report every post as changed on every build —
        // the same reason products drop `image`. The id and the three dates are bookkeeping; the
        // copy columns are what actually decide whether the page changed.
        const {
          cover_image_url: _cover,
          id: _id,
          created_at: _createdAt,
          published_at: publishedAt,
          updated_at: updatedAt,
          ...content
        } = post;

        // published_at alone was being advertised, so 22 of 30 posts edited after publication
        // were telling crawlers they had not changed since the day they went up.
        //
        // Only dates that exist are considered. toDateStamp() answers today for a null, and two
        // posts carry a null published_at, so folding it in unconditionally would have dated
        // both to the build date on every build — a daily "this changed" for a page that had
        // not, which is the signal this file exists to avoid. Today is used only when a post
        // has neither date.
        const knownDates = [publishedAt, updatedAt].filter(Boolean).map((value) => toDateStamp(value as string));
        const contentDate = knownDates.length ? knownDates.reduce(laterOf) : todayStamp();

        urls.push({
          loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
          // Hashing the rendering inputs alongside the copy is what makes a code-level change
          // count: adding a post to ARTICLE_PRODUCTS or to contextualLinks changes what the page
          // renders without touching a single database row, and until now the sitemap said
          // nothing had changed. Both are per-slug, so editing one post's block re-dates that
          // post and leaves the other 29 alone.
          lastmod: stamp(
            `/blog/${post.slug}`,
            {
              content,
              products: blogProductsFor(post.slug).map((product) => product.slug),
              links: contextualLinks({ kind: "blog", slug: post.slug }),
            },
            [],
            { seed: contentDate, version: HASH_V_RENDER_INPUTS }
          ),
          changefreq: "monthly",
          priority: "0.7",
        });
      }
    } catch (error) {
      console.warn("[sitemap] Failed to fetch blog posts; omitting blog post URLs.", error);
      degraded = true;
    }
  } catch (error) {
    console.warn("[sitemap] Database unavailable at build time; generating sitemap with static pages only.", error);
    degraded = true;
  }

  const imageXml = (images?: SitemapImage[]) =>
    (images ?? [])
      .map(
        (image) =>
          `\n    <image:image>\n      <image:loc>${escapeXml(image.loc)}</image:loc>\n      <image:title>${escapeXml(image.title)}</image:title>\n    </image:image>`
      )
      .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>${imageXml(url.images)}\n  </url>`
    )
    .join("\n")}\n</urlset>\n`;

  // A run that could not reach the database still produces a *valid* file - just one with
  // the static pages and nothing else. Writing it would replace every product and article
  // entry with silence, and because the committed copy still looks right, nothing downstream
  // would show the loss. A DB hiccup must not fail the build, so a degraded run keeps its
  // warning and leaves the existing file alone; only a first run with no file to protect
  // writes the short version.
  const outputPath = path.resolve(process.cwd(), "public/sitemap.xml");
  if (degraded && existsSync(outputPath)) {
    const existing = readFileSync(outputPath, "utf-8");
    const existingCount = (existing.match(/<loc>/g) || []).length;
    console.warn(
      `[sitemap] Database unreachable: this run would write ${urls.length} URL(s) over an existing ${existingCount}. Leaving public/sitemap.xml untouched - fix the build-time DB connection and re-run.`
    );
    return;
  }

  writeFileSync(outputPath, xml, "utf-8");
  // Sorted so the ledger diff in git shows only real changes.
  const sortedLedger = Object.fromEntries(Object.entries(nextLedger).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(LEDGER_PATH, JSON.stringify(sortedLedger, null, 2) + "\n", "utf-8");
  console.log(`[sitemap] Wrote ${urls.length} URL(s) to public/sitemap.xml`);
}

main()
  .catch((error) => {
    console.error("[sitemap] Sitemap generation failed; leaving existing public/sitemap.xml untouched.", error);
  })
  .finally(() => {
    process.exit(0);
  });
