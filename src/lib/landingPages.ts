import { POSTAL_ADDRESS, PRIMARY_CALL } from './contact.js';
import { YEARS_IN_BUSINESS } from './heritage.js';
import { CELL_FORMATS, STANDARD_THICKNESSES_MM, WIDTH_RANGE_MM } from './stripSizes.js';
// The company's stated export terms, already published on /export-enquiry and on product
// pages. Naming the actual Incoterms beats 'an agreed Incoterm': a buyer who works to CIF can
// see it applies before writing to ask.
import { HS_CODES, INCOTERMS, PRODUCT_EXPORT_TERMS } from './exportEnquiry.js';
import { DELIVERY_TIME, MINIMUM_ORDER_QUANTITY } from './productSpecs.js';

/**
 * Indexable landing pages that sit between the homepage and the individual SKU pages.
 *
 * Why these exist: searching "H type nickel strip manufacturer in India" returned this site's
 * homepage rather than anything about H type strip. That is the correct result for the site as
 * it was built — every H type product is a per-cell-format SKU ("Ni 18650 2P H-Type Nickel
 * Strip (ASTM B16)"), none of which answers a category-level "manufacturer in India" query,
 * and the only URL carrying both "H type nickel strip" and "manufacturer India" was the
 * homepage. /products?search=h+type is not an alternative: ProductListingPage canonicalises
 * every search URL to /products, which explicitly tells Google not to index it separately.
 *
 * Each page below is a real destination with its own copy, its own product list and its own
 * canonical URL, so there is something specific for a category query to land on.
 *
 * On the state pages: these are deliberately limited to states where India's battery, EV and
 * electronics manufacturing actually concentrates, and each carries content that is only true
 * of that state — its clusters, its cities, its dispatch route. Generating one page per state
 * from a single template with the name swapped is a doorway-page pattern that Google demotes
 * (and can penalise) rather than ranks. If a state is added here, it needs its own facts.
 *
 * Plain data, no React: seoSnapshot.ts imports this from inside a Node serverless function.
 */

export type LandingSection = {
  heading: string;
  body?: string;
  bullets?: readonly string[];
};

export type LandingPage = {
  /** URL path, without a leading slash. */
  slug: string;
  /** 50-60 characters, the range search engines render without truncating. */
  title: string;
  /** 120-160 characters. */
  description: string;
  h1: string;
  /** Opening paragraph. Carries the target phrase in visible copy, not just in meta tags. */
  intro: string;
  keywords: readonly string[];
  sections: readonly LandingSection[];
  faqs: readonly { question: string; answer: string }[];
  /**
   * Passed to /api/products?search= to build the page's product grid, and used by the SSR
   * snapshot to list the same products for crawlers. Omitted means no product grid.
   */
  productSearch?: string;
  /** Label used in the breadcrumb trail and in schema.org BreadcrumbList. */
  breadcrumbName: string;
};

const SPEC_BULLETS = [
  'Nickel purity 99.8%, with material test certificates on request',
  `Thickness ${STANDARD_THICKNESSES_MM.join(', ')} mm standard, other thicknesses to order`,
  `Width ${WIDTH_RANGE_MM.min}–${WIDTH_RANGE_MM.max} mm, cut to your drawing`,
  `For ${CELL_FORMATS.filter((cell) => /^\d/.test(cell)).join(', ')} cells and custom pack layouts`,
  'Pure nickel and nickel-plated steel, in strip, coil and busbar form',
  'Custom slitting, pitch and hole patterns to your cell layout',
] as const;

const H_TYPE_PAGE: LandingPage = {
  slug: 'h-type-nickel-strip',
  title: 'H Type Nickel Strip Manufacturer in India | Supplier',
  description:
    'H type nickel strip manufacturer in India. Pure nickel H type strip for 18650, 21700, 32650 and 32700 packs, in 2P, 3P and 4P layouts. Bulk and export supply.',
  h1: 'H Type Nickel Strip Manufacturer in India',
  intro:
    'Ramani Steel House is an H type nickel strip manufacturer in India, producing pure nickel H type strip for lithium-ion battery packs from its Mumbai works since 1974. H type strip is supplied for 18650, 21700, 32650 and 32700 cells in 2P, 3P and 4P layouts, in plain, fuse-type and honeycomb patterns, with PAN India despatch and export to 17+ countries.',
  keywords: [
    'H Type Nickel Strip Manufacturer in India',
    'H Type Nickel Strip',
    'H Type Nickel Strip Supplier',
    'H Type Nickel Strip Price',
    'H Type Nickel Strip for 18650 Battery',
    '21700 H Type Nickel Strip',
    'Pure Nickel H Type Strip',
    'H Type Busbar Nickel Strip',
  ],
  sections: [
    {
      heading: 'What is an H type nickel strip?',
      body:
        'An H type nickel strip is a pre-formed battery interconnect whose repeating cut-out resembles the letter H, leaving a narrow neck of nickel between each pair of cell contacts. The neck concentrates heat at the weld so the spot weld forms cleanly without drawing heat into neighbouring cells, and on fuse-type variants that same neck acts as a deliberate weak point that opens if a cell draws fault current. Because the pattern is cut to the cell pitch, the strip drops onto the pack without hand alignment, which is why H type strip is the standard interconnect for volume 18650 and 21700 assembly.',
    },
    {
      heading: 'H type nickel strip specifications',
      bullets: SPEC_BULLETS,
    },
    {
      heading: 'Cell formats and layouts supplied',
      bullets: [
        '18650 in 2P, 3P and 4P — plain, fuse-type and honeycomb patterns',
        '21700 in 2P and 4P, including double-fuse',
        '32650 and 32700 in 2P, zig-zag and honeycomb',
        'Custom pitch, neck width and hole pattern against your pack drawing',
      ],
    },
    {
      heading: 'Why buyers source H type nickel strip from Ramani Steel House',
      bullets: [
        `${YEARS_IN_BUSINESS} years of metallurgical manufacturing, ISO 9001 compliant processes`,
        'Pure nickel rather than nickel-plated steel where conductivity is critical',
        'Batch-wise conductivity and tensile testing, with traceable certificates',
        'Bulk capacity with export documentation prepared in-house',
      ],
    },
  ],
  faqs: [
    {
      question: 'What is H type nickel strip used for?',
      answer:
        'H type nickel strip connects cells in parallel and series inside lithium-ion battery packs. The H-shaped cut-out concentrates heat at the weld point, giving a clean spot weld without heating the adjacent cell, which is why it is used for 18650 and 21700 pack assembly in EVs, power tools and energy storage.',
    },
    {
      question: 'What is the difference between H type and fuse type nickel strip?',
      answer:
        'Both share the H-shaped pattern. On a fuse-type strip the neck between the cell contacts is deliberately narrowed so it melts and opens the circuit if a single cell draws fault current, isolating that cell from the pack. A plain H type strip carries full current with no intended fusing point.',
    },
    {
      question: 'Do you supply H type nickel strip in bulk and for export?',
      answer:
        'Yes. H type nickel strip is supplied in bulk across India and exported to 17+ countries, with material test certificates, HS code classification and export documentation prepared in-house. Send your cell format, layout and quantity for a quotation.',
    },
    {
      question: 'What thicknesses does H type nickel strip come in?',
      answer: `H type nickel strip is made in ${STANDARD_THICKNESSES_MM.join(', ')} mm as standard, and in other thicknesses to order. 0.15 mm suits most 18650 packs; heavier packs move to 0.20 mm or thicker. The minimum order is 5 kg, and a size not listed on a product page can still be ordered — enter it on the product page or send your drawing.`,
    },
    {
      question: 'Can you make H type nickel strip to a custom pitch?',
      answer:
        'Yes. Pitch, neck width, strip width, thickness and hole pattern are all cut to your pack drawing or cell layout. Send the drawing and we quote against your exact geometry rather than a nearest standard size.',
    },
  ],
  productSearch: 'h type',
  breadcrumbName: 'H Type Nickel Strip',
};

/**
 * The state pages. `clusters`, `cities` and `note` are what make each page distinct — they are
 * the reason the page deserves to exist as its own URL rather than as a template fill.
 */
