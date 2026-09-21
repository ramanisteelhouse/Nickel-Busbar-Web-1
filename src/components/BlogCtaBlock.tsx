import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { QuickEnquiry } from './QuickEnquiry';
import type { BlogCta } from '../lib/blogCta';

/**
 * The two calls to action on a blog post. See lib/blogCta for why each is topic-matched.
 *
 * The bar sits under the cover image for the reader who arrived already knowing what they want;
 * the full block sits after the article, where a reader who has just finished it decides what
 * to do next. The block reuses QuickEnquiry — one phone field, saved on submit — rather than a
 * form, because a reader coming off a technical article is the least likely visitor to finish
 * a nine-field form, and a phone number is enough for sales to start.
 */
export const BlogCtaBar: React.FC<{ cta: BlogCta }> = ({ cta }) => (
  <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-brand/15 bg-brand/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm font-semibold text-brand">{cta.teaser}</p>
    <Link
      to={cta.link.path}
      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand underline underline-offset-4"
    >
      {cta.link.label} <ArrowRight size={14} />
    </Link>
  </div>
);

export const BlogCtaBlock: React.FC<{ cta: BlogCta }> = ({ cta }) => (
  <section aria-labelledby="blog-cta-heading" className="mt-14 rounded-3xl bg-brand px-6 py-8 text-white md:px-10 md:py-10">
    <h2 id="blog-cta-heading" className="text-2xl font-display font-bold">{cta.heading}</h2>
    <p className="mt-3 max-w-2xl text-white/85">{cta.body}</p>
    <ul className="mt-5 flex flex-wrap gap-2 text-sm">
      {['Manufacturer since 1974', '5 kg minimum order', 'Made to your drawing'].map((point) => (
        <li key={point} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold">
          <BadgeCheck size={15} className="text-emerald-200" /> {point}
        </li>
      ))}
    </ul>
    <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-start">
      <div>
        <Link
          to={cta.link.path}
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-white/90"
        >
          {cta.link.label} <ArrowRight size={16} />
        </Link>
        <p className="mt-3 text-sm text-white/70">Or leave your number and we will call you with a quotation.</p>
      </div>
      {/* White card so QuickEnquiry keeps its own styling on the dark background. */}
      <div className="rounded-2xl bg-white p-5 text-zinc-900">
        <QuickEnquiry productName={cta.enquiryLabel} />
      </div>
    </div>
  </section>
);
