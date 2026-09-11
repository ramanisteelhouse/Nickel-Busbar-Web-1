// Non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, and most other AI/answer-engine
// bots) fetch raw HTML and never execute the client bundle, so the plain Vite SPA shell
// (`<div id="root"></div>`) is invisible to them on every route. This module injects a
// real, crawlable HTML snapshot (title/meta/JSON-LD/content) for the two route types that
// matter most for answer-engine visibility — blog posts and product pages — directly into
// the HTML response, before the client bundle ever runs. Real browsers still get the normal
// SPA: React's createRoot().render() fully replaces this markup on mount.
import { query, queryOne } from "./db.js";
import {
  EMAIL_ADDRESSES,
  PHONE_NUMBERS,
  POSTAL_ADDRESS,
  PRIMARY_CALL,
  PRIMARY_EMAIL,
} from "./src/lib/contact.js";
import { ANSWER_BLOCK, ANSWER_BLOCK_QUESTION } from "./src/lib/answerBlock.js";
import type { StaticSnapshotRoute, NoindexSnapshotRoute } from "./src/lib/snapshotRoutes.js";
import {
  RETURN_POLICY_HEADING,
  RETURN_POLICY_LINES,
  RETURN_POLICY_SCHEMA,
} from "./src/lib/returnPolicy.js";
import { getLandingPageByPathname, STATE_LANDING_PAGES } from "./src/lib/landingPages.js";
import { productImageUrl } from "./src/lib/productImage.js";
import {
  fillKeywordParagraphs,
  resolveProductKeywordBlock,
  keywordMetaDescription,
  productImageAltSubject,
  productPageTitle,
  BUYER_ROLE_KEYWORDS,
  type ProductSeoColumns,
} from "./src/lib/productSeo.js";
import { buildImageAlt } from "./src/lib/utils.js";
import { buildProductSpecs, NICKEL_PURITY_RANGE } from "./src/lib/productSpecs.js";
import { BROCHURE } from "./src/lib/brochure.js";
import { YEARS_IN_BUSINESS } from "./src/lib/heritage.js";
import {
  applications as HOME_APPLICATIONS,
  faqItems as HOME_FAQ_ITEMS,
  industries as HOME_INDUSTRIES,
  productSpecifications as HOME_SPECIFICATIONS,
  productVariants as HOME_VARIANTS,
  qualityPoints as HOME_QUALITY_POINTS,
  whyChooseUs as HOME_WHY_CHOOSE_US,
} from "./src/lib/homeContent.js";
import {
  EXPORT_DESCRIPTION,
  EXPORT_DOCUMENTS,
  EXPORT_FAQS,
  EXPORT_H1,
  EXPORT_HIGHLIGHTS,
  EXPORT_LEAD,
  EXPORT_PATH,
  EXPORT_PRODUCT_FORMS,
  EXPORT_REGIONS,
  EXPORT_SPECS,
  EXPORT_TITLE,
  HS_CODES,
  INCOTERMS,
  INDIA_HIGHLIGHTS,
  LOADING_PORTS,
  PRODUCT_EXPORT_LEAD,
  PRODUCT_EXPORT_TERMS,
} from "./src/lib/exportEnquiry.js";

const SITE_URL = "https://www.nickelbusbar.com";
const SITE_NAME = "Ramani Steel House";
// The brand logo, for schema.org `logo` fields. Kept distinct from the social card below:
// Google wants the real mark here, not a padded share image.
const SITE_LOGO_URL = `${SITE_URL}/img/logo.png`;
// The bare wordmark is 4560x916 (~5:1) and social cards crop to 1.91:1, so every share of this
// site showed a sliver of the logo. og-image.png is the wordmark centred on a 1200x630 card.
const SITE_OG_IMAGE_URL = `${SITE_URL}/img/og-image.png`;

const escapeHtml = (value: string) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttr = (value: string) => escapeHtml(value);

// Prices are stored and quoted in INR. The client localises them per visitor, but a snapshot
// is rendered once for everyone, so it states the base currency.
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const formatInr = (amount: number) => inrFormatter.format(amount);

// `location` is set only on a 301: api/render.ts turns it into a Location header. A redirect
// lives here rather than in vercel.json wherever the decision needs the database or a
// case-sensitive comparison, neither of which a route pattern can do.
type SnapshotResult = { status: number; html: string; location?: string };

type HeadInput = {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  /** Replaces index.html's site-wide keyword list when a page targets its own phrases. */
  keywords?: string[];
  robots?: string;
  jsonLd: object[];
  snapshotBody: string;
};

// String.replace treats `$&`, `$'`, "$`" and `$$` as substitution patterns inside a
// replacement *string*, which corrupts any content containing a dollar sign - and escapeHtml
// makes it worse, since it turns `&` into `&amp;` and `'` into `&#39;`, so both `$&` and `$'`
// in the source text end up as a live `$&` sequence. Passing a function instead makes the
// replacement literal. Every replace below goes through this.
const replaceOnce = (html: string, pattern: RegExp | string, replacement: string) =>
  html.replace(pattern, () => replacement);

