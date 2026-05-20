import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Copy, Download, RefreshCcw, Moon, Sun, Plus, Trash2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { encodePathSegment } from '../lib/utils';
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
];

const formatValue = (value: number) => (Number.isFinite(value) ? Number(value.toFixed(3)) : 0);

const parseNumber = (value: string) => {
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const dimensionToCm = (value: number, unit: 'mm' | 'inch') => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return unit === 'mm' ? value / 10 : value * 2.54;
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

export const CalculatorPage: React.FC = () => {
  const [mode, setMode] = React.useState<'simple' | 'batch'>('simple');
  const [unit, setUnit] = React.useState<'mm' | 'inch'>('mm');
  const [selectedMaterial, setSelectedMaterial] = React.useState(materialOptions[0].name);
  const [materialSearch, setMaterialSearch] = React.useState('');
  const [shape, setShape] = React.useState(shapeOptions[0]);
  const [thickness, setThickness] = React.useState('0.15');
  const [width, setWidth] = React.useState('8');
  const [length, setLength] = React.useState('100');
  const [quantity, setQuantity] = React.useState('10');
  const [customDensity, setCustomDensity] = React.useState('');
  const [isDarkMode, setIsDarkMode] = React.useState(false);
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

  const simpleWeightGrams = React.useMemo(() => {
    const t = parseNumber(thickness);
    const w = parseNumber(width);
    const l = parseNumber(length);
    const q = parseNumber(quantity);
    return calculateWeightGrams(t, w, l, selectedDensity, q, unit);
  }, [thickness, width, length, quantity, selectedDensity, unit]);

  const batchWeightGrams = React.useMemo(() => {
    return rows.reduce((sum, row) => {
      const rowDensity = row.material === 'Custom Density' ? selectedDensity : materialOptions.find((option) => option.name === row.material)?.density ?? 0;
      return sum + calculateWeightGrams(parseNumber(row.thickness), parseNumber(row.width), parseNumber(row.length), rowDensity, parseNumber(row.quantity), unit);
    }, 0);
  }, [rows, selectedDensity, unit]);

  const activeWeightGrams = mode === 'simple' ? simpleWeightGrams : batchWeightGrams;
  const activeWeightKg = activeWeightGrams / 1000;
  const activeWeightTons = activeWeightKg / 1000;
  const activeWeightG = activeWeightGrams;

  const saveCalculation = () => {
    const label = mode === 'simple'
      ? `${selectedMaterial} • ${thickness}${unit} x ${width}${unit} x ${length}${unit} × ${quantity}`
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
    const payload = `Nickel Alloy Weight Calculator result:\n${formatValue(activeWeightG)} g | ${formatValue(activeWeightKg)} kg | ${formatValue(activeWeightTons)} t`;
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
    setThickness('0.15');
    setWidth('8');
    setLength('100');
    setQuantity('10');
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
    <div className={isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-950'}>
      <Helmet>
        <title>Nickel Alloy Weight Calculator | Nickel Strip Weight Tool</title>
        <meta
          name="description"
          content="Calculate nickel strip and alloy weight instantly with a premium calculator built for battery, EV, and industrial manufacturing applications."
        />
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

      <section className={`pt-28 pb-16 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-[40px] border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-200/30 backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-700 shadow-slate-950/20' : ''}`}>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#304e58]">Calculator Tool</p>
                <h1 className="mt-3 text-4xl md:text-5xl font-display font-bold tracking-tight text-[#0b1e2d] dark:text-white">Nickel Alloy Weight Calculator</h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                  Instantly calculate weight for nickel strips, sheets, busbars, foil, wire and coil in mm or inches. Built for battery pack engineers, EV manufacturers and industrial metal buyers.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDarkMode((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5b72ff] to-[#8a5cff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5b72ff]/20 transition hover:scale-[1.01]"
                  >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {isDarkMode ? 'Light mode' : 'Dark mode'}
                  </button>
                  <button
                    type="button"
                    onClick={exportPdf}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#304e58] shadow-sm transition hover:border-[#314e58] hover:text-[#314e58]"
                  >
                    <Download size={16} /> Export to PDF
                  </button>
                </div>
              </div>
              <div className="rounded-[32px] bg-gradient-to-br from-[#f4f7ff] to-[#e4e9ff] p-8 shadow-xl shadow-[#304e5880] dark:from-slate-900 dark:to-slate-800 dark:shadow-slate-950/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Live Preview</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{formatValue(activeWeightKg)} kg</p>
                  </div>
                  <div className="rounded-3xl bg-white/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#304e58] shadow-sm dark:bg-slate-900/90">
                    {mode === 'simple' ? 'Simple' : 'Batch'} Mode
                  </div>
                </div>
                <div className="mt-8 grid gap-4">
                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Total weight</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="rounded-3xl bg-slate-100 p-4 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        {formatValue(activeWeightG)} g
                      </div>
                      <div className="rounded-3xl bg-slate-100 p-4 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        {formatValue(activeWeightKg)} kg
                      </div>
                      <div className="rounded-3xl bg-slate-100 p-4 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        {formatValue(activeWeightTons)} t
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={copyResults}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5b72ff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5b72ff]/20 transition hover:opacity-90"
                    >
                      <Copy size={16} /> Copy Result
                    </button>
                    <button
                      type="button"
                      onClick={saveCalculation}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#304e58] shadow-sm transition hover:border-[#314e58] hover:text-[#314e58]"
                    >
                      <Plus size={16} /> Save Calculation
                    </button>
                  </div>
                  {copyMessage ? (
                    <p className="text-sm text-[#304e58]">{copyMessage}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={isDarkMode ? 'rounded-[40px] border border-slate-700 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/40' : 'rounded-[40px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50'}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-[#304e58] dark:bg-slate-800 dark:text-slate-100">Mode</div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setMode('simple')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'simple' ? 'bg-gradient-to-r from-[#5b72ff] to-[#8a5cff] text-white shadow-lg shadow-[#5b72ff]/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'}`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('batch')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'batch' ? 'bg-gradient-to-r from-[#5b72ff] to-[#8a5cff] text-white shadow-lg shadow-[#5b72ff]/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'}`}
                  >
                    Batch
                  </button>
                </div>
                <div className="ml-auto flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <span>Unit</span>
                  <button
                    type="button"
                    onClick={() => setUnit('mm')}
                    className={`rounded-full px-3 py-2 transition ${unit === 'mm' ? 'bg-[#5b72ff] text-white' : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}
                  >mm</button>
                  <button
                    type="button"
                    onClick={() => setUnit('inch')}
                    className={`rounded-full px-3 py-2 transition ${unit === 'inch' ? 'bg-[#5b72ff] text-white' : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}
                  >inch</button>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Material selection</label>
                    <input
                      type="search"
                      value={materialSearch}
                      onChange={(event) => setMaterialSearch(event.target.value)}
                      placeholder="Search materials"
                      className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <select
                      value={selectedMaterial}
                      onChange={(event) => setSelectedMaterial(event.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {filteredMaterials.map((material) => (
                        <option key={material.name} value={material.name}>{material.name}</option>
                      ))}
                    </select>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{materialOptions.find((option) => option.name === selectedMaterial)?.description}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Custom density (g/cm³)</label>
                    <input
                      type="text"
                      value={customDensity}
                      onChange={(event) => setCustomDensity(event.target.value)}
                      placeholder={String(selectedDensity)}
                      className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Leave blank to use material density automatically.</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Shape / product type</label>
                    <select
                      value={shape}
                      onChange={(event) => setShape(event.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {shapeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Thickness</label>
                      <input
                        type="text"
                        value={thickness}
                        onChange={(event) => setThickness(event.target.value)}
                        placeholder="0.15"
                        className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Quantity</label>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        placeholder="10"
                        className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {mode === 'simple' ? (
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Width</label>
                      <input
                        type="text"
                        value={width}
                        onChange={(event) => setWidth(event.target.value)}
                        placeholder="8"
                        className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Length</label>
                      <input
                        type="text"
                        value={length}
                        onChange={(event) => setLength(event.target.value)}
                        placeholder="100"
                        className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rows.map((row, index) => (
                      <div key={row.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Row {index + 1}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Use separate rows for different strip dimensions.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#c21f1f] shadow-sm transition hover:bg-slate-100 dark:bg-slate-950 dark:text-[#fca5a5]"
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                        <div className="mt-5 grid gap-4 lg:grid-cols-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Material</label>
                            <select
                              value={row.material}
                              onChange={(event) => updateRow(row.id, 'material', event.target.value)}
                              className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                              {materialOptions.map((material) => (
                                <option key={material.name} value={material.name}>{material.name}</option>
                              ))}
                              <option value="Custom Density">Custom Density</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Thickness</label>
                            <input
                              type="text"
                              value={row.thickness}
                              onChange={(event) => updateRow(row.id, 'thickness', event.target.value)}
                              placeholder="0.15"
                              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Width</label>
                            <input
                              type="text"
                              value={row.width}
                              onChange={(event) => updateRow(row.id, 'width', event.target.value)}
                              placeholder="8"
                              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Length</label>
                            <input
                              type="text"
                              value={row.length}
                              onChange={(event) => updateRow(row.id, 'length', event.target.value)}
                              placeholder="120"
                              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Qty</label>
                            <input
                              type="text"
                              value={row.quantity}
                              onChange={(event) => updateRow(row.id, 'quantity', event.target.value)}
                              placeholder="10"
                              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#5b72ff] focus:ring-2 focus:ring-[#5b72ff]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addBatchRow}
                      className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#5b72ff] bg-white px-5 py-3 text-sm font-semibold text-[#304e58] shadow-sm transition hover:bg-[#eff3ff] dark:bg-slate-900 dark:text-slate-100"
                    >
                      <Plus size={16} /> Add row
                    </button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Current density</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{selectedDensity ? `${selectedDensity} g/cm³` : 'Enter density'}</p>
                  </div>
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Calculated volume</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{formatValue(mode === 'simple' ? dimensionToCm(parseNumber(thickness), unit) * dimensionToCm(parseNumber(width), unit) * dimensionToCm(parseNumber(length), unit) : rows.reduce((sum, row) => sum + (dimensionToCm(parseNumber(row.thickness), unit) * dimensionToCm(parseNumber(row.width), unit) * dimensionToCm(parseNumber(row.length), unit) * parseNumber(row.quantity)), 0))} cm³</p>
                  </div>
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Output</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{formatValue(activeWeightG)} g</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetCalculator}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#304e58] shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <RefreshCcw size={16} /> Reset
                  </button>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-[#5b72ff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5b72ff]/20 transition hover:opacity-95"
                  >
                    Request Quote
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="https://wa.me/918369724730"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#22C55E] bg-white px-5 py-3 text-sm font-semibold text-[#22C55E] shadow-sm transition hover:bg-[#ecfdf5]"
                  >
                    <MessageCircle size={16} /> WhatsApp Manufacturer
                  </a>
                </div>
              </div>
            </div>

            <aside className={isDarkMode ? 'rounded-[40px] border border-slate-700 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/40' : 'rounded-[40px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50'}>
              <div className="space-y-6">
                <div className="rounded-[32px] bg-gradient-to-br from-[#eef3ff] to-[#e3e8ff] p-6 shadow-sm dark:from-slate-800 dark:to-slate-900">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#304e58]">Quick tips</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <li>Use mm for strip, sheet and foil work. Switch to inches for export drawings.</li>
                    <li>Custom density helps with nickel-plated, alloy or mixed material calculations.</li>
                    <li>Save repeated builds to recent results for fast quoting.</li>
                    <li>Use batch mode to compare multiple strip dimensions in a single estimate.</li>
                  </ul>
                </div>
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Recent calculations</p>
                  {recentCalculations.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No saved calculations yet. Save your first result to show recent estimates here.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {recentCalculations.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                            <span className="rounded-full bg-[#5b72ff]/10 px-3 py-1 text-xs font-semibold text-[#304e58]">{item.totalKg} kg</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={isDarkMode ? 'rounded-[32px] border border-slate-700 bg-slate-950 p-6' : 'rounded-[32px] border border-slate-200 bg-white p-6'}>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#304e58]">Dynamic insights</p>
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Latest nickel strip and battery assembly articles load automatically from the site blog database.</p>
                  <div className="mt-5 space-y-3">
                    {blogPosts.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Loading blog posts…</p>
                    ) : (
                      blogPosts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/blog/${encodePathSegment(post.slug)}`}
                          className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 transition hover:border-[#5b72ff] hover:bg-[#f2f5ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <p className="font-semibold">{post.title}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{post.excerpt}</p>
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

      <section className="pb-20 bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[40px] border border-slate-200 bg-slate-50 p-10 shadow-2xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#304e58]">How to use</p>
                <h2 className="mt-3 text-3xl font-display font-bold text-[#304e58]">What is Nickel Strip Weight Calculator?</h2>
                <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                  This calculator helps manufacturing teams estimate the weight of nickel strips, sheets, busbars and coils based on thickness, width, length, density and quantity.
                </p>
                <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <p><strong>Weight formula:</strong> Weight = Thickness × Width × Length × Density × Quantity.</p>
                  <p><strong>Unit conversion:</strong> If using mm, convert dimensions to cm by dividing by 10. If using inches, multiply by 2.54.</p>
                  <p><strong>Density:</strong> Nickel 200 and Nickel 201 use 8.89 g/cm³. Nickel Plated Steel uses 7.85 g/cm³, and custom density can be entered for special alloys.</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-slate-950 dark:border dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-[#304e58]">Nickel strip applications</h3>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    <li>Battery tab and connector fabrication for lithium-ion cells.</li>
                    <li>EV battery module busbars and high-current connectors.</li>
                    <li>Industrial plating, foil manufacturing and welded assemblies.</li>
                  </ul>
                </div>
                <div className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-slate-950 dark:border dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-[#304e58]">Battery pack applications</h3>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
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

      <section className="pb-24 bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[40px] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#304e58]">FAQ</p>
                <h2 className="mt-3 text-3xl font-display font-bold text-[#304e58]">Common Nickel Strip Weight Questions</h2>
                <div className="mt-8 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  {faqItems.map((faq) => (
                    <details key={faq.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                      <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">{faq.question}</summary>
                      <p className="mt-3">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.3em] text-[#304e58]">Calculator highlights</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li>Live calculation updates while typing for instant quoting.</li>
                  <li>Batch row support for multiple products and dimensions.</li>
                  <li>Export estimates to PDF and save recent calculations locally.</li>
                  <li>Built for engineering teams, battery OEMs, and nickel strip manufacturers.</li>
                </ul>
                <div className="mt-8 space-y-4">
                  <Link
                    to="/products?search=nickel"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#5b72ff] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#5b72ff]/20 transition hover:opacity-95"
                  >
                    Browse Nickel Products
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex w-full items-center justify-center rounded-full border border-[#304e58] bg-white px-6 py-4 text-sm font-semibold text-[#304e58] shadow-sm transition hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-100"
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
