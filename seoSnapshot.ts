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
import { noindexSnapshotPath } from "./src/lib/snapshotRoutes.js";
import {
  RETURN_POLICY_HEADING,
  RETURN_POLICY_LINES,
  RETURN_POLICY_SCHEMA,
} from "./src/lib/returnPolicy.js";
import { catalogueMetaFor } from "./src/lib/catalogueMeta.js";
import {
  buildShippingSchema,
  SHIPPING_HEADING,
  SHIPPING_LINES,
} from "./src/lib/shippingPolicy.js";
import { getLandingPageByPathname, parentCategoryFor, REGION_LANDING_PAGES, STATE_PAGE_REDIRECTS } from "./src/lib/landingPages.js";
import { blogCtaFor } from "./src/lib/blogCta.js";
import { blogProductsFor, BLOG_PRODUCTS_HEADING } from "./src/lib/blogProducts.js";
import { buildProductFaqs, productFaqJsonLd } from "./src/lib/productFaq.js";
import { SHOWCASE_VIDEO, showcaseVideoJsonLd } from "./src/lib/showcaseVideo.js";
import { productImagePath, productImageUrl } from "./src/lib/productImage.js";
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
import { GROUP_SITES } from "./src/lib/groupSites.js";
import { YEARS_IN_BUSINESS } from "./src/lib/heritage.js";
import { PRODUCT_LINKS } from "./src/lib/productLinks.js";
import { GUIDES, GUIDES_PATH, getGuideBySlug } from "./src/lib/guides.js";
import { contextualLinks, type PageContext } from "./src/lib/contextualLinks.js";
import { authorBoxContent, authorJsonLd } from "./src/lib/author.js";
import { LITHIUM_ARTICLE, LITHIUM_ARTICLE_PATH, lithiumArticleJsonLd } from "./src/lib/lithiumArticle.js";
import { blogCover } from "./src/lib/blogImage.js";
import {
  GUIDES_INDEX_DESCRIPTION,
  GUIDES_INDEX_TITLE,
  formatGuideDate,
  guideCoverUrl,
  guideJsonLd,
  guideProducts,
  guideUrl,
  guidesIndexJsonLd,
  otherGuides,
} from "./src/lib/guideView.js";
import {
  applications as HOME_APPLICATIONS,
  faqItems as HOME_FAQ_ITEMS,
  HERO_PRODUCT_SLUG,
  HOME_HERO,
  HOME_SEO,
  TRADE_ROLES_SECTION,
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
  /** index.html says `website` for every page; articles and products say what they are. */
  ogType?: "website" | "article" | "product";
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

  // A page that does not choose an image still names one. The brand card is indexable, on our own
  // origin and 1200x630, so it is a valid thumbnail source where nothing better exists.
  const ogImage = head.ogImage || SITE_OG_IMAGE_URL;

  // index.html declares the brand card's 1200x630 and a large Twitter card for every page. Product
  // and cover photos are square, so on those pages the declared size is wrong (Meta and WhatsApp
  // size the preview from it) and a large card centre-crops the photo. Drop the size and use the
  // square `summary` card whenever the image is not the brand card.
  if (ogImage !== SITE_OG_IMAGE_URL) {
    html = html.replace(/\s*<meta property="og:image:(width|height)"[^>]*>/g, "");
    html = html.replace(/<meta name="twitter:card"[^>]*>/, `<meta name="twitter:card" data-ssr-head="true" content="summary" />`);
  }
  if (head.ogType && head.ogType !== "website") {
    html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" data-ssr-head="true" content="${head.ogType}" />`);
  }

  const ogTags = [
    `<meta property="og:title" data-ssr-head="true" content="${escapeAttr(head.title)}" />`,
    `<meta property="og:description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`,
    `<meta property="og:url" data-ssr-head="true" content="${escapeAttr(head.canonical)}" />`,
    `<meta property="og:image" data-ssr-head="true" content="${escapeAttr(ogImage)}" />`,
    `<meta name="twitter:title" data-ssr-head="true" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`,
    `<meta name="twitter:image" data-ssr-head="true" content="${escapeAttr(ogImage)}" />`,
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
 * "About the author", the same facts ContextualLinks-style blocks give readers in AuthorBox.tsx
 * (both read lib/author). The byline said only the company name; this says what the company is
 * and where the claims can be checked.
 */
const authorBoxHtml = (): string => {
  const box = authorBoxContent();
  const facts = box.facts
    .map((fact) =>
      `<li>${escapeHtml(fact.text)}${
        fact.href && fact.linkText ? `. <a href="${SITE_URL}${fact.href}">${escapeHtml(fact.linkText)}</a>` : ""
      }</li>`
    )
    .join("");
  return `<aside><h2>${escapeHtml(box.heading)}</h2><p>${escapeHtml(box.lead)}</p><ul>${facts}</ul><p>${escapeHtml(
    box.contact.text
  )} <a href="mailto:${escapeAttr(box.contact.email)}">${escapeHtml(box.contact.email)}</a></p></aside>`;
};

type BlogCardRow = { title: string; slug: string; excerpt: string | null; cover_image_url: string | null };

/**
 * One article as a card: the cover as a real element, then the title as a heading and the
 * excerpt. Shared by the /blog index (h2) and the homepage's latest-articles block (h3), which
 * had cards with covers in the React page and none in the HTML a crawler is handed.
 *
 * Own-origin cover (see lib/blogImage), and a product photo when a post has none, so every card
 * has a picture an image crawler can index. 1000x1000 because that is the size covers are
 * uploaded at (see supabase/README.md) and what the rendered page declares.
 */
export const blogCardHtml = (post: BlogCardRow, level: 2 | 3): string => {
  const href = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const postCover = blogCover(post.slug, post.cover_image_url);
  const cover = postCover.kind !== "brand"
    ? `<a href="${href}"><img src="${escapeAttr(`${SITE_URL}${postCover.path}`)}" alt="${escapeAttr(
        buildImageAlt(post.title)
      )}" width="1000" height="1000" loading="lazy" decoding="async" /></a>`
    : "";
  // The same fallback sentence the rendered page uses, so an excerpt-less post reads the same way.
  const excerpt = escapeHtml(post.excerpt || "Read the full article for details.");
  return `<article>${cover}<h${level}><a href="${href}">${escapeHtml(post.title)}</a></h${level}><p>${excerpt}</p></article>`;
};

/**
 * The topic-matched links for a page (src/lib/contextualLinks.ts), as the sections a crawler
 * reads. ContextualLinks.tsx renders the same blocks for readers, so the two cannot disagree.
 *
 * This is the half the snapshots were missing. A product page linked to other products and to
 * nothing else; a landing page linked to its sibling states; the guides were reachable only from
 * each other. Anchor text is written per destination to say what the page is, since a crawler
 * that never runs the bundle has only the anchor to go on. `exclude` is for links the page
 * already carries, so none appears twice.
 */
const contextualLinksHtml = (ctx: PageContext, exclude: readonly string[] = []): string =>
  contextualLinks(ctx, exclude)
    .map(
      (block) =>
        `<section><h2>${escapeHtml(block.heading)}</h2><ul>${block.links
          .map((link) => `<li><a href="${SITE_URL}${link.path}">${escapeHtml(link.anchor)}</a></li>`)
          .join("")}</ul></section>`
    )
    .join("");

/**
 * The company's other web properties, as a sentence for the crawler snapshot.
 *
 * The `sameAs` array in index.html already asserts these are one company to anything parsing
 * JSON-LD. This is the same claim in prose, for the retrieval side: an answer engine summarising
 * "who is Ramani Steel House" reads body text, and until now nothing in the rendered page said
 * this site and ramanialloys.com were the same business. Rendered only on / and /about — the two
 * URLs where a reader is actually asking who the company is.
 */
const groupSitesHtml = (): string =>
  `<h2>Part of Ramani Steel House</h2>
    <p>NickelBusbar.com is the nickel strip and nickel busbar catalogue of Ramani Steel House, Mumbai, established 1974. Company websites: ${GROUP_SITES.map(
      (site) => `<a href="${site.href}">${escapeHtml(site.label)}</a>`
    ).join(", ")}.</p>`;

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
    `SELECT title, slug, excerpt, content, cover_image_url, cover_image_alt, author_name, meta_title,
            meta_description, faq_items, key_answer, social_post_url, published_at, created_at, updated_at
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
  // Never the stored URL: that is a Supabase signed URL served with X-Robots-Tag: none, which
  // Google obeys, so it can never be indexed or become the result thumbnail. See lib/blogImage.
  const cover = blogCover(String(post.slug ?? slug), post.cover_image_url as string | null);
  const coverImageUrl = `${SITE_URL}${cover.path}`;
  const publishedIso = (post.published_at as string) || (post.created_at as string) || null;
  const modifiedIso = (post.updated_at as string) || publishedIso;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    ...(coverImageUrl ? { image: [coverImageUrl] } : {}),
    author: authorJsonLd(post.author_name as string | null),
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
  const coverImageHtml = cover.kind !== "brand"
    ? `<img src="${escapeAttr(coverImageUrl)}" alt="${escapeAttr(
        (typeof post.cover_image_alt === "string" && post.cover_image_alt.trim()) ||
          buildImageAlt(String(post.title ?? ""))
      )}" width="1000" height="1000" fetchpriority="high" />`
    : "";

  // The content column is only ever written via the authenticated /api/admin/blog-posts
  // endpoint (not public user input), so it's rendered as-is here — same trust boundary
  // the client already relies on before its own sanitize-then-render step.
  // Same topic-matched next step as BlogPostPage renders; see src/lib/blogCta.
  const cta = blogCtaFor(String(post.slug ?? slug));
  const ctaHtml = `<section><h2>${escapeHtml(cta.heading)}</h2><p>${escapeHtml(cta.body)}</p><p><a href="${SITE_URL}${cta.link.path}">${escapeHtml(cta.link.label)}</a></p></section>`;
  // Links from the article to the products it discusses, with the product name as anchor text.
  // This is the half that matters most: the snapshot is what a crawler reads, and these posts
  // are the pages that rank, so this is where the authority they hold gets passed to the
  // catalogue. Same mapping BlogPostPage renders — see src/lib/blogProducts.
  const articleProducts = blogProductsFor(String(post.slug ?? slug));
  const productsHtml = articleProducts.length
    ? `<section><h2>${escapeHtml(BLOG_PRODUCTS_HEADING)}</h2><ul>${articleProducts
        .map(
          (product) =>
            `<li><a href="${SITE_URL}/product/${encodeURIComponent(product.slug)}">${escapeHtml(
              product.name
            )}</a></li>`
        )
        .join("")}</ul></section>`
    : "";
  // The answer-first paragraph, above everything but the heading: this is what a featured
  // snippet or an assistant quotes, and it cannot be quoted from halfway down the article.
  const keyAnswer = typeof post.key_answer === "string" ? post.key_answer.trim() : "";
  const keyAnswerHtml = keyAnswer ? `<p><strong>${escapeHtml(keyAnswer)}</strong></p>` : "";
  // Who wrote it and when, as text. The dates were only in the JSON-LD and the React page, so a
  // fetcher that reads the HTML without running scripts (which is how assistants retrieve a page
  // to quote it) saw an undated article, and recency is one of the things they rank on.
  const bylineDate = (iso: string | null) => {
    const parsed = iso ? new Date(iso) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? {
          iso: parsed.toISOString(),
          label: parsed.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" }),
        }
      : null;
  };
  const publishedOn = bylineDate(publishedIso);
  const updatedOn = bylineDate(modifiedIso);
  const showUpdated =
    publishedOn && updatedOn && Date.parse(updatedOn.iso) - Date.parse(publishedOn.iso) >= 24 * 3_600_000 && updatedOn.label !== publishedOn.label;
  const bylineHtml = `<p>${escapeHtml(String(post.author_name || SITE_NAME))}${
    publishedOn ? ` &middot; Published <time datetime="${publishedOn.iso}">${publishedOn.label}</time>` : ""
  }${showUpdated && updatedOn ? ` &middot; Updated <time datetime="${updatedOn.iso}">${updatedOn.label}</time>` : ""}</p>`;
  const snapshotBody = `<article>
    <h1>${escapeHtml(post.title as string)}</h1>
    ${bylineHtml}
    ${keyAnswerHtml}
    ${coverImageHtml}
    ${(post.content as string) || ""}
    ${productsHtml}
    ${ctaHtml}
    ${faqHtml}
    ${authorBoxHtml()}
    ${typeof post.social_post_url === "string" && /^https?:\/\//i.test(post.social_post_url)
      ? `<p><a href="${escapeAttr(post.social_post_url)}" rel="noopener">See this on LinkedIn</a></p>`
      : ""}
    ${relatedProductsHtml}
    ${relatedPostsHtml}
    ${contextualLinksHtml({ kind: "blog", slug: String(post.slug ?? slug) }, [
      cta.link.path,
      ...articleProducts.map((product) => `/product/${product.slug}`),
      // The related posts above were chosen from the database by title; do not list them twice.
      ...relatedPosts.map((related) => `/blog/${related.slug}`),
    ])}
    <p><a href="${SITE_URL}/blog">All nickel strip guides and technical articles</a> &middot; <a href="${SITE_URL}/products">Nickel strip and busbar products</a></p>
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: coverImageUrl,
    ogType: "article",
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
  // The article is defined in code (src/lib/lithiumArticle.ts) and shared with the React page, so
  // the HTML a crawler is handed and the page a visitor sees say the same thing. It was four
  // paragraphs about the company; it is now a buyer's article, and this renders all of it.
  const article = LITHIUM_ARTICLE;
  const canonical = `${SITE_URL}${LITHIUM_ARTICLE_PATH}`;
  const cta = blogCtaFor(article.slug);
  const products = guideProducts(article);

  const productsHtml = products.length
    ? `<section><h2>Products covered in this article</h2><ul>${products
        .map(
          (product) =>
            `<li><a href="${SITE_URL}/product/${encodeURIComponent(product.slug)}">${escapeHtml(product.name)}</a></li>`
        )
        .join("")}</ul></section>`
    : "";
  const ctaHtml = `<section><h2>${escapeHtml(cta.heading)}</h2><p>${escapeHtml(cta.body)}</p><p><a href="${SITE_URL}${cta.link.path}">${escapeHtml(cta.link.label)}</a></p></section>`;
  const faqHtml = `<section><h2>Frequently Asked Questions</h2>${article.faqs
    .map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`)
    .join("")}</section>`;

  const html = injectHead(template, {
    title: article.metaTitle,
    description: article.description,
    canonical,
    ogImage: `${SITE_URL}${article.coverImage}`,
    ogType: "article",
    jsonLd: lithiumArticleJsonLd(),
    // The body is authored in this repository, not user input, so it is injected as-is: the same
    // trust boundary the guides and blog snapshots rely on.
    snapshotBody: `<article>
    <nav aria-label="Breadcrumb"><a href="${SITE_URL}/">Home</a> › <a href="${SITE_URL}/blog">Blog</a> › ${escapeHtml(article.title)}</nav>
    <h1>${escapeHtml(article.title)}</h1>
    <p><a href="${SITE_URL}/about">${escapeHtml(SITE_NAME)}</a> &middot; Published <time datetime="${article.datePublished}">${formatGuideDate(article.datePublished)}</time> &middot; Updated <time datetime="${article.dateModified}">${formatGuideDate(article.dateModified)}</time></p>
    <p><strong>${escapeHtml(article.keyAnswer)}</strong></p>
    <img src="${escapeAttr(`${SITE_URL}${article.coverImage}`)}" alt="${escapeAttr(article.coverAlt)}" width="900" height="900" fetchpriority="high" />
    ${article.html}
    ${productsHtml}
    ${ctaHtml}
    ${faqHtml}
    ${authorBoxHtml()}
    ${contextualLinksHtml({ kind: "blog", slug: article.slug }, [
      cta.link.path,
      ...products.map((product) => `/product/${product.slug}`),
    ])}
    <p><a href="${SITE_URL}/blog">All articles</a> &middot; <a href="${SITE_URL}${GUIDES_PATH}">Nickel strip guides</a> &middot; <a href="${SITE_URL}/products">Nickel strip and busbar products</a></p>
  </article>`,
  });

  return { status: 200, html };
}