const injectHead = (template: string, head: HeadInput) => {
  let html = template;

  // Every tag this function writes carries data-ssr-head, matching index.html. The marker is
  // what src/lib/ssrHeadCleanup.ts looks for: React 19 hoists a page component's head tags
  // alongside these rather than reconciling with them, so without it the mounted page ends up
  // holding two canonicals and two descriptions - the duplicate-canonical audit finding. The
  // marked copy is removed once the app has published its own replacement.
  html = replaceOnce(
    html,
    /<title[^>]*>[\s\S]*?<\/title>/,
    `<title data-ssr-head="true">${escapeHtml(head.title)}</title>`
  );

  html = replaceOnce(
    html,
    /<meta name="description"[^>]*>/,
    `<meta name="description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`
  );

  html = replaceOnce(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" data-ssr-head="true" href="${escapeAttr(head.canonical)}" />`
  );

  // Self-referencing hreflang. The site publishes one language, so `en` plus `x-default`
  // pointing at the same URL is the complete set - it tells search engines the URL is the
  // canonical choice for every locale rather than leaving them to guess at an alternate.
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="en"[^>]*>\s*<link rel="alternate" hreflang="x-default"[^>]*>/,
    `<link rel="alternate" hreflang="en" href="${escapeAttr(head.canonical)}" />\n  ` +
      `<link rel="alternate" hreflang="x-default" href="${escapeAttr(head.canonical)}" />`
  );

  if (head.robots) {
    html = replaceOnce(
      html,
      /<meta name="robots"[^>]*>/,
      `<meta name="robots" data-ssr-head="true" content="${escapeAttr(head.robots)}" />`
    );
  }

  // Google has ignored this tag since 2009, so it is never the reason a page ranks - but Bing,
  // Yandex and several AI crawlers still read it, and leaving the homepage's list on a product
  // page describes the wrong page to all of them.
  if (head.keywords?.length) {
    html = replaceOnce(
      html,
      /<meta name="keywords"[\s\S]*?>/,
      `<meta name="keywords" data-ssr-head="true" content="${escapeAttr(head.keywords.join(", "))}" />`
    );
  }

  // Strip the original og:description/og:url/og:image/twitter:* tags *before* inserting the
  // new og:title block below — otherwise the newly-inserted tags (which appear earlier in the
  // document) get matched and stripped instead of the stale originals.
  html = html.replace(/<meta property="og:description"[^>]*>/, "");
  html = html.replace(/<meta property="og:url"[^>]*>/, "");
  html = html.replace(/<meta property="og:image"[^>]*>/, "");
  html = html.replace(/<meta name="twitter:title"[^>]*>/, "");
  html = html.replace(/<meta name="twitter:description"[^>]*>/, "");
  html = html.replace(/<meta name="twitter:image"[^>]*>/, "");

  const ogTags = [
    `<meta property="og:title" data-ssr-head="true" content="${escapeAttr(head.title)}" />`,
    `<meta property="og:description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`,
    `<meta property="og:url" data-ssr-head="true" content="${escapeAttr(head.canonical)}" />`,
    head.ogImage ? `<meta property="og:image" data-ssr-head="true" content="${escapeAttr(head.ogImage)}" />` : "",
    `<meta name="twitter:title" data-ssr-head="true" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`,
    head.ogImage ? `<meta name="twitter:image" data-ssr-head="true" content="${escapeAttr(head.ogImage)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n  ");
  html = replaceOnce(html, /<meta property="og:title"[^>]*>/, ogTags);

  // JSON.stringify escapes neither `<` nor `/`, so a title or FAQ answer containing the
  // literal text `</script>` would close this tag early and turn whatever follows into live
  // markup. Escaping `<` as its \u003c form keeps the JSON valid and the tag intact.
  const jsonLdScripts = head.jsonLd
    .map(
      (entry) =>
        `<script type="application/ld+json" data-ssr-head="true">${JSON.stringify(entry).replace(/</g, "\\u003c")}</script>`
    )
    .join("\n  ");

  // Inject an SSR content snapshot inside #root (real crawlers see this; React replaces it on mount).
  html = replaceOnce(
    html,
    '<div id="root"></div>',
    `<div id="root">${head.snapshotBody ?? ""}</div>\n  ${jsonLdScripts}`
  );

  return html;
};

/** The columns every product-card renderer below needs. `image` only picks the file extension. */
export type ProductCardRow = {
  slug?: unknown;
  name?: unknown;
  image?: unknown;
  dimensions?: unknown;
  seo_heading?: unknown;
};

/**
 * One product as a linked card: thumbnail, link, and a describing line.
 *
 * Two things this exists for, both measured against IndiaMART's category pages, which ship 91
 * internal links and 58 images (all with alt text) in their raw HTML:
 *
 *   Links. Our snapshots carried one link per page. Googlebot runs the bundle and sees the
 *   React nav, but GPTBot, ClaudeBot and PerplexityBot never do — and this module exists for
 *   exactly those crawlers. Anchor text is the product's own name, so it describes where it
 *   goes rather than repeating boilerplate navigation.
 *
 *   Images. The listing snapshots rendered no <img> at all, so a non-rendering crawler saw a
 *   catalogue with no pictures. `loading="lazy"` and explicit dimensions keep a grid of these
 *   from competing with the page's own content for bandwidth.
 */
const productCardHtml = (product: ProductCardRow): string => {
  const slug = String(product.slug ?? "");
  const name = String(product.name ?? "");
  if (!slug || !name) return "";

  const href = `${SITE_URL}/product/${encodeURIComponent(slug)}`;
  const src = productImageUrl(SITE_URL, slug, (product.image as string | null) ?? null);
  // The product's own target phrase when it has one, so the alt text says what the picture
  // shows in the words a buyer would search for. buildImageAlt adds the brand/location suffix.
  // Same shape productImageAltSubject produces, without needing the whole keyword block here.
  const alt = buildImageAlt(
    product.seo_heading ? `${name} - ${String(product.seo_heading)}` : name
  );
  const detail = product.dimensions ? ` &mdash; ${escapeHtml(String(product.dimensions))}` : "";

  return (
    `<li>` +
    `<a href="${escapeAttr(href)}">` +
    `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" width="600" height="600" loading="lazy" decoding="async" />` +
    `${escapeHtml(name)}</a>${detail}</li>`
  );
};

export const productListHtml = (products: ProductCardRow[]): string =>
  products.map(productCardHtml).filter(Boolean).join("");

/**
 * A BreadcrumbList for a page one or two levels below the homepage.
 *
 * Breadcrumbs were published on product, landing and export pages but not on blog posts, the
 * blog index or the catalogue, so those URLs showed a bare domain in search results instead of
 * a labelled trail. It is also the cheapest way to tell Google how a URL sits in the site,
 * which matters most for the pages that have the fewest inbound links.
 */
const breadcrumbJsonLd = (
  trail: { name: string; url: string }[]
): object => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", url: SITE_URL }, ...trail].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});

/**
 * `priceValidUntil` for a product Offer, 30 days out.
 *
 * Google warns on an Offer without it, and treats a date in the past as an expired price -
 * which is why this is computed per render rather than written into the data. Nickel is priced
 * off a moving metal market, so a month is roughly how long a quoted rate holds; it is a
 * statement about how long the figure shown can be relied on, not a commitment beyond it.
 */
const priceValidUntil = (): string => {
  const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return until.toISOString().slice(0, 10);
};

// Every renderer below reads the database, so any of them can throw when it is unreachable.
// Answering that with the untouched template returns 200 carrying the *homepage's* title and
// <link rel="canonical" href="https://www.nickelbusbar.com/">, so during an outage every
// product and article URL tells a crawler it is a duplicate of the homepage - the same failure
// STATIC_ROUTE_SEO exists to prevent, surfacing only when the site is already unwell. 503 says
// "temporary, come back" and leaves the URL's existing index entry alone, while the
// self-canonical withdraws the duplicate claim. Deliberately no noindex: a temporary failure
// marked noindex turns into a permanent removal if the outage outlasts the next few crawls.
// The body is still the SPA shell, so a real visitor's app still boots and shows its own error
// state rather than a dead page.
export function renderUnavailableShell(template: string, pathname: string): SnapshotResult {
  const html = injectHead(template, {
    title: "Temporarily Unavailable | Ramani Steel House",
    description:
      "This page is temporarily unavailable while we restore service. Please try again shortly.",
    canonical: `${SITE_URL}${pathname === "/" ? "/" : pathname}`,
    ogImage: SITE_OG_IMAGE_URL,
    jsonLd: [],
    snapshotBody: "",
  });
  return { status: 503, html };
}

