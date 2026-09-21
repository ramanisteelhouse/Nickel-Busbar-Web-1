/**
 * The size a buyer actually wants, as opposed to the size a product happens to be listed at.
 *
 * The catalogue lists a handful of sizes, and most products record only a thickness
 * ("Thickness: 0.15mm") with no width or length at all. Until now a buyer could add
 * "Ni 18650 2P H-Type" to the cart and send it to WhatsApp and to quote_requests with no size
 * anywhere in the order — so every enquiry opened with a phone call to ask what they meant.
 * The business also makes to order: other thicknesses, other widths, new patterns, and the
 * tooling for battery packs with a unique layout. The listed size is a starting point, not a
 * constraint, and the order has to carry what the buyer chose.
 *
 * This module is the single definition of that choice. It is plain data with no React import,
 * because apiApp.ts reads it inside the Node serverless function to validate and store what the
 * browser sends.
 */
import { deriveCellFormat, parseDimensions } from './productSpecs.js';

export {
  CELL_FORMATS,
  STANDARD_THICKNESSES_MM,
  STRIP_FORMS,
  THICKNESS_RANGE_MM,
  WIDTH_RANGE_MM,
} from './stripSizes.js';
import { THICKNESS_RANGE_MM, WIDTH_RANGE_MM } from './stripSizes.js';

export type StripSpec = {
  /** Millimetres, as the buyer typed or chose it: "0.15". */
  thickness: string;
  /** Millimetres. Empty only when adviseWidth is set. */
  width: string;
  /** The buyer is not sure of the width and wants one recommended for their cells. */
  adviseWidth: boolean;
  form: string;
  /** Only meaningful for cut lengths, in millimetres. */
  length: string;
  cellFormat: string;
  /** A new design: a pattern or pack layout that needs tooling made for it. */
  customDesign: boolean;
  notes: string;
};

export const EMPTY_SPEC: StripSpec = {
  thickness: '',
  width: '',
  adviseWidth: false,
  form: '',
  length: '',
  cellFormat: '',
  customDesign: false,
  notes: '',
};

/** Bounds every free-text field before it reaches WhatsApp or the database. */
const MAX_FIELD = 40;
const MAX_NOTES = 500;

const clean = (value: unknown, max = MAX_FIELD) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';

/** "0.15mm", "0.15 mm", "0.15" -> "0.15"; anything unparseable -> "". */
function millimetres(raw?: string | null): string {
  const match = /(\d+(?:\.\d+)?)/.exec(raw ?? '');
  return match ? match[1] : '';
}

/** Two decimals for thickness, so "0.1" and "0.10" are the same chip and the same cart line. */
function normaliseThickness(raw: string): string {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n.toFixed(2) : raw;
}

/**
 * Coerces anything — a form state, a stored cart line, a request body — into a StripSpec.
 * Unknown fields are dropped and every string is trimmed and length-capped, so this is also the
 * server's sanitiser.
 */
export function normaliseSpec(input: unknown): StripSpec {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const thickness = clean(raw.thickness);
  return {
    thickness: thickness ? normaliseThickness(millimetres(thickness) || thickness) : '',
    width: millimetres(clean(raw.width)) || clean(raw.width),
    adviseWidth: raw.adviseWidth === true,
    form: clean(raw.form),
    length: clean(raw.length),
    cellFormat: clean(raw.cellFormat),
    customDesign: raw.customDesign === true,
    notes: clean(raw.notes, MAX_NOTES),
  };
}

/**
 * The starting point for a product's size picker: whatever the listing records, and nothing
 * invented. Most products record only a thickness, so width usually starts empty and the buyer
 * is asked for it.
 */
export function defaultSpecFor(product: { name?: string | null; dimensions?: string | null }): StripSpec {
  const dims = parseDimensions(product.dimensions);
  const thickness = millimetres(dims.thickness);
  // "Thickness: 0.1 mm to 1.0 mm" is a range, not a size — start blank rather than pick an end.
  const isRange = /\bto\b|–|-\s*\d/.test(dims.thickness ?? '');
  const cell = deriveCellFormat(product.name ?? '');
  return {
    ...EMPTY_SPEC,
    thickness: thickness && !isRange ? normaliseThickness(thickness) : '',
    width: millimetres(dims.width),
    cellFormat: cell && !cell.includes(',') ? cell : '',
  };
}