export async function renderProductListSnapshot(template: string, isCategoriesRoute: boolean): Promise<SnapshotResult> {
  // /categories renders the exact same product grid as /products (see ProductListingPage —
  // only the title/description differ), so it canonicalises to /products rather than
  // self-canonicalising. Two indexable URLs for identical content split their own ranking.
  const canonical = `${SITE_URL}/products`;
  // Shared with ProductListingPage.tsx so the crawler and the browser cannot be told two
  // different things about the same page — see src/lib/catalogueMeta.ts.
  const { title, description } = catalogueMetaFor(isCategoriesRoute);

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
    // The catalogue hub showed the brand card, which says nothing a shopper wants to know. Plain
    // stock is the one photo that fairly represents a page listing every pattern and format.
    ogImage: productImageUrl(SITE_URL, "Plain-Nickel-Strips"),
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

// Where the homepage snapshot gets its database-backed blocks; see homeRangeHtml below.
const HOME_RANGE_TOKEN = "%%HOME_PRODUCT_RANGE%%";
const HOME_ARTICLES_TOKEN = "%%HOME_LATEST_ARTICLES%%";
const HOME_REVIEWS_TOKEN = "%%HOME_REVIEWS%%";

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
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    jsonLd: [
      // The showcase reel, so Google can index it as a video result in its own right.
      showcaseVideoJsonLd(SITE_URL, productImagePath(HERO_PRODUCT_SLUG)),
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
    <h1>${escapeHtml(`${HOME_HERO.h1Lead} ${HOME_HERO.h1Main}`)}</h1>
    <ul>${HOME_HERO.offers.map((offer) => `<li>${escapeHtml(offer)}</li>`).join("")}</ul>
    <!-- The hero photograph, as a real element with real dimensions and alt text. Google
         Images will not index a picture that only exists once the bundle has run, and this is
         the one product photo on the site's most-linked URL. Mirrors the image element
         HomePage renders in the hero card.
         No angle-bracket tag names in this comment: it ships in the public HTML, and a
         regex-based crawler that counts image tags will match the text inside a comment and
         report the homepage as having an image with no alt. That false positive cost an
         afternoon once already. -->
    <img src="${productImageUrl(SITE_URL, HERO_PRODUCT_SLUG)}" alt="${escapeAttr(
      buildImageAlt("H type nickel strip for 18650 battery packs, cut to cell pitch")
    )}" width="900" height="900" fetchpriority="high" />
    <h2>${ANSWER_BLOCK_QUESTION}</h2>
    <p>${ANSWER_BLOCK}</p>
    <p>Looking for a specific pattern? <a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a> — pure nickel H type strip for 18650, 21700, 32650 and 32700 packs in 2P, 3P and 4P layouts.</p>
    <h2>${escapeHtml(TRADE_ROLES_SECTION.heading)}</h2>
    ${TRADE_ROLES_SECTION.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    <ul>${TRADE_ROLES_SECTION.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
    <p>Buying to resell or in small lots? <a href="${SITE_URL}/nickel-strip-wholesaler-and-distributor">Nickel strip wholesaler and distributor</a> — stock sizes, 5 kg MOQ and trade enquiries.</p>
    <h2>${escapeHtml(SHOWCASE_VIDEO.name)}</h2>
    <p>${escapeHtml(SHOWCASE_VIDEO.description)}</p>
    <video src="${SITE_URL}${SHOWCASE_VIDEO.src}" poster="${productImageUrl(SITE_URL, HERO_PRODUCT_SLUG)}" width="${SHOWCASE_VIDEO.width}" height="${SHOWCASE_VIDEO.height}" controls preload="none"></video>
    <h2>Nickel strip specifications</h2>
    <table>
      <tbody>${HOME_SPECIFICATIONS.map(
        (spec) => `<tr><th>${escapeHtml(spec.label)}</th><td>${escapeHtml(spec.value)}</td></tr>`
      ).join("")}</tbody>
    </table>
    ${HOME_RANGE_TOKEN}
    ${HOME_ARTICLES_TOKEN}
    ${HOME_REVIEWS_TOKEN}
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
    ${groupSitesHtml()}
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
    ${groupSitesHtml()}
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
        name: "Nickel Strip Weight Calculator",
        description:
          "A weight calculator for nickel strip and busbar: weight from size, or length, thickness and piece count from a known weight, with weight per metre.",
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
    <h1>Nickel Strip Weight Calculator</h1>
    <p>Enter a size to get the weight, or enter a weight to find the length, thickness or number of pieces. Works in millimetres or inches, for pure nickel (Nickel 200 / 201) and nickel-plated steel.</p>
    <h2>Nickel strip weight per metre</h2>
    <p>For any thickness and width the calculator shows the weight per metre and per piece. A 0.15 mm &times; 8 mm pure nickel strip weighs about 10.7 g per metre, so 1 kg is roughly 94 metres.</p>
    <h2>Nickel strip length and thickness calculator</h2>
    <p>Choose Length, Thickness or Pieces, enter the total weight in kilograms and the other dimensions, and the calculator rearranges the weight formula to give the missing value.</p>
    <h2>How the weight is calculated</h2>
    <p>Weight = Thickness &times; Width &times; Length &times; Density &times; Quantity, with every dimension converted to centimetres first. Pure nickel is 8.89 g/cm&sup3;; nickel-plated steel is 7.85 g/cm&sup3;.</p>
    <h2>Once you have the weight</h2>
    <p>Nickel strip is priced per kilogram, so the figure this returns is what a quotation is built from. The minimum order is 5 kg.</p>
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
  "/review": {
    title: "Leave a Review | Ramani Steel House",
    description: "Tell us how the nickel strip performed in your pack.",
  },
};

export function isNoindexSnapshotRoute(pathname: string): boolean {
  return noindexSnapshotPath(pathname) !== null;
}

export function renderNoindexSnapshot(template: string, pathname: string): SnapshotResult {
  const key = noindexSnapshotPath(pathname);
  const route = key ? NOINDEX_ROUTES[key] : undefined;
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
  // The former state pages were consolidated into regional pages; the old URLs were indexed, so
  // they answer with a permanent redirect rather than a 404.
  const regionPath = STATE_PAGE_REDIRECTS[pathname.toLowerCase()];
  if (regionPath) return { status: 301, html: "", location: `${SITE_URL}${regionPath}` };

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
    <ul>${REGION_LANDING_PAGES.filter((region) => region.path !== `/${page.slug}`)
      .map((region) => `<li><a href="${SITE_URL}${region.path}">Nickel strip manufacturer and supplier in ${escapeHtml(region.name)}</a></li>`)
      .join("")}</ul>`;

  const html = injectHead(template, {
    title: page.title,
    description: page.description,
    canonical,
    // All 22 landing pages shared the brand share card, so nothing in a search or social result
    // told anyone what the page was about. Each now shows the product it is actually written
    // around; productImageUrl prefers the synced 900px WebP on our own origin, which is both
    // relevant and indexable. The brand card stays as the fallback for a page with no photo set.
    ogImage: page.productPhoto ? productImageUrl(SITE_URL, page.productPhoto) : SITE_OG_IMAGE_URL,
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
    ${contextualLinksHtml({ kind: "landing", slug: page.slug })}
    ${crossLinksHtml}
    <h2>Contact</h2>
    <p>Ramani Steel House, ${escapeHtml(POSTAL_ADDRESS.oneLine)}</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
  </article>`,
  });

  return { status: 200, html };
}

