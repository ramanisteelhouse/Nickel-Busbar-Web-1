import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Copy, Download, RefreshCcw, Plus, Trash2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { encodePathSegment, logCallClick } from '../lib/utils';
import type { BlogPost } from '../types';

interface MaterialOption {
  name: string;
  density: number;
  description: string;
}

interface BatchRow {
  id: string;
  thickness: string;
  width: string;
  length: string;
  quantity: string;
  material: string;
}

interface SavedCalculation {
  id: string;
  label: string;
  totalKg: number;
  createdAt: string;
}

const materialOptions: MaterialOption[] = [
  { name: 'Nickel 200', density: 8.89, description: 'High-purity nickel for corrosion resistance and conductivity.' },
  { name: 'Nickel 201', density: 8.89, description: 'Lower carbon nickel for improved weldability in battery tabs.' },
  { name: 'Pure Nickel', density: 8.90, description: 'Premium nickel grade for high-conductivity battery busbars.' },
  { name: 'Nickel Plated Steel', density: 7.85, description: 'Cost-effective plated steel with nickel surface conduction.' },
  { name: 'Nickel Alloy', density: 8.50, description: 'Alloyed nickel for stronger structural strip and busbar applications.' },
];

const shapeOptions = ['Strip', 'Sheet / Plate', 'Foil', 'Busbar', 'Wire', 'Coil'];

const faqItems = [
  {
    question: 'How to calculate nickel strip weight?',
    answer: 'Multiply thickness, width, length, density and quantity. Convert each dimension to centimeters before applying density in g/cm³.',
  },
  {
    question: 'What is the density of Nickel 200?',
    answer: 'Nickel 200 has a density of approximately 8.89 g/cm³, widely used for battery tabs and connectors.',
  },
  {
    question: 'How much does 0.15mm nickel strip weigh?',
    answer: 'Weight depends on width, length and quantity. A 0.15mm × 8mm × 100mm strip at 8.89 g/cm³ weighs roughly 1.07 grams per piece.',
  },
  {
    question: 'What is the weight formula for nickel strips?',
    answer: 'Weight = Thickness × Width × Length × Density × Quantity, with dimensions converted to cm first.',
  },
  {
    question: 'I know the total weight in kg — how do I find the length or width?',
    answer: 'Use the "Solve for" selector in Simple mode. Choose Length or Width, enter your known weight in kg plus the other two dimensions and quantity, and the calculator rearranges the weight formula to solve for the missing value.',
  },
];

type SolveTarget = 'weight' | 'thickness' | 'width' | 'length' | 'quantity';

const solveTargetLabels: Record<SolveTarget, string> = {
  weight: 'Weight',
  thickness: 'Thickness',
  width: 'Width',
  length: 'Length',
  quantity: 'Quantity',
};

const formatValue = (value: number) => (Number.isFinite(value) ? Number(value.toFixed(3)) : 0);

const parseNumber = (value: string) => {
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const dimensionToCm = (value: number, unit: 'mm' | 'inch') => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return unit === 'mm' ? value / 10 : value * 2.54;
};

const cmToDimension = (valueCm: number, unit: 'mm' | 'inch') => {
  if (!Number.isFinite(valueCm) || valueCm <= 0) return 0;
  return unit === 'mm' ? valueCm * 10 : valueCm / 2.54;
};

const calculateWeightGrams = (thickness: number, width: number, length: number, density: number, quantity: number, unit: 'mm' | 'inch') => {
  const t = dimensionToCm(thickness, unit);
  const w = dimensionToCm(width, unit);
  const l = dimensionToCm(length, unit);
  if (!t || !w || !l || !Number.isFinite(density) || density <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }
  return t * w * l * density * quantity;
};

interface SolveInputs {
  target: SolveTarget;
  thickness: number;
  width: number;
  length: number;
  quantity: number;
  density: number;
  weightGrams: number;
  unit: 'mm' | 'inch';
}

interface SolveResult {
  weightGrams: number;
  thickness: number;
  width: number;
  length: number;
  quantity: number;
  isValid: boolean;
}

