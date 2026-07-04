import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Globe, Target, Gem, Factory, Users, Battery, CalendarClock, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Years of Legacy', value: '50+' },
  { label: 'Founded', value: '1974' },
  { label: 'Export Markets', value: '17+' },
  { label: 'Family-Owned', value: '100%' },
];

const keyPoints = [
  {
    icon: CalendarClock,
    text: 'Established in 1974 and built on decades of trusted supply relationships.',
  },
  {
    icon: Users,
    text: '100% family-owned partnership firm with a long-term customer-first approach.',
  },
  {
    icon: Battery,
    text: 'Manufacturer of nickel strips used in lithium-ion batteries and energy storage packs.',
  },
  {
    icon: Globe,
    text: 'Serving customers across PAN India and selected international markets.',
  },
];

const globalMarkets = [
  'Japan', 'Korea', 'China', 'Taiwan', 'Thailand', 'UAE',
  'Netherlands', 'Germany', 'Belgium', 'France', 'UK', 'Finland',
  'Italy', 'USA', 'Canada', 'New Zealand', 'Australia',
];

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#f6f8f9] text-brand">
      <Helmet>
        <title>About Us | Ramani Steel House - Nickel Strip Manufacturer</title>
        <meta
          name="description"
          content="Ramani Steel House has manufactured nickel strips for lithium-ion battery applications since 1974, serving PAN India and 17+ international markets."
        />
        <link rel="canonical" href="https://www.nickelbusbar.com/about" />
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-light" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 md:pt-32 md:pb-20 text-white">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-white/80">About Us</p>
          <h1 className="mt-4 max-w-3xl text-3xl md:text-5xl font-display font-bold leading-tight">
            Trusted Nickel Strip Manufacturer Since 1974
          </h1>
          <p className="mt-5 max-w-2xl text-sm md:text-base text-white/90 leading-relaxed">
            We manufacture high-quality nickel strips, nickel alloys and stainless steel materials with reliable delivery,
            competitive pricing, and technical support. Our core focus is nickel strips for lithium-ion battery applications.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-center sm:text-left">
                <p className="text-2xl md:text-3xl font-display font-bold">{stat.value}</p>
                <p className="mt-1 text-xs md:text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {keyPoints.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon size={20} />
              </div>
              <p className="text-sm md:text-base leading-relaxed pt-1.5">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">What Drives Us</p>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Target size={20} />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">Our Vision</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To support customers in developing energy resources with world-class capability delivered locally and through
              practical, value-driven commercial partnerships.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Gem size={20} />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">Our Mission</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To deliver technically sound solutions, create mutual value, and remain a preferred stockist, supplier,
              and manufacturing partner for industrial and battery-focused materials.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
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
          <div className="flex items-center gap-3 text-brand">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Globe size={20} />
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold">PAN India Presence with Global Reach</h2>
          </div>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
            We serve customers across India and maintain trusted business relationships with buyers and suppliers in multiple
            international markets.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {globalMarkets.map((market) => (
              <span
                key={market}
                className="rounded-full border border-slate-200 bg-brand-surface px-3.5 py-1.5 text-sm font-medium text-brand"
              >
                {market}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-light p-8 md:p-10 text-white shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold">Need nickel strips for your production line?</h2>
              <p className="mt-2 max-w-xl text-sm text-white/85 leading-relaxed">
                Talk to our team about specifications, bulk pricing, or custom requirements for battery and industrial applications.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand shadow-sm transition hover:bg-white/90"
              >
                Contact Us
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/products?search=nickel"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