/**
 * /guides and /guides/<slug>: the long-form explainers kept in code (src/lib/guides.ts), not in
 * the blog database.
 *
 * Matched with any slug, not only the known ones, so an invented /guides/anything is answered
 * here with a real 404 rather than falling through to the branch that serves the untouched
 * homepage template with a 200 — the soft-404 the landing pages guard against the same way.
 */
export function isGuideSnapshotRoute(pathname: string): boolean {
  return /^\/guides(\/[^/]+)?$/i.test(pathname);
}

export function renderGuideSnapshot(template: string, pathname: string): SnapshotResult {
  // Vercel matches route patterns case-insensitively, so /Guides/What-Is-Nickel-Strip reaches
  // this function. Every guide slug is lowercase, so send the variant to its canonical form
  // instead of serving a second indexable copy of the page.
  const lower = pathname.toLowerCase();
  if (lower !== pathname) {
    return { status: 301, html: "", location: `${SITE_URL}${lower}` };
  }

  if (pathname === GUIDES_PATH) {
    const html = injectHead(template, {
      title: GUIDES_INDEX_TITLE,
      description: GUIDES_INDEX_DESCRIPTION,
      canonical: `${SITE_URL}${GUIDES_PATH}`,
      jsonLd: guidesIndexJsonLd(),
      snapshotBody: `<article>
    <h1>Nickel Strip Guides</h1>
    <p>${escapeHtml(GUIDES_INDEX_DESCRIPTION)}</p>
    <ul>${GUIDES.map(
      (guide) => `<li><a href="${guideUrl(guide)}">${escapeHtml(guide.title)}</a> &mdash; ${escapeHtml(guide.excerpt)}</li>`
    ).join("")}</ul>
    <p><a href="${SITE_URL}/blog">Technical articles</a> &middot; <a href="${SITE_URL}/products">Nickel strip and busbar products</a></p>
  </article>`,
    });
    return { status: 200, html };
  }

  const guide = getGuideBySlug(pathname.slice(GUIDES_PATH.length + 1));
  if (!guide) {
    const html = injectHead(template, {
      title: "404 | Page Not Found",
      description: "This guide does not exist. Browse the nickel strip guides or the product range.",
      canonical: `${SITE_URL}${pathname}`,
      robots: "noindex,follow,noarchive",
      jsonLd: [],
      snapshotBody: "",
    });
    return { status: 404, html };
  }

  const canonical = guideUrl(guide);
  const cta = blogCtaFor(guide.slug);
  const products = guideProducts(guide);

  const productsHtml = products.length
    ? `<section><h2>Products covered in this guide</h2><ul>${products
        .map(
          (product) =>
            `<li><a href="${SITE_URL}/product/${encodeURIComponent(product.slug)}">${escapeHtml(product.name)}</a></li>`
        )
        .join("")}</ul></section>`
    : "";
  const ctaHtml = `<section><h2>${escapeHtml(cta.heading)}</h2><p>${escapeHtml(cta.body)}</p><p><a href="${SITE_URL}${cta.link.path}">${escapeHtml(cta.link.label)}</a></p></section>`;
  const faqHtml = `<section><h2>Frequently Asked Questions</h2>${guide.faqs
    .map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`)
    .join("")}</section>`;
  const moreHtml = `<section><h2>More nickel strip guides</h2><ul>${otherGuides(guide)
    .map((other) => `<li><a href="${guideUrl(other)}">${escapeHtml(other.title)}</a></li>`)
    .join("")}</ul></section>`;

  // The guide body is authored in this repository (src/lib/guides.ts), not user input, so it is
  // injected as-is, the same trust boundary the blog's snapshot relies on.
  const html = injectHead(template, {
    title: guide.metaTitle,
    description: guide.description,
    canonical,
    ogImage: guideCoverUrl(guide),
    ogType: "article",
    jsonLd: guideJsonLd(guide),
    snapshotBody: `<article>
    <h1>${escapeHtml(guide.title)}</h1>
    <p>${escapeHtml(SITE_NAME)} &middot; <time datetime="${guide.datePublished}">${formatGuideDate(guide.datePublished)}</time></p>
    <p><strong>${escapeHtml(guide.keyAnswer)}</strong></p>
    <img src="${escapeAttr(guideCoverUrl(guide))}" alt="${escapeAttr(guide.coverAlt)}" width="900" height="900" fetchpriority="high" />
    ${guide.html}
    ${productsHtml}
    ${ctaHtml}
    ${faqHtml}
    ${moreHtml}
    ${authorBoxHtml()}
    ${contextualLinksHtml({ kind: "guide", slug: guide.slug }, [cta.link.path])}
    <p><a href="${SITE_URL}${GUIDES_PATH}">All nickel strip guides</a> &middot; <a href="${SITE_URL}/blog">Technical articles</a> &middot; <a href="${SITE_URL}/products">Nickel strip and busbar products</a></p>
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

