import React from 'react';
import { Phone, Check, Loader2 } from 'lucide-react';

/**
 * The product-page call to action: one field, then the rest.
 *
 * Two things were losing enquiries. The "Request Quote" button navigated the buyer off the
 * product page to /products?enquiry=1 — a page change in the middle of the decision, and every
 * navigation is somewhere to drop out. And the form there asks nine fields before it saves
 * anything, so a buyer who gives up at field four leaves nothing behind at all.
 *
 * This inverts that. Stage one asks for a phone number and nothing else, in place, and the lead
 * is written to the database on that submit. Stage two then asks for the detail that sharpens a
 * quotation — quantity, thickness, company — and is explicitly optional, because by then the
 * contact is already captured. Abandoning stage two costs the detail, not the buyer.
 *
 * It is the pattern the marketplaces use for the same reason: a single field converts several
 * times better than a form, and a phone number is all a salesperson needs to start.
 */

type Props = {
  productName: string;
  productId?: number;
  /** Prefills stage two, since the page already knows the specification being viewed. */
  defaultThickness?: string;
};

type Stage = 'phone' | 'details' | 'done';

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/20';

export const QuickEnquiry: React.FC<Props> = ({ productName, productId, defaultThickness }) => {
  const [stage, setStage] = React.useState<Stage>('phone');
  const [phone, setPhone] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [lead, setLead] = React.useState<{ id: number; token: string } | null>(null);
  const [details, setDetails] = React.useState({
    fullName: '',
    email: '',
    company: '',
    location: '',
    quantity: '',
    thickness: defaultThickness ?? '',
    message: '',
  });

  const submitPhone = async (event: React.FormEvent) => {
    event.preventDefault();
    // Digits only, so "+91 98765 43210" and "09876543210" both pass. Ten is the shortest
    // Indian mobile; the country code makes it longer, never shorter.
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a phone number we can reach you on.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quick: true, phone, productName, productId }),
      });
      if (!response.ok) throw new Error('failed');
      const data = (await response.json()) as { id: number; token: string };
      setLead(data);
      setStage('details');
    } catch {
      setError('That did not send. Please try again, or call us directly.');
    } finally {
      setBusy(false);
    }
  };

  const submitDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lead) return;
    setBusy(true);
    setError('');
    try {
      await fetch(`/api/enquiries/${lead.id}/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: lead.token, ...details }),
      });
    } catch {
      // Deliberately swallowed: the enquiry itself is already saved, and telling someone their
      // submission failed when we do have their number would be false.
    } finally {
      setBusy(false);
      setStage('done');
    }
  };

  const set = (key: keyof typeof details) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails((current) => ({ ...current, [key]: event.target.value }));

  if (stage === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 text-emerald-800">
          <Check size={18} />
          <p className="font-semibold">Thank you — we have your enquiry.</p>
        </div>
        <p className="mt-2 text-sm text-emerald-900/80">
          Our sales team will call you on {phone} within 1 business day with pricing and availability for {productName}.
        </p>
      </div>
    );
  }

  if (stage === 'details') {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700">
          <Check size={18} />
          <p className="text-sm font-semibold">Got it — we will call you on {phone}.</p>
        </div>
        <h3 className="mt-4 text-base font-bold text-zinc-900">Want an exact price instead of a range?</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Anything you add here goes to the estimator before we call. All optional.
        </p>
        <form onSubmit={submitDetails} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className={inputClass} placeholder="Full name" value={details.fullName} onChange={set('fullName')} aria-label="Full name" />
          <input className={inputClass} type="email" placeholder="Email" value={details.email} onChange={set('email')} aria-label="Email" />
          <input className={inputClass} placeholder="Company" value={details.company} onChange={set('company')} aria-label="Company" />
          <input className={inputClass} placeholder="City / country" value={details.location} onChange={set('location')} aria-label="Location" />
          <input className={inputClass} placeholder="Quantity (kg)" value={details.quantity} onChange={set('quantity')} aria-label="Required quantity" />
          <input className={inputClass} placeholder="Thickness (e.g. 0.15 mm)" value={details.thickness} onChange={set('thickness')} aria-label="Thickness" />
          <textarea
            className={`${inputClass} sm:col-span-2`}
            rows={3}
            placeholder="Cell format, pitch, pattern, or anything else we should quote against"
            value={details.message}
            onChange={set('message')}
            aria-label="Message"
          />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              Send these details
            </button>
            <button
              type="button"
              onClick={() => setStage('done')}
              className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
            >
              No thanks, just call me
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-zinc-900">Get price and availability</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Leave a number and our sales team will call you about {productName} within 1 business day.
      </p>
      <form onSubmit={submitPhone} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            className={`${inputClass} pl-10`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Your mobile number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-label="Your mobile number"
            required
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          Get a quote
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <p className="mt-2 text-xs text-zinc-400">We use your number only to answer this enquiry.</p>
    </div>
  );
};
