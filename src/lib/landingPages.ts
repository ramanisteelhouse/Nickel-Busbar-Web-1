import { POSTAL_ADDRESS, PRIMARY_CALL } from './contact.js';
import { YEARS_IN_BUSINESS } from './heritage.js';

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
  'Nickel purity 99.6%, with material test certificates on request',
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
    title: 'Pure Nickel Strip 0.15mm x 10mm | Manufacturer',
    description:
      'Pure nickel strip 0.15mm thick x 10mm wide, 99.6% nickel, UNS N02201. Made in Mumbai for 18650 and 21700 battery pack welding. 5 kg MOQ, 7 day delivery.',
    suitedTo:
      'the most widely used gauge for 18650 pack assembly. It spot welds cleanly on a mid-range resistance welder without the electrode force a thicker strip needs, which is why it is the size most builders standardise on for 2P and 3P layouts.',
    cellFormats: '18650, 21700',
  },
  {
    slug: 'pure-nickel-strip-0-20mm-x-15mm',
    thickness: '0.20 mm',
    width: '15 mm',
    title: 'Pure Nickel Strip 0.20mm x 15mm | Manufacturer',
    description:
      'Pure nickel strip 0.20mm x 15mm wide, 99.6% nickel, UNS N02201. Higher current capacity for 21700 and 32700 packs. 5 kg MOQ, 7 day delivery from Mumbai.',
    suitedTo:
      'packs that draw more current per cell than 0.15 mm comfortably carries. The larger cross-section — thicker and wider — lowers resistance through the interconnect, at the cost of needing more weld energy than a 0.15 mm strip.',
    cellFormats: '21700, 32650, 32700',
  },
];

const stripSizePage = (size: StripSize): LandingPage => ({
  slug: size.slug,
  title: size.title,
  description: size.description,
  h1: `Pure Nickel Strip ${size.thickness} × ${size.width}`,
  intro: `Pure nickel strip in ${size.thickness} thickness and ${size.width} width, manufactured by Ramani Steel House in Mumbai since 1974. Supplied at 99.6% nickel to UNS N02201, slit to width from coil, for battery pack builders working with ${size.cellFormats} cells. Minimum order 5 kg, despatched in 7 days PAN India and exported to 17+ countries.`,
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
        'Purity 99.6% pure nickel',
        'Grade Nickel 201, UNS N02201 (DIN 2.4068)',
        `Suited to ${size.cellFormats} cell formats`,
        'Supplied as strip or coil, slit to width',
        'Minimum order 5 kg · despatch in 7 days',
        'Material test certificate on request',
      ],
    },
    {
      heading: 'What this size is used for',
      body: `This gauge is ${size.suitedTo}`,
    },
    {
      heading: 'Ordering this size',
      body: `${size.thickness} × ${size.width} is a stocked size, so it ships from coil rather than being rolled to order. If your pack needs a different width, the same 99.6% material is slit to any width from 2 mm to 50 mm against your drawing — send the pitch and cell layout and it is cut to that instead.`,
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
        'Pure nickel, at 99.6%, to UNS N02201. Nickel-plated steel is supplied separately and is a different material — it is cheaper but has substantially higher resistance, so it is not interchangeable where conductivity matters.',
    },
    {
      question: `What is the minimum order for ${size.thickness} × ${size.width} strip?`,
      answer:
        '5 kg. Both trial quantities for qualifying a new pack design and repeat bulk schedules are quoted from the same stock.',
    },
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
const APPLICATION_PAGES: readonly LandingPage[] = [
  {
    slug: 'nickel-strip-for-battery-pack-welding',
    title: 'Nickel Strip for Battery Pack Welding | Supplier',
    description:
      'Nickel strip for battery pack spot welding: 99.6% pure nickel, 0.10-0.50mm, cut to cell pitch. Welds cleanly on 18650, 21700 and 32700 packs. Made in Mumbai.',
    h1: 'Nickel Strip for Battery Pack Welding',
    intro:
      'Nickel strip for battery pack welding, manufactured in Mumbai by Ramani Steel House. Spot welding is what the material has to survive: 99.6% pure nickel takes a weld nugget cleanly at moderate electrode force, and the strip is slit and cut to your cell pitch so it seats on the pack without hand alignment.',
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
          'Purity 99.6% pure nickel, Nickel 201 / UNS N02201',
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
    title: 'Nickel Strip for Lithium-Ion Battery Manufacturers',
    description:
      'Bulk nickel strip for lithium-ion battery manufacturers: 99.6% pure nickel, custom slitting, test certificates, PAN India supply and export to 17+ countries.',
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
    title: 'Nickel Busbar for Battery Applications | India',
    description:
      'Nickel busbar for battery applications: pure nickel interconnects for EV, storage and industrial packs. Custom width and thickness, made in Mumbai since 1974.',
    h1: 'Nickel Busbar for Battery Applications',
    intro:
      'Nickel busbar for battery applications, manufactured in Mumbai by Ramani Steel House. Where a strip interconnects cells, a busbar carries the combined current of a module — so the cross-section, not the weld pattern, is the governing dimension. Supplied in pure nickel at 99.6%, cut to the width and thickness your module drawing calls for.',
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
          'Pure nickel busbar at 99.6% purity, Nickel 201 / UNS N02201',
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

export const LANDING_PAGES: readonly LandingPage[] = [
  H_TYPE_PAGE,
  MUMBAI_PAGE,
  ...STRIP_SIZES.map(stripSizePage),
  ...APPLICATION_PAGES,
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
