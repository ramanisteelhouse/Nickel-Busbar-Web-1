import { query, queryOne } from "../db.js";
import {
  normalizeAdRow,
  normalizeBlogRow,
  normalizeProductRow,
  searchHaystackSql,
  toSearchTokens,
} from "./rows.js";

/**
 * The read side of the API, as plain functions.
 *
 * Express (apiApp.ts) and the Cloudflare Worker (worker/index.ts) both serve these same
 * endpoints, and both call the functions below rather than carrying their own copy of the SQL.
 * Two runtimes with two copies of a query is the drift this codebase has been bitten by
 * before — a search fix applied to one host and not the other would be invisible until a buyer
 * on the wrong host got no results.
 *
 * No Node-only imports here: this file is bundled into the Worker.
 */

export type ProductFilters = {
  category?: string | null;
  featured?: boolean;
  search?: string | null;
};

/**
 * Returns null when the search query normalises to no tokens at all — which is different from
 * "no filter". A query in a script this tokeniser strips (Chinese, Arabic, Devanagari) or one
 * made only of punctuation would otherwise fall through and return the entire catalogue,
 * telling the buyer that all 17 products matched. Zero results is the honest answer, and the
 * callers turn this null into an empty list.
 */
export async function listProducts(filters: ProductFilters): Promise<Record<string, unknown>[] | null> {
  let sql =
    "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
  const params: unknown[] = [];

  const category = typeof filters.category === "string" ? filters.category.trim() : "";
  if (category) {
    params.push(category);
    sql += ` AND c.slug = $${params.length}`;
  }
  if (filters.featured) {
    sql += " AND p.is_featured = true";
  }

  const search = typeof filters.search === "string" ? filters.search.trim() : "";
  if (search) {
    const tokens = toSearchTokens(search);
    if (!tokens.length) return null;
    params.push(tokens);
    const tokensParam = `$${params.length}`;
    const haystack = searchHaystackSql([
      "p.name",
      "p.description",
      "p.astm_value",
      "p.uns_value",
      "p.dimensions",
      "p.price",
      "c.name",
    ]);
    sql += ` AND (
          SELECT bool_and(${haystack} LIKE '%' || token || '%')
          FROM unnest(${tokensParam}::text[]) AS token
        )`;
  }

  const rows = await query(sql, params as any[]);
  return rows.map((row) => normalizeProductRow(row as Record<string, unknown>));
}

export async function getProductBySlug(slug: string): Promise<Record<string, unknown> | null> {
  const product = await queryOne(
    "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1",
    [slug]
  );
  return product ? normalizeProductRow(product as Record<string, unknown>) : null;
}

/**
 * The related block on a product page. Deliberately the same query renderProductSnapshot uses,
 * so the crawler snapshot and the rendered page link to the same six products.
 */
export async function getRelatedProducts(slug: string): Promise<Record<string, unknown>[] | null> {
  const product = await queryOne<{ category_id: number | null }>(
    "SELECT category_id FROM products WHERE slug = $1",
    [slug]
  );
  // null, not []: the caller answers 404 for an unknown product rather than an empty list.
  if (!product) return null;

  return query(
    // Same category first, then fill from the rest of the catalogue rather than filtering to
    // it: "Plain Nickel Strips" and "Copper Busbar" are each alone in their category, so a
    // category-only filter left the two pages that most needed a way onward as dead ends.
    //
    // IS NOT DISTINCT FROM, not `=`: a product with no category would otherwise compare NULL
    // to NULL, get NULL rather than true, and lose its own category grouping.
    `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
           FROM products p
          WHERE p.slug <> $1
          ORDER BY (p.category_id IS NOT DISTINCT FROM $2::bigint) DESC,
                   p.is_featured DESC,
                   p.name
          LIMIT 6`,
    [slug, product.category_id ?? null]
  );
}

/**
 * Typeahead. Same separator-insensitive matching as listProducts, so the dropdown cannot go
 * empty on a phrase the results page would have matched. Tokens match as substrings, which is
 * what a typeahead needs: it fires mid-word. Names that start with what was typed sort first.
 */
export async function getProductSuggestions(rawQuery: string, limit = 8): Promise<Record<string, unknown>[]> {
  const tokens = toSearchTokens(rawQuery.trim());
  if (!tokens.length) return [];

  const nameHaystack = searchHaystackSql(["p.name"]);
  const prefixPattern = `${tokens.join(" ")}%`;
  return query(
    `SELECT
          p.id,
          p.slug,
          p.name,
          p.image,
          c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE (
           SELECT bool_and(${nameHaystack} LIKE '%' || token || '%')
           FROM unnest($1::text[]) AS token
         )
         ORDER BY
           CASE WHEN ${nameHaystack} LIKE $2 THEN 0 ELSE 1 END,
           p.name ASC
         LIMIT $3`,
    [tokens, prefixPattern, limit]
  );
}

export async function listCategories(): Promise<Record<string, unknown>[]> {
  return query("SELECT * FROM categories ORDER BY id");
}

export async function listBlogPosts(limit = 6): Promise<Record<string, unknown>[]> {
  const posts = await query(
    `SELECT
          id,
          title,
          slug,
          -- The backslash must be doubled: this SQL lives in a JS template literal, where a
          -- lone \\s collapses to a bare "s" and Postgres would strip the letter s from every
          -- generated excerpt instead of collapsing whitespace.
          COALESCE(NULLIF(excerpt, ''), LEFT(REGEXP_REPLACE(content, '\\s+', ' ', 'g'), 180)) AS excerpt,
          cover_image_url,
          cover_image_alt,
          author_name,
          status,
          meta_title,
          meta_description,
          published_at,
          created_at,
          updated_at
         FROM blog_posts
         WHERE status = 'published'
           AND (published_at IS NULL OR published_at <= now())
         ORDER BY published_at DESC NULLS LAST, created_at DESC
         LIMIT $1`,
    [limit]
  );
  return posts.map((post) => normalizeBlogRow(post as Record<string, unknown>));
}

export async function getBlogPostBySlug(slug: string): Promise<Record<string, unknown> | null> {
  const post = await queryOne(
    `SELECT
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image_url,
          cover_image_alt,
          author_name,
          status,
          meta_title,
          meta_description,
          key_answer,
          social_post_url,
          faq_items,
          published_at,
          created_at,
          updated_at
         FROM blog_posts
         WHERE slug = $1
           AND status = 'published'
           AND (published_at IS NULL OR published_at <= now())`,
    [slug]
  );
  return post ? normalizeBlogRow(post as Record<string, unknown>) : null;
}

export async function getActiveAds(): Promise<Record<string, unknown>[]> {
  try {
    const ads = await query(
      `SELECT *
         FROM ads
         WHERE is_active = true
           AND (start_at IS NULL OR start_at <= now())
           AND (end_at IS NULL OR end_at >= now())
         ORDER BY priority DESC, created_at DESC`
    );
    return ads.map((ad) => normalizeAdRow(ad as Record<string, unknown>));
  } catch (error) {
    // 42P01 is "relation does not exist": a database that has not run supabase/setup.sql has
    // no ads table, and an empty ad list is the right answer rather than a 500 on every page.
    if ((error as { code?: string })?.code === "42P01") return [];
    throw error;
  }
}
