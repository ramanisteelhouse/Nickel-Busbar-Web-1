/**
 * Tells Bing and the other IndexNow search engines which pages are new or changed.
 *
 * Why: ChatGPT search, Copilot and Bing all lean on Bing's index, and Bing otherwise finds a new
 * page on its own schedule, which can be days. IndexNow is a free open protocol (one POST listing
 * URLs) that makes it minutes. Google does not take part in IndexNow; this does nothing for Google.
 *
 *     npx tsx scripts/indexnow.ts                  # pages changed in the last 48 hours
 *     npx tsx scripts/indexnow.ts --since 26       # ... in the last 26 hours
 *     npx tsx scripts/indexnow.ts --all            # every URL in the sitemap (use rarely)
 *     npx tsx scripts/indexnow.ts --urls /blog/x /guides/y     # exactly these pages
 *     npx tsx scripts/indexnow.ts --dry-run        # show what would be sent, send nothing
 *
 * It runs by itself: after every deploy that passes the smoke check (.github/workflows/smoke.yml)
 * and once a day (.github/workflows/indexnow.yml), because blog posts are published through the
 * database with no deploy at all.
 *
 * What counts as "changed". The sitemap cannot answer that: it is written at build time, so a post
 * published afterwards is missing from it, and the build stamps every product with the build date.
 * So the changed set is read from live sources instead: blog posts from /api/blog-posts (the later
 * of published_at and updated_at, which also catches a post edited in the database and a scheduled
 * post going live), and guides from their own dateModified. A changed page also pulls in its hub
 * (/blog or /guides), since that is where its link first appears. Products are not in the set: the
 * products API carries no change date, so use --urls after editing one.
 *
 * Before sending anything it fetches the key file from the live site. A submission whose key file
 * is not yet deployed is answered 403, and repeating that is the "submitting too often" pattern
 * IndexNow rate-limits, so the script stops instead.
 *
 * The key is not a password. The protocol requires the key file to be publicly readable at the site
 * root; it only proves that whoever submits URLs controls the host, and engines reject any URL that
 * is not on that host.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { GUIDES, GUIDES_PATH, guidePath } from "../src/lib/guides.js";

export const INDEXNOW_KEY = "486281807b02b3774e51da9201d71faa";

const SITE = (process.env.SITE_URL || "https://www.nickelbusbar.com").replace(/\/+$/, "");
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const HOST = new URL(SITE).host;
const KEY_URL = `${SITE}/${INDEXNOW_KEY}.txt`;
/** IndexNow accepts up to 10,000 URLs per request. */
const MAX_PER_REQUEST = 10_000;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ALL = args.includes("--all");

const flagValue = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const SINCE_HOURS = Number(flagValue("--since") ?? 48);
const urlsFlag = args.indexOf("--urls");
const EXPLICIT_URLS = urlsFlag === -1 ? [] : args.slice(urlsFlag + 1).filter((a) => !a.startsWith("--"));

const fail = (message: string): never => {
  throw new Error(message);
};

const absolute = (value: string): string => {
  const url = new URL(value, `${SITE}/`);
  if (url.host !== HOST) fail(`${value} is on ${url.host}, not ${HOST}. IndexNow rejects URLs from another host.`);
  return url.toString();
};

type BlogRow = { slug?: string; published_at?: string | null; updated_at?: string | null };

async function recentBlogUrls(cutoff: number): Promise<string[]> {
  const response = await fetch(`${SITE}/api/blog-posts?limit=50`);
  if (!response.ok) throw new Error(`blog API returned ${response.status}`);
  const rows = (await response.json()) as BlogRow[];
  return rows
    .filter((row) => {
      if (!row.slug) return false;
      const touched = Math.max(Date.parse(row.published_at ?? "") || 0, Date.parse(row.updated_at ?? "") || 0);
      return touched >= cutoff;
    })
    .map((row) => `/blog/${row.slug}`);
}

