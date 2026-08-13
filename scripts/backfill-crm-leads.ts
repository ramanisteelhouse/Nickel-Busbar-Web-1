/**
 * One-off backfill: queues enquiries and quote requests that predate the CRM
 * integration into crm_lead_sync.
 *
 *   npx tsx scripts/backfill-crm-leads.ts           # dry run, prints what it would queue
 *   npx tsx scripts/backfill-crm-leads.ts --commit  # actually queue them
 *
 * Safe to re-run: enqueueLead uses ON CONFLICT (external_id) DO NOTHING, so a
 * lead already in the queue is skipped rather than duplicated.
 */
import dotenv from "dotenv";
import pool, { query } from "../db.js";
import { buildEnquiryLead, buildQuoteLead, ensureCrmSyncSchema, enqueueLead } from "../crm.js";

dotenv.config();

const commit = process.argv.includes("--commit");

type EnquiryRow = {
  id: number;
  product_id: number | null;
  product_name: string | null;
  requirement: string | null;
  thickness: string | null;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  location: string | null;
  quantity: string | null;
  message: string | null;
  user_id: number | null;
};

type QuoteRow = {
  id: number;
  user_id: number | null;
  phone_country_code: string | null;
  phone_number: string | null;
  phone_full: string | null;
  gst_number: string | null;
  pin_code: string | null;
  shipping_option: string | null;
  subtotal: string | null;
  gst: string | null;
  total: string | null;
  currency: string | null;
  locale: string | null;
  items_count: number | null;
  source: string | null;
  user_agent: string | null;
};

async function main() {
  await ensureCrmSyncSchema();

  const enquiries = await query<EnquiryRow>(
    `SELECT e.* FROM product_enquiries e
      WHERE NOT EXISTS (
        SELECT 1 FROM crm_lead_sync s WHERE s.external_id = 'enquiry:' || e.id
      )
      ORDER BY e.id ASC`
  );

  const quotes = await query<QuoteRow>(
    `SELECT q.* FROM quote_requests q
      WHERE NOT EXISTS (
        SELECT 1 FROM crm_lead_sync s WHERE s.external_id = 'quote:' || q.id
      )
      ORDER BY q.id ASC`
  );

  console.log(`Unqueued enquiries: ${enquiries.length}`);
  console.log(`Unqueued quotes:    ${quotes.length}`);

  if (!commit) {
    enquiries.forEach((e) => console.log(`  would queue enquiry:${e.id}  ${e.full_name} <${e.email}>`));
    quotes.forEach((q) => console.log(`  would queue quote:${q.id}  ${q.phone_full ?? "no phone"}`));
    console.log("\nDry run. Re-run with --commit to queue these.");
    return;
  }

  for (const e of enquiries) {
    await enqueueLead(
      "enquiry",
      e.id,
      buildEnquiryLead(
        e.id,
        {
          productId: e.product_id,
          productName: e.product_name,
          requirement: e.requirement,
          thickness: e.thickness,
          fullName: e.full_name,
          email: e.email,
          phone: e.phone,
          company: e.company,
          location: e.location,
          quantity: e.quantity,
          message: e.message,
        },
        e.user_id
      )
    );
    console.log(`  queued enquiry:${e.id}`);
  }

  for (const q of quotes) {
    const items = await query<{
      product_id: number | null;
      product_name: string | null;
      category_name: string | null;
      quantity: number | null;
      unit_price: string | null;
      line_total: string | null;
    }>(
      `SELECT product_id, product_name, category_name, quantity, unit_price, line_total
         FROM quote_request_items WHERE quote_request_id = $1`,
      [q.id]
    );

    await enqueueLead(
      "quote",
      q.id,
      buildQuoteLead(
        q.id,
        {
          customer: {
            phone_country_code: q.phone_country_code,
            phone_number: q.phone_number,
            phone_full: q.phone_full,
            gst_number: q.gst_number,
            pin_code: q.pin_code,
          },
          items,
          summary: {
            subtotal: q.subtotal,
            gst: q.gst,
            total: q.total,
            currency: q.currency,
            locale: q.locale,
          },
          shipping_option: q.shipping_option,
          meta: { source: q.source, user_agent: q.user_agent },
        },
        q.user_id,
        q.items_count ?? items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
      )
    );
    console.log(`  queued quote:${q.id}`);
  }

  console.log("\nBackfill complete.");
}

main()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
