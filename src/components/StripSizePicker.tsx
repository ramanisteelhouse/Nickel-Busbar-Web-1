import React from 'react';
import { AlertTriangle, Ruler } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  CELL_FORMATS,
  STANDARD_THICKNESSES_MM,
  STRIP_FORMS,
  THICKNESS_RANGE_MM,
  WIDTH_RANGE_MM,
  checkSpec,
  type StripSpec,
} from '../lib/stripSpec';

/**
 * Asks the buyer for the size they actually want.
 *
 * The listed size is prefilled but never assumed: standard thicknesses are one tap, anything
 * else is typed in, and a width outside the listing is accepted and flagged as custom rather
 * than refused, because the business makes to order. Used on the product page before Add to
 * Cart, and in compact form on each cart line so an item added from the product grid can still
 * be given its size before checkout.
 */
type Props = {
  value: StripSpec;
  onChange: (next: StripSpec) => void;
  /** Show the blocking errors. Off until the buyer first tries to add, so the form does not open red. */
  showErrors?: boolean;
  compact?: boolean;
  /** Distinguishes the field ids when several pickers are on one page (the cart). */
  idPrefix?: string;
};

const chip = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
    active ? 'border-brand bg-brand text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-brand/50'
  );

const input =
  'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/20';

export const StripSizePicker: React.FC<Props> = ({ value, onChange, showErrors = false, compact = false, idPrefix = 'size' }) => {
  const set = <K extends keyof StripSpec>(key: K, next: StripSpec[K]) => onChange({ ...value, [key]: next });
  const isStandard = (STANDARD_THICKNESSES_MM as readonly string[]).includes(value.thickness);
  // Custom mode is sticky once chosen, and also entered automatically when a stored or listed
  // thickness is not one of the chips, so that value is visible and editable.
  const [customThickness, setCustomThickness] = React.useState(!!value.thickness && !isStandard);
  const { errors, warnings } = checkSpec(value);
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <fieldset className={cn('space-y-4', !compact && 'rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5')}>
      {!compact ? (
        <legend className="sr-only">Your size</legend>
      ) : null}
      {!compact ? (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Ruler size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Enter your size</p>
            <p className="text-xs text-zinc-500">
              Listed sizes are the most common. We also make any size to order, and develop tooling for new pack designs.
            </p>
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Thickness (mm)</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Thickness in millimetres">
          {STANDARD_THICKNESSES_MM.map((mm) => (
            <button
              key={mm}
              type="button"
              aria-pressed={!customThickness && value.thickness === mm}
              onClick={() => {
                setCustomThickness(false);
                set('thickness', mm);
              }}
              className={chip(!customThickness && value.thickness === mm)}
            >
              {mm}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={customThickness}
            onClick={() => {
              setCustomThickness(true);
              if (isStandard) set('thickness', '');
            }}
            className={chip(customThickness)}
          >
            Other
          </button>
        </div>
        {customThickness ? (
          <input
            id={id('thickness')}
            aria-label="Custom thickness in millimetres"
            inputMode="decimal"
            placeholder={`e.g. 0.18 (standard ${THICKNESS_RANGE_MM.min.toFixed(2)}–${THICKNESS_RANGE_MM.max.toFixed(2)})`}
            value={value.thickness}
            onChange={(event) => set('thickness', event.target.value)}
            className={cn(input, 'mt-2 max-w-xs')}
          />
        ) : null}
        {showErrors && errors.thickness ? <p className="mt-1 text-xs text-red-600">{errors.thickness}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id('width')} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Width (mm)
          </label>
          <input
            id={id('width')}
            inputMode="decimal"
            placeholder={`e.g. 8 (standard ${WIDTH_RANGE_MM.min}–${WIDTH_RANGE_MM.max})`}
            value={value.adviseWidth ? '' : value.width}
            disabled={value.adviseWidth}
            onChange={(event) => set('width', event.target.value)}
            className={cn(input, value.adviseWidth && 'bg-zinc-100 text-zinc-400')}
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={value.adviseWidth}
              onChange={(event) => set('adviseWidth', event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-brand"
            />
            Not sure? Recommend a width for my cells
          </label>
          {showErrors && errors.width ? <p className="mt-1 text-xs text-red-600">{errors.width}</p> : null}
        </div>

        <div>
          <label htmlFor={id('cell')} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Battery cell type
          </label>
          <select
            id={id('cell')}
            value={value.cellFormat}
            onChange={(event) => set('cellFormat', event.target.value)}
            className={input}
          >
            <option value="">Select cell type (optional)</option>
            {CELL_FORMATS.map((cell) => (
              <option key={cell} value={cell}>
                {cell}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Supplied as</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Supplied as">
          {STRIP_FORMS.map((form) => (
            <button
              key={form}
              type="button"
              aria-pressed={value.form === form}
              onClick={() => set('form', value.form === form ? '' : form)}
              className={chip(value.form === form)}
            >
              {form}
            </button>
          ))}
        </div>
        {value.form === 'Cut lengths' ? (
          <input
            id={id('length')}
            aria-label="Cut length in millimetres"
            inputMode="decimal"
            placeholder="Length of each piece in mm, e.g. 120"
            value={value.length}
            onChange={(event) => set('length', event.target.value)}
            className={cn(input, 'mt-2 max-w-xs')}
          />
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={value.customDesign}
            onChange={(event) => set('customDesign', event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-brand"
          />
          <span>
            <span className="font-semibold">New design or unique pack layout</span>
            <span className="block text-xs text-zinc-500">We make it to your drawing and develop the tooling.</span>
          </span>
        </label>
        {value.customDesign || value.notes ? (
          <textarea
            id={id('notes')}
            aria-label="Describe your design"
            rows={compact ? 2 : 3}
            maxLength={500}
            placeholder="Pitch, hole pattern, series/parallel layout… You can send the drawing on WhatsApp after you submit."
            value={value.notes}
            onChange={(event) => set('notes', event.target.value)}
            className={cn(input, 'mt-2')}
          />
        ) : null}
      </div>

      {warnings.length ? (
        <div className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
};
