/**
 * Removes a server-rendered tag once the app renders its own copy of it.
 *
 * index.html (and the SSR snapshot that rewrites it per route in seoSnapshot.ts) ships a full
 * head and a JSON-LD payload so that crawlers which never run this bundle still get a title,
 * description, canonical, social card and structured data. React 19 does not reconcile a page
 * component's metadata against tags that were already in the HTML — it hoists `<title>`,
 * `<meta>` and `<link>` into `<head>` alongside them, and leaves inline `<script>` where the
 * component rendered it. So once a page mounted, its tags joined the server-rendered ones
 * instead of replacing them, and the document carried two of each.
 *
 * That is the duplicate-canonical finding in the SEO audit, and the reason Search Console lists
 * a product URL twice: the rendered page publishes two `Product` and two `BreadcrumbList`
 * entities, one pair from the snapshot and one from ProductDetailPage's `<Helmet>`.
 *
 * (react-helmet-async has its own `data-rh` mechanism for exactly this, but under React 19 it
 * delegates to React's native hoisting and the cleanup path never runs.)
 *
 * The removal is conditional: a marked tag is dropped only when an unmarked tag of the same
 * kind exists. Coverage across page components is uneven — /about sets no og:image, most routes
 * set no og:type, and the homepage, /products, /about and the blog list publish no JSON-LD of
 * their own at all — so stripping unconditionally would delete markup nothing replaces.
 *
 * A MutationObserver rather than a React effect: pages that fetch before they can describe
 * themselves (ProductDetailPage, BlogPostPage) publish their metadata well after mount.
 */

const MARKER = 'data-ssr-head';

/**
 * What makes two tags "the same tag" for de-duplication.
 *
 * JSON-LD is keyed by `@type` because that is the granularity a duplicate matters at: two
 * `Product` entities on one URL are two competing descriptions of one thing, whether or not
 * their fields agree. A `@graph` wrapper is keyed by its member types so the site-wide
 * Organization graph in index.html is never confused with a page's own entities.
 */
const identity = (el: Element): string | null => {
  switch (el.tagName) {
    case 'TITLE':
      return 'title';
    case 'META': {
      const name = el.getAttribute('name') ?? el.getAttribute('property');
      return name ? `meta:${name}` : null;
    }
    case 'LINK':
      return el.getAttribute('rel') === 'canonical' ? 'link:canonical' : null;
    case 'SCRIPT': {
      if (el.getAttribute('type') !== 'application/ld+json') return null;
      const types = jsonLdTypes(el.textContent);
      return types ? `ld:${types}` : null;
    }
    default:
      return null;
  }
};

/** Sorted, comma-joined `@type` list, so member order in a graph cannot change the key. */
const jsonLdTypes = (raw: string | null): string | null => {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Malformed JSON-LD is not ours to interpret; leaving it alone is safer than guessing.
    return null;
  }
  const nodes = Array.isArray(parsed)
    ? parsed
    : [parsed as Record<string, unknown>].flatMap((node) =>
        Array.isArray(node?.['@graph']) ? (node['@graph'] as unknown[]) : [node]
      );

  const types = nodes
    .flatMap((node) => {
      const type = (node as Record<string, unknown> | null)?.['@type'];
      return Array.isArray(type) ? (type as string[]) : typeof type === 'string' ? [type] : [];
    })
    .sort();

  return types.length ? types.join(',') : null;
};

/**
 * Head tags are only meaningful inside `<head>`, but the snapshot's JSON-LD sits in `<body>`
 * and React leaves a component's inline JSON-LD wherever it rendered — so scripts have to be
 * collected document-wide.
 */
const candidates = (): Element[] => [
  ...Array.from(document.head.children),
  ...Array.from(document.querySelectorAll('script[type="application/ld+json"]')),
];

const dedupe = () => {
  const marked = new Map<string, Element[]>();
  const replaced = new Set<string>();

  for (const el of candidates()) {
    const key = identity(el);
    if (!key) continue;
    if (el.hasAttribute(MARKER)) {
      const list = marked.get(key);
      if (list) list.push(el);
      else marked.set(key, [el]);
    } else {
      replaced.add(key);
    }
  }

  for (const [key, elements] of marked) {
    if (!replaced.has(key)) continue;
    for (const el of elements) el.remove();
  }
};

export const startSsrHeadCleanup = () => {
  if (typeof document === 'undefined') return;
  dedupe();

  // Coalesced into one run per task: the subtree observer needed to catch a page component's
  // inline JSON-LD fires on every render that adds or removes a node, and the scan should not
  // repeat for each burst. childList only — the motion animations mutate `style`, which this
  // never sees.
  //
  // A timer rather than requestAnimationFrame: rAF does not fire while the tab is hidden, which
  // would leave duplicate tags in place for a page opened in a background tab (and makes the
  // behaviour untestable in a headless pane). setTimeout is throttled there, never blocked.
  let queued = 0;
  const schedule = () => {
    if (queued) return;
    queued = window.setTimeout(() => {
      queued = 0;
      dedupe();
    }, 0);
  };

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
};
