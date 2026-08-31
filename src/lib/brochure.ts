/**
 * The company brochure, offered as a download across the site.
 *
 * Overseas buyers and procurement teams routinely ask for a company profile before they
 * enquire — it is the document that gets forwarded internally for approval — so the link
 * belongs on the pages where that decision happens (About, Contact, Export Enquiry) rather
 * than buried in a resources page.
 *
 * Kept in one module so the path, label and file size are stated once. The size is shown to
 * the visitor because the file is a 3.3MB download on a site whose buyers are often on mobile
 * data, and an unlabelled PDF link that stalls is worse than one that warns.
 */
export const BROCHURE = {
  path: '/docs/ramani-steel-house-company-brochure.pdf',
  label: 'Company brochure',
  /** Shown next to the link. Update if the file is replaced. */
  sizeLabel: 'PDF, 3.3 MB',
  /** What the brochure actually covers — used for the link's accessible description. */
  description:
    'Ramani Steel House company profile: product range, industries served, the Nippon Steel Stainless Corporation partnership, and contact details.',
} as const;
