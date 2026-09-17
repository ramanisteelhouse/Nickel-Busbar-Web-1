/**
 * Saving the checkout RFQ to the database, with the lead kept if the save fails.
 *
 * The WhatsApp button does two things: it records the request in quote_requests, and it opens
 * wa.me with the cart written out as a message. Those have very different failure costs. If the
 * database write fails the business loses its record of the enquiry; if the WhatsApp window
 * never opens the buyer loses the enquiry itself and almost certainly does not start again.
 *
 * So WhatsApp is never blocked on the save — CheckoutPage opens it either way. This module's
 * job is to make sure that "the save failed" does not also mean "the data is gone": one retry
 * for the transient case, and a localStorage queue for the rest, flushed on the next visit to
 * checkout. A queued request is worth keeping because it holds the buyer's name, email, phone
 * and the exact cart — everything needed to follow up, none of which is recoverable afterwards
 * for a buyer who never signed in.
 *
 * On duplicates: a retry runs only after a network error or a 5xx. The endpoint rolls its
 * transaction back before returning 500, so a 5xx leaves no row and retrying is safe. A network
 * error raised after the commit but before the response arrived would produce a second row —
 * possible, rare, and much cheaper than dropping the lead, since two identical rows seconds
 * apart are obvious to whoever reads the table. The timestamp is carried on the queued copy so
 * a flushed request is not mistaken for a fresh one.
 */

const PENDING_KEY = 'pending_quote_requests';

/** Keeps a corrupt or runaway queue from filling the origin's storage quota. */
const MAX_PENDING = 10;

/** Older than this and the buyer has almost certainly been dealt with by hand over WhatsApp. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type QuotePayload = Record<string, unknown>;

type PendingQuote = { queuedAt: number; payload: QuotePayload };

/**
 * Every read is wrapped: localStorage throws on access in a private window with site data
 * blocked, and a half-written value parses to nothing. A broken queue must not take down the
 * checkout page it runs on.
 */
function readPending(): PendingQuote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (entry): entry is PendingQuote =>
        entry && typeof entry.queuedAt === 'number' && now - entry.queuedAt < MAX_AGE_MS && !!entry.payload
    );
  } catch {
    return [];
  }
}

function writePending(entries: PendingQuote[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (entries.length === 0) window.localStorage.removeItem(PENDING_KEY);
    else window.localStorage.setItem(PENDING_KEY, JSON.stringify(entries.slice(-MAX_PENDING)));
  } catch {
    // Storage unavailable or full. The request is still going out over WhatsApp, which is the
    // path the buyer sees; there is nothing useful to do here.
  }
}

/** Resolves false only for a failure worth retrying — a network error or a 5xx. */
async function postQuote(payload: QuotePayload): Promise<{ ok: boolean; retryable: boolean; error?: string }> {
  try {
    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) return { ok: true, retryable: false };

    let error = `Request failed (${response.status})`;
    try {
      const data = await response.clone().json();
      if (data && typeof data.error === 'string') error = data.error;
    } catch {
      // Not JSON; the status-based message above stands.
    }
    // A 4xx is the payload's own fault and will fail identically on every retry, so it is not
    // queued — queueing it would retry it on every checkout visit until it aged out.
    return { ok: false, retryable: response.status >= 500, error };
  } catch (cause) {
    return {
      ok: false,
      retryable: true,
      error: cause instanceof Error ? cause.message : 'Network error',
    };
  }
}

/**
 * Saves the request. Returns whether it reached the database, and whether it was kept for a
 * later attempt if not — CheckoutPage uses that to word the message it shows.
 */
export async function saveQuoteRequest(
  payload: QuotePayload
): Promise<{ saved: boolean; queued: boolean; error?: string }> {
  const first = await postQuote(payload);
  if (first.ok) return { saved: true, queued: false };

  if (!first.retryable) return { saved: false, queued: false, error: first.error };

  // One retry, after a short pause. A serverless cold start or a database connection being
  // re-established is the common cause and clears in well under a second.
  await new Promise((resolve) => setTimeout(resolve, 800));
  const second = await postQuote(payload);
  if (second.ok) return { saved: true, queued: false };

  if (second.retryable) {
    writePending([...readPending(), { queuedAt: Date.now(), payload }]);
    return { saved: false, queued: true, error: second.error };
  }
  return { saved: false, queued: false, error: second.error };
}

/**
 * Retries anything queued by an earlier visit. Called on checkout mount; failures are left in
 * the queue for the visit after this one, and anything past MAX_AGE_MS is dropped by readPending.
 */
export async function flushPendingQuotes(): Promise<number> {
  const pending = readPending();
  if (pending.length === 0) {
    writePending(pending);
    return 0;
  }

  const stillPending: PendingQuote[] = [];
  let flushed = 0;
  for (const entry of pending) {
    const result = await postQuote(entry.payload);
    if (result.ok) flushed += 1;
    else if (result.retryable) stillPending.push(entry);
    // A non-retryable failure is dropped: it will never succeed, and holding it only makes
    // every future checkout visit pay for the attempt.
  }
  writePending(stillPending);
  return flushed;
}
