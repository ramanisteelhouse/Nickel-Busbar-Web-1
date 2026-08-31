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
  'Nickel purity 99.6-99.8%, with material test certificates on request',
  'Thickness 0.10mm – 0.50mm, width 2mm – 50mm',
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
        '52 years of metallurgical manufacturing, ISO 9001 compliant processes',
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
 * Search engines truncate a description past ~160 characters, and the city list is the part
 * that varies — "Sri City, Tirupati, Visakhapatnam" is 20 characters longer than "Jaipur,
 * Neemrana, Bhiwadi". Rather than hand-tune ten strings and have the next state added here
 * silently overflow, fit as many cities as the budget allows and stop.
 */
const DESCRIPTION_MAX = 160;

const stateDescription = (state: StateFacts) => {
  const base = `Nickel strip manufacturer supplying ${state.name}: pure nickel strip, H type nickel strip and nickel busbar for battery packs.`;
  const chosen: string[] = [];
  let description = base;
  for (const city of state.cities) {
    const candidate = `${base} Despatch to ${[...chosen, city].join(', ')}.`;
    if (candidate.length > DESCRIPTION_MAX) break;
    chosen.push(city);
    description = candidate;
  }
  return description;
};

const stateLandingPage = (state: StateFacts): LandingPage => ({
  slug: `nickel-strip-manufacturer-in-${state.slug}`,
  // "| Ramani Steel" rather than "| Supplier": it keeps every state's title inside the 50-60
  // character window and puts the brand in the SERP line.
  title: `Nickel Strip Manufacturer in ${state.name} | Ramani Steel`,
  description: stateDescription(state),
  h1: `Nickel Strip Manufacturer Supplying ${state.name}`,
  intro: `Ramani Steel House supplies nickel strip to battery pack makers, electronics manufacturers and engineering firms across ${state.name} from its Mumbai works. Pure nickel strip, H type nickel strip and nickel busbar are despatched to ${state.cities.slice(0, -1).join(', ')} and ${state.cities[state.cities.length - 1]}, cut to the cell format and pack layout you build to.`,
  keywords: [
    `Nickel Strip Manufacturer in ${state.name}`,
    `Nickel Strip Supplier in ${state.name}`,
    `Nickel Strips Manufacturer in ${state.name}`,
    `H Type Nickel Strip ${state.name}`,
    `Battery Nickel Strip Supplier ${state.name}`,
    ...state.cities.map((city) => `Nickel Strip Supplier in ${city}`),
  ],
  sections: [
    {
      heading: `Battery and electronics manufacturing in ${state.name}`,
      body: state.clusters,
    },
    {
      heading: `Supplying ${state.name}`,
      body: state.note,
    },
    {
      heading: 'What is supplied',
      bullets: SPEC_BULLETS,
    },
    {
      heading: `Cities served in ${state.name}`,
      bullets: state.cities,
    },
  ],
  faqs: [
    {
      question: `Do you supply nickel strip in ${state.name}?`,
      answer: `Yes. Nickel strip, H type nickel strip and nickel busbar are despatched from our Mumbai works to customers across ${state.name}, including ${state.cities.slice(0, 3).join(', ')}. Send your cell format, thickness, width and quantity for a quotation.`,
    },
    {
      question: `What is the minimum order for ${state.name} deliveries?`,
      answer:
        'Order quantity depends on thickness, width and whether the pattern is standard or cut to your drawing. Both trial lots for a new pack design and repeat bulk schedules are quoted — send the specification and we confirm the minimum against it.',
    },
    {
      question: 'Are material test certificates provided?',
      answer:
        'Yes, on request. A material test certificate with batch-wise conductivity and tensile results is issued when you ask for one, and the batch remains traceable after delivery.',
    },
  ],
  productSearch: 'nickel strip',
  breadcrumbName: `Nickel Strip in ${state.name}`,
});

export const LANDING_PAGES: readonly LandingPage[] = [
  H_TYPE_PAGE,
  ...STATE_FACTS.map(stateLandingPage),
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

/** Every landing path, for the sitemap and the router. */
export const LANDING_PATHS: readonly string[] = LANDING_PAGES.map((page) => `/${page.slug}`);

/** The state pages only, for the "also supplying" cross-links rendered on each landing page. */
export const STATE_LANDING_PAGES: readonly { path: string; name: string }[] = STATE_FACTS.map(
  (state) => ({ path: `/nickel-strip-manufacturer-in-${state.slug}`, name: state.name })
);