type StateFacts = {
  slug: string;
  /** "Tamil Nadu" */
  name: string;
  cities: readonly string[];
  /** What is actually manufactured there that consumes nickel strip. */
  clusters: string;
  /** Anything true only of supply into this state. */
  note: string;
};

const STATE_FACTS: readonly StateFacts[] = [
  {
    slug: 'tamil-nadu',
    name: 'Tamil Nadu',
    cities: ['Chennai', 'Hosur', 'Coimbatore', 'Krishnagiri', 'Sriperumbudur'],
    clusters:
      'Tamil Nadu carries the largest concentration of electric two- and three-wheeler assembly in India, running from the Hosur belt on the Karnataka border through Krishnagiri, with vehicle and component plants clustered around Sriperumbudur and Oragadam outside Chennai and a motor and pump manufacturing base at Coimbatore.',
    note:
      'Consignments move by road on the Mumbai–Bengaluru–Hosur corridor, and export lots for southern customers can be routed through Chennai port instead of Nhava Sheva where that suits the buyer.',
  },
  {
    slug: 'karnataka',
    name: 'Karnataka',
    cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Kolar', 'Tumakuru'],
    clusters:
      'Karnataka holds much of the country’s battery pack engineering and electronics design base, concentrated in Bengaluru and the Kolar and Narasapura industrial belts, where EV powertrain firms, energy storage integrators and contract electronics manufacturers build packs in prototype and pilot volumes as well as at scale.',
    note:
      'Bengaluru’s pack builders order small, frequent lots against fast-changing cell layouts, so custom slitting and short-run H type patterns are quoted as readily as bulk coil.',
  },
  {
    slug: 'maharashtra',
    name: 'Maharashtra',
    cities: ['Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Chakan'],
    clusters:
      'Maharashtra’s automotive and engineering base runs from the Chakan and Talegaon belts outside Pune through Nashik and Aurangabad, covering vehicle assembly, auto components, power tools and industrial equipment, alongside a dense trading and fabrication market in Mumbai itself.',
    note:
      'This is our home state — the works and office are in Mumbai, so Maharashtra orders ship from the same city and small or urgent quantities can be collected directly.',
  },
  {
    slug: 'gujarat',
    name: 'Gujarat',
    cities: ['Ahmedabad', 'Sanand', 'Vadodara', 'Surat', 'Rajkot'],
    clusters:
      'Gujarat combines vehicle assembly at Sanand and Halol with a large chemicals, electricals and engineering base around Vadodara, Ahmedabad and Rajkot, and hosts several of the country’s announced cell and energy storage manufacturing investments.',
    note:
      'Road transit from Mumbai into Gujarat is short, and export consignments for Gujarat buyers can be handed over at Mundra or Kandla as easily as at Nhava Sheva.',
  },
  {
    slug: 'haryana',
    name: 'Haryana',
    cities: ['Gurugram', 'Manesar', 'Faridabad', 'Bawal', 'Rewari'],
    clusters:
      'The Gurugram–Manesar–Bawal corridor is one of India’s densest automotive component clusters, supplying vehicle assembly across the National Capital Region, with a matching base of power tool, appliance and electrical manufacturers at Faridabad.',
    note:
      'Haryana buyers are typically tier-1 and tier-2 component makers working to a released drawing, so material test certificates and dimensional traceability are supplied with every batch as standard.',
  },
  {
    slug: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    cities: ['Noida', 'Greater Noida', 'Ghaziabad', 'Lucknow', 'Kanpur'],
    clusters:
      'Noida and Greater Noida host the largest mobile handset, consumer electronics and appliance manufacturing base in the country, along with a growing set of battery pack assemblers serving electric two- and three-wheeler makers across the state.',
    note:
      'Electronics assembly in this belt runs to tight incoming-quality gates, so strip is despatched with batch conductivity and tensile results rather than a certificate of conformity alone.',
  },
  {
    slug: 'telangana',
    name: 'Telangana',
    cities: ['Hyderabad', 'Medak', 'Sangareddy', 'Zaheerabad'],
    clusters:
      'Telangana’s manufacturing base around Hyderabad spans electronics, aerospace, pharmaceutical equipment and electrical machinery, with battery pack and energy storage assembly growing alongside the state’s electronics manufacturing clusters.',
    note:
      'Hyderabad consignments move on the same southern road corridor as Karnataka and can be consolidated with Bengaluru despatches where a buyer runs plants in both.',
  },
  {
    slug: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    cities: ['Sri City', 'Tirupati', 'Visakhapatnam', 'Anantapur'],
    clusters:
      'Sri City and the Tirupati electronics cluster host large-scale contract electronics and appliance manufacturing, while Visakhapatnam and Anantapur carry heavier engineering and automotive investment, both of which draw on battery pack assembly.',
    note:
      'Sri City’s tenants work to import-substitution schedules with fixed delivery windows, so despatch dates are committed at order confirmation rather than at production.',
  },
  {
    slug: 'rajasthan',
    name: 'Rajasthan',
    cities: ['Jaipur', 'Neemrana', 'Bhiwadi', 'Alwar', 'Jodhpur'],
    clusters:
      'The Neemrana, Bhiwadi and Alwar belt along the Delhi–Jaipur corridor carries automotive components, electricals and light engineering, including several Japanese-invested plants, with a separate engineering and metals base around Jodhpur and Jaipur.',
    note:
      'Rajasthan deliveries run on the Mumbai–Delhi highway corridor and are frequently consolidated with Haryana and NCR consignments on the same vehicle.',
  },
  {
    slug: 'west-bengal',
    name: 'West Bengal',
    cities: ['Kolkata', 'Howrah', 'Durgapur', 'Haldia', 'Kharagpur'],
    clusters:
      'West Bengal’s engineering and metals base is concentrated in Howrah, Durgapur and Haldia, with battery, inverter and electrical equipment manufacturing serving eastern India from the Kolkata industrial belt.',
    note:
      'Eastern India orders are quoted with the longest road transit of any mainland despatch, so buyers on repeat schedules usually take larger consolidated lots at a lower frequency.',
  },
];

/**
 * The state pages, consolidated into three regional pages.
 *
 * There used to be ten, one per state, generated from STATE_FACTS. About a hundred words on each
 * were specific to the state (the cluster paragraph and the shipping note) and the other three
 * hundred were identical, which is the near-duplicate location-page pattern Google demotes, and
 * a weak cluster of pages can weigh on the site around it. A buyer in Hosur and a buyer in Pune
 * get the same material, the same minimum order and the same certificates, so ten pages said one
 * thing ten times.
 *
 * Each regional page now carries the state-specific text of every state in it, which puts the
 * unique content in one place and makes the page long enough to deserve its URL. Nothing was
 * added to that text: the cluster paragraphs and shipping notes are the ones the state pages had.
 * The ten old URLs redirect (301) to the region that covers them, see STATE_PAGE_REDIRECTS.
 * Mumbai keeps its own hand-written page, below.
 */
type Region = {
  slug: string;
  /** "South India", for headings and the breadcrumb. */
  name: string;
  /** Same, with "&" where the title has no room for "and". */
  titleName: string;
  stateSlugs: readonly string[];
};

const REGIONS: readonly Region[] = [
  { slug: 'south-india', name: 'South India', titleName: 'South India', stateSlugs: ['tamil-nadu', 'karnataka', 'telangana', 'andhra-pradesh'] },
  { slug: 'north-and-east-india', name: 'North and East India', titleName: 'North & East India', stateSlugs: ['haryana', 'uttar-pradesh', 'rajasthan', 'west-bengal'] },
  { slug: 'west-india', name: 'West India', titleName: 'West India', stateSlugs: ['maharashtra', 'gujarat'] },
];

const STATE_BY_SLUG = new Map(STATE_FACTS.map((state) => [state.slug, state]));

const joinNames = (names: readonly string[]): string =>
  names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

const regionStates = (region: Region): StateFacts[] =>
  region.stateSlugs.map((slug) => {
    const state = STATE_BY_SLUG.get(slug);
    if (!state) throw new Error(`Region ${region.slug} names a state with no facts: ${slug}`);
    return state;
  });

const DESCRIPTION_MAX = 160;

