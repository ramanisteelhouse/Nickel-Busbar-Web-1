// Non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, and most other AI/answer-engine
// bots) fetch raw HTML and never execute the client bundle, so the plain Vite SPA shell
// (`<div id="root"></div>`) is invisible to them on every route. This module injects a
// real, crawlable HTML snapshot (title/meta/JSON-LD/content) for the two route types that
// matter most for answer-engine visibility — blog posts and product pages — directly into
// the HTML response, before the client bundle ever runs. Real browsers still get the normal
// SPA: React's createRoot().render() fully replaces this markup on mount.
import { query, queryOne } from "./db.js";

const SITE_URL = "https://www.nickelbusbar.com";
const SITE_NAME = "Ramani Steel House";
const SITE_LOGO_URL = `${SITE_URL}/img/logo.png`;

const escapeHtml = (value: string) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttr = (value: string) => escapeHtml(value);

type SnapshotResult = { status: number; html: string };

type HeadInput = {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  robots?: string;
  jsonLd: object[];
  snapshotBody: string;
};

const injectHead = (template: string, head: HeadInput) => {
  let html = template;

  // Replace the default <title>...</title>.
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(head.title)}</title>`);

  // Replace the default meta description.
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeAttr(head.description)}" />`
  );

  // Replace the default canonical link.
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escapeAttr(head.canonical)}" />`
  );

  if (head.robots) {
    html = html.replace(
      /<meta name="robots"[^>]*>/,
      `<meta name="robots" content="${escapeAttr(head.robots)}" />`
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
    `<meta property="og:title" content="${escapeAttr(head.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(head.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(head.canonical)}" />`,
    head.ogImage ? `<meta property="og:image" content="${escapeAttr(head.ogImage)}" />` : "",
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
    head.ogImage ? `<meta name="twitter:image" content="${escapeAttr(head.ogImage)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n  ");
  html = html.replace(/<meta property="og:title"[^>]*>/, ogTags);

  const jsonLdScripts = head.jsonLd
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join("\n  ");

  // Inject an SSR content snapshot inside #root (real crawlers see this; React replaces it on mount).
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${head.snapshotBody ?? ""}</div>\n  ${jsonLdScripts}`
  );

  return html;
};

export async function renderBlogSnapshot(template: string, slug: string): Promise<SnapshotResult> {
  const post = await queryOne<Record<string, unknown>>(
    `SELECT title, slug, excerpt, content, cover_image_url, author_name, meta_title,
            meta_description, faq_items, published_at, created_at, updated_at
     FROM blog_posts
     WHERE slug = $1 AND status = 'published' AND (published_at IS NULL OR published_at <= now())
     LIMIT 1`,
    [slug]
  );

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

  // The content column is only ever written via the authenticated /api/admin/blog-posts
  // endpoint (not public user input), so it's rendered as-is here — same trust boundary
  // the client already relies on before its own sanitize-then-render step.
  const snapshotBody = `<article>
    <h1>${escapeHtml(post.title as string)}</h1>
    ${(post.content as string) || ""}
    ${faqHtml}
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: coverImageUrl || undefined,
    jsonLd: faqJsonLd ? [articleJsonLd, faqJsonLd] : [articleJsonLd],
    snapshotBody,
  });

  return { status: 200, html };
}

export async function renderProductSnapshot(template: string, slug: string): Promise<SnapshotResult> {
  const product = await queryOne<Record<string, unknown>>(
    `SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = $1`,
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
  const title = `${name} | Nickel Strips Manufacturer`;
  const rawDescription = `${name} by ${SITE_NAME}. ${
    (product.description as string) || "Industrial-grade nickel strip for lithium-ion battery and precision applications."
  }`;
  const description = rawDescription.slice(0, 160);
  const canonical = `${SITE_URL}/product/${encodeURIComponent(product.slug as string)}`;
  const imageUrl = (product.image as string) || `${SITE_URL}/img/logo.png`;

  const applications = Array.isArray(product.applications) ? (product.applications as string[]) : [];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: (product.description as string) || description,
    image: [imageUrl],
    brand: { "@type": "Brand", name: SITE_NAME },
    category: (product.category_name as string) || "Nickel Strips",
    sku: product.slug,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(product.price) || 0,
      availability: Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonical,
    },
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

  const specRows = [
    product.astm_value ? `<li>ASTM: ${escapeHtml(product.astm_value as string)}</li>` : "",
    product.uns_value ? `<li>UNS: ${escapeHtml(product.uns_value as string)}</li>` : "",
    product.dimensions ? `<li>Dimensions: ${escapeHtml(product.dimensions as string)}</li>` : "",
  ]
    .filter(Boolean)
    .join("");

  const snapshotBody = `<article>
    <h1>${escapeHtml(name)}</h1>
    <p>${escapeHtml((product.description as string) || "")}</p>
    ${specRows ? `<h2>Specifications</h2><ul>${specRows}</ul>` : ""}
    ${
      applications.length
        ? `<h2>Applications</h2><ul>${applications.map((app) => `<li>${escapeHtml(app)}</li>`).join("")}</ul>`
        : ""
    }
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: imageUrl,
    jsonLd: [productJsonLd, breadcrumbJsonLd],
    snapshotBody,
  });

  return { status: 200, html };
}
