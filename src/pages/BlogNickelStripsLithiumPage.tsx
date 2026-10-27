import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthorBox } from '../components/AuthorBox';
import { BlogCtaBar, BlogCtaBlock } from '../components/BlogCtaBlock';
import { BlogFaqSection } from '../components/BlogFaqSection';
import { BlogShare } from '../components/BlogShare';
import { ContextualLinks } from '../components/ContextualLinks';
import { blogCtaFor } from '../lib/blogCta';
import { formatGuideDate, guideProducts } from '../lib/guideView';
import { LITHIUM_ARTICLE, LITHIUM_ARTICLE_PATH, lithiumArticleJsonLd } from '../lib/lithiumArticle';
import { MINIMUM_ORDER_QUANTITY } from '../lib/productSpecs';
import { encodePathSegment, sanitizeRichHtml } from '../lib/utils';
import { PROSE_CLASS } from './GuidePage';

const SITE_URL = 'https://www.nickelbusbar.com';

/**
 * /blog/nickel-strips-lithium-batteries. The copy, FAQs and structured data live in
 * lib/lithiumArticle, which renderNickelStripsLithiumSnapshot in seoSnapshot.ts also reads, so
 * the page a visitor sees and the HTML a crawler is served say the same thing.
 */
export const BlogNickelStripsLithiumPage: React.FC = () => {
  const article = LITHIUM_ARTICLE;
  const canonical = `${SITE_URL}${LITHIUM_ARTICLE_PATH}`;
  const cover = `${SITE_URL}${article.coverImage}`;
  const content = React.useMemo(() => sanitizeRichHtml(article.html), [article.html]);
  const cta = blogCtaFor(article.slug);
  const products = guideProducts(article);

  return (
    <div className="pt-28 pb-24 bg-white text-brand">
      <Helmet>
        <title>{article.metaTitle}</title>
        <meta name="description" content={article.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.metaTitle} />
        <meta property="og:description" content={article.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={cover} />
        {lithiumArticleJsonLd().map((entry, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(entry)}
          </script>
        ))}
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-brand">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/blog" className="hover:text-brand">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-slate-500">{article.title}</span>
        </nav>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Blog</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-display font-bold leading-tight">{article.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <Link to="/about" className="font-medium text-slate-600 hover:text-brand">Ramani Steel House</Link>
            <span aria-hidden="true">•</span>
            <span>Published</span>
            <time dateTime={article.datePublished}>{formatGuideDate(article.datePublished)}</time>
            <span aria-hidden="true">•</span>
            <span>Updated</span>
            <time dateTime={article.dateModified}>{formatGuideDate(article.dateModified)}</time>
          </div>
        </header>

        <p className="mt-8 rounded-2xl border-l-4 border-brand bg-slate-50 px-5 py-4 text-base font-medium leading-relaxed text-brand">
          {article.keyAnswer}
        </p>

        <BlogCtaBar cta={cta} />

        <figure className="mt-8">
          <img
            src={article.coverImage}
            alt={article.coverAlt}
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
            <h2 className="text-lg font-bold text-zinc-900">Products covered in this article</h2>
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

        <BlogShare url={canonical} title={article.title} />

        <BlogCtaBlock cta={cta} />

        <BlogFaqSection items={[...article.faqs]} />

        <AuthorBox />

        <ContextualLinks
          context={{ kind: 'blog', slug: article.slug }}
          exclude={[cta.link.path, ...products.map((product) => `/product/${product.slug}`)]}
        />
      </article>
    </div>
  );
};
