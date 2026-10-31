import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { cn, logCallClick } from '../lib/utils';
import { PRIMARY_WHATSAPP, buildWhatsAppUrl } from '../lib/contact';
import { STANDARD_THICKNESSES_MM, THICKNESS_RANGE_MM } from '../lib/stripSizes';

/**
 * Nickel strip weight calculator.
 *
 * Rebuilt to do one job clearly. The previous page offered batch mode, PDF export, copy, reset,
 * recent calculations, a material search box over five options, tonnes, two WhatsApp buttons,
 * two result cards, a blog feed and three lists of "highlights" — and a "Shape" selector that
 * fed into nothing at all. Every one of those competed with the two things a visitor comes for:
 * type a size, read a weight. What remains is the formula, the four questions buyers actually
 * ask of it (weight, length, thickness, pieces), and a way to turn the answer into a quote.
 *
 * Added, because they are what strip buyers ask for and the old page never showed: weight per
 * metre, weight per piece, and how much of this size the 5 kg minimum order comes to.
 */

type Unit = 'mm' | 'inch';
type SolveTarget = 'weight' | 'length' | 'thickness' | 'quantity';

const MATERIALS = [
  { id: 'nickel', label: 'Pure nickel (Nickel 200 / 201)', density: 8.89 },
  { id: 'plated', label: 'Nickel-plated steel', density: 7.85 },
  { id: 'custom', label: 'Other (enter density)', density: 0 },
] as const;
type MaterialId = (typeof MATERIALS)[number]['id'];

const TARGETS: ReadonlyArray<{ id: SolveTarget; label: string }> = [
  { id: 'weight', label: 'Weight' },
  { id: 'length', label: 'Length' },
  { id: 'thickness', label: 'Thickness' },
  { id: 'quantity', label: 'Pieces' },
];

/** Confirmed minimum order; see MINIMUM_ORDER_QUANTITY in lib/productSpecs. */
const MOQ_KG = 5;

const faqItems = [
  {
    question: 'How do I calculate nickel strip weight?',
    answer:
      'Weight = Thickness × Width × Length × Density × Quantity, with every dimension converted to centimetres first. Pure nickel is 8.89 g/cm³. For example, a 0.15 mm × 8 mm × 100 mm strip weighs about 1.07 g.',
  },
  {
    question: 'What is the density of Nickel 200 and Nickel 201?',
    answer: 'Both are about 8.89 g/cm³. Nickel-plated steel is about 7.85 g/cm³.',
  },
  {
    question: 'How many metres of nickel strip are in 1 kg?',
    answer:
      'It depends on thickness and width. 0.15 mm × 8 mm pure nickel weighs about 10.7 g per metre, so 1 kg is roughly 94 metres. Choose "Length" above and enter your size to get the exact figure.',
  },
  {
    question: 'I know the weight in kg. How do I find the length, thickness or number of pieces?',
    answer:
      'Choose what you want to find at the top of the calculator, enter the total weight in kg and the other dimensions, and the calculator rearranges the formula for you.',
  },
];

const parseNumber = (value: string) => {
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const toCm = (value: number, unit: Unit) => (unit === 'mm' ? value / 10 : value * 2.54);
const fromCm = (value: number, unit: Unit) => (unit === 'mm' ? value * 10 : value / 2.54);

/** Rounds for display without trailing zeros: 1.0700 -> "1.07", 94.2857 -> "94.29". */
const fmt = (value: number, digits = 2) =>
  Number.isFinite(value) && value > 0 ? Number(value.toFixed(digits)).toLocaleString('en-IN') : '—';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-brand outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20';

/**
 * Thicknesses actually supplied, offered as one tap each.
 *
 * Strip is made to order and the field still accepts anything, but a buyer rarely wants an
 * arbitrary gauge: most orders are 0.12 mm or 0.15 mm and the rest are almost always another
 * value from this list. Typing "0.15" is not hard; knowing that 0.15 is a normal thing to ask
 * for is the part the page can answer.
 *
 * Only in mm. These are millimetre stock sizes, and rendering them as 0.0059 in would be
 * offering a number nobody orders by.
 */
const ThicknessPresets: React.FC<{ value: string; onPick: (value: string) => void }> = ({ value, onPick }) => (
  <div className="mt-2 flex flex-wrap gap-1.5">
    {STANDARD_THICKNESSES_MM.map((preset) => (
      <button
        key={preset}
        type="button"
        onClick={() => onPick(preset)}
        aria-pressed={parseNumber(value) === parseNumber(preset)}
        className={cn(
          'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
          parseNumber(value) === parseNumber(preset)
            ? 'bg-brand text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        )}
      >
        {preset}
      </button>
    ))}
  </div>
);

const Field: React.FC<{
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ id, label, suffix, value, onChange }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, 'pr-14')}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>
    </div>
  </div>
);

