/**
 * Row normalisers and search helpers, shared by every runtime.
 *
 * These were defined inside apiApp.ts, which imports Express, nodemailer and jsonwebtoken —
 * none of which can be bundled for Cloudflare Workers. The Worker needs exactly these
 * functions and none of that, so they live here and apiApp imports them back.
 *
 * Nothing in this file may import a Node-only module: it is bundled into the Worker.
 */

const toFiniteNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toFiniteInteger = (value: unknown, fallback = 0) => {
  const parsed = toFiniteNumber(value, fallback);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const normalizeImageSource = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  const compact = value.replace(/\u0000/g, "").trim();
  if (!compact) {
    return "";
  }

  // Some rows contain accidental multi-line image content. Keep the first usable source.
  const candidates = compact
    .split(/[\r\n]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const firstUsable =
    candidates.find((entry) => /^https?:\/\//i.test(entry) || entry.startsWith("/")) ||
    candidates[0] ||
    "";

  const cleaned = firstUsable.trim();
  if (cleaned.includes("images.unsplash.com/photo-1535813548-6601f6945379")) {
    return "/img/icon-logo.jpg";
  }

  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith("/")) {
    return cleaned;
  }

  return `/${encodeURI(cleaned)}`;
};

const normalizeStringArray = (value: unknown) => {
  const raw = typeof value === "string" ? (() => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  })() : value;

  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : null;
};

const normalizeProductRow = (row: Record<string, unknown>) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  category_id: toFiniteInteger(row.category_id, 0),
  price: toFiniteNumber(row.price, 0),
  stock: toFiniteInteger(row.stock, 0),
  image: normalizeImageSource(row.image),
  applications: normalizeStringArray(row.applications),
});

/**
 * Product search matched a single contiguous `ILIKE '%<raw query>%'`, so the separator a
 * buyer happened to type decided whether they got results: every H-Type product is named
 * with a hyphen ("Ni 18650 2P H-Type Nickel Strip"), so "H-Type Nickel Strip" returned three
 * products and "H Type Nickel Strip" returned none. Word order was just as brittle —
 * "nickel strip h type" matched nothing either.
 *
 * Both sides are now flattened to lowercase alphanumeric words and every word has to appear
 * somewhere in the row, in any order. "H Type", "H-Type" and "h_type" all reduce to the same
 * two tokens, and a longer phrase narrows the result set instead of emptying it.
 */
const SEARCH_TOKEN_SEPARATORS = /[^a-z0-9]+/g;

const toSearchTokens = (value: string) =>
  value.toLowerCase().replace(SEARCH_TOKEN_SEPARATORS, " ").trim().split(" ").filter(Boolean);

/**
 * The same flattening applied to the row, as a SQL expression. `columns` are concatenated
 * before normalizing so a phrase spanning two fields ("nickel strip" in `name` plus "ASTM" in
 * `astm_value`) still matches.
 */
const searchHaystackSql = (columns: string[]) =>
  `regexp_replace(lower(${columns.map((column) => `coalesce(${column}::text, '')`).join(" || ' ' || ")}), '[^a-z0-9]+', ' ', 'g')`;

const normalizeAdRow = (row: Record<string, unknown>) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  priority: toFiniteInteger(row.priority, 0),
  discount_percent:
    row.discount_percent == null ? null : toFiniteInteger(row.discount_percent, 0),
  image_url: normalizeImageSource(row.image_url),
});

const normalizeFaqItems = (value: unknown) => {
  const raw = typeof value === "string" ? (() => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  })() : value;

  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = String((item as Record<string, unknown>).question || "").trim();
      const answer = String((item as Record<string, unknown>).answer || "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => item !== null);

  return items.length > 0 ? items : null;
};

const normalizeBlogRow = (row: Record<string, unknown>) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  title: String(row.title || "").trim(),
  slug: String(row.slug || "").trim(),
  excerpt: row.excerpt == null ? null : String(row.excerpt),
  content: row.content == null ? null : String(row.content),
  cover_image_url: normalizeImageSource(row.cover_image_url),
  cover_image_alt: row.cover_image_alt == null ? null : String(row.cover_image_alt).trim() || null,
  author_name: row.author_name == null ? null : String(row.author_name),
  status: row.status == null ? null : String(row.status),
  meta_title: row.meta_title == null ? null : String(row.meta_title),
  meta_description: row.meta_description == null ? null : String(row.meta_description),
  key_answer: row.key_answer == null ? null : String(row.key_answer).trim() || null,
  social_post_url: row.social_post_url == null ? null : String(row.social_post_url).trim() || null,
  faq_items: normalizeFaqItems(row.faq_items),
});

export {
  toFiniteNumber,
  toFiniteInteger,
  normalizeImageSource,
  normalizeStringArray,
  normalizeProductRow,
  toSearchTokens,
  searchHaystackSql,
  normalizeAdRow,
  normalizeFaqItems,
  normalizeBlogRow,
};
