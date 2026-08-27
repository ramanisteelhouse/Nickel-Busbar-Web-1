/**
 * Removes the server-rendered head tag when the app renders its own copy of it.
 *
 * index.html (and the SSR snapshot that rewrites it per route in seoSnapshot.ts) ships a full
 * head so that crawlers which never run this bundle still get a title, description, canonical
 * and social card. React 19 hoists `<title>`/`<meta>`/`<link>` out of page components into
 * `<head>` on its own — it does not reconcile them against tags that were already in the HTML.
 * So once a page mounted, its canonical joined the server-rendered one instead of replacing it,
 * and the document carried two. That is the duplicate-canonical finding in the SEO audit, and
 * on a route whose raw HTML had not been rewritten the stale copy was the homepage's, listed
 * first.
 *
 * (react-helmet-async has its own `data-rh` mechanism for exactly this, but under React 19 it
 * delegates to React's native hoisting and the cleanup path never runs.)
 *
 * The removal is conditional: a marked tag is dropped only when an unmarked tag of the same
 * kind exists. Coverage across page components is uneven — /about sets no og:image, most
 * routes set no og:type — so stripping unconditionally would delete tags nothing replaces.
 *
 * A MutationObserver rather than a React effect: pages that fetch before they can describe
 * themselves (ProductDetailPage, BlogPostPage) publish their head tags well after mount.
 */

const MARKER = 'data-ssr-head';

/** What makes two head tags "the same tag" for de-duplication. */
const identity = (el: Element): string | null => {
  switch (el.tagName) {
    case 'TITLE':
      return 'title';
    case 'META': {
      const name = el.getAttribute('name') ?? el.getAttribute('property');
      return name ? `meta:${name}` : null;
    }
    case 'LINK': {
      const rel = el.getAttribute('rel');
      if (rel !== 'canonical') return null;
      return 'link:canonical';
    }
    default:
      return null;
  }
};

const dedupe = () => {
  const marked = new Map<string, Element[]>();
  const replaced = new Set<string>();

  for (const el of Array.from(document.head.children)) {
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
  new MutationObserver(dedupe).observe(document.head, { childList: true });
};
