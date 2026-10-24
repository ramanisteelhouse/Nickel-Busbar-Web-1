import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GUIDES, GUIDES_PATH, guidePath } from '../lib/guides';
import {
  formatGuideDate,
  GUIDE_SITE_URL,
  GUIDES_INDEX_DESCRIPTION,
  GUIDES_INDEX_TITLE,
  guidesIndexJsonLd,
} from '../lib/guideView';

/** /guides: the hub the individual guides hang off, so each has a page that links to it. */
export const GuidesIndexPage: React.FC = () => (
  <div className="pt-28 pb-24 bg-white text-brand">
    {/* Mirrors renderGuideSnapshot in seoSnapshot.ts (both read lib/guideView). */}
    <Helmet>
      <title>{GUIDES_INDEX_TITLE}</title>
      <meta name="description" content={GUIDES_INDEX_DESCRIPTION} />
      <link rel="canonical" href={`${GUIDE_SITE_URL}${GUIDES_PATH}`} />
      {guidesIndexJsonLd().map((entry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>

    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-500">Guides</span>
      </nav>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Guides</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-display font-bold leading-tight">Nickel Strip Guides</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Plain-English explainers for battery builders and buyers: what nickel strip is, how to size it for a pack,
          why it overheats, and how much current it can carry.
        </p>
      </header>

      <ul className="mt-10 space-y-6">
        {GUIDES.map((guide) => (
          <li key={guide.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              <Link to={guidePath(guide.slug)} className="text-brand underline-offset-4 hover:underline">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              <time dateTime={guide.datePublished}>{formatGuideDate(guide.datePublished)}</time>
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-700">{guide.excerpt}</p>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-sm text-slate-600">
        Looking for something more specific? Browse the{' '}
        <Link to="/blog" className="font-semibold text-brand underline underline-offset-2">
          technical articles
        </Link>{' '}
        or the{' '}
        <Link to="/products" className="font-semibold text-brand underline underline-offset-2">
          full product range
        </Link>
        .
      </p>
    </div>
  </div>
);
