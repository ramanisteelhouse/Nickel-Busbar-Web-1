import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '../types';
import { buildImageAlt, encodePathSegment, sanitizeRichHtml } from '../lib/utils';
import { BlogFaqSection } from '../components/BlogFaqSection';
import { BlogCtaBar, BlogCtaBlock } from '../components/BlogCtaBlock';
import { BlogShare } from '../components/BlogShare';
import { ContextualLinks } from '../components/ContextualLinks';
import { blogCtaFor } from '../lib/blogCta';
import { blogCover } from '../lib/blogImage';
import { blogProductsFor, BLOG_PRODUCTS_HEADING } from '../lib/blogProducts';
import { MINIMUM_ORDER_QUANTITY } from '../lib/productSpecs';

const SITE_URL = 'https://www.nickelbusbar.com';
const SITE_LOGO_URL = `${SITE_URL}/img/logo.png`;
const SITE_NAME = 'Ramani Steel House';

const formatDate = (value: string | null | undefined) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
};

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const decodedSlug = slug || '';
  const encodedSlug = encodePathSegment(decodedSlug);
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<'not-found' | 'server' | null>(null);
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(decodedSlug)}`;
  const sanitizedContent = React.useMemo(() => sanitizeRichHtml(post?.content || ''), [post?.content]);

  React.useEffect(() => {
    let isActive = true;
    setLoading(true);
    setFetchError(null);
    setPost(null);

    fetch(`/api/blog-posts/${encodedSlug}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 400 || res.status === 404) throw new Error('NOT_FOUND');
          throw new Error('REQUEST_FAILED');
        }
        return res.json();
      })
      .then((data) => {
        if (!isActive) return;
        setPost(data);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const message = error instanceof Error ? error.message : '';
        setFetchError(message === 'NOT_FOUND' ? 'not-found' : 'server');
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [encodedSlug]);

  if (loading) {
    return <div className="pt-32 text-center text-slate-600">Loading article...</div>;
  }

  if (fetchError === 'server') {
    return (
      <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 text-center">
        <Helmet>
          <title>Article Unavailable</title>
          <meta name="robots" content="noindex,follow,noarchive" />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <h1 className="text-3xl font-bold text-brand">Unable to load article right now</h1>
        <p className="mt-3 text-slate-600">Please try again in a moment.</p>
        <Link to="/blog" className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
          Back to Blog
        </Link>
      </div>
    );
  }

  if (fetchError === 'not-found' || !post) {
    return (
      <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 text-center">
        <Helmet>
          <title>404 | Article Not Found</title>
          <meta name="robots" content="noindex,follow,noarchive" />
          <meta name="prerender-status-code" content="404" />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <h1 className="text-3xl font-bold text-brand">Article not found</h1>
        <p className="mt-3 text-slate-600">This article may be unpublished or moved to another URL.</p>
        <Link to="/blog" className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
          Back to Blog
        </Link>
      </div>
    );
  }

  const title = post.meta_title?.trim() || post.title;
  const description = post.meta_description?.trim() || post.excerpt?.trim() || 'Technical insights from Ramani Steel House.';
  // Never the stored URL: it is a Supabase signed URL served with X-Robots-Tag: none, which Google
  // obeys, so it can never be indexed or become the search-result thumbnail. See lib/blogImage.
  // Mirrored by renderBlogSnapshot, which calls the same function.
  const cover = blogCover(post.slug, post.cover_image_url);
  const coverImageUrl = `${SITE_URL}${cover.path}`;
  const coverImageAlt = post.cover_image_alt?.trim() || buildImageAlt(post.title, 'blog article cover');
  const publishedIso = post.published_at || post.created_at || null;
  const modifiedIso = post.updated_at || publishedIso;
  // Mirrors the byline in renderBlogSnapshot: shown only for a real edit, not for the row being
  // touched on the day it was published.
  const showUpdated =
    Boolean(publishedIso && modifiedIso) &&
    Date.parse(modifiedIso as string) - Date.parse(publishedIso as string) >= 24 * 3_600_000 &&
    formatDate(modifiedIso) !== formatDate(publishedIso);
  const faqItems = post.faq_items || [];
  const keyAnswer = post.key_answer?.trim();
  // The next step for a reader of this article; see lib/blogCta.
  const cta = blogCtaFor(post.slug || decodedSlug);
  // Empty for any post not yet mapped — the block then does not render at all.
  const articleProducts = blogProductsFor(post.slug || decodedSlug);

  // Article schema: built from the same title/description/dates rendered on the
  // page so structured data can never drift from what visitors actually see.
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    ...(coverImageUrl ? { image: [coverImageUrl] } : {}),
    author: { '@type': 'Organization', name: post.author_name || SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: SITE_LOGO_URL },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    ...(publishedIso ? { datePublished: publishedIso } : {}),
    ...(modifiedIso ? { dateModified: modifiedIso } : {}),
  };

  // Only emitted when the post has real FAQ content, and BlogFaqSection below
  // renders those exact questions/answers so the answers are visible on-page
  // (a Google Rich Results requirement, not just present in the JSON-LD).
  const faqJsonLd = faqItems.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  return (
    <div className="pt-28 pb-24 bg-white text-brand">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {coverImageUrl ? <meta property="og:image" content={coverImageUrl} /> : null}
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        {faqJsonLd ? <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script> : null}
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-brand">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/blog" className="hover:text-brand">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-slate-500">{post.title}</span>
        </nav>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Blog</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-display font-bold leading-tight">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span className="font-medium text-slate-600">{post.author_name || SITE_NAME}</span>
            {formatDate(publishedIso) ? (
              <>
                <span aria-hidden="true">•</span>
                <span>Published</span>
                <time dateTime={publishedIso ?? undefined}>{formatDate(publishedIso)}</time>
                {showUpdated ? (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>Updated</span>
                    <time dateTime={modifiedIso ?? undefined}>{formatDate(modifiedIso)}</time>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </header>

        {cover.kind !== 'brand' ? (
          <figure className="mt-8">
            <img
              src={cover.path}
              alt={coverImageAlt}
              width={1000}
              height={1000}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full max-w-[1000px] aspect-square mx-auto rounded-2xl border border-slate-200 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
          </figure>
        ) : null}

        {/* The answer to the question in the title, before the article rather than inside it.
            Mirrored by the crawler snapshot; see lib/blogCta for the CTA that follows. */}
        {keyAnswer ? (
          <p className="mt-8 rounded-2xl border-l-4 border-brand bg-slate-50 px-5 py-4 text-base font-medium leading-relaxed text-brand">
            {keyAnswer}
          </p>
        ) : null}

        <BlogCtaBar cta={cta} />

        <div
          className="mt-10 text-base leading-relaxed text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_strong]:font-semibold [&_blockquote]:mt-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-100 [&_pre]:p-4 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_img]:mt-6 [&_img]:rounded-2xl [&_img]:border [&_img]:border-slate-200 [&_img]:w-full [&_img]:h-auto [&_figure]:mt-6 [&_figure]:mb-2 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-slate-500 [&_table]:mt-6 [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto sm:[&_table]:table [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-brand [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_caption]:mt-2 [&_caption]:caption-bottom [&_caption]:text-sm [&_caption]:text-slate-500"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* The products the article actually discusses, placed immediately after the content
            rather than below the share row: the reader has just worked out which strip they
            need, and this is the only route on the page from here to a product. The anchor text
            is the product's own name. See src/lib/blogProducts.ts for why this exists and how
            each mapping was checked. Mirrored in seoSnapshot.ts. */}
        {articleProducts.length > 0 && (
          <section className="mt-12 rounded-3xl border border-zinc-100 bg-zinc-50 p-8">
            <h2 className="text-lg font-bold text-zinc-900">{BLOG_PRODUCTS_HEADING}</h2>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {articleProducts.map((product) => (
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

        <BlogShare url={canonical} title={post.title} socialPostUrl={post.social_post_url} />

        <BlogCtaBlock cta={cta} />

        <BlogFaqSection items={faqItems} />

        <ContextualLinks
          context={{ kind: 'blog', slug: post.slug || decodedSlug }}
          exclude={[cta.link.path, ...articleProducts.map((product) => `/product/${product.slug}`)]}
        />

        <div className="mt-14 border-t border-slate-200 pt-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
};