/**
 * The homepage's product range and latest articles, with their photographs.
 *
 * The React page renders a card grid of real products and four article covers. The snapshot had a
 * text list of three generic variants (Pure Nickel Strips, Nickel Plated Strips, Custom Sizes) that
 * matched neither the catalogue nor the grid, and no images at all, so a crawler that runs no
 * scripts saw a homepage with one picture. These are real products and real posts, as cards with
 * a linked <img> and descriptive alt text, like every other grid in this file.
 *
 * Each block is best-effort and falls back to what the snapshot showed before: the homepage is
 * the most-fetched URL on the site, and a database hiccup must not cost it its copy.
 */

const homeRangeFallbackHtml = (): string =>
  `<h2>Product range</h2><ul>${HOME_VARIANTS.map(
    (variant) =>
      `<li><a href="${SITE_URL}${escapeAttr(variant.cta)}"><strong>${escapeHtml(variant.title)}</strong></a>` +
      ` — ${escapeHtml(variant.spec)}. ${escapeHtml(variant.note)}</li>`
  ).join("")}</ul>`;

async function homeRangeHtml(): Promise<string> {
  try {
    const products = await query<ProductCardRow>(
      `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
         FROM products p
        ORDER BY p.is_featured DESC, p.name
        LIMIT 6`
    );
    return products.length
      ? `<h2>Product range</h2><ul>${productListHtml(products)}</ul><p><a href="${SITE_URL}/products">All nickel strip and busbar products</a></p>`
      : homeRangeFallbackHtml();
  } catch (error) {
    console.warn("[snapshot] Homepage product range unavailable; rendering the text list.", error);
    return homeRangeFallbackHtml();
  }
}