export async function renderBlogSnapshot(template: string, slug: string): Promise<SnapshotResult> {
  // lower(slug) rather than an exact match, so a request for a post's old Title-Case URL still
  // finds it and can be redirected to the canonical spelling below.
  //
  // This cannot be done in vercel.json. Its `src` patterns match case-insensitively, so a rule
  // written for "/blog/Nickel-Strips-for-Electric-Vehicles" also matches the lowercase URL it
  // redirects to - which is an infinite loop, and briefly was one. Case-only differences have
  // to be resolved somewhere that compares strings case-sensitively, which is here.
  const post = await queryOne<Record<string, unknown>>(
    `SELECT title, slug, excerpt, content, cover_image_url, author_name, meta_title,
            meta_description, faq_items, published_at, created_at, updated_at
     FROM blog_posts
     WHERE lower(slug) = lower($1) AND status = 'published' AND (published_at IS NULL OR published_at <= now())
     LIMIT 1`,
    [slug]
  );

  // The stored slug is the canonical one. Anything that differs only by case gets a permanent
  // redirect rather than a second URL serving identical content.
  if (post && String(post.slug) !== slug) {
    return {
      status: 301,
      location: `${SITE_URL}/blog/${encodeURIComponent(String(post.slug))}`,
      html: "",
    };
  }

  if (!post) {
    const canonical = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
    const html = injectHead(template, {
      title: "404 | Article Not Found",
      description: "This article may be unpublished or moved to another URL.",
      canonical,
      robots: "noindex,follow,noarchive",
      jsonLd: [],
      snapshotBody: "",
    });
    return { status: 404, html };
  }

  const title = (post.meta_title as string) || (post.title as string);
  const description =
    (post.meta_description as string) || (post.excerpt as string) || `Technical insights from ${SITE_NAME}.`;
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug as string)}`;
  const coverImageUrl = (post.cover_image_url as string) || "";
  const publishedIso = (post.published_at as string) || (post.created_at as string) || null;
  const modifiedIso = (post.updated_at as string) || publishedIso;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    ...(coverImageUrl ? { image: [coverImageUrl] } : {}),
    author: { "@type": "Organization", name: post.author_name || SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: SITE_LOGO_URL } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    ...(publishedIso ? { datePublished: publishedIso } : {}),
    ...(modifiedIso ? { dateModified: modifiedIso } : {}),
  };

  let faqItems: { question: string; answer: string }[] = [];
  try {
    const raw = post.faq_items;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      faqItems = parsed.filter(
        (item): item is { question: string; answer: string } =>
          item && typeof item.question === "string" && typeof item.answer === "string"
      );
    }
  } catch {
    faqItems = [];
  }

  const faqJsonLd = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  const faqHtml = faqItems.length
    ? `<section><h2>Frequently Asked Questions</h2>${faqItems
        .map((item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`)
        .join("")}</section>`
    : "";

  // Every article was a dead end: 21 posts, none of them linking to a product or to each
  // other, so the blog held a fifth of the site's URLs and passed relevance to none of them.
  // These are the two links that matter — the product a reader of this article might actually
  // buy, and the next article — and both are chosen from the post's own subject rather than
  // being a fixed block repeated on all 21.
  const titleTokens = String(post.title ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (token) =>
        token.length >= 3 &&
        // Words every product name contains carry no signal, and matching on them would rank
        // the catalogue in its default order on every article.
        !["nickel", "strip", "strips", "the", "and", "for", "with", "your", "what", "how", "vs"].includes(token)
    );

  let relatedProducts: ProductCardRow[] = [];
  let relatedPosts: { slug: string; title: string }[] = [];
  try {
    [relatedProducts, relatedPosts] = await Promise.all([
      query<ProductCardRow>(
        // Ordered by how many of the article's distinctive words appear in the product name, so
        // a piece about 21700 packs leads with 21700 strip. Falls back to featured order when
        // nothing matches, which keeps the links present rather than dropping the section.
        `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
           FROM products p
          ORDER BY (
            SELECT count(*) FROM unnest($1::text[]) AS token
             WHERE regexp_replace(lower(coalesce(p.name, '')), '[^a-z0-9]+', ' ', 'g')
                   LIKE '%' || token || '%'
          ) DESC, p.is_featured DESC, p.name
          LIMIT 4`,
        [titleTokens]
      ),
      query<{ slug: string; title: string }>(
        `SELECT slug, title
           FROM blog_posts
          WHERE lower(slug) <> lower($1)
            AND status = 'published' AND (published_at IS NULL OR published_at <= now())
          ORDER BY (
            SELECT count(*) FROM unnest($2::text[]) AS token
             WHERE regexp_replace(lower(coalesce(title, '')), '[^a-z0-9]+', ' ', 'g')
                   LIKE '%' || token || '%'
          ) DESC, published_at DESC NULLS LAST, id DESC
          LIMIT 4`,
        [slug, titleTokens]
      ),
    ]);
  } catch (error) {
    console.warn(`[snapshot] Related links unavailable for /blog/${slug}.`, error);
  }

  const relatedProductsHtml = relatedProducts.length
    ? `<h2>Products covered in this article</h2><ul>${productListHtml(relatedProducts)}</ul>`
    : "";

  const relatedPostsHtml = relatedPosts.length
    ? `<h2>Related guides</h2><ul>${relatedPosts
        .map(
          (item) =>
            `<li><a href="${SITE_URL}/blog/${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a></li>`
        )
        .join("")}</ul>`
    : "";

  // The cover photo as a real element. It was published in the Article JSON-LD but never as an
  // <img>, so an image crawler had nothing on the page to index.
  const coverImageHtml = coverImageUrl
    ? `<img src="${escapeAttr(coverImageUrl)}" alt="${escapeAttr(
        buildImageAlt(String(post.title ?? ""))
      )}" width="1200" height="675" fetchpriority="high" />`
    : "";

  // The content column is only ever written via the authenticated /api/admin/blog-posts
  // endpoint (not public user input), so it's rendered as-is here — same trust boundary
  // the client already relies on before its own sanitize-then-render step.
  const snapshotBody = `<article>
    <h1>${escapeHtml(post.title as string)}</h1>
    ${coverImageHtml}
    ${(post.content as string) || ""}
    ${faqHtml}
    ${relatedProductsHtml}
    ${relatedPostsHtml}
    <p><a href="${SITE_URL}/blog">All nickel strip guides and technical articles</a> &middot; <a href="${SITE_URL}/products">Nickel strip and busbar products</a></p>
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: coverImageUrl || undefined,
    jsonLd: [
      articleJsonLd,
      ...(faqJsonLd ? [faqJsonLd] : []),
      breadcrumbJsonLd([
        { name: "Blog", url: `${SITE_URL}/blog` },
        { name: String(post.title ?? ""), url: canonical },
      ]),
    ],
    snapshotBody,
  });

  return { status: 200, html };
}

export async function renderNickelStripsLithiumSnapshot(template: string): Promise<SnapshotResult> {
  const canonical = `${SITE_URL}/blog/nickel-strips-lithium-batteries`;
  const title = "Nickel Strips for Lithium-Ion Batteries | Manufacturer Guide";
  const description =
    "We are a manufacturer of nickel strips used in lithium-ion batteries, delivering consistent quality and competitive pricing for battery manufacturers.";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Nickel Strips for Lithium-Ion Batteries: Why Manufacturers Choose Us",
    description,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: SITE_LOGO_URL } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    datePublished: "2026-05-14",
  };

  const snapshotBody = `<article>
    <h1>Nickel Strips for Lithium-Ion Batteries: Why Manufacturers Choose Us</h1>
    <p>Nickel strips are a critical component in lithium-ion battery packs because they provide strong conductivity, stable weldability, and reliable performance under demanding charging cycles.</p>
    <p>As a dedicated manufacturer of nickel strips used in lithium-ion batteries, we produce precision strips for battery manufacturers across India and selected global markets. Our production focus is consistency in thickness, controlled purity, and dependable electrical performance.</p>
    <p>We support lithium-ion battery manufacturers with competitive pricing by combining scalable manufacturing, disciplined quality control, and efficient supply planning. This helps customers reduce procurement risk while maintaining product quality in high-volume battery assembly.</p>
    <p>Whether your requirement is for EV battery packs, consumer electronics, or energy storage systems, we provide technically aligned nickel strip solutions with timely delivery and responsive support.</p>
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    jsonLd: [articleJsonLd],
    snapshotBody,
  });

  return { status: 200, html };
}

