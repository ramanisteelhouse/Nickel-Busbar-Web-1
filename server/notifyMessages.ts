import { formatSpec, normaliseSpec } from "../src/lib/stripSpec.js";

/**
 * The text of an order notification, built once for every runtime.
 *
 * apiApp.ts sends it over SMTP and the Worker sends it over an HTTP email API (server/notify.ts),
 * but the sales team should receive the same message either way — including the size line, which
 * is the part that makes an RFQ actionable without a phone call.
 */

export type QuoteNotificationPayload = {
  id: number;
  customer: Record<string, unknown>;
  items: Array<{ product_name?: string; quantity?: number | string; unit_price?: number | string; line_total?: number | string; spec?: unknown }>;
  summary: Record<string, unknown>;
};

export const formatQuoteMessage = (payload: QuoteNotificationPayload) => {
  const { customer, items, summary } = payload;
  const lines = [
    `New quote / cart request received (#${payload.id})`,
    `Name: ${customer.full_name || "N/A"}`,
    `Email: ${customer.email || "N/A"}`,
    `Phone: ${customer.phone_full || customer.phone_number || "N/A"}`,
    `GST Number: ${customer.gst_number || "N/A"}`,
    `Pin Code: ${customer.pin_code || "N/A"}`,
    ``,
    `Items:`,
    ...items.map(
      (item) =>
        `- ${item.product_name || "Unnamed product"} | Size: ${item.spec ? formatSpec(normaliseSpec(item.spec)) : "not given"} | Qty: ${item.quantity ?? "N/A"} | Unit Price: ${item.unit_price ?? "N/A"} | Total: ${item.line_total ?? "N/A"}`
    ),
    ``,
    `Subtotal: ${summary.subtotal ?? "N/A"}`,
    `GST: ${summary.gst ?? "N/A"}`,
    `Total: ${summary.total ?? "N/A"} ${summary.currency ?? ""}`.trim(),
    `Received at: ${new Date().toISOString()}`,
  ];
  return lines.join("\n");
};