const regionDescription = (region: Region): string => {
  const names = joinNames(regionStates(region).map((state) => state.name));
  const full = `Nickel strip manufacturer supplying ${region.name}: ${names}. Pure nickel strip, H type strip and busbar, despatched from Mumbai.`;
  return full.length <= DESCRIPTION_MAX
    ? full
    : `Nickel strip manufacturer supplying ${region.name}: pure nickel strip, H type strip and busbar for battery packs, despatched from our Mumbai works.`;
};

/** Manufacturer and supplier, inside 60 characters; the trailing detail only where it still fits. */
const regionTitle = (region: Region): string => {
  const base = `Nickel Strip Manufacturer & Supplier in ${region.titleName}`;
  const tail = [' | 5 kg MOQ', ' | Ramani Steel'].find((candidate) => (base + candidate).length <= 60);
  return tail ? base + tail : base;
};

const regionLandingPage = (region: Region): LandingPage => {
  const states = regionStates(region);
  const stateNames = states.map((state) => state.name);
  const cities = states.flatMap((state) => state.cities);

  return {
    slug: `nickel-strip-manufacturer-in-${region.slug}`,
    title: regionTitle(region),
    description: regionDescription(region),
    h1: `Nickel Strip Manufacturer Supplying ${region.name}`,
    intro: `Ramani Steel House supplies nickel strip to battery pack makers, electronics manufacturers and engineering firms across ${region.name}: ${joinNames(stateNames)}. Everything is despatched from its Mumbai works, and pure nickel strip, H type nickel strip and nickel busbar are cut to the cell format and pack layout you build to. The minimum order is ${MINIMUM_ORDER_QUANTITY} and despatch takes ${DELIVERY_TIME}, the same in every state below.`,
    keywords: [
      `Nickel Strip Manufacturer in ${region.name}`,
      `Nickel Strip Supplier in ${region.name}`,
      ...states.flatMap((state) => [
        `Nickel Strip Manufacturer in ${state.name}`,
        `Nickel Strip Supplier in ${state.name}`,
        `H Type Nickel Strip ${state.name}`,
      ]),
      ...cities.map((city) => `Nickel Strip Supplier in ${city}`),
    ],
    sections: [
      ...states.map((state) => ({
        heading: `Supplying ${state.name}`,
        body: `${state.clusters} ${state.note} Despatches go to ${joinNames(state.cities)}.`,
      })),
      {
        heading: 'What is supplied',
        bullets: SPEC_BULLETS,
      },
      {
        heading: `Ordering from ${region.name}`,
        body: `A buyer in ${cities[0]} and a buyer in ${cities[cities.length - 1]} order the same way: send the cell format, thickness, width and quantity, with a drawing for anything that is not a listed size, and the quotation is made against it. The minimum order is ${MINIMUM_ORDER_QUANTITY}. Trial lots for a new pack design are quoted as readily as repeat schedules, and a material test certificate is issued on request with each batch.`,
      },
    ],
    faqs: [
      ...states.map((state) => ({
        question: `Do you supply nickel strip in ${state.name}?`,
        answer: `Yes. Nickel strip, H type nickel strip and nickel busbar are despatched from our Mumbai works to customers across ${state.name}, including ${state.cities.slice(0, 3).join(', ')}. ${state.note}`,
      })),
      {
        question: `What is the minimum order for ${region.name} deliveries?`,
        answer: `The minimum order is ${MINIMUM_ORDER_QUANTITY}, the same in every state. Thickness, width and whether the pattern is standard or cut to your drawing affect the quotation, so send the specification and it is confirmed against it.`,
      },
      {
        question: 'Are material test certificates provided?',
        answer:
          'Yes, on request. A material test certificate with batch-wise conductivity and tensile results is issued when you ask for one, and the batch remains traceable after delivery.',
      },
    ],
    productSearch: 'nickel strip',
    breadcrumbName: `Nickel Strip in ${region.name}`,
  };
};

/**
 * Mumbai, written by hand rather than generated from STATE_FACTS.
 *
 * Search Console shows 23 impressions and zero clicks across "nickel strips exporters in
 * mumbai" (14), "nickel strips suppliers in mumbai" (6) and "nickel strips stockists in
 * mumbai" (3). Those queries had nothing to land on: the state set covers Maharashtra, and a
 * state page answers "which state do you ship to", not "who sells this in my city".
 *
 * It is deliberately not a stateLandingPage() with the name swapped, because that would make it
 * a near-duplicate of the Maharashtra page — the doorway pattern this module warns about at the
 * top. Everything below is true of Mumbai and of nowhere else on the site: the works address on
 * C.P. Tank Road, the metals market it sits in, collection in person, and Nhava Sheva as the
 * loading port. Maharashtra keeps the state-level clusters (Pune, Chakan, Nashik, Aurangabad).
 */
const MUMBAI_PAGE: LandingPage = {
  slug: 'nickel-strip-manufacturer-in-mumbai',
  title: 'Nickel Strip Manufacturer in Mumbai | Supplier & Exporter',
  description:
    'Nickel strip manufacturer, supplier and exporter in Mumbai since 1974. Pure nickel strip, H type strip and busbar from our C.P. Tank Road works.',
  h1: 'Nickel Strip Manufacturer, Supplier & Exporter in Mumbai',
  intro: `Ramani Steel House is a nickel strip manufacturer, supplier and exporter in Mumbai, working from ${POSTAL_ADDRESS.streetAddress} since 1974. Pure nickel strip, H type nickel strip and nickel busbar are slit and despatched from the same premises, so Mumbai buyers can collect in person rather than wait on a courier, and export consignments load through Nhava Sheva.`,
  keywords: [
    'Nickel Strip Manufacturer in Mumbai',
    'Nickel Strips Suppliers in Mumbai',
    'Nickel Strips Exporters in Mumbai',
    'Nickel Strips Stockists in Mumbai',
    'Nickel Busbar Manufacturer Mumbai',
    'H Type Nickel Strip Mumbai',
    'Pure Nickel Strip Supplier Mumbai',
  ],
  sections: [
    {
      heading: 'Nickel strip suppliers in Mumbai',
      body: `The works and office are at ${POSTAL_ADDRESS.oneLine}, in the C.P. Tank metals market that has supplied Mumbai's fabricators and traders for decades. Buying from a manufacturer in the same city removes the freight leg and the lead time that comes with it: stock widths can be collected the same day, and custom slitting is quoted against your drawing rather than against a catalogue.`,
    },
    {
      heading: 'Nickel strip exporters in Mumbai',
      body: 'Export consignments are packed at the Mumbai works and loaded through Nhava Sheva (JNPT), the port that handles most of western India\'s container traffic. Commercial invoice, packing list, certificate of origin and material test certificates are prepared with the shipment, and nickel strip and busbar have shipped to buyers in 17+ countries.',
    },
    {
      heading: 'Nickel strip stockists in Mumbai',
      body: 'Common thicknesses and widths in pure nickel are held as coil and slit to order, so an ordinary 0.15mm or 0.20mm requirement does not wait on a mill run. Non-standard widths, pitches and hole patterns are cut to your cell layout, and a sample strip can be provided before a bulk lot is committed.',
    },
    {
      heading: 'What is supplied',
      bullets: SPEC_BULLETS,
    },
  ],
  faqs: [
    {
      question: 'Who supplies nickel strips in Mumbai?',
      answer: `Ramani Steel House manufactures and supplies nickel strip in Mumbai from ${POSTAL_ADDRESS.streetAddress}, and has done since 1974. Pure nickel strip, H type nickel strip, fuse-type and zig-zag patterns and nickel busbar are all made in-house rather than bought in.`,
    },
    {
      question: 'Do you export nickel strips from Mumbai?',
      answer:
        'Yes. Export lots are packed at the Mumbai works and shipped through Nhava Sheva with full documentation, including certificate of origin and material test certificates. Send your specification, quantity and destination port for a quotation.',
    },
    {
      question: 'Can I collect nickel strip from your Mumbai office?',
      answer: `Yes. The works and office are at ${POSTAL_ADDRESS.oneLine}. Call ahead on ${PRIMARY_CALL.display} so the material is cut and ready when you arrive.`,
    },
    {
      question: 'What nickel strip sizes are stocked in Mumbai?',
      answer:
        'Thickness runs 0.10mm to 0.50mm and width 2mm to 50mm, in pure nickel and nickel-plated steel. Common sizes are held as coil and slit to order; anything outside that is cut to your drawing.',
    },
  ],
  productSearch: 'nickel strip',
  breadcrumbName: 'Nickel Strip in Mumbai',
};

