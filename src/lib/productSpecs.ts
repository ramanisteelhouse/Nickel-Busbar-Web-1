/**
 * The key-value specification table rendered on every product page.
 *
 * Marketplace listings (IndiaMART, TradeIndia) publish specs as a label/value table, and that
 * is the shape Google and answer engines lift a single attribute out of — "what thickness",
 * "what purity", "which cell format" — without having to parse prose. This builds the same
 * table from the columns we already store, deriving pattern and cell format from the product
 * name rather than asking anyone to re-enter them.
 *
 * Nothing here invents a value. A row whose value cannot be derived is omitted, because a spec
 * table that guesses is worse than a short one: it is the part of the page a buyer checks
 * against their drawing.
 */

/**
 * The measured purity of the nickel supplied, confirmed against the company's own IndiaMART
 * listing. The site previously published "99.6% - 99.8%", and before that "99.8%+", both of
 * which overstated it — this is the figure a buyer checks against their drawing, so it is the
 * worst place on the site to be optimistic.
 *
 * 99.2% is consistent with the grades the catalogue actually lists: ASTM B162/B16/B17 Nickel
 * 200 and 201 both specify 99.0% nickel minimum.
 */
export const NICKEL_PURITY_RANGE = '99.2% pure nickel';

/** Material test certificates are issued on request, not automatically with every despatch. */
export const MTC_AVAILABILITY = 'Material test certificate provided on request';

/**
 * Minimum order quantity, uniform across the catalogue.
 *
 * Confirmed at 5 kg, not the 15 kg on the IndiaMART listing. Supplying in smaller lots than the
 * mills is a stated differentiator, so this is a figure worth publishing rather than burying.
 */
export const MINIMUM_ORDER_QUANTITY = '5 kg';

/** Published on the company's IndiaMART listing; the same commitment applies here. */
export const DELIVERY_TIME = '7 days';

/** Ditto — export consignments are packed to standard export specification. */
export const PACKAGING = 'Standard export packing';

/**
 * The alloy grade, read off the UNS number already stored per product rather than fixed
 * site-wide.
 *
 * This matters: the IndiaMART listing quotes "Nickel 200", but 15 of the 17 catalogue items are
 * UNS N02201, which is Nickel 201. Publishing 200 across the site would misstate the grade on
 * almost every product — and grade is exactly what a buyer cross-checks against a drawing.
 */
function deriveGrade(unsValue?: string | null): string | null {
  const uns = (unsValue ?? '').toUpperCase();
  if (uns.includes('N02200')) return 'Nickel 200';
  if (uns.includes('N02201')) return 'Nickel 201';
  return null;
}

export type ProductSpecRow = { label: string; value: string };

export type ProductSpecInput = {
  name?: string | null;
  dimensions?: string | null;
  astm_value?: string | null;
  uns_value?: string | null;
};

/**
 * Whether this item is nickel at all. The catalogue includes a copper busbar (ASTM B187), and
 * tagging that with a nickel purity would be a false material claim on the one page where a
 * buyer is most likely to check it.
 */
export function isNickelProduct(product: ProductSpecInput): boolean {
  const haystack = `${product.name ?? ''} ${product.astm_value ?? ''} ${product.uns_value ?? ''}`.toLowerCase();
  if (/copper|astm\s*b187|c1[01]\d{3}/.test(haystack)) return false;
  return /nickel|\bni\b|n022\d\d|astm\s*b1[678]\b|astm\s*b162/.test(haystack);
}

/** "Thickness: 0.20mm, Width: 44mm, 19mm CD" -> { Thickness: "0.20mm", Width: "44mm" } */
function parseDimensions(dimensions?: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!dimensions) return out;
  for (const part of dimensions.split(',')) {
    const [rawLabel, ...rest] = part.split(':');
    if (!rest.length) continue;
    const label = rawLabel.trim();
    const value = rest.join(':').trim();
    if (label && value) out[label.toLowerCase()] = value;
  }
  return out;
}

/** H-Type / Zig-Zag / Honeycomb / Fuse-type, read off the product name. */
function derivePattern(name: string): string | null {
  const n = name.toLowerCase();
  const parts: string[] = [];
  if (/h[-\s]?type/.test(n)) parts.push('H-type');
  if (/zig[-\s]?zag/.test(n)) parts.push('Zig-zag');
  if (/honeycomb/.test(n)) parts.push('Honeycomb');
  if (/fuse/.test(n)) parts.push(/no\s*fuse/.test(n) ? 'No fuse' : 'Fuse-type');
  if (/plain/.test(n)) parts.push('Plain');
  return parts.length ? parts.join(', ') : null;
}

/** 18650 / 21700 / 32650 / 32700, read off the product name. */
function deriveCellFormat(name: string): string | null {
  const matches = [...name.matchAll(/\b(18650|21700|32650|32700)\b/g)].map((m) => m[1]);
  return matches.length ? [...new Set(matches)].join(', ') : null;
}

/** 2P / 3P / 4P parallel-group count, read off the product name. */
function deriveConfiguration(name: string): string | null {
  const match = name.match(/\b([234])P\b/i);
  return match ? `${match[1]}P` : null;
}

export function buildProductSpecs(product: ProductSpecInput): ProductSpecRow[] {
  const name = product.name ?? '';
  const dims = parseDimensions(product.dimensions);
  const nickel = isNickelProduct(product);

  const rows: Array<[string, string | null | undefined]> = [
    ['Material', nickel ? 'Pure nickel' : null],
    ['Grade', nickel ? deriveGrade(product.uns_value) : null],
    ['Purity', nickel ? NICKEL_PURITY_RANGE : null],
    // Silver is true of nickel and nickel-plated strip alike, and marketplace listings publish
    // it because buyers filter on it. Surface finish is deliberately absent: the catalogue is
    // supplied bright, matte and nickel-plated, and there is no per-product column saying
    // which — asserting "Bright" on all 17 would be a guess on the row most likely to be
    // checked against a sample.
    ['Colour', nickel ? 'Silver' : null],
    ['Thickness', dims.thickness],
    ['Width', dims.width],
    ['Cell format', deriveCellFormat(name)],
    ['Configuration', deriveConfiguration(name)],
    ['Pattern', derivePattern(name)],
    ['Standard', product.astm_value],
    ['UNS / DIN', product.uns_value],
    ['Minimum order', MINIMUM_ORDER_QUANTITY],
    ['Delivery time', DELIVERY_TIME],
    ['Packaging', PACKAGING],
    ['Test certificate', MTC_AVAILABILITY],
    ['Country of origin', 'India'],
  ];

  return rows
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([label, value]) => ({ label, value }));
}
