import React from 'react';
import { Globe, Target, Gem, Factory } from 'lucide-react';

const keyPoints = [
  'Established in 1974 and built on decades of trusted supply relationships.',
  '100% family-owned partnership firm with a long-term, customer-first approach.',
  'Manufacturer of nickel strips used in lithium-ion batteries and energy storage packs.',
  'Serving customers across PAN India and selected international markets.',
];

const globalMarkets = [
  'Japan', 'Korea', 'China', 'Taiwan', 'Thailand', 'UAE',
  'Netherlands', 'Germany', 'Belgium', 'France', 'UK', 'Finland',
  'Italy', 'USA', 'Canada', 'New Zealand', 'Australia',
];

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#f6f8f9] text-[#304e58]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#304e58] to-[#3e6471]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-white/80">About Us</p>
          <h1 className="mt-4 text-3xl md:text-5xl font-display font-bold leading-tight">
            Trusted Stainless Steel and Nickel Alloy Partner Since 1974
          </h1>
          <p className="mt-5 max-w-3xl text-sm md:text-base text-white/90 leading-relaxed">
            We supply high-quality stainless steel and nickel alloy materials with reliable delivery, competitive pricing,
            and technical support. Our core focus includes nickel strips for lithium-ion battery applications.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyPoints.map((point) => (
            <div key={point} className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
              <p className="text-sm md:text-base leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#304e58]/10 text-[#304e58]">
              <Target size={20} />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">Our Vision</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To support customers in developing energy resources with world-class capability delivered locally and through
              practical, value-driven commercial partnerships.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#304e58]/10 text-[#304e58]">
              <Gem size={20} />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">Our Mission</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To deliver technically sound solutions, create mutual value, and remain a preferred stockist, supplier,
              and manufacturing partner for industrial and battery-focused materials.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#304e58]/10 text-[#304e58]">
              <Factory size={20} />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">What We Manufacture</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We manufacture nickel strips used in lithium-ion battery cells and packs, designed for consistent performance,
              reliable conductivity, and scalable supply.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#304e58]">
            <Globe size={20} />
            <h2 className="text-xl md:text-2xl font-display font-bold">PAN India Presence with Global Reach</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            We serve customers across India and maintain trusted business relationships with buyers and suppliers in multiple international markets.
          </p>
          <p className="mt-4 text-sm text-slate-700 leading-relaxed">
            {globalMarkets.join(' | ')}
          </p>
        </div>
      </section>
    </div>
  );
};
