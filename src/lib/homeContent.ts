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
 * here may import React or lucide-react. HomePage.tsx attaches its icons by `title`.
 */

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
  { title: '52 Years Manufacturing Experience', detail: 'Legacy of metallurgical excellence and precision engineering.' },
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
  { label: 'Nickel Purity', value: '99.6% - 99.8%' },
  { label: 'Thickness Range', value: '0.10mm – 0.50mm' },
  { label: 'Width Range', value: '2mm – 50mm' },
  { label: 'Surface Finish', value: 'Bright, matte, nickel-plated' },
  { label: 'Typical Use', value: 'Battery tabs, busbars, welding strips' },
] as const;

export const productVariants = [
  {
    title: 'Pure Nickel Strips',
    spec: '99.6-99.8% purity | 0.10mm - 0.50mm',
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
