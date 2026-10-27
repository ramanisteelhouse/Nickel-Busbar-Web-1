import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getGuideBySlug, GUIDES_PATH, guidePath } from '../lib/guides';
import {
  formatGuideDate,
  guideCoverUrl,
  guideJsonLd,
  guideProducts,
  guideUrl,
  otherGuides,
} from '../lib/guideView';
import { sanitizeRichHtml, encodePathSegment } from '../lib/utils';
import { blogCtaFor } from '../lib/blogCta';
import { BlogFaqSection } from '../components/BlogFaqSection';
import { BlogCtaBar, BlogCtaBlock } from '../components/BlogCtaBlock';
import { BlogShare } from '../components/BlogShare';
import { ContextualLinks } from '../components/ContextualLinks';
import { AuthorBox } from '../components/AuthorBox';
import { MINIMUM_ORDER_QUANTITY } from '../lib/productSpecs';
import { NotFoundPage } from './NotFoundPage';

const SITE_NAME = 'Ramani Steel House';

/**
 * The same typography the blog applies to its article body, so a guide reads like the posts
 * people already know. Tables scroll sideways on a phone instead of breaking the page.
 */
export const PROSE_CLASS =
  'mt-10 text-base leading-relaxed text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_strong]:font-semibold [&_blockquote]:mt-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-100 [&_pre]:p-4 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_img]:mt-6 [&_img]:rounded-2xl [&_img]:border [&_img]:border-slate-200 [&_img]:w-full [&_img]:h-auto [&_figure]:mt-6 [&_figure]:mb-2 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-slate-500 [&_table]:mt-6 [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto sm:[&_table]:table [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-brand [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2';

export const GuidePage: React.FC = () => {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug || '');

  // Parsing and sanitising the article is the expensive part, and it never changes for a slug.
  const content = React.useMemo(() => sanitizeRichHtml(guide?.html || ''), [guide?.html]);

  // An unknown slug is a real not-found page (noindex), not an empty guide.
  if (!guide) return <NotFoundPage />;

  const canonical = guideUrl(guide);
  const cover = guideCoverUrl(guide);
  const cta = blogCtaFor(guide.slug);
  const products = guideProducts(guide);
  const more = otherGuides(guide);

  return (
    <div className="pt-28 pb-24 bg-white text-brand">
      {/* Mirrors renderGuideSnapshot in seoSnapshot.ts: both read lib/guideView, because a
          mounted page that says less than its snapshot has the difference thrown away. */}
      <Helmet>
        <title>{guide.metaTitle}</title>
        <meta name="description" content={guide.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={guide.metaTitle} />
        <meta property="og:description" content={guide.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={cover} />
        {guideJsonLd(guide).map((entry, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(entry)}
          </script>
        ))}
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-brand">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={GUIDES_PATH} className="hover:text-brand">Guides</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-slate-500">{guide.title}</span>
        </nav>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Guide</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-display font-bold leading-tight">{guide.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span className="font-medium text-slate-600">{SITE_NAME}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={guide.datePublished}>{formatGuideDate(guide.datePublished)}</time>
          </div>
        </header>

        {/* The answer to the title's question, before the guide rather than inside it. */}
        <p className="mt-8 rounded-2xl border-l-4 border-brand bg-slate-50 px-5 py-4 text-base font-medium leading-relaxed text-brand">
          {guide.keyAnswer}
        </p>

        <BlogCtaBar cta={cta} />

        <figure className="mt-8">
          <img
            src={guide.coverImage}
            alt={guide.coverAlt}
            width={900}
            height={900}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full max-w-md aspect-square mx-auto rounded-2xl border border-slate-200 object-cover shadow-sm"
          />
        </figure>

        <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: content }} />

        {products.length > 0 && (
          <section className="mt-12 rounded-3xl border border-zinc-100 bg-zinc-50 p-8">
            <h2 className="text-lg font-bold text-zinc-900">Products covered in this guide</h2>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {products.map((product) => (
                <li key={product.slug}>
                  <Link
                    to={`/product/${encodePathSegment(product.slug)}`}
                    className="inline-block py-1 font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              All sizes are slit to order from {MINIMUM_ORDER_QUANTITY}, with a material test certificate on request.
            </p>
          </section>
        )}

        <BlogShare url={canonical} title={guide.title} />

        <BlogCtaBlock cta={cta} />

        <BlogFaqSection items={[...guide.faqs]} />

        <section className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-bold text-brand">More nickel strip guides</h2>
          <ul className="mt-4 space-y-2 text-base">
            {more.map((other) => (
              <li key={other.slug}>
                <Link to={guidePath(other.slug)} className="font-semibold text-brand underline underline-offset-2">
                  {other.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-600">
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
        </section>

        <AuthorBox />

        <ContextualLinks context={{ kind: 'guide', slug: guide.slug }} exclude={[cta.link.path]} />
      </article>
    </div>
  );
};
