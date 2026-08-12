// Non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, and most other AI/answer-engine
// bots) fetch raw HTML and never execute the client bundle, so the plain Vite SPA shell
// (`<div id="root"></div>`) is invisible to them on every route. This module injects a
// real, crawlable HTML snapshot (title/meta/JSON-LD/content) for the two route types that
// matter most for answer-engine visibility — blog posts and product pages — directly into
// the HTML response, before the client bundle ever runs. Real browsers still get the normal
// SPA: React's createRoot().render() fully replaces this markup on mount.
import { query, queryOne } from "./db.js";
import { EMAIL_ADDRESSES, PHONE_NUMBERS, PRIMARY_CALL, PRIMARY_EMAIL } from "./src/lib/contact.js";

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

// String.replace treats `$&`, `$'`, "$`" and `$$` as substitution patterns inside a
// replacement *string*, which corrupts any content containing a dollar sign - and escapeHtml
// makes it worse, since it turns `&` into `&amp;` and `'` into `&#39;`, so both `$&` and `$'`
// in the source text end up as a live `$&` sequence. Passing a function instead makes the
// replacement literal. Every replace below goes through this.
const replaceOnce = (html: string, pattern: RegExp | string, replacement: string) =>
  html.replace(pattern, () => replacement);

const injectHead = (template: string, head: HeadInput) => {
  let html = template;

  // Replace the default <title>...</title>.
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(head.title)}</title>`);

  // Replace the default meta description.
  html = replaceOnce(
    html,
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeAttr(head.description)}" />`
  );

  // Replace the default canonical link.
  html = replaceOnce(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escapeAttr(head.canonical)}" />`
  );

  if (head.robots) {
    html = replaceOnce(
      html,
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
  html = replaceOnce(html, /<meta property="og:title"[^>]*>/, ogTags);

  // JSON.stringify escapes neither `<` nor `/`, so a title or FAQ answer containing the
  // literal text `</script>` would close this tag early and turn whatever follows into live
  // markup. Escaping `<` as its \u003c form keeps the JSON valid and the tag intact.
  const jsonLdScripts = head.jsonLd
    .map(
      (entry) =>
        `<script type="application/ld+json">${JSON.stringify(entry).replace(/</g, "\\u003c")}</script>`
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
    ? "Nickel Strip Categories | Pure Nickel, Nickel Plated & Battery Tabs"
    : "Nickel Strip Products | Pure Nickel & Nickel Plated Strips - Ramani Steel House";
  const description = isCategoriesRoute
    ? "Browse nickel strip categories from Ramani Steel House: pure nickel, nickel-plated strips, battery tabs, busbars and custom coils. Manufactured in Mumbai, supplied PAN India and exported worldwide."
    : "Shop nickel strips, nickel-plated strips, and battery tabs manufactured in Mumbai, India. PAN India supply and export to 17+ countries. Request bulk and custom quotes.";

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
  };

  const snapshotBody = `<article>
    <h1>${escapeHtml(isCategoriesRoute ? "Nickel Strip Categories" : "Nickel Strip Products")}</h1>
    <p>${escapeHtml(description)}</p>
  </article>`;

  const html = injectHead(template, {
    title,
    description,
    canonical,
    jsonLd: [collectionJsonLd],
    snapshotBody,
  });

  return { status: 200, html };
}

// The content routes below have no per-URL database record behind them, so before this they
// were served the unmodified dist/index.html — which carries the *homepage's* title and, worse,
// `<link rel="canonical" href="https://www.nickelbusbar.com/">`. Every non-rendering crawler
// therefore saw /about, /contact and /calculator each declare itself a duplicate of the
// homepage. These values mirror the <Helmet> block in the matching page component
// (AboutPage / ContactPage / CalculatorPage); update both together.
const STATIC_ROUTE_SEO: Record<string, { title: string; description: string; jsonLd: object[]; body: string }> = {
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
    ],
    body: `<article>
    <h1>Trusted Nickel Strip Manufacturer Since 1974</h1>
    <p>We manufacture high-quality nickel strips with reliable delivery, competitive pricing, and technical support, supplying PAN India and exporting to 17+ countries. Our core focus is nickel strips for lithium-ion battery applications.</p>
  </article>`,
  },
  "/contact": {
    title: "Contact Us | Ramani Steel House",
    description:
      "Contact Ramani Steel House, a nickel strip manufacturer in India, for nickel strip and nickel busbar enquiries. Request a quote for lithium-ion battery manufacturing applications.",
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
    ],
    body: `<article>
    <h1>Contact Us</h1>
    <p>For product enquiries, custom requirements, and bulk orders.</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
  </article>`,
  },
  "/calculator": {
    title: "Nickel Alloy Weight Calculator | Nickel Strip Weight Tool",
    description:
      "Calculate nickel strip and alloy weight instantly with a premium calculator built for battery, EV, and industrial manufacturing applications.",
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
      },
    ],
    body: `<article>
    <h1>Nickel Alloy Weight Calculator</h1>
    <p>Instantly calculate weight for nickel strips, sheets, busbars, foil, wire and coil in mm or inches. Built for battery pack engineers, EV manufacturers and industrial metal buyers.</p>
  </article>`,
  },
};

export function isStaticSnapshotRoute(pathname: string): boolean {
  return Object.prototype.hasOwnProperty.call(STATIC_ROUTE_SEO, pathname);
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
    ogImage: SITE_LOGO_URL,
    jsonLd: route.jsonLd,
    snapshotBody: route.body,
  });

  return { status: 200, html };
}

export async function renderBlogListSnapshot(template: string): Promise<SnapshotResult> {
  const canonical = `${SITE_URL}/blog`;
  const title = "Blog | Nickel Strips, Battery Materials & Manufacturing Guides";
  const description =
    "Read technical guides and industry insights from Ramani Steel House on nickel strips, battery tabs, and lithium manufacturing.";

  let posts: Array<{ title: string; slug: string; excerpt: string | null }> = [];
  try {
    posts = await query<{ title: string; slug: string; excerpt: string | null }>(
      `SELECT title, slug, excerpt FROM blog_posts
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
        .map(
          (post) =>
            `<li><a href="${SITE_URL}/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a>${
              post.excerpt ? ` — ${escapeHtml(post.excerpt)}` : ""
            }</li>`
        )
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
    ogImage: SITE_LOGO_URL,
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
  const title = `${name} | Nickel Strips Manufacturer`;
  const rawDescription = `${name} by ${SITE_NAME}. ${
    (product.description as string) || "Industrial-grade nickel strip for lithium-ion battery and precision applications."
  }`;
  const description = rawDescription.slice(0, 160);
  const canonical = `${SITE_URL}/product/${encodeURIComponent(product.slug as string)}`;
  const imageUrl = (product.image as string) || `${SITE_URL}/img/logo.png`;

  const applications = Array.isArray(product.applications) ? (product.applications as string[]) : [];

  // Products quoted on enquiry have no price, and `Number(price) || 0` used to publish those
  // as a `price: 0` InStock Offer — a structurally valid claim that the item is free. An
  // absent price means "no offer to advertise", so the Offer node is omitted entirely.
  const numericPrice = Number(product.price);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: (product.description as string) || description,
    image: [imageUrl],
    brand: { "@type": "Brand", name: SITE_NAME },
    category: (product.category_name as string) || "Nickel Strips",
    sku: product.slug,
    ...(hasPrice
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: numericPrice,
            availability:
              Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: canonical,
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
