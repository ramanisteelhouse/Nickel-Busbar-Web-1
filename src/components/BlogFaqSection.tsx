import React from 'react';
import type { BlogFaqItem } from '../types';

interface BlogFaqSectionProps {
  items: BlogFaqItem[];
}

// Renders the same Q&A pairs that back the FAQPage JSON-LD script so the
// structured data always matches content that is actually visible on the
// page (a <details> accordion keeps answers in the DOM, not display:none).
export const BlogFaqSection: React.FC<BlogFaqSectionProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="blog-faq-heading">
      <h2 id="blog-faq-heading" className="text-2xl font-bold text-brand">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/60">
        {items.map((item, index) => (
          <details key={`${index}-${item.question}`} className="group p-5 open:bg-white first:rounded-t-2xl last:rounded-b-2xl">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-brand marker:content-none">
              {item.question}
              <span className="mt-0.5 shrink-0 text-slate-400 transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
};
