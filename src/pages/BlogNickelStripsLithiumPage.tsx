import React from 'react';
import { Helmet } from 'react-helmet-async';

export const BlogNickelStripsLithiumPage: React.FC = () => {
  const canonical = 'https://www.nickelbusbar.com/blog/nickel-strips-lithium-batteries';
  const title = 'Nickel Strips for Lithium-Ion Batteries | Manufacturer Guide';
  const description =
    'We are a manufacturer of nickel strips used in lithium-ion batteries, delivering consistent quality and competitive pricing for battery manufacturers.';

  return (
    <div className="pt-28 pb-20 bg-white text-brand">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Blog</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-display font-bold leading-tight">
          Nickel Strips for Lithium-Ion Batteries: Why Manufacturers Choose Us
        </h1>
        <p className="mt-4 text-sm text-slate-500">Published on May 14, 2026</p>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-slate-700">
          <p>
            Nickel strips are a critical component in lithium-ion battery packs because they provide strong conductivity,
            stable weldability, and reliable performance under demanding charging cycles.
          </p>
          <p>
            As a dedicated manufacturer of nickel strips used in lithium-ion batteries, we produce precision strips for
            battery manufacturers across India and selected global markets. Our production focus is consistency in thickness,
            controlled purity, and dependable electrical performance.
          </p>
          <p>
            We support lithium-ion battery manufacturers with competitive pricing by combining scalable manufacturing,
            disciplined quality control, and efficient supply planning. This helps customers reduce procurement risk while
            maintaining product quality in high-volume battery assembly.
          </p>
          <p>
            Whether your requirement is for EV battery packs, consumer electronics, or energy storage systems, we provide
            technically aligned nickel strip solutions with timely delivery and responsive support.
          </p>
        </div>
      </article>
    </div>
  );
};