export async function renderProductListSnapshot(template: string, isCategoriesRoute: boolean): Promise<SnapshotResult> {
  // /categories renders the exact same product grid as /products (see ProductListingPage —
  // only the title/description differ), so it canonicalises to /products rather than
  // self-canonicalising. Two indexable URLs for identical content split their own ranking.
  const canonical = `${SITE_URL}/products`;
  const title = isCategoriesRoute
    ? "Nickel Strip Categories | Pure Nickel & Plated Strips"
    : "Nickel Strip Products | Manufacturer & Exporter India";
  const description = isCategoriesRoute
    ? "Browse nickel strip categories from Ramani Steel House: pure nickel, nickel-plated strips, battery tabs, busbars and custom coils. Manufactured in Mumbai, supplied PAN India and exported worldwide."
    : "Shop nickel strips, nickel-plated strips, and battery tabs manufactured in Mumbai, India. PAN India supply and export to 17+ countries. Request bulk and custom quotes.";

  // The catalogue hub shipped an h1 and one sentence — no products, no links, no images. It is
  // the page every product URL should be reachable from, so for a crawler that does not run the
  // bundle the whole catalogue was invisible from here. Best-effort like the landing pages: a
  // database hiccup leaves the copy intact rather than 503-ing the hub.
  let products: ProductCardRow[] = [];
  try {
    products = await query<ProductCardRow>(
      `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
         FROM products p
        ORDER BY p.is_featured DESC, p.name`
    );
  } catch (error) {
    console.warn("[snapshot] Product list unavailable for /products; rendering copy only.", error);
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    ...(products.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: String(product.name ?? ""),
              url: `${SITE_URL}/product/${encodeURIComponent(String(product.slug ?? ""))}`,
            })),
          },
        }
      : {}),
  };

  const productsHtml = products.length
    ? `<h2>Nickel strip and busbar products</h2><ul>${productListHtml(products)}</ul>`
    : "";

  const html = injectHead(template, {
    title,
    description,
    canonical,
    jsonLd: [collectionJsonLd, breadcrumbJsonLd([{ name: "Products", url: SITE_URL + "/products" }])],
    snapshotBody: `<article>
    <h1>${escapeHtml(isCategoriesRoute ? "Nickel Strip Categories" : "Nickel Strip Products")}</h1>
    <p>${escapeHtml(description)}</p>
    ${productsHtml}
    <h2>Browse by type</h2>
    <ul>
      <li><a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a></li>
      <li><a href="${SITE_URL}/calculator">Nickel strip weight calculator</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
    </ul>
  </article>`,
  });

  return { status: 200, html };
}

