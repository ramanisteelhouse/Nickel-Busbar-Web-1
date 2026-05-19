import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const NotFoundPage: React.FC = () => {
  const { pathname } = useLocation();
  const siteUrl = 'https://www.nickelbusbar.com';
  const canonicalUrl = `${siteUrl}${pathname}`;

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Helmet>
        <title>404 | Page Not Found</title>
        <meta
          name="description"
          content="The page you are looking for could not be found. Explore our nickel strip products and contact our team for support."
        />
        <meta name="robots" content="noindex,follow,noarchive" />
        <meta name="prerender-status-code" content="404" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#314e58]">Error 404</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-display font-bold text-[#304e58]">Page not found</h1>
      <p className="mt-4 text-slate-600">
        The link may be outdated or the page may have moved. You can continue from one of the options below.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-[#304e58] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#314e58] transition-colors"
        >
          Go to Homepage
        </Link>
        <Link
          to="/products"
          className="rounded-full border border-[#314e58]/30 px-5 py-2.5 text-sm font-semibold text-[#304e58] hover:bg-slate-50 transition-colors"
        >
          Browse Products
        </Link>
        <Link
          to="/contact"
          className="rounded-full border border-[#314e58]/30 px-5 py-2.5 text-sm font-semibold text-[#304e58] hover:bg-slate-50 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};
