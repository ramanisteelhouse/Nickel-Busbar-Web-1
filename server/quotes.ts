import pool, { queryOne } from "../db.js";
import { formatSpec, normaliseSpec } from "../src/lib/stripSpec.js";

/**
 * Creating a quote request — the RFQ the checkout sends.
 *
 * Extracted from apiApp.ts so Express and the Cloudflare Worker write the order the same way.
 * This is the one path on the site where a difference between hosts would cost real money, so
 * there is exactly one copy of the transaction.
 *
 * Deliberately only the database work. Notifications and the CRM push differ by runtime (SMTP
 * and `waitUntil` on Node, HTTP and `ctx.waitUntil` on Workers), so the caller does those with
 * the result this returns.
 */

/** Each item is its own INSERT inside one transaction, so an oversized array would hold a pooled connection open for thousands of round trips. */
export const MAX_QUOTE_ITEMS = 200;

export type QuoteRequestBody = {
  customer?: Record<string, any>;
  items?: any[];
  summary?: Record<string, any>;
  shipping_option?: string | null;
  meta?: Record<string, any>;
};

export type QuoteCreateResult = {
  id: number;
  itemsCount: number;
  /** The body with the contact details filled in from the account, for the CRM and notifications. */
  leadBody: Record<string, any>;
};

export function validateQuoteBody(body: QuoteRequestBody): { error: string } | null {
  const items = body?.items;
  if (!Array.isArray(items) || items.length === 0) return { error: "Cart items are required." };
  if (items.length > MAX_QUOTE_ITEMS) {
    return { error: `A quote cannot contain more than ${MAX_QUOTE_ITEMS} items.` };
  }
  return null;
}

export async function createQuoteRequest(
  body: QuoteRequestBody,
  userId: number | null
): Promise<QuoteCreateResult> {
  const customer = body.customer ?? {};
  const items = body.items ?? [];
  const summary = body.summary ?? {};
  const meta = body.meta ?? {};
  const itemsCount = items.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 0), 0);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const quoteResult = await client.query<{ id: number }>(
      // full_name and email are stored, not just forwarded to the notification. Checkout
      // makes both mandatory, and for an anonymous buyer there is no users row to recover
      // them from later — without these columns the request landed in the table with no way
      // to reply to it except the WhatsApp thread.
      `INSERT INTO quote_requests
          (user_id, full_name, email, phone_country_code, phone_number, phone_full, gst_number, pin_code,
           shipping_option, subtotal, gst, total, currency, locale, items_count, source, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING id`,
      [
        userId ?? null,
        customer.full_name ?? null,
        customer.email ?? null,
        customer.phone_country_code ?? null,
        customer.phone_number ?? null,
        customer.phone_full ?? null,
        customer.gst_number ?? null,
        customer.pin_code ?? null,
        body.shipping_option ?? null,
        summary.subtotal ?? null,
        summary.gst ?? null,
        summary.total ?? null,
        summary.currency ?? null,
        summary.locale ?? null,
        itemsCount,
        meta.source ?? null,
        meta.user_agent ?? null,
      ]
    );

    const quote = quoteResult.rows[0];
    if (!quote) throw new Error("Failed to create quote request");

    for (const item of items) {
      await client.query(
        `INSERT INTO quote_request_items
            (quote_request_id, product_id, product_name, category_name, quantity, unit_price, line_total, spec, spec_summary)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          quote.id,
          item.product_id ?? null,
          item.product_name ?? null,
          item.category_name ?? null,
          item.quantity ?? null,
          item.unit_price ?? null,
          item.line_total ?? null,
          // The size the buyer chose, sanitised here rather than trusted: it is free text from
          // a browser and it ends up in the sales team's view of the order.
          item.spec ? JSON.stringify(normaliseSpec(item.spec)) : null,
          item.spec ? formatSpec(normaliseSpec(item.spec)) : null,
        ]
      );
    }

    await client.query("COMMIT");

    // The checkout form may only collect phone/GST/PIN, so fall back to the signed-in account
    // for a usable contact name and email.
    const account = userId
      ? await queryOne<{ name: string; email: string }>("SELECT name, email FROM users WHERE id = $1", [userId])
      : null;

    const leadBody = {
      ...body,
      customer: {
        ...customer,
        full_name: customer.full_name ?? account?.name ?? null,
        email: customer.email ?? account?.email ?? null,
      },
    };

    return { id: quote.id, itemsCount, leadBody };
  } catch (error) {
    // A dropped connection is the usual reason the transaction failed in the first place, and
    // ROLLBACK will then fail too. Unguarded, that second error escapes this catch entirely.
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to roll back quote request transaction", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}