// The content routes below have no per-URL database record behind them, so before this they
// were served the unmodified dist/index.html — which carries the *homepage's* title and, worse,
// `<link rel="canonical" href="https://www.nickelbusbar.com/">`. Every non-rendering crawler
// therefore saw /about, /contact and /calculator each declare itself a duplicate of the
// homepage. These values mirror the <Helmet> block in the matching page component
// (HomePage / AboutPage / ContactPage / CalculatorPage); update both together.
// Keyed by StaticSnapshotRoute rather than string: the routing table is generated from that
// union, so a route named there without content here (or the reverse) fails the typecheck
// instead of shipping a rewrite to a page that renders nothing.
const STATIC_ROUTE_SEO: Record<StaticSnapshotRoute, { title: string; description: string; jsonLd: object[]; body: string }> = {
  // The homepage is the first URL an answer engine fetches and was the last content route
  // with no snapshot at all: vercel.json sent "/" straight to the static dist/index.html,
  // whose body is an empty <div id="root">. Its head was already correct - what a crawler
  // that runs no JavaScript could not see was a single sentence of the answer. The title and
  // description below therefore mirror index.html's own head and HomePage's <Helmet> exactly;
  // all three change together.
  //
  // The body carries the whole of the page's factual copy, not just the answer block. The SEO
  // audit measured this URL's rendering ratio at 1272%: nearly everything a model could cite -
  // the specification table, what the strip is used for, who buys it - existed only in the
  // React tree. Both surfaces now read from src/lib/homeContent.ts, so a crawler that runs no
  // JavaScript and a visitor who does are shown the same claims.
  //
  // The FAQPage carries all four questions and HomePage's <Helmet> no longer publishes its own.
  // Previously each published a different subset, so a rendering crawler saw two FAQPage
  // entities on one URL - two competing copies of the same claim.
  "/": {
    title: "Nickel Strip Manufacturer India | Nickel Busbar Supplier",
    description:
      "Nickel strip manufacturer in India supplying pure nickel strip, H type nickel strip and nickel busbar for 18650 battery packs. PAN India supply and export.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: ANSWER_BLOCK_QUESTION,
            acceptedAnswer: { "@type": "Answer", text: ANSWER_BLOCK },
          },
          ...HOME_FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        ],
      },
      // Deliberately no Product entity here.
      //
      // Search Console flagged this URL with "Either offers, review, or aggregateRating should
      // be specified". The Product it was describing - "Nickel Strips for Lithium-Ion
      // Batteries" - is a category, not something anyone can buy: it has no SKU, no single
      // price, and no offer to state. The honest fix is to stop claiming the homepage is a
      // product page rather than to attach an offer to an abstraction.
      //
      // Nothing is lost. Every real SKU publishes a complete Product with an Offer on its own
      // page, and the specification table this entity carried in `additionalProperty` is still
      // rendered as a visible <table> in the body below, which is what a reader or a model
      // actually quotes from. The homepage keeps the entities that are true of it:
      // Organization/LocalBusiness and WebSite from index.html, and the FAQPage above.
    ],
    body: `<article>
    <h1>India's Trusted Nickel Strip Manufacturer</h1>
    <!-- The hero photograph, as a real element with real dimensions and alt text. Google
         Images will not index a picture that only exists once the bundle has run, and this is
         the one product photo on the site's most-linked URL. Mirrors the <img> HomePage
         renders in the hero card. -->
    <img src="${SITE_URL}/img/products/ni-18650-2p-h-type.webp" alt="${escapeAttr(
      buildImageAlt("H type nickel strip for 18650 battery packs, cut to cell pitch")
    )}" width="900" height="900" fetchpriority="high" />
    <h2>${ANSWER_BLOCK_QUESTION}</h2>
    <p>${ANSWER_BLOCK}</p>
    <p>Looking for a specific pattern? <a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a> — pure nickel H type strip for 18650, 21700, 32650 and 32700 packs in 2P, 3P and 4P layouts.</p>
    <h2>Nickel strip specifications</h2>
    <table>
      <tbody>${HOME_SPECIFICATIONS.map(
        (spec) => `<tr><th>${escapeHtml(spec.label)}</th><td>${escapeHtml(spec.value)}</td></tr>`
      ).join("")}</tbody>
    </table>
    <h2>Product range</h2>
    <ul>${HOME_VARIANTS.map(
      (variant) =>
        `<li><a href="${SITE_URL}${escapeAttr(variant.cta)}"><strong>${escapeHtml(variant.title)}</strong></a>` +
        ` — ${escapeHtml(variant.spec)}. ${escapeHtml(variant.note)}</li>`
    ).join("")}</ul>
    <h2>Applications</h2>
    <ul>${HOME_APPLICATIONS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Industries served</h2>
    <ul>${HOME_INDUSTRIES.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Why buyers choose Ramani Steel House</h2>
    <ul>${HOME_WHY_CHOOSE_US.map(
      (item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.detail)}</li>`
    ).join("")}</ul>
    <h2>Quality and certifications</h2>
    <ul>${HOME_QUALITY_POINTS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Frequently asked questions</h2>
    ${HOME_FAQ_ITEMS.map(
      (item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`
    ).join("\n    ")}
    <h2>Send your enquiry</h2>
    <p>Share the specification, quantity and destination and we respond with a quotation within 1 business day.</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
    <p>Ramani Steel House, ${escapeHtml(POSTAL_ADDRESS.oneLine)}</p>
    <h2>More from Ramani Steel House</h2>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products</a></li>
      <!-- /h-type-nickel-strip is deliberately absent: it is already linked from the product
           range copy above, where the surrounding sentence gives the anchor context. Google
           attributes the first anchor for a URL on a page, so a second link here would only
           repeat it with weaker placement. -->
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/calculator">Nickel strip weight calculator</a></li>
      <li><a href="${SITE_URL}/blog">Nickel strip guides and technical articles</a></li>
      <li><a href="${SITE_URL}/about">About Ramani Steel House</a></li>
      <li><a href="${SITE_URL}/contact">Contact the sales team</a></li>
    </ul>
  </article>`,
  },
  "/about": {
    title: "About Us | Ramani Steel House - Nickel Strip Manufacturer",
    description:
      "Ramani Steel House has manufactured nickel strips for lithium-ion battery applications since 1974, serving PAN India and 17+ international markets.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Ramani Steel House",
        url: `${SITE_URL}/about`,
        about: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, foundingDate: "1974" },
      },
      breadcrumbJsonLd([{ name: "About", url: `${SITE_URL}/about` }]),
    ],
    // Was two sentences. /about is one of the pages a buyer checks before enquiring and one of
    // the few an answer engine reads to decide what this company is, and it said almost nothing
    // that could be quoted. Every claim below is already published elsewhere on the site — the
    // specification table, the quality points, the cell formats — so nothing here is a new
    // assertion, it is the same facts on the page that exists to state them.
    body: `<article>
    <h1>Trusted Nickel Strip Manufacturer Since 1974</h1>
    <p>Ramani Steel House has manufactured nickel strip in Mumbai since 1974. Over ${YEARS_IN_BUSINESS} years the work has narrowed to what it is now known for: pure nickel strip, H type nickel strip and nickel busbar for lithium-ion battery packs, supplied to pack builders, EV manufacturers and energy storage integrators across India and in 17+ export markets.</p>
    <p>Strip is slit, cut and finished at our own works at ${escapeHtml(POSTAL_ADDRESS.oneLine)} rather than bought in and resold, which is what makes custom pitch, width and hole patterns a normal order rather than a special case.</p>
    <h2>What we manufacture</h2>
    <table>
      <tbody>${HOME_SPECIFICATIONS.map(
        (spec) => `<tr><th>${escapeHtml(spec.label)}</th><td>${escapeHtml(spec.value)}</td></tr>`
      ).join("")}</tbody>
    </table>
    <h2>Cell formats and patterns supplied</h2>
    <ul>
      <li>18650 in 2P, 3P and 4P — plain, fuse-type and honeycomb</li>
      <li>21700 in 2P and 4P, including double-fuse</li>
      <li>32650 and 32700 in 2P, zig-zag and honeycomb</li>
      <li>Custom pitch, neck width and hole pattern against your pack drawing</li>
    </ul>
    <h2>Quality and certification</h2>
    <ul>${HOME_QUALITY_POINTS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Supply and export</h2>
    <p>Domestic consignments despatch from Mumbai to battery and electronics manufacturing across India. Export lots load through Nhava Sheva with commercial invoice, packing list, certificate of origin and material test certificates prepared alongside the shipment.</p>
    <h2>Where to go next</h2>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products</a></li>
      <li><a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a></li>
      <li><a href="${SITE_URL}/nickel-strip-manufacturer-in-mumbai">Nickel strip manufacturer, supplier and exporter in Mumbai</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/contact">Contact the sales team</a></li>
    </ul>
  </article>`,
  },
  "/contact": {
    title: "Contact Nickel Strip Manufacturer Mumbai | Ramani Steel",
    description:
      "Contact Ramani Steel House, nickel strip manufacturer and exporter in Mumbai, India, for nickel strip and nickel busbar enquiries and quotations.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Ramani Steel House",
        url: `${SITE_URL}/contact`,
        about: {
          "@type": "Organization",
          name: SITE_NAME,
          email: PRIMARY_EMAIL,
          telephone: `+${PRIMARY_CALL.e164}`,
          contactPoint: PHONE_NUMBERS.map((number) => ({
            "@type": "ContactPoint",
            telephone: `+${number.e164}`,
            contactType: "sales",
            areaServed: "IN",
          })),
        },
      },
      breadcrumbJsonLd([{ name: "Contact", url: `${SITE_URL}/contact` }]),
    ],
    body: `<article>
    <h1>Contact Ramani Steel House</h1>
    <p>For nickel strip and nickel busbar enquiries, custom slitting, bulk orders and export quotations. We respond with a quotation within 1 business day.</p>
    <h2>Nickel strip works and office</h2>
    <address>Ramani Steel House, ${escapeHtml(POSTAL_ADDRESS.oneLine)}</address>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
    <p>Mumbai buyers can collect from the works; call ahead so the material is cut and ready.</p>
    <h2>What to include in an enquiry</h2>
    <p>The more of this a first message carries, the closer the first quotation is to a final price.</p>
    <ul>
      <li>Cell format and layout — 18650, 21700, 32650 or 32700, in 2P, 3P or 4P</li>
      <li>Pattern — plain, H type, zig-zag or honeycomb, fuse or non-fuse</li>
      <li>Thickness and width, or the pack drawing to cut against</li>
      <li>Quantity in kilograms, and whether it is a one-off or a running requirement</li>
      <li>Destination — city for PAN India despatch, or port for export</li>
    </ul>
    <h2>Company literature</h2>
    <p><a href="${SITE_URL}${BROCHURE.path}">${escapeHtml(BROCHURE.label)}</a> (${escapeHtml(BROCHURE.sizeLabel)})</p>
    <h2>Where to go next</h2>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/calculator">Nickel strip weight and conversion calculator</a></li>
      <li><a href="${SITE_URL}/about">About Ramani Steel House</a></li>
    </ul>
  </article>`,
  },
  // Search Console shows this page earning impressions for capabilities it never mentions:
  // "nickel alloy weight conversion calculator" (14 impressions, 0 clicks), "nickel strip
  // thickness calculator" (5) and "steel strip length calculator" (3). CalculatorPage already
  // does all three - its "Solve for" selector rearranges the weight formula for thickness,
  // width or length, and dimensionToCm/cmToDimension convert between mm and inch - but the
  // title and copy only ever said "weight". Google surfaced the page and the searcher never
  // saw their own word in it. Nothing here claims a feature the tool lacks.
  "/calculator": {
    title: "Free Nickel Strip & Alloy Weight Conversion Calculator",
    description:
      "Free calculator for nickel strip weight, thickness, width and length. Converts mm and inch, and solves for any dimension from a known weight.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Nickel Alloy Weight Calculator",
        description:
          "A weight calculator for nickel strips, sheets, busbars, foil, wire and coil used in battery and industrial manufacturing.",
        url: `${SITE_URL}/calculator`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        // Google asks a SoftwareApplication for one of offers/review/aggregateRating, which is
        // what Search Console flagged on this URL. `price: 0` is the documented way to say a
        // tool is free, and here it is simply true - the calculator is open to anyone.
        //
        // Note this is the opposite call from renderProductSnapshot, which omits the Offer
        // entirely for enquiry-only products rather than publishing `price: 0`. A zero price on
        // a physical product advertises it as free; on a free web tool it is the fact.
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      },
      breadcrumbJsonLd([{ name: "Calculator", url: `${SITE_URL}/calculator` }]),
    ],
    body: `<article>
    <h1>Nickel Strip Weight and Conversion Calculator</h1>
    <p>Calculate weight for nickel strips, sheets, busbars, foil, wire and coil in millimetres or inches. Built for battery pack engineers, EV manufacturers and industrial metal buyers.</p>
    <h2>Nickel strip thickness calculator</h2>
    <p>Enter a known weight with any two of thickness, width and length, and the calculator solves for the third. Use it to work back to the thickness a finished coil weight implies, or to check a supplied strip against the gauge it was ordered at.</p>
    <h2>Strip length and width calculator</h2>
    <p>The same "Solve for" selector returns length or width instead. Given a weight in kilograms, a thickness and one other dimension, it rearranges the weight formula rather than asking you to do it by hand.</p>
    <h2>Nickel alloy weight conversion calculator</h2>
    <p>Dimensions can be entered in millimetres or inches and are converted internally, so an imperial drawing does not need translating first. Density is selectable, which is what makes it an alloy calculator rather than a pure-nickel one: the same tool covers nickel, nickel-plated steel, copper and aluminium.</p>
    <h2>How the weight is calculated</h2>
    <p>Weight = Thickness &times; Width &times; Length &times; Density &times; Quantity, with every dimension converted to centimetres first. The result is shown in grams and kilograms.</p>
    <h2>Once you have the weight</h2>
    <p>Nickel strip is priced per kilogram, so the figure this returns is what a quotation is built from.</p>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products, with prices per kg</a></li>
      <li><a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/contact">Send your specification for a quotation</a></li>
    </ul>
  </article>`,
  },
  // The export landing page targets two audiences on one URL - Indian bulk buyers and
  // overseas importers - so both the copy and the structured data name India and worldwide
  // supply. Unlike /contact, this route publishes its JSON-LD *only* here: injectHead writes
  // these scripts outside #root, so React's mount does not remove them, and a second copy in
  // the page's <Helmet> would leave a rendering crawler with the same FAQ marked up twice.
  // Content comes from src/lib/exportEnquiry.ts, which the page component also reads.
  [EXPORT_PATH]: {
    title: EXPORT_TITLE,
    description: EXPORT_DESCRIPTION,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: EXPORT_TITLE,
        description: EXPORT_DESCRIPTION,
        url: `${SITE_URL}${EXPORT_PATH}`,
        // index.html already publishes a site-wide Organization, WebSite and LocalBusiness on
        // every URL. A second top-level Organization node here would describe the same company
        // a second time on one page; nesting it under `about` (as /contact does) attaches the
        // export-specific areaServed and offer catalogue without splitting the entity.
        about: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: SITE_LOGO_URL,
          email: PRIMARY_EMAIL,
          telephone: `+${PRIMARY_CALL.e164}`,
          foundingDate: "1974",
          areaServed: ["IN", "Worldwide"],
          knowsAbout: [
            "Nickel Strip Export",
            "Nickel Busbar Manufacturing",
            "Lithium-Ion Battery Components Export",
          ],
          contactPoint: PHONE_NUMBERS.map((number) => ({
            "@type": "ContactPoint",
            telephone: `+${number.e164}`,
            email: PRIMARY_EMAIL,
            contactType: "sales",
            areaServed: ["IN", "Worldwide"],
            availableLanguage: ["en", "hi"],
          })),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Nickel strip and nickel busbar for export and PAN India supply",
            itemListElement: EXPORT_PRODUCT_FORMS.map((form) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Product", name: form },
              eligibleRegion: ["IN", "Worldwide"],
            })),
          },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: EXPORT_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Export Enquiry", item: `${SITE_URL}${EXPORT_PATH}` },
        ],
      },
    ],
    body: `<article>
    <h1>${escapeHtml(EXPORT_H1)}</h1>
    <p>${escapeHtml(EXPORT_LEAD)}</p>
    <h2>Supply within India</h2>
    <ul>${INDIA_HIGHLIGHTS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Export worldwide</h2>
    <ul>${EXPORT_HIGHLIGHTS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Export markets we serve</h2>
    <p>Exporting to 17+ countries from our Mumbai manufacturing unit, loading at ${escapeHtml(LOADING_PORTS)}.</p>
    <ul>${EXPORT_REGIONS.map((market) => `<li>${escapeHtml(market.region)} - ${escapeHtml(market.detail)}</li>`).join("")}</ul>
    <h2>Specification range</h2>
    <ul>${EXPORT_SPECS.map((spec) => `<li>${escapeHtml(spec.label)}: ${escapeHtml(spec.value)}</li>`).join("")}</ul>
    <h2>Export documentation</h2>
    <ul>${EXPORT_DOCUMENTS.map((doc) => `<li>${escapeHtml(doc)}</li>`).join("")}</ul>
    <h2>HS codes</h2>
    <ul>${HS_CODES.map((entry) => `<li>${escapeHtml(entry.code)} - ${escapeHtml(entry.covers)}</li>`).join("")}</ul>
    <p>Incoterms quoted: ${escapeHtml(INCOTERMS.join(", "))}.</p>
    <h2>Export enquiry FAQs</h2>
    ${EXPORT_FAQS.map((faq) => `<h3>${escapeHtml(faq.question)}</h3>\n    <p>${escapeHtml(faq.answer)}</p>`).join("\n    ")}
    <h2>Send your enquiry</h2>
    <p>Share the specification, quantity and destination and we respond with a quotation within 1 business day.</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
    <p><a href="${SITE_URL}${BROCHURE.path}">${escapeHtml(BROCHURE.label)}</a> (${escapeHtml(BROCHURE.sizeLabel)})</p>
  </article>`,
  },
};

