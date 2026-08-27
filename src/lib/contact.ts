/**
 * Single source of truth for public contact details.
 * Nothing in the app should hardcode a number or address - import from here so a
 * change lands everywhere at once, including the SEO structured data.
 */

export type ContactNumber = {
  e164: string;
  display: string;
  /** Whether this number is reachable on WhatsApp. */
  whatsapp: boolean;
};

export const PHONE_NUMBERS: readonly ContactNumber[] = [
  { e164: '918369724730', display: '+91 83697 24730', whatsapp: true },
  { e164: '918097653930', display: '+91 80976 53930', whatsapp: true },
  { e164: '918169182418', display: '+91 81691 82418', whatsapp: true },
] as const;

export const EMAIL_ADDRESSES = [
  'mayank@ramanisteel.com',
  'ramanioffice@gmail.com',
] as const;

/**
 * The registered office, in the field shape schema.org's PostalAddress expects.
 *
 * The SEO audit's Local SEO check reported the address as missing even though the footer
 * printed it: it was one unlabelled sentence with no markup, so nothing identified it as an
 * address. The footer now renders these fields with PostalAddress microdata, and the JSON-LD
 * in index.html and seoSnapshot.ts reads the same values, so the address a crawler extracts
 * from the page and the one it reads from the structured data cannot disagree.
 */
export const POSTAL_ADDRESS = {
  streetAddress: 'Marine Lines East',
  addressLocality: 'Mumbai',
  addressRegion: 'Maharashtra',
  postalCode: '400004',
  addressCountry: 'IN',
  countryName: 'India',
  /** "Marine Lines East, Mumbai, Maharashtra 400004, India" - for prose and one-line rendering. */
  get oneLine() {
    return `${this.streetAddress}, ${this.addressLocality}, ${this.addressRegion} ${this.postalCode}, ${this.countryName}`;
  },
} as const;

/**
 * The long-standing answered line. Kept as the target for click-to-call and for
 * the `telephone` field in structured data so search results stay stable.
 */
export const PRIMARY_CALL = PHONE_NUMBERS[0];

/** WhatsApp conversations route to the dedicated WhatsApp number. */
export const PRIMARY_WHATSAPP = PHONE_NUMBERS[1];

export const PRIMARY_EMAIL = EMAIL_ADDRESSES[0];

/** `+91 83697 24730` -> `+918369724730`, for tel: hrefs. */
export const telHref = (number: ContactNumber) => `tel:+${number.e164}`;

/** Builds a wa.me link, encoding the message text. */
export const buildWhatsAppUrl = (text: string, e164: string = PRIMARY_WHATSAPP.e164) =>
  `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;

/**
 * For callers that have already percent-encoded their message (the checkout RFQ
 * builds one with literal %0A line breaks), so it is not encoded twice.
 */
export const buildWhatsAppUrlPreEncoded = (
  encodedText: string,
  e164: string = PRIMARY_WHATSAPP.e164
) => `https://wa.me/${e164}?text=${encodedText}`;

/** "+91 83697 24730, +91 80976 53930 or +91 81691 82418" - for prose and emails. */
export const phoneListSentence = (conjunction = 'or') => {
  const list = PHONE_NUMBERS.map((n) => n.display);
  return `${list.slice(0, -1).join(', ')} ${conjunction} ${list[list.length - 1]}`;
};

export const emailListSentence = (conjunction = 'or') => EMAIL_ADDRESSES.join(` ${conjunction} `);
