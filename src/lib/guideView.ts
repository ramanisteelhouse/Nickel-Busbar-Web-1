/**
 * What a guide page shows besides its body: structured data, product links, the date line.
 *
 * Used by both renderers — the React page a visitor gets (GuidePage.tsx) and the HTML snapshot a
 * crawler gets (renderGuideSnapshot in seoSnapshot.ts). A page whose React head differs from its
 * snapshot head has its snapshot discarded when React mounts, so the structured data is built
 * once, here, and both read it.
 *
 * Plain data, no React, and `.js` on relative imports: the Node serverless function loads this.
 */
import { GUIDES, GUIDES_PATH, guidePath, type Guide } from './guides.js';
import { PRODUCT_LINKS } from './productLinks.js';

export const GUIDE_SITE_URL = 'https://www.nickelbusbar.com';
const SITE_NAME = 'Ramani Steel House';
const SITE_LOGO_URL = `${GUIDE_SITE_URL}/img/logo.png`;

export const guideUrl = (guide: Guide): string => `${GUIDE_SITE_URL}${guidePath(guide.slug)}`;
export const guideCoverUrl = (guide: Guide): string => `${GUIDE_SITE_URL}${guide.coverImage}`;

/** "24 October 2026". Pinned to UTC so a visitor's timezone cannot show the previous day. */
export function formatGuideDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/**
 * The products a guide discusses, named as the catalogue names them.
 *
 * Names come from PRODUCT_LINKS, which the build regenerates from the database, so a renamed
 * product is renamed here too. A slug that is no longer in the catalogue is dropped rather than
 * linked: a guide must not link to a URL that now 404s.
 */
export function guideProducts(guide: Guide): Array<{ slug: string; name: string }> {
  return guide.productSlugs
    .map((slug) => PRODUCT_LINKS.find((product) => product.slug === slug))
    .filter((product): product is { slug: string; name: string } => Boolean(product));
}

/** The other guides, for the "more guides" list. */
export function otherGuides(guide: Guide): Guide[] {
  return GUIDES.filter((candidate) => candidate.slug !== guide.slug);
}

export function guideJsonLd(guide: Guide): object[] {
  const canonical = guideUrl(guide);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      image: [guideCoverUrl(guide)],
      author: { '@type': 'Organization', name: SITE_NAME, url: GUIDE_SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: SITE_LOGO_URL },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      datePublished: guide.datePublished,
      dateModified: guide.dateModified,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${GUIDE_SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${GUIDE_SITE_URL}${GUIDES_PATH}` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: canonical },
      ],
    },
  ];
}

export const GUIDES_INDEX_TITLE = 'Nickel Strip Guides | Ramani Steel House';
export const GUIDES_INDEX_DESCRIPTION =
  'Plain-English nickel strip guides for battery builders and buyers: what it is, how to size it, why it overheats, and how much current it can carry.';

export function guidesIndexJsonLd(): object[] {
  const canonical = `${GUIDE_SITE_URL}${GUIDES_PATH}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Nickel Strip Guides',
      description: GUIDES_INDEX_DESCRIPTION,
      url: canonical,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: GUIDES.map((guide, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: guideUrl(guide),
          name: guide.title,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${GUIDE_SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: canonical },
      ],
    },
  ];
}
