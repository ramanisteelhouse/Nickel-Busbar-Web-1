/**
 * Order notifications over HTTP, for runtimes that cannot open an SMTP connection.
 *
 * apiApp.ts sends these with nodemailer (SMTP) and the Twilio SDK. Neither runs on Cloudflare
 * Workers: there is no raw SMTP, and the Twilio SDK is built on Node's http module. Both
 * services do have plain HTTPS APIs, which `fetch` can call from anywhere — so this module
 * re-implements the same two notifications with nothing but fetch.
 *
 * Email provider is chosen by whichever secret is set, so the host can be switched without a
 * code change:
 *   RESEND_API_KEY   -> Resend
 *   SENDGRID_API_KEY -> SendGrid
 * With neither set, email is skipped and logged. That is deliberate: a missing email key must
 * never fail the request that saved the order. The order is already in the database, the buyer
 * has already been handed to WhatsApp, and the CRM push is separate.
 */

export type NotifyEnv = Record<string, string | undefined>;

export type NotificationMessage = {
  subject: string;
  text: string;
};

const recipients = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

async function sendWithResend(env: NotifyEnv, message: NotificationMessage, to: string[]): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.SMTP_FROM || "noreply@nickelbusbar.com",
      to,
      subject: message.subject,
      text: message.text,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
}

async function sendWithSendgrid(env: NotifyEnv, message: NotificationMessage, to: string[]): Promise<void> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: to.map((email) => ({ email })) }],
      from: { email: env.SMTP_FROM || "noreply@nickelbusbar.com" },
      subject: message.subject,
      content: [{ type: "text/plain", value: message.text }],
    }),
  });
  if (!response.ok) {
    throw new Error(`SendGrid returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
}

export async function sendNotificationEmail(env: NotifyEnv, message: NotificationMessage): Promise<boolean> {
  const to = recipients(env.ENQUIRY_NOTIFY_EMAILS);
  if (!to.length) return false;

  if (env.RESEND_API_KEY) {
    await sendWithResend(env, message, to);
    return true;
  }
  if (env.SENDGRID_API_KEY) {
    await sendWithSendgrid(env, message, to);
    return true;
  }

  console.warn(
    "[notify] No RESEND_API_KEY or SENDGRID_API_KEY set; email notification skipped. " +
      "SMTP is not available on this runtime."
  );
  return false;
}

/**
 * Twilio's REST API, called directly rather than through its SDK. Basic auth with the account
 * SID and token, and a form-encoded body — the same request the SDK would make.
 */
export async function sendNotificationWhatsApp(env: NotifyEnv, body: string): Promise<boolean> {
  const sid = env.TWILIO_ACCOUNT_SID;
  const token = env.TWILIO_AUTH_TOKEN;
  const from = env.TWILIO_WHATSAPP_FROM;
  const to = recipients(env.ENQUIRY_NOTIFY_WHATSAPP);
  if (!sid || !token || !from || !to.length) return false;

  const form = (recipient: string) =>
    new URLSearchParams({
      From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
      To: recipient.startsWith("whatsapp:") ? recipient : `whatsapp:${recipient}`,
      Body: body,
    });

  for (const recipient of to) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form(recipient).toString(),
    });
    if (!response.ok) {
      throw new Error(`Twilio returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
  }
  return true;
}

/**
 * Sends both, and never rejects: a notification failure must not turn a saved order into an
 * error for the buyer. Failures are logged for whoever reads the Worker's logs.
 */
export async function notifyOrder(env: NotifyEnv, message: NotificationMessage): Promise<void> {
  const results = await Promise.allSettled([
    sendNotificationEmail(env, message),
    sendNotificationWhatsApp(env, message.text),
  ]);
  for (const result of results) {
    if (result.status === "rejected") console.error("[notify] notification failed", result.reason);
  }
}