/**
 * The category and state landing pages from src/lib/landingPages.
 *
 * These are the pages that exist because "H type nickel strip manufacturer in India" returned
 * the homepage: they need a crawlable snapshot more than any other route on the site, since a
 * landing page whose copy only appears after React mounts gives a category query nothing to
 * match on in the raw HTML.
 */
/**
 * The routes that must never be indexed: the cart, the checkout and the sign-in page.
 *
 * These were the only routes vercel.json sent straight to the static dist/index.html, which
 * meant their raw HTML - the version Googlebot reads on its first pass - carried the
 * *homepage's* title, `<meta name="robots" content="index, follow">` and
 * `<link rel="canonical" href="https://www.nickelbusbar.com/">`. Three URLs each announcing
 * that they are the homepage and asking to be indexed. The pages do set noindex through their
 * own <Helmet>, but only once the bundle has run, and a crawler is under no obligation to wait.
 *
 * A self-referencing canonical rather than a homepage one: pointing a noindex page at the
 * homepage asks Google to consolidate the two, which is the opposite of excluding it.
 */
const NOINDEX_ROUTES: Record<NoindexSnapshotRoute, { title: string; description: string }> = {
  "/cart": {
    title: "Your Cart | Ramani Steel House",
    description: "Review the nickel strip and busbar items in your quote request.",
  },
  "/checkout": {
    title: "Checkout | Ramani Steel House",
    description: "Complete your nickel strip and busbar quote request.",
  },
  "/login": {
    title: "Sign In | Ramani Steel House",
    description: "Sign in to your Ramani Steel House account.",
  },
};

export function isNoindexSnapshotRoute(pathname: string): boolean {
  return Object.prototype.hasOwnProperty.call(NOINDEX_ROUTES, pathname);
}

export function renderNoindexSnapshot(template: string, pathname: string): SnapshotResult {
  const route = isNoindexSnapshotRoute(pathname) ? NOINDEX_ROUTES[pathname] : undefined;
  if (!route) return { status: 200, html: template };

  const html = injectHead(template, {
    title: route.title,
    description: route.description,
    canonical: `${SITE_URL}${pathname}`,
    robots: "noindex,follow",
    jsonLd: [],
    // No body snapshot: there is nothing here worth crawling, and the app renders the real
    // page on mount either way.
    snapshotBody: "",
  });
  return { status: 200, html };
}

export function isLandingSnapshotRoute(pathname: string): boolean {
  // The prefix is matched as well as the exact slugs so that an unrecognised state name is
  // handled here — and answered with a real 404 — rather than falling through to the branch
  // that serves the untouched homepage template with a 200.
  return (
    getLandingPageByPathname(pathname) !== null ||
    /^\/nickel-strip-manufacturer-in-[a-z0-9-]+$/.test(pathname)
  );
}