/**
 * The trade-buyer page: stockist, wholesaler, distributor, trader.
 *
 * Manufacturing is the company's primary business, and every other page leads with it. But a
 * large share of nickel strip buyers are not volume cell or EV makers: they are small battery
 * manufacturers, pack assemblers and traders buying 5 to 50 kg at a time, and they search by
 * the role they expect to buy from ("nickel strip wholesaler", "stockist", "distributor",
 * "dealer"). A result that says only "manufacturer" reads to them as "minimum order: a tonne",
 * and they scroll past it to a marketplace listing that stacks the trade roles in its title.
 *
 * This page answers that buyer directly, with the facts that matter to them and are true only
 * here: the 5 kg MOQ, what is held in stock, and that the same manufacturer's material and
 * certificates apply to a small lot. It is a different intent from the homepage, not a copy of
 * it with the nouns swapped.
 */
const TRADE_BUYER_PAGE: LandingPage = {
  slug: 'nickel-strip-wholesaler-and-distributor',
  title: 'Nickel Strip Wholesaler & Distributor India | 5 kg MOQ',
  description:
    'Nickel strip and busbar wholesaler, stockist and distributor backed by our own Mumbai manufacturing. 99.8% pure nickel from 5 kg, PAN India and export.',
  h1: 'Nickel Strip & Busbar Wholesaler, Stockist and Distributor',
  intro:
    'Ramani Steel House is a nickel strip and nickel busbar manufacturer in Mumbai that also sells as a wholesaler, stockist and distributor, in India and to export buyers. Manufacturing is the core of the business, and because the material is made and slit in-house, the same 99.8% pure nickel is available in small lots: orders start at 5 kg, which suits small battery manufacturers, pack assemblers, traders and overseas distributors as well as volume buyers.',
  keywords: [
    'Nickel Strip Wholesaler',
    'Nickel Strip Distributor',
    'Nickel Strip Stockist',
    'Nickel Strip Trader',
    'Nickel Strip Dealer',
    'Nickel Strip Wholesale Price',
    'Nickel Strip 5 kg MOQ',
    'Nickel Strip for Small Battery Manufacturers',
    'Battery Nickel Strip Wholesale Supplier India',
    'Nickel Busbar Supplier',
    'Nickel Busbar Distributor',
    'Nickel Strip Exporter',
    'Nickel Strip Export Supplier India',
  ],
  sections: [
    {
      heading: 'Why buy from a manufacturer that also wholesales',
      body:
        'A trader or distributor usually buys from a mill and resells, so the buyer is two steps from the material and the certificate. Buying from the manufacturer removes that step. The strip comes from the same production and slitting lines that supply volume orders, a material test certificate is available on request, and a question about thickness tolerance or weldability goes to the people who made the strip.',
    },
    {
      heading: 'Small lots for small battery manufacturers',
      body:
        'The minimum order is 5 kg. That is enough strip for a pack builder assembling a few hundred cells, a workshop building e-bike or power-tool packs, or a trader stocking a few common sizes, without committing to a mill-sized order. Pricing is quoted per kilogram.',
    },
    {
      heading: 'What is held in stock',
      body:
        'Common thicknesses in pure nickel, chiefly 0.15 mm and 0.20 mm, are held as coil and slit to the width you need, so an ordinary requirement does not wait on a mill run. Stock of a particular width is confirmed at quotation. Despatch is typically within 7 days, PAN India.',
    },
    {
      heading: 'Nickel busbar and copper busbar for distributors',
      body:
        'Busbar is stocked and supplied on the same terms as strip. Nickel busbar carries more current than strip at the same width, which is what pack builders move to when a 2P or 3P interconnect starts running warm, and copper busbar is supplied where conductivity matters more than corrosion resistance. Both are cut to the length and hole pattern of the pack they go into, so a distributor holding a few common sizes can quote against a drawing rather than only from a stock list.',
    },
    {
      heading: 'New designs made to your drawing',
      body:
        'The listed sizes are only the most requested ones. If your pack needs a different thickness, width, pitch or hole pattern, it is made to your drawing, and tooling is developed for unique battery pack layouts. Send the drawing or cell arrangement with the enquiry and the quotation is made against it.',
    },
    {
      heading: 'Supplying distributors and buyers outside India',
      body:
        'The same material is exported, and has gone to 17+ countries. Export consignments are packed at the Mumbai works in moisture-protected, export-grade packing for sea freight and loaded through Nhava Sheva (JNPT), with Chennai available instead where that suits a buyer in the south. Documentation includes the certificate of origin, the material test certificate and HS code classification. Export orders are quoted in USD against an agreed Incoterm, separately from the rupee price list, and freight is quoted with the order once weight and destination are known.',
    },
    {
      heading: 'At a glance',
      bullets: [
        'Manufacturer first, also stockist, wholesaler and distributor',
        'Minimum order 5 kg, despatch in about 7 days',
        'Nickel strip, nickel busbar and copper busbar on the same terms',
        'Supplied PAN India and exported to 17+ countries',
        ...SPEC_BULLETS,
      ],
    },
  ],
  faqs: [
    {
      question: 'What is the minimum order for nickel strip?',
      answer:
        '5 kg. The same material, certificates and slitting apply at 5 kg as at bulk quantities.',
    },
    {
      question: 'Are you a nickel strip manufacturer or a distributor?',
      answer:
        'Both. Manufacturing in Mumbai is the primary business, and the company also sells as a stockist, wholesaler, trader and distributor, so small buyers get manufacturer-direct material without a mill-sized order.',
    },
    {
      question: 'Can traders and distributors buy nickel strip from you for resale?',
      answer:
        'Yes. Traders and distributors buy by the kilogram in the common thicknesses and widths. Send the sizes and quantities you stock and a price is quoted per kilogram.',
    },
    {
      question: 'Do you make nickel strip in sizes that are not listed?',
      answer:
        'Yes. Thickness, width, pitch and hole pattern are made to your drawing, and tooling is developed for new battery pack designs. The minimum order still applies.',
    },
    {
      question: 'Do you export nickel strip and busbar?',
      answer:
        'Yes, to 17+ countries. Consignments are packed at the Mumbai works in export-grade packing for sea freight and loaded through Nhava Sheva (JNPT), or Chennai where that suits the buyer. The certificate of origin, material test certificate and HS code classification are supplied with the shipment.',
    },
    {
      question: 'How are export orders priced?',
      answer:
        'In USD against an agreed Incoterm, quoted separately from the rupee price list. Freight is quoted with the order rather than listed, because it depends on weight and destination.',
    },
    {
      question: 'Do you supply nickel busbar as well as strip?',
      answer:
        'Yes. Nickel busbar and copper busbar are supplied on the same terms as strip, cut to the length and hole pattern of your pack, from the same 5 kg minimum.',
    },
  ],
  productSearch: 'nickel strip',
  breadcrumbName: 'Wholesale & Distribution',
};

/**
 * Size pages: one URL per commercially stocked thickness × width.
 *
 * A buyer sourcing nickel strip searches the dimension, not the pattern — "0.15mm x 10mm nickel
 * strip" is a real query and the catalogue had no URL carrying that string. The SKU pages are
 * named for cell format and pattern ("Ni 18650 2P H-Type"), which answers a different question,
 * and /products canonicalises every search URL away, so there was nothing for a dimension query
 * to land on.
 *
 * Only sizes confirmed by the company appear here. Adding a page for a size that is not actually
 * stocked would rank for a query the enquiry cannot be fulfilled from, which costs more than the
 * traffic is worth.
 */
type StripSize = {
  slug: string;
  thickness: string;
  width: string;
  /** The same two numbers as thickness and width, for the arithmetic on the page. */
  thicknessMm: number;
  widthMm: number;
  title: string;
  description: string;
  /** What this gauge is actually for — the reason a buyer picks it over the other. */
  suitedTo: string;
  cellFormats: string;
};