function recentGuideUrls(cutoff: number): string[] {
  // dateModified is a calendar date (UTC midnight), so compare on whole days, not hours. A guide
  // dated today therefore counts as changed for the rest of today, whatever --since says.
  const cutoffDay = new Date(cutoff).toISOString().slice(0, 10);
  return GUIDES.filter((guide) => guide.dateModified >= cutoffDay).map((guide) => guidePath(guide.slug));
}

async function sitemapUrls(): Promise<string[]> {
  const response = await fetch(`${SITE}/sitemap.xml`);
  if (!response.ok) throw new Error(`sitemap returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function collect(): Promise<{ urls: string[]; why: string }> {
  if (EXPLICIT_URLS.length) return { urls: EXPLICIT_URLS, why: "the URLs you named" };
  if (ALL) return { urls: await sitemapUrls(), why: "every URL in the sitemap" };

  if (!Number.isFinite(SINCE_HOURS) || SINCE_HOURS <= 0) fail(`--since needs a number of hours, got "${flagValue("--since")}".`);
  const cutoff = Date.now() - SINCE_HOURS * 3_600_000;
  const blog = await recentBlogUrls(cutoff);
  const guides = recentGuideUrls(cutoff);
  const hubs = [...(blog.length ? ["/blog"] : []), ...(guides.length ? [GUIDES_PATH] : [])];
  return { urls: [...blog, ...guides, ...hubs], why: `pages changed in the last ${SINCE_HOURS} hours` };
}

/** The key file must be live and must contain exactly the key, or every engine answers 403. */
async function keyFileIsLive(): Promise<boolean> {
  const local = path.resolve(process.cwd(), "public", `${INDEXNOW_KEY}.txt`);
  if (!existsSync(local) || readFileSync(local, "utf8").trim() !== INDEXNOW_KEY) {
    fail(`public/${INDEXNOW_KEY}.txt is missing or does not contain the key. Restore it before submitting.`);
  }
  try {
    const response = await fetch(KEY_URL, { redirect: "follow" });
    return response.ok && (await response.text()).trim() === INDEXNOW_KEY;
  } catch {
    return false;
  }
}

async function submit(urls: string[]): Promise<void> {
  for (let i = 0; i < urls.length; i += MAX_PER_REQUEST) {
    const batch = urls.slice(i, i + MAX_PER_REQUEST);
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_URL, urlList: batch }),
    });
    const meaning: Record<number, string> = {
      200: "accepted",
      202: "accepted, key validation pending (normal for a first submission)",
      400: "rejected: bad request format",
      403: "rejected: the key file could not be validated",
      422: "rejected: a URL is not on this host, or the key does not match the schema",
      429: "rejected: too many requests, wait before trying again",
    };
    const ok = response.status === 200 || response.status === 202;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${batch.length} URL(s) -> HTTP ${response.status} ${meaning[response.status] ?? ""}`);
    if (!ok) fail(`the submission was rejected (HTTP ${response.status}); see above.`);
  }
}

async function main() {
  const { urls: raw, why } = await collect();
  const urls = [...new Set(raw.map(absolute))];

  console.log(`IndexNow for ${HOST}: ${why}`);
  if (!urls.length) {
    console.log("Nothing has changed, so nothing was sent.");
    return;
  }
  for (const url of urls.slice(0, 15)) console.log(`  ${url}`);
  if (urls.length > 15) console.log(`  ... and ${urls.length - 15} more`);

  const live = await keyFileIsLive();
  console.log(`key file ${KEY_URL}: ${live ? "live" : "NOT live"}`);
  if (DRY_RUN) {
    console.log(`\nDry run: ${urls.length} URL(s) would be sent. Nothing was sent.`);
    return;
  }
  if (!live) {
    fail("the key file is not live yet, so engines would reject the submission. Deploy it, then run this again.");
  }
  await submit(urls);
}

main().catch((error) => {
  console.error(`\nindexnow: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