/** Weight(g) = Thickness(cm) x Width(cm) x Length(cm) x Density(g/cm3) x Quantity — solved for whichever field is the target. */
const solveNickelCalculation = (inputs: SolveInputs): SolveResult => {
  const { target, unit, density } = inputs;
  const t = dimensionToCm(inputs.thickness, unit);
  const w = dimensionToCm(inputs.width, unit);
  const l = dimensionToCm(inputs.length, unit);
  const q = inputs.quantity;
  const weightG = inputs.weightGrams;
  const hasDensity = Number.isFinite(density) && density > 0;

  const empty: SolveResult = { weightGrams: 0, thickness: 0, width: 0, length: 0, quantity: 0, isValid: false };
  if (!hasDensity) return empty;

  if (target === 'weight') {
    if (!t || !w || !l || !q || q <= 0) return empty;
    return { weightGrams: t * w * l * density * q, thickness: inputs.thickness, width: inputs.width, length: inputs.length, quantity: q, isValid: true };
  }

  if (!weightG || weightG <= 0) return empty;

  if (target === 'thickness') {
    if (!w || !l || !q || q <= 0) return empty;
    const solvedCm = weightG / (w * l * density * q);
    return { weightGrams: weightG, thickness: cmToDimension(solvedCm, unit), width: inputs.width, length: inputs.length, quantity: q, isValid: solvedCm > 0 };
  }

  if (target === 'width') {
    if (!t || !l || !q || q <= 0) return empty;
    const solvedCm = weightG / (t * l * density * q);
    return { weightGrams: weightG, thickness: inputs.thickness, width: cmToDimension(solvedCm, unit), length: inputs.length, quantity: q, isValid: solvedCm > 0 };
  }

  if (target === 'length') {
    if (!t || !w || !q || q <= 0) return empty;
    const solvedCm = weightG / (t * w * density * q);
    return { weightGrams: weightG, thickness: inputs.thickness, width: inputs.width, length: cmToDimension(solvedCm, unit), quantity: q, isValid: solvedCm > 0 };
  }

  // target === 'quantity'
  if (!t || !w || !l) return empty;
  const solvedQuantity = weightG / (t * w * l * density);
  return { weightGrams: weightG, thickness: inputs.thickness, width: inputs.width, length: inputs.length, quantity: solvedQuantity, isValid: solvedQuantity > 0 };
};

const inputClass = 'w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-brand outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';
const selectClass = 'w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-brand outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