const STRIP_SIZES: readonly StripSize[] = [
  {
    slug: 'pure-nickel-strip-0-15mm-x-10mm',
    thickness: '0.15 mm',
    width: '10 mm',
    thicknessMm: 0.15,
    widthMm: 10,
    title: 'Pure Nickel Strip 0.15mm x 10mm | Manufacturer & Supplier',
    description:
      'Pure nickel strip 0.15mm thick x 10mm wide, 99.8% nickel, UNS N02201. Made in Mumbai for 18650 and 21700 battery pack welding. 5 kg MOQ, 7 day delivery.',
    suitedTo:
      'This is the most widely used gauge for 18650 pack assembly. It spot welds cleanly on a mid-range resistance welder without the electrode force a thicker strip needs, which is why it is the size most builders standardise on for 2P and 3P layouts.',
    cellFormats: '18650, 21700',
  },
  {
    slug: 'pure-nickel-strip-0-20mm-x-15mm',
    thickness: '0.20 mm',
    width: '15 mm',
    thicknessMm: 0.20,
    widthMm: 15,
    title: 'Pure Nickel Strip 0.20mm x 15mm | Manufacturer & Supplier',
    description:
      'Pure nickel strip 0.20mm x 15mm wide, 99.8% nickel, UNS N02201. Higher current capacity for 21700 and 32700 packs. 5 kg MOQ, 7 day delivery from Mumbai.',
    suitedTo:
      'This gauge is suited to packs that draw more current per cell than 0.15 mm comfortably carries. The larger cross-section — thicker and wider — lowers resistance through the interconnect, at the cost of needing more weld energy than a 0.15 mm strip.',
    cellFormats: '21700, 32650, 32700',
  },
];

const stripSizePage = (size: StripSize): LandingPage => ({
  slug: size.slug,
  title: size.title,
  description: size.description,
  h1: `Pure Nickel Strip ${size.thickness} × ${size.width}`,
  intro: `Pure nickel strip in ${size.thickness} thickness and ${size.width} width, manufactured by Ramani Steel House in Mumbai since 1974. Supplied at 99.8% nickel to UNS N02201, slit to width from coil, for battery pack builders working with ${size.cellFormats} cells. Minimum order 5 kg, despatched in 7 days PAN India and exported to 17+ countries.`,
  keywords: [
    `Pure Nickel Strip ${size.thickness} x ${size.width}`,
    `Nickel Strip ${size.thickness}`,
    `${size.width} Nickel Strip`,
    `Nickel Strip ${size.thickness} x ${size.width} Price`,
    'Pure Nickel Strip Manufacturer India',
    'Battery Nickel Strip Supplier',
  ],
  sections: [
    {
      heading: `Specification — ${size.thickness} × ${size.width}`,
      bullets: [
        `Thickness ${size.thickness}, width ${size.width}`,
        'Purity 99.8% pure nickel',
        'Grade Nickel 201, UNS N02201 (DIN 2.4068)',
        `Suited to ${size.cellFormats} cell formats`,
        'Supplied as strip or coil, slit to width',
        'Minimum order 5 kg · despatch in 7 days',
        'Material test certificate on request',
      ],
    },
    {
      heading: 'What this size is used for',
      body: size.suitedTo,
    },
    ...sizeNumbersSections(size),
    {
      heading: 'Ordering this size',
      body: `${size.thickness} × ${size.width} is a stocked size, so it ships from coil rather than being rolled to order. If your pack needs a different width, the same 99.8% material is slit to any width from 2 mm to 50 mm against your drawing — send the pitch and cell layout and it is cut to that instead.`,
    },
  ],
  faqs: [
    {
      question: `What is pure nickel strip ${size.thickness} × ${size.width} used for?`,
      answer: `It is used as a cell interconnect and battery tab in lithium-ion packs built from ${size.cellFormats} cells, spot welded onto the cell terminals to join cells in parallel and series.`,
    },
    {
      question: `Is ${size.thickness} × ${size.width} nickel strip pure nickel or nickel-plated steel?`,
      answer:
        'Pure nickel, at 99.8%, to UNS N02201. Nickel-plated steel is supplied separately and is a different material — it is cheaper but has substantially higher resistance, so it is not interchangeable where conductivity matters.',
    },
    {
      question: `What is the minimum order for ${size.thickness} × ${size.width} strip?`,
      answer:
        '5 kg. Both trial quantities for qualifying a new pack design and repeat bulk schedules are quoted from the same stock.',
    },
    sizeNumbersFaq(size),
    {
      question: 'Can this size be supplied as a coil rather than cut strip?',
      answer:
        'Yes. The same material is supplied as coil or as cut lengths. Say which you need with the enquiry, along with the coil weight or the cut length.',
    },
  ],
  productSearch: 'nickel strip',
  breadcrumbName: `${size.thickness} × ${size.width} Nickel Strip`,
});

/**
 * Application pages: one URL per job the product is bought to do.
 *
 * Distinct from the size pages above and from the H-type page. A buyer searching "nickel strip
 * for battery pack welding" is not asking for a dimension or a pattern — they are asking whether
 * this supplier understands the process they are running. These pages answer that, and they are
 * the phrasing answer engines are most often asked in.
 */
/**
 * The export page, written for a buyer outside India.
 *
 * Search Console for 2026-07-21 to 2026-10-20 shows 72% of clicks coming from outside India —
 * 23 from the United States, 6 from the United Kingdom, 5 each from Germany and Sweden, against
 * 38 from India — and "nickel strips exporters in mumbai" sitting at position 48. There was
 * nowhere purpose-built for that traffic to land: /export-enquiry is a form, and the Mumbai and
 * wholesale pages carry export as a paragraph inside a domestic page.
 *
 * What an overseas buyer needs is not a translated version of the domestic pitch. They already
 * assume the material exists; what they cannot tell from a product page is whether the paperwork
 * will clear their customs, which port it leaves from, and how the price is expressed. So the
 * page is built around documentation, packing, loading and pricing, and it ends by naming what
 * to send so the first enquiry is quotable rather than a round of questions.
 *
 * Every claim here restates something already published elsewhere on the site. Nothing about
 * payment terms, transit times, a separate export minimum, or any particular Incoterm being
 * offered appears, because the company has not stated those — see the DATA REQUIRED list in the
 * growth dashboard. Add them here when confirmed; do not infer them from the domestic terms.
 */
