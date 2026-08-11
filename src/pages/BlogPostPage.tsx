import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '../types';
import { buildImageAlt, encodePathSegment, sanitizeRichHtml, resolveImageSrc } from '../lib/utils';
import { BlogFaqSection } from '../components/BlogFaqSection';

const SITE_URL = 'https://www.nickelbusbar.com';
const SITE_LOGO_URL = `${SITE_URL}/img/logo.png`;
const SITE_NAME = 'Ramani Steel House';

const formatDate = (value: string | null | undefined) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
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
  const coverImageUrl = post.cover_image_url ? resolveImageSrc(post.cover_image_url) : '';
  const coverImageAlt = post.cover_image_alt?.trim() || buildImageAlt(post.title, 'blog article cover');
  const publishedIso = post.published_at || post.created_at || null;
  const modifiedIso = post.updated_at || publishedIso;
  const faqItems = post.faq_items || [];

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
                <time dateTime={publishedIso ?? undefined}>{formatDate(publishedIso)}</time>
              </>
            ) : null}
          </div>
        </header>

        {coverImageUrl ? (
          <figure className="mt-8">
            <img
              src={coverImageUrl}
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

        <div
          className="mt-10 text-base leading-relaxed text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_strong]:font-semibold [&_blockquote]:mt-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-100 [&_pre]:p-4 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_img]:mt-6 [&_img]:rounded-2xl [&_img]:border [&_img]:border-slate-200 [&_img]:w-full [&_img]:h-auto [&_figure]:mt-6 [&_figure]:mb-2 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-slate-500"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        <BlogFaqSection items={faqItems} />

        <div className="mt-14 border-t border-slate-200 pt-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
};
