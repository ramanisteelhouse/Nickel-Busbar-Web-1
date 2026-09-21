/**
 * The homepage's factual copy — specifications, applications, differentiators and FAQs.
 *
 * It lives here rather than inside HomePage.tsx because two surfaces have to render the same
 * words: the React page a visitor sees, and the raw-HTML snapshot seoSnapshot.ts serves to
 * crawlers that never run the bundle. The SEO audit measured the homepage rendering at 1272%
 * — the shipped HTML carried a heading, one answer paragraph and a phone number, while
 * everything a buyer (or an answer engine) would actually want to read appeared only after
 * React mounted. Sharing the source means the snapshot can carry the real content without the
 * two copies drifting into two different sets of claims about the same product.
 *
 * Deliberately plain data: seoSnapshot.ts runs inside a Node serverless function, so nothing
 * here may import React or lucide-react. HomePage.tsx attaches its icons by position.
 */

import { YEARS_IN_BUSINESS } from './heritage.js';

/**
 * The product whose photo fills the hero card, named by slug rather than by file path.
 *
 * Both surfaces used to hard-code /img/products/ni-18650-2p-h-type.webp. That filename is no
 * longer correct — product photos are saved under a descriptive name now (see
 * scripts/sync-product-images.ts) — and nothing would have reported the breakage: the routing
 * tables 301 a legacy image URL to the /api/product-image proxy, so the picture still appears
 * and the fault shows up only as a redirect into a serverless function and a round trip to
 * Supabase, in place of a static file on the CDN. This is the LCP element of the site's
 * most-visited page, so that swap is worth avoiding.
 *
 * Resolving through productImagePath() instead means the manifest decides the filename, and a
 * future rename moves this with it.
 */
export const HERO_PRODUCT_SLUG = 'ni-18650-2p-h-type';

/**
 * The homepage <title>, description and keywords, shared by HomePage.tsx and the snapshot in
 * seoSnapshot.ts. index.html carries a static copy for the pre-render shell and must be kept
 * in step by hand.
 *
 * Positioning, as confirmed by the owner: manufacturing is the primary business, and the
 * company also sells as a stockist, wholesaler, trader and distributor. The earlier copy said
 * "manufacturer" only, and llms.txt went further and said "not a reseller or distributor".
 * That cost a real segment of buyers. A small pack builder or a trader searching for a
 * "nickel strip wholesaler" or "stockist" does not expect a manufacturer to sell 5 kg, and
 * scrolls past a result that only says "manufacturer". The 5 kg MOQ sits in the title for the
 * same reason: it is the fact that tells that buyer this supplier will take their order.
 *
 * "Manufacturer" still leads every string, because it is the primary business and the
 * strongest claim. The trade roles follow it rather than replace it.
 */
export const HOME_SEO = {
  title: 'Nickel Strip Manufacturer & Stockist India | 5 kg MOQ',
  description:
    'Nickel strip and busbar manufacturer in Mumbai, also a stockist, wholesaler and distributor. 99.6% pure nickel from 5 kg MOQ, custom made to your drawing.',
  socialDescription:
    'Manufacturer of pure nickel strip, H type strip and nickel busbar since 1974, also a stockist, wholesaler and distributor. 5 kg MOQ; custom strips and tooling to your drawing.',
  keywords: [
    'Nickel Strip Manufacturer India',
    'Nickel Strip Stockist',
    'Nickel Strip Wholesaler',
    'Nickel Strip Distributor',
    'Nickel Strip Trader',
    'Nickel Strip Supplier',
    'Nickel Strip 5 kg MOQ',
    'Custom Nickel Strip as per Drawing',
    'Pure Nickel Strip',
    'H Type Nickel Strip',
    'Nickel Busbar',
    'Nickel Strip for 18650 Battery',
    'Nickel Strip Exporter',
  ].join(', '),
} as const;

/**
 * The hero heading and the three offers under it, shared with the crawler snapshot.
 *
 * The H1 repeats the title's phrase ("Nickel Strip Manufacturer & Stockist … India") on
 * purpose. The title decides whether someone clicks; the H1 is the first thing they read after
 * clicking, and a heading that matches what they clicked on is what tells them they landed in
 * the right place instead of hitting back. "India's Trusted …" was a claim; this is a
 * description, and the proof sits directly underneath it.
 *
 * The offers are the three facts a small buyer is checking for, and each is already stated
 * elsewhere on the site: the 5 kg MOQ, a sample before a bulk order (the Mumbai page), and
 * sizes made to the buyer's drawing.
 */