export const CalculatorPage: React.FC = () => {
  const [target, setTarget] = React.useState<SolveTarget>('weight');
  const [unit, setUnit] = React.useState<Unit>('mm');
  const [materialId, setMaterialId] = React.useState<MaterialId>('nickel');
  const [customDensity, setCustomDensity] = React.useState('');
  const [thickness, setThickness] = React.useState('0.15');
  const [width, setWidth] = React.useState('8');
  const [length, setLength] = React.useState('100');
  const [quantity, setQuantity] = React.useState('10');
  const [totalKg, setTotalKg] = React.useState('1');

  /**
   * Switching units converts what is typed, so the physical size stays the same. Relabelling
   * alone would silently turn "0.15 mm" into "0.15 inch" — a 25× thicker strip and a weight
   * hundreds of times larger, with nothing on screen to say why.
   */
  const changeUnit = (next: Unit) => {
    if (next === unit) return;
    const factor = next === 'inch' ? 1 / 25.4 : 25.4;
    const convert = (value: string) => {
      const n = parseNumber(value);
      return n ? String(Number((n * factor).toFixed(next === 'inch' ? 5 : 3))) : value;
    };
    setThickness(convert);
    setWidth(convert);
    setLength(convert);
    setUnit(next);
  };

  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];
  const density = materialId === 'custom' ? parseNumber(customDensity) : material.density;

  /**
   * Weight (g) = t(cm) × w(cm) × l(cm) × density × pieces, solved for whichever of the four is
   * the target. Every other value is taken as entered.
   */
  const result = React.useMemo(() => {
    const t = toCm(parseNumber(thickness), unit);
    const w = toCm(parseNumber(width), unit);
    const l = toCm(parseNumber(length), unit);
    const q = parseNumber(quantity);
    const grams = parseNumber(totalKg) * 1000;
    const none = { ok: false, t, w, l, q, grams: 0 };
    if (!density) return none;

    switch (target) {
      case 'weight':
        return t && w && l && q ? { ok: true, t, w, l, q, grams: t * w * l * density * q } : none;
      case 'length':
        return t && w && q && grams ? { ok: true, t, w, l: grams / (t * w * density * q), q, grams } : none;
      case 'thickness':
        return w && l && q && grams ? { ok: true, t: grams / (w * l * density * q), w, l, q, grams } : none;
      case 'quantity':
        return t && w && l && grams ? { ok: true, t, w, l, q: grams / (t * w * l * density), grams } : none;
    }
  }, [target, thickness, width, length, quantity, totalKg, unit, density]);

  // Per-metre and per-piece figures need only the cross-section, so they show whenever
  // thickness and width are known — including while solving for length or pieces.
  const gramsPerMetre = result.t && result.w && density ? result.t * result.w * 100 * density : 0;
  const gramsPerPiece = gramsPerMetre && result.l ? (gramsPerMetre * result.l) / 100 : 0;
  const totalKgResult = result.ok ? result.grams / 1000 : 0;

  const headline = (() => {
    if (!result.ok) return { label: 'Enter your size', value: '—' };
    switch (target) {
      case 'weight':
        // Under a kilogram, grams read better than "0.011 kg".
        return {
          label: 'Total weight',
          value: totalKgResult < 1 ? `${fmt(result.grams)} g` : `${fmt(totalKgResult, 3)} kg`,
        };
      case 'length':
        return { label: 'Length of each piece', value: `${fmt(fromCm(result.l, unit))} ${unit}` };
      case 'thickness':
        return { label: 'Thickness', value: `${fmt(fromCm(result.t, unit), 3)} ${unit}` };
      case 'quantity':
        return { label: 'Number of pieces', value: `${Math.floor(result.q).toLocaleString('en-IN')} pcs` };
    }
  })();

  /**
   * The nearest thickness actually supplied, when thickness is the answer.
   *
   * Solving for thickness gives a number like 0.1407 mm, which is arithmetically right and not
   * orderable: strip comes in the gauges in STANDARD_THICKNESSES_MM, and which one a customer
   * takes is a decision, not a rounding. So the exact figure stays the headline and this says
   * what it is nearest to, with the weight that gauge would actually give at the same size — the
   * number they would be quoted against.
   */
  const nearestStandard = (() => {
    if (target !== 'thickness' || !result.ok) return null;
    const exactMm = result.t * 10;
    const nearest = STANDARD_THICKNESSES_MM.reduce((best, candidate) =>
      Math.abs(Number(candidate) - exactMm) < Math.abs(Number(best) - exactMm) ? candidate : best
    );
    const nearestMm = Number(nearest);

    // Outside the range nickel strip is made in, there is no "nearest" worth naming. Solving
    // 0.5 kg across ten 8 x 100 mm pieces wants 7 mm, and answering that with "supplied as
    // 0.30 mm, 21 g at this size" sets a stock gauge beside a weight 23 times smaller and calls
    // it the nearest thing to what was asked for. The honest answer is that the inputs do not
    // describe a strip, so say which way they have to move.
    if (exactMm < THICKNESS_RANGE_MM.min || exactMm > THICKNESS_RANGE_MM.max) {
      return {
        kind: 'out-of-range' as const,
        tooThick: exactMm > THICKNESS_RANGE_MM.max,
      };
    }

    // Already on a stock gauge to three decimals: saying "nearest" would be noise.
    if (Math.abs(nearestMm - exactMm) < 0.0005) return null;
    const gramsAtNearest = (nearestMm / 10) * result.w * result.l * density * result.q;
    return {
      kind: 'nearest' as const,
      mm: nearest,
      kg: gramsAtNearest / 1000,
      grams: gramsAtNearest,
    };
  })();

  // What the 5 kg minimum amounts to at this cross-section, in the terms a buyer thinks in.
  const moqMetres = gramsPerMetre ? (MOQ_KG * 1000) / gramsPerMetre : 0;
  const belowMoq = result.ok && totalKgResult > 0 && totalKgResult < MOQ_KG;

  const sizeText = [
    result.t ? `${fmt(fromCm(result.t, unit), 3)} ${unit} thick` : '',
    result.w ? `${fmt(fromCm(result.w, unit))} ${unit} wide` : '',
  ]
    .filter(Boolean)
    .join(' × ');
  const quoteMessage = `Hello, I need a quote for ${material.id === 'custom' ? 'nickel strip' : material.label}: ${sizeText || 'size to confirm'}${
    result.ok ? `, about ${fmt(Math.max(totalKgResult, MOQ_KG), 2)} kg` : ''
  }. (From the weight calculator on nickelbusbar.com)`;

  // The field being solved for is the answer, so it is not also shown as an input.
  const showField = (field: SolveTarget) => target !== field;

  return (
    <div className="bg-[#f6f8f9] text-brand">
      <Helmet>
        <title>Free Nickel Strip & Alloy Weight Conversion Calculator</title>
        <meta
          name="description"
          content="Free calculator for nickel strip weight, thickness, width and length. Converts mm and inch, and solves for any dimension from a known weight."
        />
        <link rel="canonical" href="https://www.nickelbusbar.com/calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free Nickel Strip & Alloy Weight Conversion Calculator" />
        <meta
          property="og:description"
          content="Free calculator for nickel strip weight, thickness, width and length. Converts mm and inch, and solves for any dimension from a known weight."
        />
        <meta property="og:url" content="https://www.nickelbusbar.com/calculator" />
        <meta property="og:image" content="https://www.nickelbusbar.com/img/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        {/*
          No Product entity here: this is a free tool. The WebApplication with a zero-price Offer
          is published by STATIC_ROUTE_SEO["/calculator"] in seoSnapshot.ts and survives
          hydration, because this page publishes no WebApplication of its own.
        */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          })}
        </script>
      </Helmet>

      <section className="pt-28 pb-8 sm:pt-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">Nickel Strip Weight Calculator</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Enter a size to get the weight — or enter a weight to find the length, thickness or number of pieces.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-5">
          {/* Inputs */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">I want to find</p>
              <div className="inline-flex rounded-full bg-slate-100 p-1" role="group" aria-label="Units">
                {(['mm', 'inch'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={unit === option}
                    onClick={() => changeUnit(option)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold transition',
                      unit === option ? 'bg-white text-brand shadow-sm' : 'text-slate-500'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1" role="group" aria-label="What to calculate">
              {TARGETS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={target === option.id}
                  onClick={() => setTarget(option.id)}
                  className={cn(
                    // text-xs below sm: "Thickness" does not fit a quarter of a 375px card at text-sm.
                    'rounded-xl px-1 py-2 text-xs font-semibold transition sm:px-2 sm:text-sm',
                    target === option.id ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:text-brand'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="calc-material" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Material
                </label>
                <select
                  id="calc-material"
                  value={materialId}
                  onChange={(event) => setMaterialId(event.target.value as MaterialId)}
                  className={inputClass}
                >
                  {MATERIALS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                      {option.density ? ` — ${option.density} g/cm³` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {materialId === 'custom' ? (
                <div className="sm:col-span-2">
                  <Field id="calc-density" label="Density" suffix="g/cm³" value={customDensity} onChange={setCustomDensity} />
                </div>
              ) : null}

              {target !== 'weight' ? (
                <div className="sm:col-span-2">
                  <Field id="calc-total" label="Total weight" suffix="kg" value={totalKg} onChange={setTotalKg} />
                </div>
              ) : null}
              {showField('thickness') ? (
                <div>
                  <Field id="calc-thickness" label="Thickness" suffix={unit} value={thickness} onChange={setThickness} />
                  {unit === 'mm' ? <ThicknessPresets value={thickness} onPick={setThickness} /> : null}
                </div>
              ) : null}
              <Field id="calc-width" label="Width" suffix={unit} value={width} onChange={setWidth} />
              {showField('length') ? (
                <Field id="calc-length" label="Length of each piece" suffix={unit} value={length} onChange={setLength} />
              ) : null}
              {showField('quantity') ? (
                <Field id="calc-quantity" label="Number of pieces" suffix="pcs" value={quantity} onChange={setQuantity} />
              ) : null}
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-brand p-6 text-white shadow-lg sm:p-7 lg:sticky lg:top-28" aria-live="polite">
              <p className="text-sm text-white/70">{headline.label}</p>
              <p className="mt-1 text-4xl font-display font-bold tracking-tight">{headline.value}</p>

              {/* Strip is supplied in set gauges, so the exact figure above is the arithmetic and
                  this is what it means at the counter. The weight is recalculated at the stock
                  gauge, because that is the figure the order would actually be quoted against. */}
              {nearestStandard?.kind === 'nearest' ? (
                <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/80">
                  Supplied as{' '}
                  <strong className="font-semibold text-white">{nearestStandard.mm} mm</strong>, the nearest
                  standard thickness —{' '}
                  {nearestStandard.kg < 1
                    ? `${fmt(nearestStandard.grams)} g`
                    : `${fmt(nearestStandard.kg, 3)} kg`}{' '}
                  at this size.
                </p>
              ) : null}

              {nearestStandard?.kind === 'out-of-range' ? (
                <p className="mt-3 rounded-xl bg-amber-400/15 px-3 py-2 text-sm text-amber-100">
                  That is {nearestStandard.tooThick ? 'thicker' : 'thinner'} than nickel strip is made —
                  standard is {THICKNESS_RANGE_MM.min}–{THICKNESS_RANGE_MM.max} mm.{' '}
                  {nearestStandard.tooThick
                    ? 'For this weight you need more pieces, a wider strip or a longer cut.'
                    : 'For this weight you need fewer pieces, a narrower strip or a shorter cut.'}
                </p>
              ) : null}

              <dl className="mt-6 space-y-2 border-t border-white/15 pt-5 text-sm">
                {target !== 'weight' && result.ok ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/70">Total weight</dt>
                    <dd className="font-semibold">{fmt(totalKgResult, 3)} kg</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-white/70">Weight per metre</dt>
                  <dd className="font-semibold">{gramsPerMetre ? `${fmt(gramsPerMetre)} g/m` : '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/70">Weight per piece</dt>
                  <dd className="font-semibold">{gramsPerPiece ? `${fmt(gramsPerPiece, 3)} g` : '—'}</dd>
                </div>
              </dl>

              {moqMetres ? (
                <p className={cn('mt-5 rounded-xl px-3 py-2 text-xs', belowMoq ? 'bg-amber-300/20 text-amber-100' : 'bg-white/10 text-white/80')}>
                  {belowMoq ? 'Below our 5 kg minimum order. ' : 'Minimum order is 5 kg. '}
                  At this size, 5 kg is about {fmt(moqMetres, moqMetres < 10 ? 1 : 0)} {moqMetres >= 0.95 && moqMetres < 1.05 ? 'metre' : 'metres'}.
                </p>
              ) : null}

              <a
                href={buildWhatsAppUrl(quoteMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logCallClick(`+${PRIMARY_WHATSAPP.e164}`, 'calculator_whatsapp')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:bg-white/90"
              >
                <MessageCircle size={16} /> Get a price for this size
              </a>
              <Link
                to="/products"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-white/85 hover:text-white"
              >
                Browse nickel strip <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The explanatory copy and FAQ stay: they are what the page ranks on (566 impressions in
          Search Console), and they answer the question in text for anyone who will not type. */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-display font-bold">How the weight is calculated</h2>
            <p className="mt-4 text-slate-600">
              <strong className="text-brand">Weight = Thickness × Width × Length × Density × Quantity</strong>, with every
              dimension converted to centimetres first (mm ÷ 10, or inches × 2.54).
            </p>
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              <li>Pure nickel (Nickel 200 / 201): 8.89 g/cm³</li>
              <li>Nickel-plated steel: 7.85 g/cm³</li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              Nickel strip is priced per kilogram, so this weight is what a quotation is built from.{' '}
              <Link to="/h-type-nickel-strip" className="font-semibold text-brand underline underline-offset-2">
                H type nickel strip
              </Link>{' '}
              and plain strip are made in any size from 5 kg.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Common questions</h2>
            <div className="mt-4 space-y-3">
              {faqItems.map((faq) => (
                <details key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-semibold text-brand">{faq.question}</summary>
                  <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
