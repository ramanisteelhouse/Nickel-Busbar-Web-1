import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '../types';
import { encodePathSegment, sanitizeRichHtml, resolveImageSrc } from '../lib/utils';

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
  const siteUrl = 'https://www.nickelbusbar.com';
  const canonical = `${siteUrl}/blog/${encodeURIComponent(decodedSlug)}`;
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
        <h1 className="text-3xl font-bold text-[#304e58]">Unable to load article right now</h1>
        <p className="mt-3 text-slate-600">Please try again in a moment.</p>
        <Link to="/blog" className="mt-6 inline-flex rounded-full bg-[#304e58] px-5 py-2.5 text-sm font-semibold text-white">
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
        <h1 className="text-3xl font-bold text-[#304e58]">Article not found</h1>
        <p className="mt-3 text-slate-600">This article may be unpublished or moved to another URL.</p>
        <Link to="/blog" className="mt-6 inline-flex rounded-full bg-[#304e58] px-5 py-2.5 text-sm font-semibold text-white">
          Back to Blog
        </Link>
      </div>
    );
  }

  const title = post.meta_title?.trim() || post.title;
  const description = post.meta_description?.trim() || post.excerpt?.trim() || 'Technical insights from Ramani Steel House.';

  return (
    <div className="pt-28 pb-24 bg-white text-[#304e58]">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {post.cover_image_url ? <meta property="og:image" content={resolveImageSrc(post.cover_image_url)} /> : null}
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#304e58]">Blog</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-display font-bold leading-tight">{post.title}</h1>
        <p className="mt-4 text-sm text-slate-500">
          {post.author_name || 'Ramani Steel House'}
          {formatDate(post.published_at) ? ` • ${formatDate(post.published_at)}` : ''}
        </p>
        {post.cover_image_url ? (
          <img
            src={resolveImageSrc(post.cover_image_url)}
            alt={post.title}
            className="mt-8 w-full rounded-2xl border border-slate-200 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div
          className="mt-8 whitespace-pre-line text-base leading-relaxed text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2 [&_a]:font-semibold [&_a]:text-[#304e58] [&_a]:underline [&_strong]:font-semibold [&_blockquote]:mt-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#304e58]/30 [&_blockquote]:pl-4 [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-100 [&_pre]:p-4 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </article>
    </div>
  );
};
