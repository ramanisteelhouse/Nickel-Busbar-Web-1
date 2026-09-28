/**
 * The call to action at the end of a blog post, matched to what the post is about.
 *
 * The blog is where the organic traffic lands. In Search Console the articles earn most of the
 * site's clicks (fuse-type vs plain, current carrying capacity, strip vs busbar, …) while the
 * product pages earn almost none, and until now every article ended with "← Back to Blog" and
 * nothing else. A reader who had just learned which strip they need had no next step on the
 * page, so they left, and the click Google sent became a bounce rather than an enquiry.
 *
 * A generic "Contact us" converts badly after a technical article, because it asks the reader
 * to restart the conversation. The block below instead continues it: a reader of the welding
 * article is offered welding strip, a reader of the busbar article is offered busbar, and so
 * on — the page that answers "and where do I buy this?" for that specific topic.
 *
 * Plain data with no React: seoSnapshot.ts renders the same links for crawlers, which also
 * gives every article a descriptive internal link into the commercial pages.
 */

export type BlogCta = {
  /** Short line for the slim bar under the cover image. */
  teaser: string;
  heading: string;
  body: string;
  link: { label: string; path: string };
  /** Recorded as the enquiry's product name, so a lead shows which article produced it. */
  enquiryLabel: string;
};

type Rule = { match: RegExp; cta: Omit<BlogCta, 'enquiryLabel'> & { topic: string } };

/** First match wins, so the more specific topics come first. */
const RULES: readonly Rule[] = [
  {
    match: /weld/,
    cta: {
      topic: 'Nickel strip for spot welding',
      teaser: 'Need strip that welds cleanly? 5 kg MOQ, any size.',
      heading: 'Nickel strip for spot welding, in the size you need',
      body: '99.8% pure nickel that forms a clean weld at moderate electrode force, slit to your width and cut to your cell pitch. Orders start at 5 kg.',
      link: { label: 'See nickel strip for battery pack welding', path: '/nickel-strip-for-battery-pack-welding' },
    },
  },
  {
    match: /busbar/,
    cta: {
      topic: 'Nickel busbar',
      teaser: 'Need a busbar made to your module drawing? 5 kg MOQ.',
      heading: 'Nickel busbar made to your module drawing',
      body: 'Pure nickel busbar in the width and thickness your current and cross-section call for, with tooling developed for new pack layouts.',
      link: { label: 'See nickel busbar for battery applications', path: '/nickel-busbar-for-battery-applications' },
    },
  },
  {
    match: /fuse|h-type|zig-zag|2p-vs|18650|21700|pattern/,
    cta: {
      topic: 'H type / fuse-type nickel strip',
      teaser: 'Ready to order H type or fuse-type strip? Choose your size.',
      heading: 'H type and fuse-type nickel strip, cut to your cell pitch',
      body: 'Plain, fuse-type, honeycomb and zig-zag patterns for 18650, 21700, 32650 and 32700 cells, in 0.10–0.30 mm standard thicknesses or any size to order. 5 kg minimum order.',
      link: { label: 'See H type nickel strip sizes and prices', path: '/h-type-nickel-strip' },
    },
  },
  {
    match: /price|pricing|moq|minimum-order|wholesal|choose/,
    cta: {
      topic: 'Nickel strip wholesale / small lots',
      teaser: 'Buying in small lots? Orders start at 5 kg.',
      heading: 'Manufacturer-direct nickel strip from 5 kg',
      body: 'The same 99.8% pure nickel and test certificates at 5 kg as at bulk quantities, supplied as manufacturer, stockist, wholesaler and distributor.',
      link: { label: 'See wholesale and small-lot supply', path: '/nickel-strip-wholesaler-and-distributor' },
    },
  },
  {
    match: /export|uk-|-uk/,
    cta: {
      topic: 'Nickel strip export',
      teaser: 'Importing nickel strip? Get an export quotation.',
      heading: 'Export quotation for nickel strip and busbar',
      body: 'Commercial invoice, packing list, certificate of origin and material test certificates prepared with the shipment, to 17+ countries.',
      link: { label: 'Send an export enquiry', path: '/export-enquiry' },
    },
  },
  {
    // (^|-)ess(-|$), not a bare "ess", which would also match "thickness" and "process".
    match: /electric-vehicle|lithium|(^|-)ess(-|$)|purity|energy-storage/,
    cta: {
      topic: 'Nickel strip for lithium-ion packs',
      teaser: 'Building lithium-ion packs? Get strip in your exact size.',
      heading: 'Pure nickel strip for lithium-ion battery packs',
      body: '99.8% pure nickel strip and busbar for EV, energy storage and power-tool packs, made to your thickness, width and cell layout. 5 kg minimum order.',
      link: { label: 'See nickel strip for lithium-ion battery makers', path: '/nickel-strip-for-lithium-ion-battery-manufacturers' },
    },
  },
];

const DEFAULT_CTA: Rule['cta'] = {
  topic: 'Nickel strip',
  teaser: 'Know the size you need? 5 kg MOQ, made to order.',
  heading: 'Order nickel strip in your exact size',
  body: 'Standard thicknesses from 0.10 to 0.30 mm and widths from 2 to 50 mm, or any size made to your drawing. Orders start at 5 kg.',
  link: { label: 'Browse nickel strip and choose your size', path: '/products' },
};

export function blogCtaFor(slug: string): BlogCta {
  const key = slug.toLowerCase();
  const { topic, ...cta } = RULES.find((rule) => rule.match.test(key))?.cta ?? DEFAULT_CTA;
  return { ...cta, enquiryLabel: `${topic} (from article: ${slug})` };
}