export async function renderLandingSnapshot(
  template: string,
  pathname: string
): Promise<SnapshotResult> {
  const page = getLandingPageByPathname(pathname);
  // vercel.json routes the whole /nickel-strip-manufacturer-in-* prefix here, so an invented
  // state name reaches this function. Answering 200 with the untouched template would leave a
  // soft 404 at an indexable URL carrying the homepage's title and canonical.
  if (!page) {
    const html = injectHead(template, {
      title: "404 | Page Not Found",
      description: "This page does not exist. Browse the nickel strip range or contact us.",
      canonical: `${SITE_URL}${pathname}`,
      robots: "noindex,follow,noarchive",
      jsonLd: [],
      snapshotBody: "",
    });
    return { status: 404, html };
  }

  const canonical = `${SITE_URL}/${page.slug}`;

  // The product grid is best-effort: it is supporting content, and a database hiccup should
  // leave the page's own copy — which is what it ranks on — intact rather than 503 the URL.
  let products: Array<Record<string, unknown>> = [];
  if (page.productSearch) {
    try {
      const tokens = page.productSearch.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      products = await query<Record<string, unknown>>(
        `SELECT p.name, p.slug, p.dimensions, p.image, p.seo_heading
           FROM products p
          WHERE (
            SELECT bool_and(
              regexp_replace(lower(coalesce(p.name, '')), '[^a-z0-9]+', ' ', 'g') LIKE '%' || token || '%'
            )
            FROM unnest($1::text[]) AS token
          )
          ORDER BY p.name
          LIMIT 6`,
        [tokens]
      );
    } catch (error) {
      console.warn(`[snapshot] Product list unavailable for ${pathname}; rendering copy only.`, error);
    }
  }

  const sectionsHtml = page.sections
    .map((section) => {
      const body = section.body ? `<p>${escapeHtml(section.body)}</p>` : "";
      const bullets = section.bullets?.length
        ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : "";
      return `<h2>${escapeHtml(section.heading)}</h2>${body}${bullets}`;
    })
    .join("\n    ");

  const productsHtml = products.length
    ? `<h2>Products</h2>
    <ul>${productListHtml(products)}</ul>`
    : "";

  const faqHtml = `<h2>Frequently asked questions</h2>
    ${page.faqs
      .map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`)
      .join("\n    ")}`;

  const crossLinksHtml = `<h2>Also supplying</h2>
    <ul>${STATE_LANDING_PAGES.filter((state) => state.path !== `/${page.slug}`)
      .map((state) => `<li><a href="${SITE_URL}${state.path}">${escapeHtml(state.name)}</a></li>`)
      .join("")}</ul>`;

  const html = injectHead(template, {
    title: page.title,
    description: page.description,
    canonical,
    ogImage: SITE_OG_IMAGE_URL,
    keywords: [...page.keywords],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: page.title,
        description: page.description,
        url: canonical,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        provider: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: page.breadcrumbName, item: canonical },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
    snapshotBody: `<article>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.intro)}</p>
    ${sectionsHtml}
    ${productsHtml}
    ${faqHtml}
    ${crossLinksHtml}
    <h2>Contact</h2>
    <p>Ramani Steel House, ${escapeHtml(POSTAL_ADDRESS.oneLine)}</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
  </article>`,
  });

  return { status: 200, html };
}

export function isStaticSnapshotRoute(pathname: string): boolean {
  return Object.prototype.hasOwnProperty.call(STATIC_ROUTE_SEO, pathname);
}

// The route names themselves live in src/lib/snapshotRoutes.ts, which imports nothing, so the
// build-time routing-table generator can read them without pulling in db.ts. Re-exported here
// so existing importers of this module keep working.
export { STATIC_SNAPSHOT_ROUTES, NOINDEX_SNAPSHOT_ROUTES, SPA_ONLY_ROUTES } from "./src/lib/snapshotRoutes.js";

export async function renderStaticRouteSnapshot(template: string, pathname: string): Promise<SnapshotResult> {
  // hasOwnProperty rather than a bare lookup: `/constructor` and `/toString` would otherwise
  // resolve to inherited Object members and pass the truthiness check below with no title.
  const route = isStaticSnapshotRoute(pathname) ? STATIC_ROUTE_SEO[pathname] : undefined;
  if (!route) {
    return { status: 200, html: template };
  }

  const html = injectHead(template, {
    title: route.title,
    description: route.description,
    canonical: `${SITE_URL}${pathname}`,
    ogImage: SITE_OG_IMAGE_URL,
    jsonLd: route.jsonLd,
    snapshotBody: route.body,
  });

  return { status: 200, html };
}

export async function renderBlogListSnapshot(template: string): Promise<SnapshotResult> {
  const canonical = `${SITE_URL}/blog`;
  const title = "Nickel Strip Blog | Battery Material Guides & Specs";
  const description =
    "Read technical guides and industry insights from Ramani Steel House on nickel strips, battery tabs, and lithium manufacturing.";

  let posts: Array<{ title: string; slug: string; excerpt: string | null; cover_image_url: string | null }> = [];
  try {
    posts = await query<{ title: string; slug: string; excerpt: string | null; cover_image_url: string | null }>(
      `SELECT title, slug, excerpt, cover_image_url FROM blog_posts
       WHERE status = 'published' AND (published_at IS NULL OR published_at <= now())
         AND slug IS NOT NULL AND slug <> ''
       ORDER BY published_at DESC NULLS LAST, id DESC
       LIMIT 20`
    );
  } catch (error) {
    // A listing with no posts is still a better snapshot than the homepage shell, so a failed
    // query degrades to the heading-only body rather than losing the corrected head tags.
    console.warn("[seo] Blog list snapshot could not load posts; rendering heading only.", error);
  }

  // Without this, /blog was a dead end for non-rendering crawlers: the post links exist only
  // in the client bundle, so nothing but the sitemap pointed at individual articles.
  const postsHtml = posts.length
    ? `<ul>${posts
        .map((post) => {
          // The cover art as a real element, matching what /products does for its grid. The
          // index rendered twenty links and no pictures, so an image crawler saw nothing here.
          const cover = post.cover_image_url
            ? `<img src="${escapeAttr(post.cover_image_url)}" alt="${escapeAttr(
                buildImageAlt(post.title)
              )}" width="600" height="338" loading="lazy" decoding="async" />`
            : "";
          return (
            `<li><a href="${SITE_URL}/blog/${encodeURIComponent(post.slug)}">${cover}${escapeHtml(post.title)}</a>${
              post.excerpt ? ` — ${escapeHtml(post.excerpt)}` : ""
            }</li>`
          );
        })
        .join("")}</ul>`
    : "";

  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonical,
    },
    breadcrumbJsonLd([{ name: "Blog", url: SITE_URL + "/blog" }]),
  ];

  if (posts.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      })),
    });
  }

  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: SITE_OG_IMAGE_URL,
    jsonLd,
    snapshotBody: `<article>
    <h1>Latest Blog Articles</h1>
    <p>${escapeHtml(description)}</p>
    ${postsHtml}
  </article>`,
  });

  return { status: 200, html };
}

export async function renderProductSnapshot(template: string, slug: string): Promise<SnapshotResult> {
  const product = await queryOne<Record<string, unknown>>(
    // LEFT JOIN: products.category_id is ON DELETE SET NULL, so an inner join would 404 a
    // live product page (and mark it noindex) as soon as its category was removed.
    `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1`,
    [slug]
  );

  if (!product) {
    const canonical = `${SITE_URL}/product/${encodeURIComponent(slug)}`;
    const html = injectHead(template, {
      title: "404 | Product Not Found",
      description: "The product page you requested is not available. Explore our full nickel strip catalog.",
      canonical,
      robots: "noindex,follow,noarchive",
      jsonLd: [],
      snapshotBody: "",
    });
    return { status: 404, html };
  }

  const name = product.name as string;
  const productSlug = product.slug as string;
  const keywordBlock = resolveProductKeywordBlock(product as ProductSeoColumns);
  const title = productPageTitle(name, keywordBlock);
  const rawDescription = `${name} by ${SITE_NAME}. ${
    (product.description as string) || "Industrial-grade nickel strip for lithium-ion battery and precision applications."
  }`;
  const canonical = `${SITE_URL}/product/${encodeURIComponent(productSlug)}`;
  // Never the raw `product.image`: that is a signed Supabase Storage URL served with
  // `X-Robots-Tag: none`, which is exactly why these pages have a price in their search result
  // but no thumbnail. See src/lib/productImage.ts.
  const imageUrl = productImageUrl(SITE_URL, productSlug, product.image as string | null);

  const applications = Array.isArray(product.applications) ? (product.applications as string[]) : [];

  // Products quoted on enquiry have no price, and `Number(price) || 0` used to publish those
  // as a `price: 0` InStock Offer — a structurally valid claim that the item is free. An
  // absent price means "no offer to advertise", so the Offer node is omitted entirely.
  const numericPrice = Number(product.price);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;

  const keywordValues = { name, price: hasPrice ? formatInr(numericPrice) : null };
  const description =
    (keywordBlock && keywordMetaDescription(keywordBlock, keywordValues)) ||
    rawDescription.slice(0, 160);

  // Material, purity, thickness, width, cell format, configuration and pattern, derived from
  // the product's own columns and name - see src/lib/productSpecs.ts. Purity is applied only to
  // nickel items: the catalogue also carries a copper busbar, and a nickel purity on that page
  // would be a false material claim exactly where a buyer checks it.
  const productSpecs = buildProductSpecs(product as Record<string, string | null>);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: (product.description as string) || description,
    image: [imageUrl],
    brand: { "@type": "Brand", name: SITE_NAME },
    category: (product.category_name as string) || "Nickel Strips",
    // mpn alongside sku: these are own-manufactured goods with no GS1 barcode, so brand +
    // mpn is the identifier pair Google looks for when gtin is absent.
    sku: product.slug,
    mpn: product.slug,
    countryOfOrigin: "IN",
    // The export terms as machine-readable attributes, matching the visible table below.
    // additionalProperty is the field Google and answer engines read specifications out of, so
    // an "HS code for nickel strip" or "what Incoterms" question can be answered from the
    // product page itself rather than only from /export-enquiry.
    // Exactly the rows the visible table renders, so the markup and the page agree - Google
    // discounts structured data that states attributes the page does not show.
    additionalProperty: [...productSpecs, ...PRODUCT_EXPORT_TERMS].map((row) => ({
      "@type": "PropertyValue",
      name: row.label,
      value: row.value,
    })),
    ...(hasPrice
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: numericPrice,
            availability:
              Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            // Without this Google warns on the Offer and can stop showing the price it is
            // already displaying. Computed per render, never stored - see priceValidUntil().
            priceValidUntil: priceValidUntil(),
            url: canonical,
            // Answers Search Console's "Missing field hasMerchantReturnPolicy (in offers)".
            // The copy backing this claim is rendered below, in the snapshot body.
            hasMerchantReturnPolicy: RETURN_POLICY_SCHEMA,
            // Points at the Organization @id published in index.html rather than repeating the
            // company as a second, rival entity.
            seller: { "@id": `${SITE_URL}/#organization` },
            // IN, not Worldwide. This price is in INR and the return policy above is scoped to
            // India, because export is quoted separately in USD against an Incoterm. Marking
            // the offer valid worldwide would advertise the domestic rupee price to overseas
            // buyers and contradict its own return policy. The worldwide supply claim belongs
            // on the entity that is true of - the Organization, which already carries
            // areaServed: Worldwide - and on the product's export terms below.
            eligibleRegion: { "@type": "Country", name: "IN" },
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name, item: canonical },
    ],
  };

  // A key-value table rather than the bullet list this used to be. Both render, but a <table>
  // with a <th> label against a <td> value is what Google and answer engines lift specifications
  // out of - it is the shape every B2B marketplace listing uses, and it is the format a model
  // can quote a single attribute from without re-parsing prose.
  const specRows = [...productSpecs, ...PRODUCT_EXPORT_TERMS]
    .map(
      (row) =>
        `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`
    )
    .join("");

  // Google only ever considered indexing this photo through the JSON-LD `image` field before,
  // because the snapshot carried no <img> at all and the tag the React page renders does not
  // exist until the bundle runs. An image crawler wants a real element, with real dimensions
  // and real alt text, in the HTML it is handed.
  const imageAlt = buildImageAlt(productImageAltSubject(name, keywordBlock));
  const imageTag =
    `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(imageAlt)}" ` +
    `width="1000" height="1000" fetchpriority="high" />`;

  const keywordSection = keywordBlock
    ? `<h2>${escapeHtml(keywordBlock.heading)}</h2>${fillKeywordParagraphs(keywordBlock, keywordValues)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("")}`
    : "";

  // Siblings from the same category, so a product page is not a dead end for a crawler that
  // arrives from search and never runs the bundle. Anchor text is each product's own name, and
  // the cards carry their thumbnails — the pattern IndiaMART's category pages use to spread
  // relevance across a catalogue. Best-effort: this is supporting content, and a failure here
  // must not take down a page that is otherwise complete.
  let related: ProductCardRow[] = [];
  try {
    related = await query<ProductCardRow>(
      // Same category first, then fill from the rest of the catalogue rather than filtering to
      // it. Restricting to the category left "Plain Nickel Strips" and "Copper Busbar" with no
      // related products at all - each is the only item in its category - so the two pages that
      // most needed a way onward were the two that stayed dead ends.
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
      [productSlug, (product.category_id as number | null) ?? null]
    );
  } catch (error) {
    console.warn(`[snapshot] Related products unavailable for ${productSlug}.`, error);
  }

  const relatedHtml = related.length
    ? `<h2>Related nickel strip products</h2><ul>${productListHtml(related)}</ul>`
    : "";

  const snapshotBody = `<article>
    <h1>${escapeHtml(name)}</h1>
    ${imageTag}
    <p>${escapeHtml((product.description as string) || "")}</p>
    ${keywordSection}
    ${specRows ? `<h2>Specifications and export terms</h2><table><tbody>${specRows}</tbody></table>` : ""}
    ${
      applications.length
        ? `<h2>Applications</h2><ul>${applications.map((app) => `<li>${escapeHtml(app)}</li>`).join("")}</ul>`
        : ""
    }
    <h2>Export supply</h2>
    <p>${escapeHtml(PRODUCT_EXPORT_LEAD)}</p>
    <p><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a> &mdash; send your specification, quantity and destination port for a quotation.</p>
    <h2>${escapeHtml(RETURN_POLICY_HEADING)}</h2>
    ${RETURN_POLICY_LINES.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    ${relatedHtml}
    <p><a href="${SITE_URL}/products">All nickel strip and busbar products</a></p>
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: imageUrl,
    keywords: [...(keywordBlock?.keywords ?? []), ...BUYER_ROLE_KEYWORDS],
    jsonLd: [productJsonLd, breadcrumbJsonLd],
    snapshotBody,
  });

  return { status: 200, html };
}