export const HOME_HERO = {
  h1Lead: 'Nickel Strip Manufacturer',
  h1Main: '& Stockist in India',
  offers: ['5 kg minimum order', 'Sample before bulk order', 'Any size, made to your drawing'],
} as const;

/**
 * The visible version of the positioning above. Meta tags alone do not rank a page for a
 * phrase; the words have to be in the text a buyer reads. Rendered on the homepage and in its
 * crawler snapshot.
 */
export const TRADE_ROLES_SECTION = {
  heading: 'Manufacturer first, also stockist, wholesaler and distributor',
  paragraphs: [
    'Ramani Steel House manufactures nickel strip and nickel busbar in Mumbai, and that is the core of the business. Because the strip is made and slit in-house, the same material is also sold the way traders and smaller buyers need it: as a stockist of the common sizes, and as a wholesaler and distributor to small battery manufacturers, pack builders and traders.',
    'Orders start at 5 kg. That is small enough for a pack assembler building a few hundred cells, not only for volume manufacturers, and the material and certificates are the same at 5 kg as at 500.',
    'Listed sizes are only the most common ones. New designs are made to your drawing: strip thickness, width, pitch and hole pattern, plus tooling for unique battery pack layouts. Send the drawing or the cell arrangement and the quotation is made against it.',
  ],
  bullets: [
    'Manufacturer: in-house production and slitting in Mumbai since 1974',
    'Stockist: common thicknesses and widths for quick despatch',
    'Wholesaler and distributor: 5 kg MOQ for small battery makers and traders',
    'Custom: made to your drawing, with tooling for new pack designs',
  ],
} as const;

export const applications = [
  'Lithium-ion Batteries',
  'EV Battery Packs',
  'Power Tools',
  'Energy Storage Systems',
] as const;

export const industries = [
  'Electric Vehicles (EV)',
  'Consumer Electronics',
  'Renewable Energy',
  'Industrial Battery Manufacturers',
] as const;

export const whyChooseUs = [
  { title: `${YEARS_IN_BUSINESS} Years Manufacturing Experience`, detail: 'Legacy of metallurgical excellence and precision engineering.' },
  { title: 'Consistent Quality & Precision', detail: 'Strict ISO processes and multi-stage QA for every batch.' },
  { title: 'Bulk Supply Capability', detail: 'Scalable production with ready export documentation.' },
  { title: 'Custom Manufacturing Options', detail: 'Widths, thickness, and surface finishes tailored to spec.' },
  { title: 'Fast Delivery & Global Shipping', detail: 'Reliable lead times with worldwide logistics coverage.' },
] as const;

export const qualityPoints = [
  'ISO 9001 compliant manufacturing & traceability',
  'High purity nickel with certified material reports',
  'Automated slitting, edge conditioning, and surface inspection',
  'Batch-wise conductivity and tensile testing',
] as const;

export const productSpecifications = [
  { label: 'Nickel Purity', value: '99.6%' },
  { label: 'Thickness Range', value: '0.10mm – 0.50mm' },
  { label: 'Width Range', value: '2mm – 50mm' },
  { label: 'Surface Finish', value: 'Bright, matte, nickel-plated' },
  { label: 'Typical Use', value: 'Battery tabs, busbars, welding strips' },
] as const;

export const productVariants = [
  {
    title: 'Pure Nickel Strips',
    spec: '99.6% purity | 0.10mm - 0.50mm',
    note: 'High conductivity for battery tabs and precision welding.',
    cta: '/products?search=pure+nickel+strip',
  },
  {
    title: 'Nickel Plated Strips',
    spec: 'Low resistance | 0.15mm x 8mm',
    note: 'Cost-effective performance for high-volume manufacturing.',
    cta: '/products?search=nickel+plated+strip',
  },
  {
    title: 'Custom Sizes & Coils',
    spec: 'Width 2mm - 50mm | Custom slitting',
    note: 'Built to your cell design, welding process, and load specs.',
    cta: '/products?search=custom+nickel+strip',
  },
] as const;

export const faqItems = [
  {
    question: 'What is nickel strip used for?',
    answer:
      'Nickel strip is used as a battery tab and connector in lithium-ion cells, EV packs, power tools, and energy storage systems because of its conductivity and weldability.',
  },
  {
    question: 'How do I choose the right nickel strip thickness?',
    answer:
      'Choose thickness based on current rating, welding method, and cell design. Thin strips suit compact packs; thicker strip supports higher current and durability.',
  },
  {
    question: 'Can you supply custom nickel strips for EV battery assembly?',
    answer:
      'Yes, we offer custom slitting, width, and surface preparation for nickel strips used in EV battery modules and high-performance battery systems.',
  },
] as const;
