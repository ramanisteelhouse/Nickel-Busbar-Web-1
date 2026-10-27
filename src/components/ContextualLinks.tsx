import React from 'react';
import { Link } from 'react-router-dom';
import { contextualLinks, type PageContext } from '../lib/contextualLinks';

type Props = {
  context: PageContext;
  /** Paths the page already links to elsewhere, so none appears twice. */
  exclude?: readonly string[];
  className?: string;
};

/**
 * Where a reader of this page would go next: the guides, articles, categories and sibling
 * products that share its topic. The same blocks seoSnapshot.ts writes for crawlers, from the
 * same function, so what a crawler is told the page links to is what the page shows.
 *
 * Renders nothing for a page the module has no topics for, rather than a generic block.
 */
export const ContextualLinks: React.FC<Props> = ({ context, exclude, className = 'mt-14 border-t border-slate-200 pt-10' }) => {
  const blocks = contextualLinks(context, exclude);
  if (!blocks.length) return null;

  return (
    <nav aria-label="Related pages" className={className}>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {blocks.map((block) => (
          <section key={block.heading}>
            <h2 className="text-lg font-bold text-brand">{block.heading}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-snug">
              {block.links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
                  >
                    {link.anchor}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
};
