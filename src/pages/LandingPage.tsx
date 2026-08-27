import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { Product } from '../types';
import { PHONE_NUMBERS, PRIMARY_EMAIL, POSTAL_ADDRESS, telHref } from '../lib/contact';
import { getLandingPage, STATE_LANDING_PAGES } from '../lib/landingPages';
import { ProductThumbnail } from '../components/ProductThumbnail';
import { Reveal } from '../components/Tilt3D';
import { NotFoundPage } from './NotFoundPage';

const SITE_URL = 'https://www.nickelbusbar.com';

/**
 * Renders the category and state landing pages defined in lib/landingPages.
 *
 * The copy, the FAQs and the product list all come from that module, which seoSnapshot.ts also
 * reads — so the page a visitor sees and the raw HTML a non-rendering crawler is served carry
 * the same words. A landing page whose target phrase appears only in the crawler snapshot, or
 * only in a meta tag, is worth nothing: Google indexes what it renders.
 */
export const LandingPage: React.FC = () => {
  const { pathname } = useLocation();
  const page = getLandingPage(pathname);
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    if (!page?.productSearch) {
      setProducts([]);
      return;
    }
    let active = true;
    fetch(`/api/products?search=${encodeURIComponent(page.productSearch)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active) setProducts(Array.isArray(data) ? data.slice(0, 6) : []);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, [page?.productSearch]);

  // An unknown slug reaching this component means the router matched a path that lib/landingPages
  // no longer defines. That is a 404, not an empty landing page: rendering a bare shell would
  // leave an indexable URL with no content on it.
  if (!page) {
    return <NotFoundPage />;
  }

  const canonical = `${SITE_URL}/${page.slug}`;
  const crossLinks = STATE_LANDING_PAGES.filter((state) => state.path !== `/${page.slug}`);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonical}#page`,
      name: page.title,
      description: page.description,
      url: canonical,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      provider: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: page.breadcrumbName, item: canonical },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];

  return (
    <div className="pt-28">
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <meta name="keywords" content={page.keywords.join(', ')} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.description} />
        {jsonLd.map((entry, index) => (
          <script type="application/ld+json" key={index}>
            {JSON.stringify(entry)}
          </script>
        ))}
      </Helmet>

      <section className="bg-gradient-to-br from-brand to-brand-light text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.3em] text-white/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">{page.breadcrumbName}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl text-4xl md:text-5xl font-display font-bold leading-tight">
            {page.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-white/80">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-slate-100"
            >
              Request a quotation <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={telHref(PHONE_NUMBERS[0])}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <Phone className="h-4 w-4" /> {PHONE_NUMBERS[0].display}
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {page.sections.map((section) => (
            <Reveal key={section.heading}>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-brand">{section.heading}</h2>
              {section.body && <p className="mt-4 max-w-4xl text-slate-600 leading-relaxed">{section.body}</p>}
              {section.bullets && (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {products.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-brand">Products</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg"
                >
                  <ProductThumbnail
                    slug={product.slug}
                    image={product.image}
                    name={product.name}
                    size={400}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                  <h3 className="mt-4 font-semibold text-brand group-hover:underline">{product.name}</h3>
                  {product.dimensions && <p className="mt-1 text-sm text-slate-500">{product.dimensions}</p>}
                </Link>
              ))}
            </div>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
            >
              See the full nickel strip range <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand">Frequently asked questions</h2>
          <dl className="mt-8 space-y-6">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-slate-200 p-6">
                <dt className="font-semibold text-brand">{faq.question}</dt>
                <dd className="mt-2 text-slate-600 leading-relaxed">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand">Also supplying</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {crossLinks.map((state) => (
              <Link
                key={state.path}
                to={state.path}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:border-brand hover:text-brand"
              >
                <MapPin className="h-4 w-4" /> {state.name}
              </Link>
            ))}
          </div>
          <address className="mt-10 not-italic text-sm text-slate-600">
            Ramani Steel House, {POSTAL_ADDRESS.oneLine}
            <br />
            {PHONE_NUMBERS.map((number) => number.display).join(' · ')} ·{' '}
            <a href={`mailto:${PRIMARY_EMAIL}`} className="hover:text-brand">{PRIMARY_EMAIL}</a>
          </address>
        </div>
      </section>
    </div>
  );
};
