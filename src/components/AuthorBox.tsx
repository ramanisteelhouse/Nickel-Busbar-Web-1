import React from 'react';
import { Link } from 'react-router-dom';
import { authorBoxContent } from '../lib/author';

/**
 * "About the author": who is behind the article, as facts a reader can check. The same content
 * seoSnapshot.ts writes for crawlers (from lib/author), so the two cannot disagree.
 */
export const AuthorBox: React.FC = () => {
  const box = authorBoxContent();
  return (
    <aside aria-label={box.heading} className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-brand">{box.heading}</h2>
      <p className="mt-3 text-base text-slate-700">{box.lead}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {box.facts.map((fact) => (
          <li key={fact.text}>
            {fact.text}
            {fact.href && fact.linkText ? (
              <>
                {'. '}
                <Link to={fact.href} className="font-semibold text-brand underline underline-offset-2">
                  {fact.linkText}
                </Link>
              </>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-slate-600">
        {box.contact.text}{' '}
        <a href={`mailto:${box.contact.email}`} className="font-semibold text-brand underline underline-offset-2">
          {box.contact.email}
        </a>
      </p>
    </aside>
  );
};