const EXPORT_PAGE: LandingPage = {
  slug: 'nickel-strip-exporter-india',
  title: 'Nickel Strip Exporter in India | Strip & Busbar Export',
  description:
    'Nickel strip and busbar exporter in Mumbai, shipping to 17+ countries through Nhava Sheva with certificate of origin, test certificate and HS code.',
  h1: 'Nickel Strip and Nickel Busbar Exporter in India',
  intro:
    'Ramani Steel House manufactures nickel strip and nickel busbar in Mumbai and exports to 17+ countries. For a buyer outside India the question is rarely whether the material exists; it is whether the consignment clears customs cleanly, which port it leaves from, and how the price is quoted. Export lots are packed at the works, loaded through Nhava Sheva (JNPT), and shipped with the certificate of origin, material test certificate and HS code classification. Orders are quoted in USD against an agreed Incoterm.',
  keywords: [
    'Nickel Strip Exporter',
    'Nickel Strip Exporter India',
    'Nickel Strips Exporters in Mumbai',
    'Nickel Busbar Exporter',
    'Pure Nickel Strip Export Supplier',
    'Battery Nickel Strip Exporter India',
    'Nickel Strip Supplier for Export',
    'Indian Nickel Strip Manufacturer Export',
  ],
  sections: [
    {
      heading: 'What ships with the consignment',
      body:
        'The paperwork is what decides whether a consignment moves or sits. Export shipments go out with the certificate of origin, the material test certificate giving batch-wise conductivity and tensile results, and the HS code classification for the material. The batch stays traceable after delivery, so a question raised during incoming inspection can be answered against the same certificate months later.',
    },
    {
      heading: 'Packing and loading',
      body:
        'Export lots are packed at the Mumbai works in moisture-protected, export-grade packing intended for sea freight, rather than the packing used for a domestic road consignment. Shipments load through Nhava Sheva (JNPT), which handles most of western India’s container traffic. Where it suits a buyer, southern consignments can be routed through Chennai instead.',
    },
    {
      heading: 'Trade terms',
      bullets: PRODUCT_EXPORT_TERMS.map((term) => `${term.label}: ${term.value}`),
    },
    {
      heading: 'How export orders are priced',
      body: `Export orders are quoted in USD, separately from the rupee price list used in India, on ${INCOTERMS.slice(0, -1).join(', ')} or ${INCOTERMS[INCOTERMS.length - 1]} terms. Freight is quoted with the order rather than published, because it depends on the weight of the consignment and the destination port. Tell us the destination, the quantity and which Incoterm you work to, and the quotation comes back against it.`,
    },
    {
      heading: 'Material supplied for export',
      bullets: [
        'Pure nickel strip, H type, fuse type, zig-zag and honeycomb patterns',
        'Nickel busbar and copper busbar, cut to length and hole pattern',
        ...SPEC_BULLETS,
      ],
    },
    {
      heading: 'What to send with an export enquiry',
      body:
        'A quotation needs the thickness, the width, the pattern or a drawing, the quantity, and the destination port or city. If the strip is for a specific cell format, naming it — 18650, 21700, 32650, 32700 — lets the pitch and hole pattern be quoted against the pack rather than guessed. Send a drawing for anything that is not a listed size; tooling is developed for new pack layouts.',
    },
  ],
  faqs: [
    {
      question: 'Do you export nickel strip and nickel busbar?',
      answer:
        'Yes. Nickel strip, H type strip, fuse type strip and busbar are manufactured in Mumbai and exported to 17+ countries.',
    },
    {
      question: 'What documents are supplied with an export shipment?',
      answer:
        'The certificate of origin, the material test certificate with batch-wise conductivity and tensile results, and the HS code classification for the material. The batch remains traceable after delivery.',
    },
    {
      question: 'Which port do you ship from?',
      answer:
        'Nhava Sheva (JNPT), near the Mumbai works, which handles most of western India’s container traffic. Chennai can be used instead where that suits a buyer in the south.',
    },
    {
      question: 'How is an export order priced?',
      answer:
        `In USD on ${INCOTERMS.join(', ')} terms, quoted separately from the rupee price list. Freight is quoted with the order, since it depends on consignment weight and destination. The HS code for pure nickel strip and busbar strip is ${HS_CODES[0].code}; confirm the import line with your own broker, since destination tariff lines vary.`,
    },
    {
      question: 'What is the minimum order for export?',
      answer:
        'The manufacturing minimum is 5 kg, the same as for domestic orders. For a sea freight consignment the practical quantity also depends on freight cost to your port, which is quoted with the order — send the destination and requirement and both are confirmed together.',
    },
    {
      question: 'Can you manufacture to our drawing for export orders?',
      answer:
        'Yes. Thickness, width, pitch and hole pattern are made to drawing, and tooling is developed for new battery pack designs. The same material test certificate is issued regardless of whether the size is listed.',
    },
  ],
  productSearch: 'nickel strip',
  breadcrumbName: 'Export',
};

