import React from 'react';
import { ExternalLink, Share2 } from 'lucide-react';
import { LINKEDIN_PROFILE, shareLinks } from '../lib/social';

/**
 * Share and follow row for an article, plus a link to the matching post on LinkedIn when there
 * is one.
 *
 * `socialPostUrl` is per-article (blog_posts.social_post_url): when the same material has been
 * published as a LinkedIn carousel, the article points at it and the carousel points back. The
 * row renders without it too — the share and follow links are always useful.
 */
type Props = {
  url: string;
  title: string;
  socialPostUrl?: string | null;
};

const linkClass =
  'inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand hover:text-brand';

export const BlogShare: React.FC<Props> = ({ url, title, socialPostUrl }) => {
  const clean = socialPostUrl?.trim();
  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Share2 size={14} /> Share
        </span>
        {shareLinks(url, title).map((target) => (
          <a
            key={target.name}
            href={target.href}
            target="_blank"
            /* noopener on a target=_blank share window; noreferrer is deliberately absent so the
               referral still shows up as coming from this site in the sharer's analytics. */
            rel="noopener"
            className={linkClass}
          >
            {target.name}
          </a>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {clean ? (
          <a href={clean} target="_blank" rel="noopener" className={linkClass}>
            See this on LinkedIn <ExternalLink size={12} />
          </a>
        ) : null}
        <a href={LINKEDIN_PROFILE} target="_blank" rel="noopener" className={linkClass}>
          Follow us on LinkedIn <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