/**
 * General customer reviews for the homepage.
 *
 * Deliberately no schema.org markup, unlike the product pages. Google treats reviews a business
 * collects about itself as self-serving and ineligible for rich results, so marking these up
 * would claim a rating Google will not show and may flag. They are here to be read by people.
 *
 * Only reviews with no product_slug: a review of one product belongs on that product's page,
 * where it is eligible for markup, not duplicated onto the homepage.
 */
async function homeReviewsHtml(): Promise<string> {
  try {
    const reviews = await query<{ reviewer_name: string; reviewer_company: string | null; rating: number; body: string }>(
      `SELECT reviewer_name, reviewer_company, rating, body
         FROM reviews
        WHERE status = 'approved' AND product_slug IS NULL
        ORDER BY created_at DESC
        LIMIT 6`
    );
    if (!reviews.length) return "";
    return (
      `<h2>What customers say</h2>` +
      reviews
        .map(
          (review) =>
            `<blockquote><p>${escapeHtml(review.body)}</p><cite>${escapeHtml(review.reviewer_name)}${
              review.reviewer_company ? `, ${escapeHtml(review.reviewer_company)}` : ""
            } &mdash; ${Number(review.rating)}/5</cite></blockquote>`
        )
        .join("") +
      `<p><a href="${SITE_URL}/review">Leave a review</a></p>`
    );
  } catch (error) {
    console.warn("[snapshot] Homepage reviews unavailable; omitting the block.", error);
    return "";
  }
}