const APPLICATION_PAGES: readonly LandingPage[] = [
  {
    slug: 'nickel-strip-for-battery-pack-welding',
    title: 'Battery Pack Welding Nickel Strip | Manufacturer, Supplier',
    description:
      'Nickel strip for battery pack spot welding: 99.8% pure nickel, 0.10-0.50mm, cut to cell pitch. Welds cleanly on 18650, 21700 and 32700 packs. Made in Mumbai.',
    h1: 'Nickel Strip for Battery Pack Welding',
    intro:
      'Nickel strip for battery pack welding, manufactured in Mumbai by Ramani Steel House. Spot welding is what the material has to survive: 99.8% pure nickel takes a weld nugget cleanly at moderate electrode force, and the strip is slit and cut to your cell pitch so it seats on the pack without hand alignment.',
    keywords: [
      'Nickel Strip for Battery Pack Welding',
      'Spot Welding Nickel Strip',
      'Battery Tab Welding Strip',
      'Nickel Strip for Spot Welder',
      'Battery Pack Welding Strip Supplier India',
    ],
    sections: [
      {
        heading: 'Why pure nickel welds better than plated steel',
        body:
          'A spot weld forms where resistance concentrates. Pure nickel has low, predictable bulk resistance, so the heat forms at the interface between strip and cell terminal, which is where the joint is wanted. Nickel-plated steel puts a thin conductive layer over a resistive core, so weld behaviour varies with how the plating sits and the joint is harder to make repeatable across a production run.',
      },
      {
        heading: 'What we supply for welding',
        bullets: [
          'Purity 99.8% pure nickel, Nickel 201 / UNS N02201',
          'Thickness 0.10mm – 0.50mm; 0.15mm is the common welding gauge',
          'Width 2mm – 50mm, slit to your drawing',
          'H-type, zig-zag, honeycomb, fuse-type and plain patterns',
          'Cut to the cell pitch of your pack layout',
          'Minimum order 5 kg · despatch in 7 days',
        ],
      },
      {
        heading: 'Matching thickness to your welder',
        body:
          'Thicker strip carries more current but needs more weld energy. A resistance welder comfortable with 0.15 mm may produce shallow, high-resistance joints on 0.25 mm without a change in settings or hardware. Tell us the welder and the per-cell current when enquiring and the gauge is recommended against both, rather than against the current alone.',
      },
    ],
    faqs: [
      {
        question: 'What thickness nickel strip is best for spot welding?',
        answer:
          '0.15 mm is the most widely used for 18650 pack assembly — it carries useful current and welds on a mid-range resistance welder. Heavier packs move to 0.20 mm or 0.25 mm, but only if the welder can deliver the extra energy.',
      },
      {
        question: 'Can nickel-plated steel strip be spot welded the same way?',
        answer:
          'It can be welded, but not with the same settings or the same consistency. The plated layer over a resistive core makes the joint less repeatable across a run, which is why pure nickel is preferred where weld quality is being controlled.',
      },
      {
        question: 'Do you cut nickel strip to our cell pitch?',
        answer:
          'Yes. Pitch, neck width, strip width and hole pattern are all cut to your pack drawing rather than to a nearest standard size. Send the drawing or the cell layout with the enquiry.',
      },
    ],
    productSearch: 'nickel strip',
    breadcrumbName: 'Battery Pack Welding',
  },
  {
    slug: 'nickel-strip-for-lithium-ion-battery-manufacturers',
    title: 'Nickel Strip Supplier for Lithium-Ion Battery Manufacturers',
    description:
      'Bulk nickel strip for lithium-ion battery manufacturers: 99.8% pure nickel, custom slitting, test certificates, PAN India supply and export to 17+ countries.',
    h1: 'Nickel Strip for Lithium-Ion Battery Manufacturers',
    intro:
      'Ramani Steel House supplies nickel strip to lithium-ion battery manufacturers across India and in 17+ export markets, from its Mumbai works. What a manufacturer needs beyond the material itself is repeatability, traceable batches and a supplier who can hold a delivery schedule — the strip is slit in-house, tested batch-wise, and despatched in 7 days.',
    keywords: [
      'Nickel Strip for Lithium-Ion Battery Manufacturers',
      'Bulk Nickel Strip Supplier India',
      'Lithium Battery Nickel Strip Manufacturer',
      'Battery Manufacturer Nickel Strip Supply',
      'OEM Nickel Strip Supplier',
    ],
    sections: [
      {
        heading: 'What manufacturers buy on',
        bullets: [
          'Batch-to-batch consistency in thickness and temper',
          'Material test certificates, traceable to the batch, on request',
          'Repeat schedules held to a 7 day despatch',
          'Custom slitting to a released drawing rather than a standard size',
          'Bulk pricing, with a 5 kg minimum for qualification lots',
          'Export documentation prepared in-house for overseas plants',
        ],
      },
      {
        heading: 'Qualification before volume',
        body:
          'Most manufacturers qualify a strip before committing to a schedule: a small lot, welded on the production line, checked for weld strength and contact resistance. The 5 kg minimum exists for exactly that — it is low enough to qualify a design without a mill-quantity commitment, and the same material and batch traceability applies to the trial lot as to the production one.',
      },
      {
        heading: 'Specification supplied',
        bullets: SPEC_BULLETS,
      },
    ],
    faqs: [
      {
        question: 'Do you supply nickel strip in production volumes?',
        answer:
          'Yes. The catalogue runs from 5 kg qualification lots up to repeat bulk schedules, slit from coil in Mumbai and despatched PAN India or exported.',
      },
      {
        question: 'Can you hold a delivery schedule for a production line?',
        answer:
          'Published despatch is 7 days. For repeat schedules, agree the call-off with the sales team at order confirmation so material is slit ahead of each release rather than on receipt of each order.',
      },
      {
        question: 'Will you supply against our drawing rather than a standard size?',
        answer:
          'Yes — width, thickness, pitch, neck width and hole pattern are cut to a released drawing. Send the drawing with the enquiry and the quotation is made against it.',
      },
    ],
    productSearch: 'nickel strip',
    breadcrumbName: 'For Battery Manufacturers',
  },
  {
    slug: 'nickel-busbar-for-battery-applications',
    title: 'Nickel Busbar Manufacturer & Supplier for Batteries | India',
    description:
      'Nickel busbar for battery applications: pure nickel interconnects for EV, storage and industrial packs. Custom width and thickness, made in Mumbai since 1974.',
    h1: 'Nickel Busbar for Battery Applications',
    intro:
      'Nickel busbar for battery applications, manufactured in Mumbai by Ramani Steel House. Where a strip interconnects cells, a busbar carries the combined current of a module — so the cross-section, not the weld pattern, is the governing dimension. Supplied in pure nickel at 99.8%, cut to the width and thickness your module drawing calls for.',
    keywords: [
      'Nickel Busbar for Battery Applications',
      'Nickel Busbar Manufacturer India',
      'Battery Busbar Supplier',
      'Pure Nickel Busbar',
      'EV Battery Busbar India',
      'Energy Storage Busbar Supplier',
    ],
    sections: [
      {
        heading: 'Busbar or strip — which your pack needs',
        body:
          'Nickel strip joins cells within a parallel group and carries the current of those cells only. A busbar joins groups or modules and carries their combined current, so it is sized on total current rather than per-cell current. Using strip where a busbar is needed is the more common error of the two, and it shows up as heating at the interconnect under load rather than as a failed weld.',
      },
      {
        heading: 'What we supply',
        bullets: [
          'Pure nickel busbar at 99.8% purity, Nickel 201 / UNS N02201',
          'Nickel-plated and copper busbar where conductivity or cost dictates',
          'Width and thickness cut to your module drawing',
          'Hole patterns and terminations to spec',
          'Minimum order 5 kg · despatch in 7 days',
          'Material test certificate on request',
        ],
      },
      {
        heading: 'Applications',
        bullets: [
          'EV battery modules and packs',
          'Grid and commercial energy storage (BESS)',
          'Industrial and traction battery assemblies',
          'Power tool and light-EV packs',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is a nickel busbar used for in a battery pack?',
        answer:
          'It carries current between parallel groups or between modules, where the combined current is higher than a cell interconnect strip is sized for. It is specified on cross-section against the total current it must carry.',
      },
      {
        question: 'Nickel busbar or copper busbar — which is better?',
        answer:
          'Copper has higher conductivity for the same cross-section; nickel resists corrosion better and welds directly to cell terminals without plating. Many packs use both, with nickel at the cell interface and copper for the longer current paths.',
      },
      {
        question: 'Can nickel busbar be made to our module drawing?',
        answer:
          'Yes. Width, thickness, length, hole pattern and terminations are cut to the drawing supplied. Send the drawing and the quotation is made against it rather than against a nearest standard section.',
      },
    ],
    productSearch: 'busbar',
    breadcrumbName: 'Nickel Busbar for Batteries',
  },
];

/**
 * The arithmetic behind the numbers on the size and busbar pages, in one place so every page
 * states the same figures and none is typed by hand.
 *
 * Density 8.9 g/cm³ and resistivity 9.5 × 10⁻⁸ Ω·m are the values the guides use (see
 * src/lib/guides.ts), so a buyer who reads a guide and then a size page meets the same numbers.
 * Resistivity is the Nickel 200 figure, the conservative one: Nickel 201 is a little lower.
 * These are geometry and material constants, not a current rating. What a strip can safely carry
 * depends on how it is cooled and how long the current lasts, which the guides explain.
 */
const NICKEL_DENSITY_G_PER_CM3 = 8.9;
const NICKEL_RESISTIVITY_OHM_M = 9.5e-8;
const COPPER_RESISTIVITY_OHM_M = 1.72e-8;

/** Properties of a solid strip. Area in mm², so one metre of it is area cm³ of metal. */
const solidStrip = (thicknessMm: number, widthMm: number) => {
  const areaMm2 = thicknessMm * widthMm;
  const gramsPerMetre = areaMm2 * NICKEL_DENSITY_G_PER_CM3;
  const ohmsPerMetre = NICKEL_RESISTIVITY_OHM_M / (areaMm2 * 1e-6);
  return { areaMm2, gramsPerMetre, metresPerKg: 1000 / gramsPerMetre, milliohmsPerMetre: ohmsPerMetre * 1000 };
};

const round = (value: number, places = 1): string => value.toFixed(places).replace(/\.0+$/, '');

const sizeNumbersSections = (size: StripSize): LandingSection[] => {
  const me = solidStrip(size.thicknessMm, size.widthMm);
  const other = STRIP_SIZES.find((candidate) => candidate.slug !== size.slug);
  const them = other ? solidStrip(other.thicknessMm, other.widthMm) : null;
  const heat10A = 10 * 10 * (me.milliohmsPerMetre / 1000) * 0.1; // I² × R over a 100 mm run, watts

  return [
    {
      heading: `The numbers for ${size.thickness} × ${size.width} strip`,
      bullets: [
        `Cross-section ${round(me.areaMm2, 2)} mm²`,
        `Weight ${round(me.gramsPerMetre)} g per metre, so ${round(me.metresPerKg, 0)} metres per kilogram and about ${round(me.metresPerKg * 5, 0)} metres in a 5 kg order`,
        `Resistance about ${round(me.milliohmsPerMetre, 0)} milliohms per metre, or ${round(me.milliohmsPerMetre / 10)} milliohms over a 100 mm run`,
        `Carrying 10 A over that 100 mm run it gives off about ${round(heat10A, 2)} W as heat (I² × R)`,
      ],
    },
    {
      heading: 'How these figures are worked out',
      body: `Weight per metre is thickness times width times 8.9 grams, from nickel's density of about 8.9 g/cm³. Resistance is ρ × length ÷ cross-section, using about 9.5 × 10⁻⁸ ohm-metres for nickel. They describe the strip as a piece of metal; they are not a current rating, because what a strip can safely carry depends on how well it is cooled and how long the current lasts. A pattern cut into the strip, such as an H type or a fuse neck, removes metal and so raises resistance and lowers weight at that point.`,
    },
    ...(other && them
      ? [
          {
            heading: `${size.thickness} × ${size.width} or ${other.thickness} × ${other.width}`,
            body: `The two stocked sizes differ by a factor of ${round(them.areaMm2 / me.areaMm2, 1)} in cross-section: ${round(me.areaMm2, 2)} mm² against ${round(them.areaMm2, 2)} mm². ${me.areaMm2 > them.areaMm2 ? 'This is the larger section, so it' : 'The other size, with the larger section,'} runs at ${round(Math.max(me.milliohmsPerMetre, them.milliohmsPerMetre) / Math.min(me.milliohmsPerMetre, them.milliohmsPerMetre), 1)} times lower resistance and heats ${round(Math.max(me.milliohmsPerMetre, them.milliohmsPerMetre) / Math.min(me.milliohmsPerMetre, them.milliohmsPerMetre), 1)} times less at the same current, at the price of more weight per metre (${round(Math.max(me.gramsPerMetre, them.gramsPerMetre))} g against ${round(Math.min(me.gramsPerMetre, them.gramsPerMetre))} g) and more weld energy. Neither is better in general: the right one is set by the current each cell connection carries and by the welder you have.`,
          },
        ]
      : []),
  ];
};

const sizeNumbersFaq = (size: StripSize) => {
  const me = solidStrip(size.thicknessMm, size.widthMm);
  return {
    question: `How many metres are in 5 kg of ${size.thickness} × ${size.width} nickel strip?`,
    answer: `About ${round(me.metresPerKg * 5, 0)} metres. Solid ${size.thickness} × ${size.width} strip weighs about ${round(me.gramsPerMetre)} g per metre, which is ${round(me.metresPerKg, 0)} metres per kilogram. Patterned strip has metal removed, so it gives more length per kilogram than the same size solid.`,
  };
};

/**
 * A worked example for the busbar page: a 0.5 mm × 20 mm nickel busbar run 150 mm between two
 * terminals at 50 A, beside the same size in copper. An illustration of the method, not a rating.
 */
const busbarWorkedExample = (): LandingSection => {
  const areaM2 = 0.5 * 20 * 1e-6;
  const lengthM = 0.15;
  const amps = 50;
  const nickelOhms = (NICKEL_RESISTIVITY_OHM_M * lengthM) / areaM2;
  const copperOhms = (COPPER_RESISTIVITY_OHM_M * lengthM) / areaM2;
  return {
    heading: 'Sizing a busbar: a worked example',
    body: `Take a nickel busbar 0.5 mm thick and 20 mm wide, which is 10 mm² in cross-section, running 150 mm between two terminals at ${amps} A. Its resistance is ρ × L ÷ A: about ${round(nickelOhms * 1000, 1)} milliohms. The heat it gives off is I² × R: about ${round(amps * amps * nickelOhms, 1)} W. The same section in copper has about ${round(copperOhms * 1000, 2)} milliohms and gives off about ${round(amps * amps * copperOhms, 1)} W, roughly ${round(nickelOhms / copperOhms, 1)} times less, which is why copper carries the long, heavy runs in a pack and nickel is used where a weldable joint matters more than the last milliohm. The example shows the method. It is not a current rating; send the current, the length and the temperature rise you can accept, and the section is worked out against them.`,
  };
};

/**
 * Sections and questions added to the application pages, which were each about 350 words and
 * answered only "what do you supply". These cover the next thing a buyer on the page is working
 * out, in general engineering terms, with no figure that is not derived or already published.
 */
const APPLICATION_DEPTH: Readonly<Record<string, { sections: LandingSection[]; faqs?: LandingPage['faqs'] }>> = {
  'nickel-strip-for-battery-pack-welding': {
    sections: [
      {
        heading: 'What makes a spot weld repeatable',
        body: 'Spot welding nickel strip to a cell is a resistance weld: current passes through the strip and the cell, and the heat is made where the two meet. Three things decide whether that joint forms the same way every time. The first is the strip surface. Oxide, fingerprints and moisture raise the contact resistance and move the heat to the wrong place, so strip is kept sealed and handled clean until it is on the cell. The second is the match between strip thickness and welder energy: thin strip needs less energy and less electrode force, and a pulse that is too strong blows a hole through it. The third is flatness, because strip that does not sit flat on the terminal welds unevenly from one end to the other.',
      },
      {
        heading: 'Checking a weld before production',
        body: 'The usual test is a peel test: pull the strip off a welded cell and look at what stays behind. A good weld tears the strip or lifts a nugget of cell metal with it. A weld that lets go cleanly at the interface was too cold. Run it on sample cells at the start of each shift and after any change of strip lot, electrode or welder setting. Trial lots for these tests start at the 5 kg minimum order, so a weld schedule can be settled on the real material before a bulk order is placed.',
      },
    ],
    faqs: [
      {
        question: 'How should nickel strip be stored before welding?',
        answer:
          'Sealed and dry, away from moisture and chemical fumes, and handled with clean gloves. Oxide and skin oils raise the contact resistance at the weld, which is the usual cause of weak or inconsistent joints on strip that was fine when it left the works.',
      },
    ],
  },
  'nickel-strip-for-lithium-ion-battery-manufacturers': {
    sections: [
      {
        heading: 'How a strip supplier is qualified',
        body: 'Most battery makers qualify strip in stages: a sample lot, then a certificate and dimension check, then weld tests on sample cells, then a pilot batch, then scheduled volume. Each stage answers one question. Is the material what the certificate says it is? Does it measure what the drawing says? Does it weld the way your process needs? Does the next batch match the last? Supply is organised around those stages, with the batch traceable from the certificate to the coil.',
      },
      {
        heading: 'What to check when strip arrives',
        bullets: [
          'Thickness and width against the drawing, with a micrometer and calipers, at several points along the length',
          'Surface: no oxide staining, scratches or fingerprints on the weld face',
          'Edges: clean, with no burr that could catch or cut a cell wrapper',
          'Flatness: the strip lies flat on the terminal without lifting at the ends',
          'Paperwork: the material test certificate carries the same batch number as the coil',
        ],
      },
    ],
    faqs: [
      {
        question: 'What checks should we run on incoming nickel strip?',
        answer:
          'Measure thickness and width at several points, inspect the surface and edges, confirm the strip lies flat, and match the batch number on the coil to the material test certificate. Then weld a sample set and peel-test it before releasing the lot to the line.',
      },
    ],
  },
  'nickel-busbar-for-battery-applications': {
    sections: [busbarWorkedExample()],
  },
};

const withDepth = (page: LandingPage): LandingPage => {
  const depth = APPLICATION_DEPTH[page.slug];
  return depth
    ? { ...page, sections: [...page.sections, ...depth.sections], faqs: [...page.faqs, ...(depth.faqs ?? [])] }
    : page;
};

export const LANDING_PAGES: readonly LandingPage[] = [
  H_TYPE_PAGE,
  MUMBAI_PAGE,
  TRADE_BUYER_PAGE,
  EXPORT_PAGE,
  ...STRIP_SIZES.map(stripSizePage),
  ...APPLICATION_PAGES.map(withDepth),
  ...REGIONS.map(regionLandingPage),
];

const LANDING_PAGES_BY_SLUG = new Map(LANDING_PAGES.map((page) => [page.slug, page]));

export function getLandingPage(slug?: string | null): LandingPage | null {
  const clean = slug?.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return null;
  return LANDING_PAGES_BY_SLUG.get(clean) ?? null;
}

/** "/h-type-nickel-strip" -> the page, for router and snapshot lookups by pathname. */
export function getLandingPageByPathname(pathname: string): LandingPage | null {
  return getLandingPage(pathname);
}

/**
 * The category page a product sits under, for its breadcrumb.
 *
 * Product breadcrumbs used to run Home › Products › product for every SKU. That told Google
 * nothing about how the H type SKUs relate to /h-type-nickel-strip, so the category page and
 * eleven product pages competed for "H type nickel strip" as unrelated URLs, and the homepage
 * (with the most links) tended to win. Making the category page the parent of every H type SKU
 * says which URL answers the category query: each SKU links up to it with the anchor
 * "H Type Nickel Strip", and Google can show that trail in the result itself.
 *
 * Matched on slug as well as name because some names drop the pattern ("Ni Fuse type 21700"
 * is ni-fuse-type-21700-2p-h-type-double-fuse).
 */
export function parentCategoryFor(product: { name?: string | null; slug?: string | null }): {
  name: string;
  path: string;
} {
  const haystack = `${product.name ?? ''} ${product.slug ?? ''}`;
  if (/\bh[\s-]?type\b/i.test(haystack)) {
    return { name: H_TYPE_PAGE.breadcrumbName, path: `/${H_TYPE_PAGE.slug}` };
  }
  return { name: 'Products', path: '/products' };
}

/** Every landing path, for the sitemap and the router. */
export const LANDING_PATHS: readonly string[] = LANDING_PAGES.map((page) => `/${page.slug}`);

/** The regional pages only, for the "also supplying" cross-links rendered on each landing page. */
export const REGION_LANDING_PAGES: readonly { path: string; name: string }[] = REGIONS.map((region) => ({
  path: `/nickel-strip-manufacturer-in-${region.slug}`,
  name: region.name,
}));

/**
 * The ten former state pages and the regional page that now covers each, for the 301s. The old
 * URLs were indexed, so they must answer with a redirect rather than a 404: that carries what
 * little they had earned across to the page that replaced them.
 */
export const STATE_PAGE_REDIRECTS: Readonly<Record<string, string>> = Object.fromEntries(
  REGIONS.flatMap((region) =>
    region.stateSlugs.map((state) => [`/nickel-strip-manufacturer-in-${state}`, `/nickel-strip-manufacturer-in-${region.slug}`])
  )
);
