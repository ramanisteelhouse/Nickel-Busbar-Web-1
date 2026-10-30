import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Star, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * The page a customer lands on from a shared link.
 *
 * Two shapes: /review for a general review of the company, and /review/<product-slug> for one
 * product, which is the version worth sharing after an order because only product reviews can
 * carry Review structured data. An unknown slug is not an error — the API stores the review as
 * a general one rather than losing what the customer wrote.
 *
 * `?src=whatsapp` (or linkedin, email) is passed through so it is possible to tell which channel
 * actually produces reviews.
 *
 * noindex: this is a form, not content. It exists to be shared, not found.
 */
const MAX_BODY = 2000;

export const ReviewFormPage: React.FC = () => {
  const { productSlug } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('src') || '';

  const [productName, setProductName] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [name, setName] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [body, setBody] = React.useState('');
  const [website, setWebsite] = React.useState(''); // honeypot
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!productSlug) return;
    let active = true;
    fetch(`/api/products/${productSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.name) setProductName(data.name);
      })
      .catch(() => {
        // A name we cannot fetch is cosmetic; the review still submits against the slug.
      });
    return () => {
      active = false;
    };
  }, [productSlug]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (rating < 1) {
      setError('Please choose a rating.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, email, body, rating, productSlug: productSlug || '', source, website }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const heading = productName ? `Review ${productName}` : 'Review Ramani Steel House';

  return (
    <div className="pt-28 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
      <Helmet>
        <title>{heading}</title>
        <meta name="description" content="Tell us how the material performed. Your review helps other battery pack builders choose." />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      {done ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-6" />
          <h1 className="text-3xl font-bold text-zinc-900 mb-3">Thank you</h1>
          <p className="text-zinc-500 leading-relaxed mb-8">
            Your review has been sent to us and will appear on the site once we have read it. We check them so the
            page stays useful — it usually takes a few hours.
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800">
            Browse nickel strip
          </Link>
        </motion.div>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-3">{heading}</h1>
          <p className="text-zinc-500 leading-relaxed mb-10">
            {productName
              ? 'How did the material perform in your pack? A few honest sentences help the next buyer more than a star alone.'
              : 'How did we do? A few honest sentences about the material and the service help the next buyer decide.'}
          </p>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Rating</label>
              <div className="flex gap-1" role="radiogroup" aria-label="Rating out of 5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} out of 5`}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <Star
                      size={32}
                      className={cn(
                        'transition-colors',
                        (hovered || rating) >= value ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="review-name" className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Your name
                </label>
                <input
                  id="review-name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="review-company" className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Company <span className="font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="review-company"
                  maxLength={120}
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="review-email" className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Email <span className="font-normal normal-case tracking-normal">(optional, never published)</span>
              </label>
              <input
                id="review-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="review-body" className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Your review
              </label>
              <textarea
                id="review-body"
                required
                rows={6}
                minLength={10}
                maxLength={MAX_BODY}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Thickness consistency, weld quality, delivery, anything a buyer should know."
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed focus:border-zinc-900 focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-zinc-400">{body.length} / {MAX_BODY}</p>
            </div>

            {/* Honeypot. Hidden from people, filled in by most form bots; the API silently drops
                anything that arrives with it set. */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="review-website">Leave this empty</label>
              <input id="review-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-zinc-900 py-4 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Submit review'}
            </button>
            <p className="text-center text-xs text-zinc-400">
              Reviews are checked before they appear, so the page stays useful.
            </p>
          </form>
        </>
      )}
    </div>
  );
};
