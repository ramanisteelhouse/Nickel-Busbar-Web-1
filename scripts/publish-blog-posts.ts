/**
 * Publishes this round of blog changes through the site's own admin API instead of SQL.
 *
 * Why this exists: the live site reads one specific Supabase project, and the SQL editor a person
 * happens to be signed in to is not always that project (it was not, the first time these scripts
 * were run: `relation "public.blog_posts" does not exist`). The admin API cannot be pointed at the
 * wrong database, because it is the site itself. POST /api/admin/blog-posts upserts by slug, and
 * the people publishing to this site already use it.
 *
 * What it does:
 *   1. Publishes the three new posts, read from supabase/blog-new-posts-overheating-sizing-what-is.sql
 *      so there is one copy of the text, not two. A post whose slug is already live is skipped.
 *   2. Adds the five diagrams to the existing current-carrying-capacity post, using the anchors in
 *      supabase/blog-current-carrying-capacity-diagrams.sql. That endpoint replaces every field of
 *      a post, so the script reads the live post first and sends all of it back with only
 *      `content` changed, after saving a copy to .blog-backups/.
 *
 * Usage (PowerShell):
 *   npx tsx scripts/publish-blog-posts.ts            # preview: reads the live site, changes nothing
 *   $env:BLOG_ADMIN_API_KEY = "<key from Vercel>"
 *   npx tsx scripts/publish-blog-posts.ts --apply    # publish
 *
 * The key is read from the environment only and is never printed. The admin endpoint is rate
 * limited to 10 requests an hour; this makes at most four.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = (process.env.SITE_URL || "https://www.nickelbusbar.com").replace(/\/+$/, "");
const KEY = (process.env.BLOG_ADMIN_API_KEY || "").trim();
const APPLY = process.argv.includes("--apply");

const NEW_POSTS_SQL = "supabase/blog-new-posts-overheating-sizing-what-is.sql";
const DIAGRAMS_SQL = "supabase/blog-current-carrying-capacity-diagrams.sql";
const DIAGRAM_POST_SLUG = "nickel-strip-current-carrying-capacity";
const DIAGRAM_MARKER = "current-carrying-capacity/nickel-strip-";

type Json = Record<string, unknown>;

type NewPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  faqItems: unknown[];
  keyAnswer: string;
};

const fail = (message: string): never => {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
};

/**
 * Reads the values of an `insert ... select <values> where not exists` block in order. The SQL file
 * is the single source for the post text, so this walks its select list rather than duplicating it:
 * single-quoted strings, dollar-quoted strings (the post HTML and JSON), and `now()`.
 */
function readSelectList(block: string): string[] {
  const start = block.indexOf("\nselect\n");
  const end = block.lastIndexOf("\nwhere not exists");
  if (start === -1 || end === -1) fail("Could not find the select list in an insert block.");
  const body = block.slice(start + 8, end);

  const values: string[] = [];
  let i = 0;
  while (i < body.length) {
    const ch = body[i];
    if (/[\s,]/.test(ch)) {
      i++;
    } else if (ch === "'") {
      let j = i + 1;
      let value = "";
      while (j < body.length) {
        if (body[j] === "'" && body[j + 1] === "'") {
          value += "'";
          j += 2;
        } else if (body[j] === "'") {
          break;
        } else {
          value += body[j++];
        }
      }
      values.push(value);
      i = j + 1;
    } else if (ch === "$") {
      const tag = body.slice(i).match(/^\$[A-Za-z0-9_]*\$/)?.[0];
      if (!tag) fail(`Unreadable dollar quote near: ${body.slice(i, i + 30)}`);
      const close = body.indexOf(tag as string, i + (tag as string).length);
      if (close === -1) fail(`Unterminated ${tag} string.`);
      values.push(body.slice(i + (tag as string).length, close));
      i = close + (tag as string).length;
      if (body.startsWith("::jsonb", i)) i += "::jsonb".length;
    } else if (body.startsWith("now()", i)) {
      values.push("now()");
      i += "now()".length;
    } else {
      fail(`Unexpected text in a select list: ${body.slice(i, i + 40)}`);
    }
  }
  return values;
}

function loadNewPosts(): NewPost[] {
  const sql = readFileSync(NEW_POSTS_SQL, "utf8");
  const blocks = [
    ...sql.matchAll(/insert into public\.blog_posts[\s\S]*?where not exists \(select 1 from public\.blog_posts where slug = '([^']+)'\);/g),
  ];
  if (blocks.length !== 3) fail(`Expected 3 posts in ${NEW_POSTS_SQL}, found ${blocks.length}.`);

  return blocks.map(([block, slug]) => {
    const v = readSelectList(block);
    // title, slug, excerpt, content, cover url, cover alt, status, meta title, meta description,
    // published_at, faq_items, key_answer
    if (v.length !== 12) fail(`${slug}: expected 12 values in the select list, found ${v.length}.`);
    if (v[1] !== slug) fail(`${slug}: slug mismatch (${v[1]}).`);
    let faqItems: unknown[];
    try {
      faqItems = JSON.parse(v[10]);
    } catch {
      return fail(`${slug}: FAQ JSON does not parse.`);
    }
    return {
      title: v[0],
      slug: v[1],
      excerpt: v[2],
      content: v[3],
      coverImageUrl: v[4],
      coverImageAlt: v[5],
      status: v[6],
      metaTitle: v[7],
      metaDescription: v[8],
      faqItems,
      keyAnswer: v[11],
    };
  });
}

