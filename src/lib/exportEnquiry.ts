/**
 * Single source of truth for the /export-enquiry landing page.
 *
 * The page has to say the same thing in two places that never run together:
 *   - the React page visitors and rendering crawlers get (src/pages/ExportEnquiryPage.tsx)
 *   - the raw-HTML snapshot non-rendering crawlers get (seoSnapshot.ts)
 * Two hand-maintained copies of an HS code or an Incoterm list is two different answers to
 * the same buyer question, so both import from here - exactly as the answer block does.
 *
 * Every figure below is already published elsewhere on this site: 1974, 17+ countries and
 * Mumbai from /about and llms.txt; purity, thickness and width from the homepage
 * specification table; ASTM B16 / UNS N02201 / DIN 2.4068 from the product pages; ISO 9001
 * from the homepage quality section; "lead times confirmed at quotation" from
 * ProductDetailPage. Nothing here asserts a capability the site does not already claim.
 */

export const EXPORT_PATH = '/export-enquiry';

/** 56 chars - stays inside the ~60 Google renders, and keeps both geo targets in view. */
export const EXPORT_TITLE = 'Nickel Strip & Busbar Export Enquiry | India & Worldwide';

/** 150 chars - inside the ~155 Google renders before truncating. */
export const EXPORT_DESCRIPTION =
  'Export enquiry for pure nickel strip and nickel busbar from Mumbai, India. Bulk supply ' +
  'PAN India and export to 17+ countries on FOB, CIF and CIP terms.';

export const EXPORT_H1 = 'Nickel Strip & Nickel Busbar Export Enquiry';

export const EXPORT_LEAD =
  'Ramani Steel House (nickelbusbar.com) has manufactured nickel strip and nickel busbar in ' +
  'Mumbai, India since 1974. We supply lithium-ion battery, EV and energy storage ' +
  'manufacturers PAN India and export to 17+ countries, shipping on EXW, FOB, CIF or CIP ' +
  'terms with mill test certificates and complete export documentation. Send your ' +
  'specification below and receive a quotation within one business day.';

/**
 * Regions rather than a named country list: the site's published claim is "17+ countries"
 * and it has never enumerated them. Replace this with the confirmed destination countries
 * when sales signs them off - named countries are what buyers actually search for, and this
 * is the one edit on the page that adds real ranking surface.
 */
export const EXPORT_REGIONS: ReadonlyArray<{ region: string; detail: string }> = [
  { region: 'Asia-Pacific', detail: 'Battery pack assemblers, cell integrators and power-tool OEMs.' },
  { region: 'Middle East', detail: 'Energy storage integrators and industrial fabricators.' },
  { region: 'Europe', detail: 'EV module builders working to ASTM B16 / DIN 2.4068 specifications.' },
  { region: 'Africa', detail: 'Solar and off-grid storage assemblers sourcing in bulk.' },
  { region: 'North & South America', detail: 'Battery pack manufacturers and distributors.' },
];

/** What we supply into the Indian market - this page serves domestic bulk buyers too. */
export const INDIA_HIGHLIGHTS: ReadonlyArray<string> = [
  'PAN India dispatch from our Mumbai manufacturing unit',
  'GST invoicing with material test certificates on every lot',
  'Bulk and repeat-order pricing for Indian battery pack manufacturers',
  'Custom widths and thicknesses slit to your drawing',
];

export const EXPORT_HIGHLIGHTS: ReadonlyArray<string> = [
  'Export to 17+ countries with sea and air freight support',
  'EXW, FOB, CIF and CIP terms quoted on request',
  'Export-grade, moisture-protected packing for sea freight',
  'Full documentation set prepared for customs clearance',
];

/**
 * The forms we ship. Kept as its own list rather than parsed back out of the spec table
 * below, because it also becomes the OfferCatalog in this route's structured data - deriving
 * product names by splitting a prose string on ", " breaks the moment someone rewords it.
 */
export const EXPORT_PRODUCT_FORMS: ReadonlyArray<string> = [
  'Pure nickel strip',
  'H-type nickel strip',
  'Fuse-type / honeycomb nickel strip',
  'Zig-zag nickel strip',
  'Nickel coil',
  'Nickel busbar',
];

/** Specification range - mirrors the homepage specification table. */
export const EXPORT_SPECS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Purity', value: '99.8%+ pure nickel' },
  { label: 'Thickness', value: '0.10 - 0.50 mm' },
  { label: 'Width', value: '2 - 50 mm (custom slitting available)' },
  { label: 'Standards', value: 'ASTM B16 / UNS N02201 / DIN 2.4068' },
  { label: 'Forms', value: EXPORT_PRODUCT_FORMS.join(', ') },
  { label: 'Quality system', value: 'ISO 9001-compliant manufacturing, in-house slitting and QC' },
];