export type SpecCheck = {
  /** Errors block the order: without these the size is not actionable. */
  errors: { thickness?: string; width?: string };
  /** Warnings are shown but allowed: custom sizes are made to order. */
  warnings: string[];
};

export function checkSpec(spec: StripSpec): SpecCheck {
  const errors: SpecCheck['errors'] = {};
  const warnings: string[] = [];

  const thickness = Number(spec.thickness);
  if (!spec.thickness) errors.thickness = 'Choose or enter a thickness.';
  else if (!Number.isFinite(thickness) || thickness <= 0) errors.thickness = 'Enter the thickness in mm, e.g. 0.15.';
  else if (thickness < THICKNESS_RANGE_MM.min || thickness > THICKNESS_RANGE_MM.max) {
    warnings.push(
      `${spec.thickness} mm is outside the standard ${THICKNESS_RANGE_MM.min.toFixed(2)}–${THICKNESS_RANGE_MM.max.toFixed(2)} mm range. It will be reviewed as a custom size.`
    );
  }

  if (!spec.adviseWidth) {
    const width = Number(spec.width);
    if (!spec.width) errors.width = 'Enter a width, or tick "Recommend a width".';
    else if (!Number.isFinite(width) || width <= 0) errors.width = 'Enter the width in mm, e.g. 8.';
    else if (width < WIDTH_RANGE_MM.min || width > WIDTH_RANGE_MM.max) {
      warnings.push(
        `${spec.width} mm is outside the standard ${WIDTH_RANGE_MM.min}–${WIDTH_RANGE_MM.max} mm width. It will be reviewed as a custom size.`
      );
    }
  }

  return { errors, warnings };
}

export const isSpecComplete = (spec?: StripSpec | null) =>
  !!spec && Object.keys(checkSpec(spec).errors).length === 0;

/**
 * Identifies a cart line. The same product in two sizes is two lines, not one line with a
 * quantity of two, so the key is built from everything that changes what gets made.
 */
export function specKey(spec?: StripSpec | null): string {
  if (!spec) return '';
  const s = normaliseSpec(spec);
  return [
    s.thickness,
    s.adviseWidth ? 'advise' : s.width,
    s.form,
    s.form === 'Cut lengths' ? s.length : '',
    s.cellFormat,
    s.customDesign ? 'custom' : '',
  ]
    .join('|')
    .toLowerCase();
}

/** A cart line's identity: the product plus the size. */
export const cartLineKey = (item: { id: number; spec?: StripSpec | null }) => `${item.id}:${specKey(item.spec)}`;

/**
 * Whether a product takes the strip size picker. Nickel strip is made to thickness and width;
 * the copper busbar in the catalogue is a different product, sized differently, and asking for
 * a 0.10–0.30 mm strip thickness on it would be wrong. It keeps its enquiry-led flow.
 */
export { isNickelProduct as takesStripSize } from './productSpecs.js';

/** "0.15 mm × 8 mm · Coil · 18650 cells · New design / tooling" */
export function formatSpec(spec?: StripSpec | null): string {
  if (!spec) return 'Size not specified';
  const s = normaliseSpec(spec);
  const parts: string[] = [];
  const size = [
    s.thickness ? `${s.thickness} mm` : 'thickness ?',
    s.adviseWidth ? 'width to be recommended' : s.width ? `${s.width} mm` : 'width ?',
  ].join(' × ');
  parts.push(size);
  if (s.form) parts.push(s.form === 'Cut lengths' && s.length ? `Cut lengths of ${s.length} mm` : s.form);
  if (s.cellFormat) parts.push(/^\d/.test(s.cellFormat) ? `${s.cellFormat} cells` : s.cellFormat);
  if (s.customDesign) parts.push('New design / tooling');
  return parts.join(' · ');
}