function loadFigures(): Array<{ anchor: string; replacement: string }> {
  const sql = readFileSync(DIAGRAMS_SQL, "utf8");
  const figures = [...sql.matchAll(/'(<h2>[^']+<\/h2>)',\s*\n\s*\$f(\d)\$([\s\S]*?)\$f\2\$/g)].map((m) => ({
    anchor: m[1],
    // Each figure body already ends with the heading it sits above, so it replaces the heading.
    replacement: m[3],
  }));
  if (figures.length !== 5) fail(`Expected 5 diagrams in ${DIAGRAMS_SQL}, found ${figures.length}.`);
  return figures;
}

async function getPost(slug: string): Promise<Json | null> {
  const response = await fetch(`${BASE}/api/blog-posts/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) fail(`GET ${slug} returned HTTP ${response.status}.`);
  return (await response.json()) as Json;
}

async function upsert(payload: Json): Promise<Json> {
  const response = await fetch(`${BASE}/api/admin/blog-posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-api-key": KEY },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (response.status === 401) fail("The admin API rejected the key (HTTP 401). Check BLOG_ADMIN_API_KEY in Vercel.");
  if (response.status === 429) fail("Rate limited (10 requests an hour). Wait and run again; finished posts are skipped.");
  if (!response.ok) fail(`POST ${String(payload.slug)} returned HTTP ${response.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text) as Json;
}

/** Every field of an existing post, in the shape the admin endpoint takes, so nothing is wiped. */
function payloadFrom(post: Json, content: string): Json {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content,
    coverImageUrl: post.cover_image_url || undefined,
    coverImageAlt: post.cover_image_alt || undefined,
    metaTitle: post.meta_title || undefined,
    metaDescription: post.meta_description || undefined,
    keyAnswer: post.key_answer || undefined,
    socialPostUrl: post.social_post_url || undefined,
    status: "published",
    faqItems: Array.isArray(post.faq_items) ? post.faq_items : undefined,
  };
}

type Action = { label: string; slug: string; payload: Json; backup?: Json };

async function main() {
  console.log(`Site: ${BASE}\nMode: ${APPLY ? "APPLY (will publish)" : "preview (changes nothing)"}\n`);
  const actions: Action[] = [];

  // 1. Three new posts.
  for (const post of loadNewPosts()) {
    if (await getPost(post.slug)) {
      console.log(`skip    ${post.slug}  (already live)`);
      continue;
    }
    actions.push({ label: `publish ${post.slug}`, slug: post.slug, payload: { ...post } });
  }

  // 2. Diagrams into the existing post.
  const current = await getPost(DIAGRAM_POST_SLUG);
  if (!current) fail(`${DIAGRAM_POST_SLUG} is not live, so there is nothing to add the diagrams to.`);
  const original = String((current as Json).content || "");
  if (original.includes(DIAGRAM_MARKER)) {
    console.log(`skip    ${DIAGRAM_POST_SLUG}  (diagrams already present)`);
  } else {
    let content = original;
    for (const { anchor, replacement } of loadFigures()) {
      const count = content.split(anchor).length - 1;
      if (count !== 1) fail(`${DIAGRAM_POST_SLUG}: heading appears ${count} times (need exactly 1): ${anchor}`);
      content = content.replace(anchor, replacement);
    }
    actions.push({
      label: `update  ${DIAGRAM_POST_SLUG}  (+5 diagrams, ${original.length} -> ${content.length} chars)`,
      slug: DIAGRAM_POST_SLUG,
      payload: payloadFrom(current as Json, content),
      backup: current as Json,
    });
  }

  if (!actions.length) {
    console.log("\nNothing to do: everything is already live.");
    return;
  }
  console.log("");
  for (const a of actions) console.log(`plan    ${a.label}`);

  if (!APPLY) {
    console.log("\nPreview only. Nothing was changed. To publish, set BLOG_ADMIN_API_KEY and re-run with --apply.");
    return;
  }
  if (!KEY) fail("BLOG_ADMIN_API_KEY is not set. In PowerShell:  $env:BLOG_ADMIN_API_KEY = \"<key>\"");

  mkdirSync(".blog-backups", { recursive: true });
  for (const a of actions) {
    if (a.backup) {
      const file = path.join(".blog-backups", `${a.slug}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
      writeFileSync(file, JSON.stringify(a.backup, null, 2));
      console.log(`backup  ${file}`);
    }
    const result = await upsert(a.payload);
    console.log(`done    ${a.label}  ->  id ${String(result.id)}, ${String(result.status)}`);
  }

  console.log("\nVerifying on the live site...");
  let ok = true;
  for (const a of actions) {
    const live = await getPost(a.slug);
    const good = Boolean(live) && (a.slug !== DIAGRAM_POST_SLUG || String(live?.content).split(DIAGRAM_MARKER).length - 1 === 5);
    ok &&= good;
    console.log(`${good ? "ok  " : "FAIL"}    ${BASE}/blog/${a.slug}`);
  }
  if (!ok) process.exit(1);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