export const EXPORT_DOCUMENTS: ReadonlyArray<string> = [
  'Commercial invoice',
  'Packing list',
  'Certificate of Origin',
  'Mill Test Certificate (MTC) / material test report',
  'HS classification for the shipped grade',
  'Bill of Lading or Air Waybill',
  'Insurance certificate (on CIF / CIP terms)',
];

/**
 * HS headings for the goods we ship. 7506 covers nickel plates, sheets, strip and foil;
 * 7505 covers nickel bars, rods, profiles and wire. Unwrought nickel (7502) does not apply
 * to finished strip and is deliberately absent. Destination tariff lines still vary by
 * country - buyers should confirm the import line with their broker.
 */
export const HS_CODES: ReadonlyArray<{ code: string; covers: string }> = [
  {
    code: '7506.10',
    covers: 'Nickel (not alloyed) plates, sheets, strip and foil - pure nickel strip and busbar strip',
  },
  { code: '7506.20', covers: 'Nickel alloy plates, sheets, strip and foil' },
  { code: '7505.11', covers: 'Nickel (not alloyed) bars, rods and profiles - solid busbar sections' },
];

export const INCOTERMS: ReadonlyArray<string> = ['EXW', 'FOB', 'CIF', 'CIP'];

/** Port of loading for sea freight; air freight is used for samples and urgent lots. */
export const LOADING_PORTS = 'Nhava Sheva (JNPT) and Mumbai';

/**
 * `llms: true` marks the answers worth repeating in public/llms.txt. That file is a summary,
 * not a mirror - copying all seven would bury the rest of the catalogue, so only the two
 * questions an answer engine is actually asked ("do you export from India", "what HS code")
 * are flagged.
 */
export const EXPORT_FAQS: ReadonlyArray<{ question: string; answer: string; llms?: boolean }> = [
  {
    llms: true,
    question: 'Do you export nickel strip and nickel busbar from India?',
    answer:
      'Yes. Ramani Steel House manufactures nickel strip and nickel busbar in Mumbai, India and ' +
      'exports to 17+ countries, alongside PAN India supply. We are a manufacturer, not a ' +
      'reseller or distributor, so export orders ship from our own production and slitting lines.',
  },
  {
    llms: true,
    question: 'What is the HS code for nickel strip exported from India?',
    answer:
      'Pure nickel strip and busbar strip fall under HS 7506.10 (nickel, not alloyed - plates, ' +
      'sheets, strip and foil). Nickel alloy strip falls under 7506.20, and solid nickel bars, ' +
      'rods and profiles under 7505.11. Import tariff lines vary by destination, so confirm the ' +
      'exact line with your customs broker.',
  },
  {
    question: 'Which Incoterms and ports do you ship on?',
    answer:
      'We quote EXW, FOB, CIF and CIP. Sea freight loads at ' +
      LOADING_PORTS +
      ', and air freight is available for samples and urgent lots. The Incoterm you select on ' +
      'the enquiry form is priced into the quotation.',
  },
  {
    question: 'What is your minimum order quantity for export?',
    answer:
      'We support low minimum order quantities for trial and qualification lots as well as bulk ' +
      'and repeat production volumes. The exact MOQ depends on the width, thickness and pattern ' +
      'you need and is confirmed with your quotation.',
  },
  {
    question: 'What export documentation do you provide?',
    answer:
      'Every export shipment is supported with a commercial invoice, packing list, Certificate of ' +
      'Origin, Mill Test Certificate, HS classification for the shipped grade, and the Bill of ' +
      'Lading or Air Waybill. An insurance certificate is included on CIF and CIP terms.',
  },
  {
    question: 'Do you supply nickel strip within India as well?',
    answer:
      'Yes. We dispatch PAN India from our Mumbai unit with GST invoicing and material test ' +
      'certificates on every lot, and offer bulk and repeat-order pricing to Indian battery pack ' +
      'manufacturers. Use the same form and select supply within India.',
  },
  {
    question: 'How quickly will I receive a quotation?',
    answer:
      'Our team responds to export and bulk enquiries within one business day. Lead times and ' +
      'freight cost are confirmed at the time of quotation, based on the specification, quantity ' +
      'and destination you provide.',
  },
];

/** Supply-region choice on the form; also segments the lead in CRM. */
export const SUPPLY_REGIONS = [
  { value: 'export', label: 'Export (outside India)', productName: 'Export Enquiry' },
  { value: 'india', label: 'Within India', productName: 'Domestic Bulk Enquiry' },
] as const;

export type SupplyRegion = (typeof SUPPLY_REGIONS)[number]['value'];
