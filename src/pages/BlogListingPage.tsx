import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '../types';
import { encodePathSegment } from '../lib/utils';

export const BlogListingPage: React.FC = () => {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const siteUrl = 'https://www.nickelbusbar.com';

  React.useEffect(() => {
    let isActive = true;
    fetch('/api/blog-posts?limit=20')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        return res.json();
      })
      .then((data) => {
        if (!isActive) return;
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isActive) return;
        setPosts([]);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Blog | Nickel Strips, Battery Materials & Manufacturing Guides</title>
        <meta
          name="description"
          content="Read technical guides and industry insights from Ramani Steel House on nickel strips, battery tabs, and lithium manufacturing."
        />
        <link rel="canonical" href={`${siteUrl}/blog`} />
      </Helmet>

      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Knowledge Hub</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-display font-bold text-brand">Latest Blog Articles</h1>
      </div>

      {loading ? (
        <div className="mt-10 text-sm text-slate-500">Loading articles...</div>
      ) : posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-600">
          No published blog posts available yet.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-brand">{post.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{post.excerpt || 'Read the full article for details.'}</p>
              <Link
                to={`/blog/${encodePathSegment(post.slug)}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand"
              >
                Read more
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
