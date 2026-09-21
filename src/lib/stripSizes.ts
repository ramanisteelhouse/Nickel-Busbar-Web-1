/**
 * The size vocabulary: standard thicknesses, published ranges, cell types and supply forms.
 *
 * Its own module, with no imports, because two modules need it and each already imports the
 * other's neighbour: stripSpec.ts (the buyer's chosen size) reads helpers from productSpecs.ts,
 * and productSpecs.ts (the spec table) lists these same sizes. Keeping the constants here means
 * neither has to import the other and there is no import cycle to reason about.
 */

/**
 * Offered as one-tap choices. 0.10, 0.12, 0.15 and 0.20 mm were named by the owner as the
 * standard run; 0.25 and 0.30 are included because the site already describes them as the
 * heavier welding gauges. Anything else is typed in as a custom thickness — the list is a
 * shortcut, never a limit.
 */
export const STANDARD_THICKNESSES_MM = ['0.10', '0.12', '0.15', '0.20', '0.25', '0.30'] as const;

/** The published range. A value outside it is accepted and flagged for review, not refused. */
export const THICKNESS_RANGE_MM = { min: 0.1, max: 0.5 } as const;
export const WIDTH_RANGE_MM = { min: 2, max: 50 } as const;

/**
 * Cell formats a buyer can pick. The catalogue itself covers 18650, 21700, 32650 and 32700, but
 * strip is cut to any cell pitch, so the list covers the formats pack builders actually use,
 * plus prismatic and pouch cells (which take tabs and busbars rather than patterned strip).
 */
export const CELL_FORMATS = [
  '14500',
  '18650',
  '21700',
  '26650',
  '32650',
  '32700',
  '4680',
  'Prismatic',
  'Pouch',
  'Other',
] as const;

export const STRIP_FORMS = ['Coil', 'Cut lengths', 'Pre-formed pattern'] as const;