async function homeArticlesHtml(): Promise<string> {
  try {
    const posts = await query<BlogCardRow>(
      `SELECT title, slug, excerpt, cover_image_url FROM blog_posts
        WHERE status = 'published' AND (published_at IS NULL OR published_at <= now())
          AND slug IS NOT NULL AND slug <> ''
        ORDER BY published_at DESC NULLS LAST, id DESC
        LIMIT 4`
    );
    return posts.length
      ? `<h2>Latest nickel strip articles</h2>${posts.map((post) => blogCardHtml(post, 3)).join("")}`
      : "";
  } catch (error) {
    console.warn("[snapshot] Homepage articles unavailable; omitting the block.", error);
    return "";
  }
}

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
    snapshotBody: route.body.includes(HOME_RANGE_TOKEN)
      ? route.body
          .replace(HOME_RANGE_TOKEN, await homeRangeHtml())
          .replace(HOME_ARTICLES_TOKEN, await homeArticlesHtml())
          .replace(HOME_REVIEWS_TOKEN, await homeReviewsHtml())
      : route.body,
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
       LIMIT 100`
    );
  } catch (error) {
    // A listing with no posts is still a better snapshot than the homepage shell, so a failed
    // query degrades to the heading-only body rather than losing the corrected head tags.
    console.warn("[seo] Blog list snapshot could not load posts; rendering heading only.", error);
  }

  // Without this, /blog was a dead end for non-rendering crawlers: the post links exist only
  // in the client bundle, so nothing but the sitemap pointed at individual articles.
  // One <article> per post, with the post's own title as an <h2> — the same shape
  // BlogListingPage.tsx renders for a browser.
  //
  // This index previously emitted a flat <ul> of links and no headings at all, so a crawler saw
  // h1=1, h2=0 while a visitor saw a heading per article. The rendered page was right and the
  // snapshot was wrong, which is the worse way round: the snapshot is the version Google and the
  // answer engines actually read, and a list with no sub-structure gives them nothing to extract
  // beyond "this is a blog". Each H2 now names an article, which is what a reader and a
  // retrieval system are both looking for.
  // The cards are the newest twenty, as before. The rest were reachable from here by nothing but
  // the sitemap, which left ten articles with one inbound link each, so they follow as a plain
  // list. The lithium guide is a page in the code rather than a row, so it is never in the query.
  const featuredPosts = posts.slice(0, 20);
  const olderPosts = posts.slice(20);
  const postsHtml = posts.length
    ? featuredPosts
        .map((post) => blogCardHtml(post, 2))
        .join("")
    : "";
  const moreArticlesHtml = `<section><h2>More nickel strip articles</h2><ul>${[
    ...olderPosts.map((post) => ({ href: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`, text: post.title })),
    { href: `${SITE_URL}/blog/nickel-strips-lithium-batteries`, text: "Nickel strips for lithium-ion batteries: what to specify and how to buy" },
  ]
    .map((item) => `<li><a href="${escapeAttr(item.href)}">${escapeHtml(item.text)}</a></li>`)
    .join("")}</ul></section>`;

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
      itemListElement: featuredPosts.map((post, index) => ({
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
    ${moreArticlesHtml}
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
  // null until the freight figure is confirmed - see the gate in shippingPolicy.ts.
  const shippingDetails = buildShippingSchema();

  const keywordValues = { name, price: hasPrice ? formatInr(numericPrice) : null };
  const description =
    (keywordBlock && keywordMetaDescription(keywordBlock, keywordValues)) ||
    rawDescription.slice(0, 160);

  // Material, purity, thickness, width, cell format, configuration and pattern, derived from
  // the product's own columns and name - see src/lib/productSpecs.ts. Purity is applied only to
  // nickel items: the catalogue also carries a copper busbar, and a nickel purity on that page
  // would be a false material claim exactly where a buyer checks it.
  const productSpecs = buildProductSpecs(product as Record<string, string | null>);

  // Approved customer reviews of this product.
  //
  // Only product reviews are marked up. Google treats a review a business collects about
  // *itself* as self-serving and ineligible for rich results, so the general reviews on the site
  // are for human readers only and never reach schema.org — claiming otherwise would be markup
  // Google discounts at best.
  //
  // Best-effort: a reviews table that is missing or unreachable must not take the product page
  // down, so the catch leaves the page to render without them.
  let reviews: { reviewer_name: string; reviewer_company: string | null; rating: number; body: string; created_at: string }[] = [];
  try {
    reviews = await query(
      `SELECT reviewer_name, reviewer_company, rating, body, created_at
         FROM reviews
        WHERE status = 'approved' AND product_slug = $1
        ORDER BY created_at DESC
        LIMIT 20`,
      [productSlug]
    );
  } catch (error) {
    console.warn(`[snapshot] Reviews unavailable for /product/${productSlug}.`, error);
  }
  const ratingAverage = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1))
    : null;

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
    // Emitted only when real approved reviews exist. An aggregateRating with no reviews behind
    // it is the single most common reason Google issues a manual action for structured data.
    ...(reviews.length && ratingAverage !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingAverage,
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 10).map((entry) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: Number(entry.rating), bestRating: 5, worstRating: 1 },
            author: {
              "@type": "Person",
              name: entry.reviewer_company ? `${entry.reviewer_name}, ${entry.reviewer_company}` : entry.reviewer_name,
            },
            datePublished: String(entry.created_at).slice(0, 10),
            reviewBody: entry.body,
          })),
        }
      : {}),
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
            // A recommended merchant-listing field Search Console reported as absent on every
            // product. Unambiguously true: this is newly manufactured material, slit to order.
            // Mirrored in ProductDetailPage.tsx.
            itemCondition: "https://schema.org/NewCondition",
            // The companion merchant-listing enhancement. Spread rather than assigned, because
            // the builder returns null until the freight figure is known: an Offer carrying a
            // shippingDetails without shippingRate is a reported invalid item, not a silently
            // missing recommendation. Mirrored in ProductDetailPage.tsx.
            ...(shippingDetails ? { shippingDetails } : {}),
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

  // H type SKUs sit under /h-type-nickel-strip rather than /products; see parentCategoryFor.
  const parent = parentCategoryFor({ name, slug: productSlug });
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: parent.name, item: `${SITE_URL}${parent.path}` },
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

  // The rest of the catalogue, as plain links. The related block above is six contextual
  // products chosen by category; this is the other side of the same problem — the audit found
  // product pages linking to no other product at all, so a crawler arriving on one SKU from
  // search had no path to the other sixteen except back through /products.
  //
  // The React page gets these from the footer, which the snapshot has no equivalent of, so
  // without this block the crawler-visible page and the rendered page disagree about how
  // connected the catalogue is. Read from the build-time PRODUCT_LINKS rather than a second
  // query: it costs nothing per request, and a database hiccup cannot strip the site's internal
  // linking. Anchor text is each product's own name, and the current page is left out — a page
  // linking to itself is noise.
  const catalogueLinks = PRODUCT_LINKS.filter((entry) => entry.slug !== productSlug);
  const catalogueHtml = catalogueLinks.length
    ? `<h2>Full nickel strip and busbar catalogue</h2><ul>${catalogueLinks
        .map(
          (entry) =>
            `<li><a href="${SITE_URL}/product/${encodeURIComponent(entry.slug)}">${escapeHtml(entry.name)}</a></li>`
        )
        .join("")}</ul>`
    : "";

  const productFaqs = buildProductFaqs(product as Record<string, string | null>);
  const productFaqHtml = productFaqs.length
    ? `<h2>Frequently asked questions</h2>${productFaqs
        .map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`)
        .join("")}`
    : "";

  const snapshotBody = `<article>
    <nav aria-label="Breadcrumb"><a href="${SITE_URL}/">Home</a> › <a href="${SITE_URL}${parent.path}">${escapeHtml(parent.name)}</a> › ${escapeHtml(name)}</nav>
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
    ${productFaqHtml}
    ${
      reviews.length && ratingAverage !== null
        ? `<h2>Customer reviews</h2>
    <p>${ratingAverage} out of 5, from ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}.</p>
    ${reviews
      .map(
        (entry) =>
          `<blockquote><p>${escapeHtml(entry.body)}</p><cite>${escapeHtml(entry.reviewer_name)}${
            entry.reviewer_company ? `, ${escapeHtml(entry.reviewer_company)}` : ""
          } &mdash; ${Number(entry.rating)}/5</cite></blockquote>`
      )
      .join("")}
    <p><a href="${SITE_URL}/review/${encodeURIComponent(productSlug)}">Review this product</a></p>`
        : ""
    }
    <h2>Export supply</h2>
    <p>${escapeHtml(PRODUCT_EXPORT_LEAD)}</p>
    <p><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a> &mdash; send your specification, quantity and destination port for a quotation.</p>
    <h2>${escapeHtml(RETURN_POLICY_HEADING)}</h2>
    ${RETURN_POLICY_LINES.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    <h2>${escapeHtml(SHIPPING_HEADING)}</h2>
    ${SHIPPING_LINES.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    ${relatedHtml}
    ${contextualLinksHtml({ kind: "product", slug: productSlug })}
    ${catalogueHtml}
    <p><a href="${SITE_URL}/products">All nickel strip and busbar products</a></p>
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: imageUrl,
    ogType: "product",
    keywords: [...(keywordBlock?.keywords ?? []), ...BUYER_ROLE_KEYWORDS],
    jsonLd: [productJsonLd, breadcrumbJsonLd, ...(productFaqJsonLd(productFaqs) ? [productFaqJsonLd(productFaqs)!] : [])],
    snapshotBody,
  });

  return { status: 200, html };
}
