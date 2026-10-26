import React from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { MINIMUM_ORDER_QUANTITY } from '../lib/productSpecs';

/**
 * The scroll-triggered phone capture, modelled on the one IndiaMART runs on this company's
 * other listings.
 *
 * It asks for a phone number and nothing else. That is the whole design: this is an
 * interruption the visitor did not ask for, so every field after the first is paid for in
 * abandonment. QuickEnquiry already makes the same argument for the in-page version on product
 * pages, and this reuses its endpoint rather than inventing a second lead pipeline —
 * POST /api/enquiries with quick: true writes to product_enquiries, which sales already works.
 *
 * When it fires is the part worth getting right. Firing on arrival annoys people who have not
 * seen anything yet and trains them to dismiss on sight; firing only at the end of the page
 * misses everyone who got what they needed halfway down. So it waits for both signals: the
 * reader has to be far enough down to have read something AND to have stayed long enough that
 * they are not bouncing. One or the other alone is noise.
 *
 * It does not appear on pages that already put a form in front of the visitor. Asking for a
 * phone number in a modal while a contact form sits open behind it is not a second chance, it
 * is a worse version of the same ask.
 *
 * Dismissal is remembered for the session, not forever: a visitor who comes back next week is
 * a different visit, but one who closes it and keeps browsing should not meet it again on the
 * next page.
 */

/** Percent of the page scrolled before this is allowed to fire. */
const SCROLL_TRIGGER = 45;
/** Seconds on the page before this is allowed to fire, counted from mount. */
const DWELL_TRIGGER = 20;
/** Session key, so closing it once covers the whole visit. */
const DISMISS_KEY = 'leadcapture_dismissed';

/** Routes that already ask for contact details in the page body. */
const SUPPRESSED = ['/contact', '/export-enquiry', '/cart', '/checkout', '/login', '/register'];

const readDismissed = (): boolean => {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    // Private windows and blocked storage throw. Treat as not dismissed and let the session
    // decide again rather than suppressing the popup for people whose browser is strict.
    return false;
  }
};

const writeDismissed = () => {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* Not fatal: the popup simply may reappear on the next route. */
  }
};

export const LeadCapturePopup: React.FC = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [phone, setPhone] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suppressed = SUPPRESSED.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  React.useEffect(() => {
    if (suppressed || done || readDismissed()) return;

    let scrolled = false;
    let dwelled = false;
    let fired = false;

    const maybeFire = () => {
      if (fired || !scrolled || !dwelled) return;
      fired = true;
      setOpen(true);
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const reach = doc.scrollHeight - window.innerHeight;
      // A page shorter than the viewport can never reach the threshold, so treat it as read.
      const percent = reach <= 0 ? 100 : (window.scrollY / reach) * 100;
      if (percent >= SCROLL_TRIGGER) {
        scrolled = true;
        maybeFire();
      }
    };

    const timer = window.setTimeout(() => {
      dwelled = true;
      maybeFire();
    }, DWELL_TRIGGER * 1000);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname, suppressed, done]);

  // Focus the field when it opens, so a keyboard user lands in the one input rather than
  // having to hunt for it behind the overlay.
  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    writeDismissed();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Same floor QuickEnquiry uses: enough digits to be a real number, without rejecting
    // international formats this site genuinely receives.
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Enter a phone number we can reach you on.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quick: true,
          phone,
          // Context so sales opens with the right product instead of "how can I help you".
          // Nothing here is guessed: it is the page the visitor was actually reading.
          productName: 'Website enquiry',
          message: `Captured by the site popup on ${pathname}`,
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setDone(true);
      writeDismissed();
    } catch {
      setError('That did not send. Please try again, or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (suppressed || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leadcapture-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="py-4 text-center">
            <h2 id="leadcapture-title" className="text-lg font-bold text-brand">
              Got it — we will call you on {phone}.
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Our sales team will be in touch within 1 business day with pricing and availability.
            </p>
            <button type="button" onClick={close} className="mt-5 text-sm font-semibold text-brand underline">
              Keep browsing
            </button>
          </div>
        ) : (
          <>
            <h2 id="leadcapture-title" className="pr-8 text-lg font-bold text-brand sm:text-xl">
              Share your requirement with Ramani Steel House
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Leave a number and our sales team will call you with pricing and availability. Orders start
              at {MINIMUM_ORDER_QUANTITY}.
            </p>
            <form onSubmit={submit} className="mt-5">
              <label htmlFor="leadcapture-phone" className="block text-sm font-semibold text-brand">
                Mobile number
              </label>
              <input
                id="leadcapture-phone"
                ref={inputRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98765 43210"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'leadcapture-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              {error ? (
                <p id="leadcapture-error" className="mt-2 text-sm font-semibold text-red-600">
                  {error}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">We will only use this to answer your enquiry.</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full rounded-lg bg-brand py-3 font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Contact me'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