export const CalculatorPage: React.FC = () => {
  const [mode, setMode] = React.useState<'simple' | 'batch'>('simple');
  const [unit, setUnit] = React.useState<'mm' | 'inch'>('mm');
  const [selectedMaterial, setSelectedMaterial] = React.useState(materialOptions[0].name);
  const [materialSearch, setMaterialSearch] = React.useState('');
  const [shape, setShape] = React.useState(shapeOptions[0]);
  const [solveFor, setSolveFor] = React.useState<SolveTarget>('weight');
  const [thickness, setThickness] = React.useState('0.15');
  const [width, setWidth] = React.useState('8');
  const [length, setLength] = React.useState('100');
  const [quantity, setQuantity] = React.useState('10');
  const [targetWeightKg, setTargetWeightKg] = React.useState('1');
  const [customDensity, setCustomDensity] = React.useState('');
  const [copyMessage, setCopyMessage] = React.useState('');
  const [recentCalculations, setRecentCalculations] = React.useState<SavedCalculation[]>([]);
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [rows, setRows] = React.useState<BatchRow[]>([
    { id: 'row-1', thickness: '0.15', width: '8', length: '120', quantity: '10', material: materialOptions[0].name },
  ]);

  const filteredMaterials = React.useMemo(() => {
    const query = materialSearch.trim().toLowerCase();
    if (!query) return materialOptions;
    return materialOptions.filter((option) => option.name.toLowerCase().includes(query) || option.description.toLowerCase().includes(query));
  }, [materialSearch]);

  const selectedDensity = React.useMemo(() => {
    if (customDensity.trim()) {
      const custom = Number(customDensity);
      return Number.isFinite(custom) && custom > 0 ? custom : 0;
    }
    const material = materialOptions.find((option) => option.name === selectedMaterial);
    return material?.density ?? 0;
  }, [customDensity, selectedMaterial]);

  const simpleResult = React.useMemo(() => {
    return solveNickelCalculation({
      target: solveFor,
      thickness: parseNumber(thickness),
      width: parseNumber(width),
      length: parseNumber(length),
      quantity: parseNumber(quantity),
      density: selectedDensity,
      weightGrams: parseNumber(targetWeightKg) * 1000,
      unit,
    });
  }, [solveFor, thickness, width, length, quantity, selectedDensity, targetWeightKg, unit]);

  const batchWeightGrams = React.useMemo(() => {
    return rows.reduce((sum, row) => {
      const rowDensity = row.material === 'Custom Density' ? selectedDensity : materialOptions.find((option) => option.name === row.material)?.density ?? 0;
      return sum + calculateWeightGrams(parseNumber(row.thickness), parseNumber(row.width), parseNumber(row.length), rowDensity, parseNumber(row.quantity), unit);
    }, 0);
  }, [rows, selectedDensity, unit]);

  const activeWeightGrams = mode === 'simple' ? simpleResult.weightGrams : batchWeightGrams;
  const activeWeightKg = activeWeightGrams / 1000;
  const activeWeightTons = activeWeightKg / 1000;
  const activeWeightG = activeWeightGrams;

  const resolvedSimple = React.useMemo(() => ({
    thickness: solveFor === 'thickness' && simpleResult.isValid ? simpleResult.thickness : parseNumber(thickness),
    width: solveFor === 'width' && simpleResult.isValid ? simpleResult.width : parseNumber(width),
    length: solveFor === 'length' && simpleResult.isValid ? simpleResult.length : parseNumber(length),
    quantity: solveFor === 'quantity' && simpleResult.isValid ? simpleResult.quantity : parseNumber(quantity),
  }), [solveFor, simpleResult, thickness, width, length, quantity]);

  const livePreview = React.useMemo(() => {
    if (mode === 'batch' || solveFor === 'weight') {
      return { label: 'Total weight', value: `${formatValue(activeWeightKg)} kg`, valid: activeWeightGrams > 0 };
    }
    if (solveFor === 'quantity') {
      return { label: 'Pieces from target weight', value: simpleResult.isValid ? `${Math.floor(simpleResult.quantity)} pcs` : '—', valid: simpleResult.isValid };
    }
    const value = solveFor === 'thickness' ? simpleResult.thickness : solveFor === 'width' ? simpleResult.width : simpleResult.length;
    return { label: `${solveTargetLabels[solveFor]} from target weight`, value: simpleResult.isValid ? `${formatValue(value)} ${unit}` : '—', valid: simpleResult.isValid };
  }, [mode, solveFor, activeWeightKg, activeWeightGrams, simpleResult, unit]);

  const saveCalculation = () => {
    const label = mode === 'simple'
      ? solveFor === 'weight'
        ? `${selectedMaterial} • ${thickness}${unit} x ${width}${unit} x ${length}${unit} × ${quantity}`
        : `${selectedMaterial} • Solved ${solveTargetLabels[solveFor]} from ${formatValue(parseNumber(targetWeightKg))}kg`
      : `Batch calculation • ${rows.length} row(s)`;
    const next: SavedCalculation = {
      id: crypto.randomUUID?.() ?? `calc-${Date.now()}`,
      label,
      totalKg: Number(activeWeightKg.toFixed(3)),
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...recentCalculations].slice(0, 5);
    setRecentCalculations(updated);
    window.localStorage.setItem('nickel-calculator-recent', JSON.stringify(updated));
    setCopyMessage('Calculation saved to recent results');
    window.setTimeout(() => setCopyMessage(''), 2200);
  };

  React.useEffect(() => {
    const stored = window.localStorage.getItem('nickel-calculator-recent');
    if (stored) {
      try {
        const parsed: SavedCalculation[] = JSON.parse(stored);
        setRecentCalculations(Array.isArray(parsed) ? parsed : []);
      } catch {
        setRecentCalculations([]);
      }
    }
  }, []);

  React.useEffect(() => {
    let isActive = true;
    fetch('/api/blog-posts?limit=3')
      .then((res) => {
        if (!res.ok) throw new Error('Blog load failed');
        return res.json();
      })
      .then((data) => {
        if (!isActive) return;
        if (Array.isArray(data)) setBlogPosts(data);
      })
      .catch(() => {
        if (!isActive) return;
        setBlogPosts([]);
      });
    return () => { isActive = false; };
  }, []);

  const copyResults = async () => {
    const solvedLine = mode === 'simple' && solveFor !== 'weight'
      ? `\nSolved ${solveTargetLabels[solveFor]}: ${livePreview.value}`
      : '';
    const payload = `Nickel Alloy Weight Calculator result:\n${formatValue(activeWeightG)} g | ${formatValue(activeWeightKg)} kg | ${formatValue(activeWeightTons)} t${solvedLine}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopyMessage('Results copied to clipboard');
    } catch {
      setCopyMessage('Unable to copy. Please use browser copy.');
    }
    window.setTimeout(() => setCopyMessage(''), 2200);
  };

  const resetCalculator = () => {
    setMode('simple');
    setUnit('mm');
    setSelectedMaterial(materialOptions[0].name);
    setMaterialSearch('');
    setShape(shapeOptions[0]);
    setSolveFor('weight');
    setThickness('0.15');
    setWidth('8');
    setLength('100');
    setQuantity('10');
    setTargetWeightKg('1');
    setCustomDensity('');
    setRows([{ id: 'row-1', thickness: '0.15', width: '8', length: '120', quantity: '10', material: materialOptions[0].name }]);
    setCopyMessage('Calculator reset');
    window.setTimeout(() => setCopyMessage(''), 2200);
  };

  const addBatchRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        thickness: '0.15',
        width: '8',
        length: '120',
        quantity: '10',
        material: materialOptions[0].name,
      },
    ]);
  };

  const updateRow = (id: string, field: keyof BatchRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="bg-[#f6f8f9] text-brand">
      <Helmet>
        <title>Nickel Alloy Weight Calculator | Nickel Strip Weight Tool</title>
        <meta
          name="description"
          content="Calculate nickel strip and alloy weight instantly with a premium calculator built for battery, EV, and industrial manufacturing applications."
        />
        <link rel="canonical" href="https://www.nickelbusbar.com/calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Nickel Alloy Weight Calculator | Nickel Strip Weight Tool" />
        <meta property="og:description" content="Calculate nickel strip and alloy weight instantly with a premium calculator built for battery, EV, and industrial manufacturing applications." />
        <meta property="og:url" content="https://www.nickelbusbar.com/calculator" />
        <meta property="og:image" content="https://www.nickelbusbar.com/img/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nickel Alloy Weight Calculator | Nickel Strip Weight Tool" />
        <meta name="twitter:description" content="Calculate nickel strip and alloy weight instantly with a premium calculator built for battery, EV, and industrial manufacturing applications." />
        <meta name="twitter:image" content="https://www.nickelbusbar.com/img/logo.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Nickel Alloy Weight Calculator',
            description: 'A premium weight calculator for nickel strips, sheets, busbars, foil, wire and coil used in battery and industrial manufacturing.',
            brand: {
              '@type': 'Organization',
              name: 'Ramani Steel House',
              url: 'https://www.nickelbusbar.com',
            },
            url: 'https://www.nickelbusbar.com/calculator',
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          })}
        </script>
      </Helmet>

      <section className="pt-24 sm:pt-28 pb-12 sm:pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/40">
            <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Calculator Tool</p>
                <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-brand">Nickel Alloy Weight Calculator</h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                  Instantly calculate weight for nickel strips, sheets, busbars, foil, wire and coil in mm or inches. Built for battery pack engineers, EV manufacturers and industrial metal buyers.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={exportPdf}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand shadow-sm transition hover:border-brand hover:text-brand-dark"
                  >
                    <Download size={16} /> Export to PDF
                  </button>
                  <a
                    href="https://wa.me/918369724730"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logCallClick('+918369724730', 'calculator_whatsapp')}
                    className="inline-flex items-center gap-2 rounded-full border border-[#22C55E] bg-white px-5 py-3 text-sm font-semibold text-[#22C55E] shadow-sm transition hover:bg-[#ecfdf5]"
                  >
                    <MessageCircle size={16} /> WhatsApp Manufacturer
                  </a>
                </div>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-brand-surface to-white p-6 sm:p-8 shadow-inner border border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{livePreview.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-brand">{livePreview.value}</p>
                  </div>
                  <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand shadow-sm">
                    {mode === 'simple' ? 'Simple' : 'Batch'} Mode
                  </div>
                </div>
                <div className="mt-8 grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{mode === 'simple' && solveFor !== 'weight' ? 'Target weight used' : 'Total weight'}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-brand">
                        {formatValue(activeWeightG)} g
                      </div>
                      <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-brand">
                        {formatValue(activeWeightKg)} kg
                      </div>
                      <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-brand">
                        {formatValue(activeWeightTons)} t
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={copyResults}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
                    >
                      <Copy size={16} /> Copy Result
                    </button>
                    <button
                      type="button"
                      onClick={saveCalculation}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand shadow-sm transition hover:border-brand hover:text-brand-dark"
                    >
                      <Plus size={16} /> Save Calculation
                    </button>
                  </div>
                  {copyMessage ? (
                    <p className="text-sm text-brand">{copyMessage}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/40">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">Mode</div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setMode('simple')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'simple' ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:text-brand'}`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('batch')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'batch' ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:text-brand'}`}
                  >
                    Batch
                  </button>
                </div>
                <div className="ml-auto flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                  <span>Unit</span>
                  <button
                    type="button"
                    onClick={() => setUnit('mm')}
                    className={`rounded-full px-3 py-2 transition ${unit === 'mm' ? 'bg-brand text-white' : 'bg-white text-slate-600'}`}
                  >mm</button>
                  <button
                    type="button"
                    onClick={() => setUnit('inch')}
                    className={`rounded-full px-3 py-2 transition ${unit === 'inch' ? 'bg-brand text-white' : 'bg-white text-slate-600'}`}
                  >inch</button>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Material selection</label>
                    <input
                      type="search"
                      value={materialSearch}
                      onChange={(event) => setMaterialSearch(event.target.value)}
                      placeholder="Search materials"
                      className={inputClass}
                    />
                    <select
                      value={selectedMaterial}
                      onChange={(event) => setSelectedMaterial(event.target.value)}
                      className={selectClass}
                    >
                      {filteredMaterials.map((material) => (
                        <option key={material.name} value={material.name}>{material.name}</option>
                      ))}
                    </select>
                    <p className="text-sm text-slate-500">{materialOptions.find((option) => option.name === selectedMaterial)?.description}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Custom density (g/cm³)</label>
                    <input
                      type="text"
                      value={customDensity}
                      onChange={(event) => setCustomDensity(event.target.value)}
                      placeholder={String(selectedDensity)}
                      className={inputClass}
                    />
                    <p className="text-sm text-slate-500">Leave blank to use material density automatically.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Shape / product type</label>
                  <select
                    value={shape}
                    onChange={(event) => setShape(event.target.value)}
                    className={selectClass}
                  >
                    {shapeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {mode === 'simple' ? (
                  <>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">Solve for</label>
                      <p className="text-sm text-slate-500">Pick the value you want calculated — the other fields become your known inputs.</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(solveTargetLabels) as SolveTarget[]).map((target) => (
                          <button
                            key={target}
                            type="button"
                            onClick={() => setSolveFor(target)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${solveFor === target ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:text-brand'}`}
                          >
                            {solveTargetLabels[target]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {solveFor !== 'weight' && (
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Target weight (kg)</label>
                        <input
                          type="text"
                          value={targetWeightKg}
                          onChange={(event) => setTargetWeightKg(event.target.value)}
                          placeholder="1"
                          className={inputClass}
                        />
                        <p className="text-sm text-slate-500">Enter the known weight — {solveTargetLabels[solveFor].toLowerCase()} will be calculated from it.</p>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-3">
                        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                          Thickness
                          {solveFor === 'thickness' && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">Calculated</span>}
                        </label>
                        <input
                          type="text"
                          value={solveFor === 'thickness' ? (simpleResult.isValid ? String(formatValue(simpleResult.thickness)) : '') : thickness}
                          onChange={(event) => setThickness(event.target.value)}
                          placeholder="0.15"
                          readOnly={solveFor === 'thickness'}
                          className={`${inputClass} ${solveFor === 'thickness' ? 'bg-brand/5 font-semibold text-brand cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                          Width
                          {solveFor === 'width' && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">Calculated</span>}
                        </label>
                        <input
                          type="text"
                          value={solveFor === 'width' ? (simpleResult.isValid ? String(formatValue(simpleResult.width)) : '') : width}
                          onChange={(event) => setWidth(event.target.value)}
                          placeholder="8"
                          readOnly={solveFor === 'width'}
                          className={`${inputClass} ${solveFor === 'width' ? 'bg-brand/5 font-semibold text-brand cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                          Length
                          {solveFor === 'length' && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">Calculated</span>}
                        </label>
                        <input
                          type="text"
                          value={solveFor === 'length' ? (simpleResult.isValid ? String(formatValue(simpleResult.length)) : '') : length}
                          onChange={(event) => setLength(event.target.value)}
                          placeholder="100"
                          readOnly={solveFor === 'length'}
                          className={`${inputClass} ${solveFor === 'length' ? 'bg-brand/5 font-semibold text-brand cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                          Quantity
                          {solveFor === 'quantity' && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">Calculated</span>}
                        </label>
                        <input
                          type="text"
                          value={solveFor === 'quantity' ? (simpleResult.isValid ? String(Math.floor(simpleResult.quantity)) : '') : quantity}
                          onChange={(event) => setQuantity(event.target.value)}
                          placeholder="10"
                          readOnly={solveFor === 'quantity'}
                          className={`${inputClass} ${solveFor === 'quantity' ? 'bg-brand/5 font-semibold text-brand cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {rows.map((row, index) => (
                      <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Row {index + 1}</p>
                            <p className="text-sm text-slate-500">Use separate rows for different strip dimensions.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#c21f1f] shadow-sm transition hover:bg-slate-100 self-start sm:self-auto"
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Material</label>
                            <select
                              value={row.material}
                              onChange={(event) => updateRow(row.id, 'material', event.target.value)}
                              className={selectClass}
                            >
                              {materialOptions.map((material) => (
                                <option key={material.name} value={material.name}>{material.name}</option>
                              ))}
                              <option value="Custom Density">Custom Density</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Thickness</label>
                            <input
                              type="text"
                              value={row.thickness}
                              onChange={(event) => updateRow(row.id, 'thickness', event.target.value)}
                              placeholder="0.15"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Width</label>
                            <input
                              type="text"
                              value={row.width}
                              onChange={(event) => updateRow(row.id, 'width', event.target.value)}
                              placeholder="8"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Length</label>
                            <input
                              type="text"
                              value={row.length}
                              onChange={(event) => updateRow(row.id, 'length', event.target.value)}
                              placeholder="120"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Qty</label>
                            <input
                              type="text"
                              value={row.quantity}
                              onChange={(event) => updateRow(row.id, 'quantity', event.target.value)}
                              placeholder="10"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addBatchRow}
                      className="inline-flex items-center gap-2 rounded-full border border-dashed border-brand bg-white px-5 py-3 text-sm font-semibold text-brand shadow-sm transition hover:bg-brand-surface"
                    >
                      <Plus size={16} /> Add row
                    </button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current density</p>
                    <p className="mt-2 text-xl font-semibold text-brand">{selectedDensity ? `${selectedDensity} g/cm³` : 'Enter density'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Calculated volume</p>
                    <p className="mt-2 text-xl font-semibold text-brand">
                      {formatValue(mode === 'simple'
                        ? dimensionToCm(resolvedSimple.thickness, unit) * dimensionToCm(resolvedSimple.width, unit) * dimensionToCm(resolvedSimple.length, unit) * (resolvedSimple.quantity || 1)
                        : rows.reduce((sum, row) => sum + (dimensionToCm(parseNumber(row.thickness), unit) * dimensionToCm(parseNumber(row.width), unit) * dimensionToCm(parseNumber(row.length), unit) * parseNumber(row.quantity)), 0))} cm³
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{mode === 'simple' ? `Output — ${solveTargetLabels[solveFor]}` : 'Output'}</p>
                    <p className="mt-2 text-xl font-semibold text-brand">
                      {mode === 'batch' && `${formatValue(activeWeightG)} g`}
                      {mode === 'simple' && solveFor === 'weight' && `${formatValue(activeWeightG)} g`}
                      {mode === 'simple' && solveFor === 'thickness' && (simpleResult.isValid ? `${formatValue(simpleResult.thickness)} ${unit}` : '—')}
                      {mode === 'simple' && solveFor === 'width' && (simpleResult.isValid ? `${formatValue(simpleResult.width)} ${unit}` : '—')}
                      {mode === 'simple' && solveFor === 'length' && (simpleResult.isValid ? `${formatValue(simpleResult.length)} ${unit}` : '—')}
                      {mode === 'simple' && solveFor === 'quantity' && (simpleResult.isValid ? `${Math.floor(simpleResult.quantity)} pcs` : '—')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetCalculator}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand shadow-sm transition hover:bg-slate-100"
                  >
                    <RefreshCcw size={16} /> Reset
                  </button>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
                  >
                    Request Quote
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="https://wa.me/918369724730"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logCallClick('+918369724730', 'calculator_whatsapp')}
                    className="inline-flex items-center gap-2 rounded-full border border-[#22C55E] bg-white px-5 py-3 text-sm font-semibold text-[#22C55E] shadow-sm transition hover:bg-[#ecfdf5]"
                  >
                    <MessageCircle size={16} /> WhatsApp Manufacturer
                  </a>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/40">
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-br from-brand-surface to-white p-6 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand">Quick tips</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li>Use "Solve for" to work backwards — enter a target weight in kg and pick Thickness, Width, Length or Quantity to calculate it automatically.</li>
                    <li>Use mm for strip, sheet and foil work. Switch to inches for export drawings.</li>
                    <li>Custom density helps with nickel-plated, alloy or mixed material calculations.</li>
                    <li>Save repeated builds to recent results for fast quoting.</li>
                    <li>Use batch mode to compare multiple strip dimensions in a single estimate.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent calculations</p>
                  {recentCalculations.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No saved calculations yet. Save your first result to show recent estimates here.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {recentCalculations.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-brand">{item.label}</p>
                            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{item.totalKg} kg</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand">Dynamic insights</p>
                  <p className="mt-3 text-sm text-slate-700">Latest nickel strip and battery assembly articles load automatically from the site blog database.</p>
                  <div className="mt-5 space-y-3">
                    {blogPosts.length === 0 ? (
                      <p className="text-sm text-slate-500">Loading blog posts…</p>
                    ) : (
                      blogPosts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/blog/${encodePathSegment(post.slug)}`}
                          className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-brand transition hover:border-brand hover:bg-brand-surface"
                        >
                          <p className="font-semibold">{post.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{post.excerpt}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 bg-white text-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-[#f6f8f9] p-6 sm:p-10 shadow-xl shadow-slate-200/40">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">How to use</p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-display font-bold text-brand">What is Nickel Strip Weight Calculator?</h2>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  This calculator helps manufacturing teams estimate the weight of nickel strips, sheets, busbars and coils based on thickness, width, length, density and quantity.
                </p>
                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <p><strong>Weight formula:</strong> Weight = Thickness × Width × Length × Density × Quantity.</p>
                  <p><strong>Unit conversion:</strong> If using mm, convert dimensions to cm by dividing by 10. If using inches, multiply by 2.54.</p>
                  <p><strong>Density:</strong> Nickel 200 and Nickel 201 use 8.89 g/cm³. Nickel Plated Steel uses 7.85 g/cm³, and custom density can be entered for special alloys.</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-brand">Nickel strip applications</h3>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    <li>Battery tab and connector fabrication for lithium-ion cells.</li>
                    <li>EV battery module busbars and high-current connectors.</li>
                    <li>Industrial plating, foil manufacturing and welded assemblies.</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-brand">Battery pack applications</h3>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    <li>18650 and 21700 cell seams, tabs and interconnects.</li>
                    <li>EV and ESS busbar networks where precise weight matters.</li>
                    <li>Custom stack and module designs used in manufacturing quotes.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 bg-[#f6f8f9] text-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/40">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">FAQ</p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-display font-bold text-brand">Common Nickel Strip Weight Questions</h2>
                <div className="mt-8 space-y-4 text-sm text-slate-600">
                  {faqItems.map((faq) => (
                    <details key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <summary className="cursor-pointer font-semibold text-brand">{faq.question}</summary>
                      <p className="mt-3">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-brand">Calculator highlights</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li>Live calculation updates while typing for instant quoting.</li>
                  <li>Batch row support for multiple products and dimensions.</li>
                  <li>Export estimates to PDF and save recent calculations locally.</li>
                  <li>Built for engineering teams, battery OEMs, and nickel strip manufacturers.</li>
                </ul>
                <div className="mt-8 space-y-4">
                  <Link
                    to="/products?search=nickel"
                    className="inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
                  >
                    Browse Nickel Products
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex w-full items-center justify-center rounded-full border border-brand bg-white px-6 py-4 text-sm font-semibold text-brand shadow-sm transition hover:bg-slate-100"
                  >
                    Contact Manufacturer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
