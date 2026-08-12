import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID, timingSafeEqual } from "crypto";
import pool, { query, queryOne } from "./db.js";
import { answerFromKnowledgeBase } from "./chatKnowledgeBase.js";
import type { CrmLead } from "./crm.js";
import {
  CRM_API_KEY,
  acknowledgeLead,
  buildEnquiryLead,
  buildQuoteLead,
  enqueueLead,
  ensureCrmSyncSchema,
  listLeads,
  retryFailedLeads,
  startCrmSyncWorker,
} from "./crm.js";
import {
  EMAIL_ADDRESSES,
  PRIMARY_EMAIL,
  emailListSentence,
  phoneListSentence,
} from "./src/lib/contact.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Missing JWT_SECRET environment variable. Set a long, random secret (never a hardcoded default) before starting the server."
    );
  }
  return secret;
})();
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
// Falls back to the published addresses so lead alerts still arrive if the env
// var is missing, rather than silently going nowhere.
const ENQUIRY_NOTIFY_EMAILS = (() => {
  const configured = (process.env.ENQUIRY_NOTIFY_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : [...EMAIL_ADDRESSES];
})();
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const ENQUIRY_NOTIFY_WHATSAPP = process.env.ENQUIRY_NOTIFY_WHATSAPP;
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const IPSTACK_API_KEY = process.env.IPSTACK_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const MAX_QUOTE_ITEMS = 200;
const MAX_CART_ITEMS = 200;
const MAX_CART_QUANTITY = 1_000_000;
const MAX_PREFERENCES_BYTES = 16 * 1024;

const emailTransporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

const whatsappClient =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;
let adsTableMissingWarned = false;
const exchangeRateCache = new Map<string, { expiresAt: number; payload: Record<string, unknown> }>();
const localizationCache = new Map<string, { expiresAt: number; payload: Record<string, string> }>();
// This cache is keyed by client IP, so without pruning it grows for the life of the process
// (expiry was only ever consulted on read, never used to evict). Called before each insert:
// drop everything already expired, then, if still over the ceiling, evict oldest-first.
const MAX_LOCALIZATION_CACHE_ENTRIES = 5_000;
const pruneLocalizationCache = () => {
  const now = Date.now();
  for (const [key, entry] of localizationCache) {
    if (entry.expiresAt <= now) localizationCache.delete(key);
  }
  // Map preserves insertion order, so the oldest surviving entries come first.
  for (const key of localizationCache.keys()) {
    if (localizationCache.size <= MAX_LOCALIZATION_CACHE_ENTRIES) break;
    localizationCache.delete(key);
  }
};
let ipApiCooldownUntil = 0;

type EnquiryNotificationPayload = {
  productId?: string | number | null;
  productName?: string | null;
  requirement?: string | null;
  thickness?: string | null;
  fullName: string;
  email: string;
  phone: string;
  company?: string | null;
  location?: string | null;
  quantity?: string | null;
  message?: string | null;
};

const formatEnquiryMessage = (payload: EnquiryNotificationPayload) => {
  const lines = [
    `New product enquiry received`,
    `Product: ${payload.productName || "Not selected"}${payload.productId ? ` (#${payload.productId})` : ""}`,
    `Requirement: ${payload.requirement || "N/A"}`,
    `Thickness: ${payload.thickness || "N/A"}`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Company: ${payload.company || "N/A"}`,
    `Location: ${payload.location || "N/A"}`,
    `Quantity: ${payload.quantity || "N/A"}`,
    `Message: ${payload.message || "N/A"}`,
    `Received at: ${new Date().toISOString()}`,
  ];
  return lines.join("\n");
};

const sendNotification = async (subject: string, message: string) => {
  const tasks: Promise<unknown>[] = [];

  if (emailTransporter && ENQUIRY_NOTIFY_EMAILS.length > 0) {
    const fromAddress = SMTP_FROM || SMTP_USER || PRIMARY_EMAIL;
    tasks.push(
      emailTransporter.sendMail({
        from: fromAddress,
        to: ENQUIRY_NOTIFY_EMAILS,
        subject,
        text: message,
      })
    );
  }

  if (whatsappClient && TWILIO_WHATSAPP_FROM && ENQUIRY_NOTIFY_WHATSAPP) {
    tasks.push(
      whatsappClient.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: ENQUIRY_NOTIFY_WHATSAPP,
        body: message,
      })
    );
  }

  if (tasks.length === 0) return;

  const results = await Promise.allSettled(tasks);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Failed to send notification", result.reason);
    }
  });
};

const sendEnquiryNotifications = (payload: EnquiryNotificationPayload) =>
  sendNotification(`New Product Enquiry - ${payload.productName || "General"}`, formatEnquiryMessage(payload));

type QuoteNotificationPayload = {
  id: number;
  customer: Record<string, unknown>;
  items: Array<{ product_name?: string; quantity?: number | string; unit_price?: number | string; line_total?: number | string }>;
  summary: Record<string, unknown>;
};

const formatQuoteMessage = (payload: QuoteNotificationPayload) => {
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
        `- ${item.product_name || "Unnamed product"} | Qty: ${item.quantity ?? "N/A"} | Unit Price: ${item.unit_price ?? "N/A"} | Total: ${item.line_total ?? "N/A"}`
    ),
    ``,
    `Subtotal: ${summary.subtotal ?? "N/A"}`,
    `GST: ${summary.gst ?? "N/A"}`,
    `Total: ${summary.total ?? "N/A"} ${summary.currency ?? ""}`.trim(),
    `Received at: ${new Date().toISOString()}`,
  ];
  return lines.join("\n");
};

const sendQuoteNotifications = (payload: QuoteNotificationPayload) =>
  sendNotification(`New Quote Request #${payload.id}`, formatQuoteMessage(payload));

const sendWelcomeEmail = async (user: { name?: string | null; email: string }) => {
  if (!emailTransporter) return;

  const fromAddress = SMTP_FROM || SMTP_USER || PRIMARY_EMAIL;
  const displayName = user.name?.trim() || "there";

  try {
    await emailTransporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject: "Welcome to Ramani Steel House - Thank you for signing up!",
      text: [
        `Hi ${displayName},`,
        "",
        "Thank you for creating an account with Ramani Steel House, a nickel strip manufacturer serving lithium-ion battery and energy storage customers across India and international markets.",
        "",
        "You can now browse our nickel strip, nickel alloy and stainless steel catalog, save items to your cart, and request quotes directly from your account.",
        "",
        `If you have any questions, reach us anytime at ${emailListSentence()} or ${phoneListSentence()}.`,
        "",
        "Best regards,",
        "Ramani Steel House Team",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Failed to send welcome email", error);
  }
};

const readCookie = (cookieHeader: string | undefined, name: string) => {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${encodeURIComponent(name)}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
};

const normalizeIp = (value: string | undefined) => {
  if (!value) return "";
  const first = value.split(",")[0]?.trim() || "";
  if (!first || first === "::1" || first === "127.0.0.1") return "";
  return first.replace(/^::ffff:/, "");
};

const getRequesterIp = (req: express.Request) => {
  return (
    normalizeIp(req.headers["x-forwarded-for"] as string | undefined) ||
    normalizeIp(req.headers["x-real-ip"] as string | undefined) ||
    normalizeIp(req.socket.remoteAddress) ||
    "check"
  );
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toFiniteInteger = (value: unknown, fallback = 0) => {
  const parsed = toFiniteNumber(value, fallback);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const normalizeImageSource = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  const compact = value.replace(/\u0000/g, "").trim();
  if (!compact) {
    return "";
  }

  // Some rows contain accidental multi-line image content. Keep the first usable source.
  const candidates = compact
    .split(/[\r\n]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const firstUsable =
    candidates.find((entry) => /^https?:\/\//i.test(entry) || entry.startsWith("/")) ||
    candidates[0] ||
    "";

  const cleaned = firstUsable.trim();
  if (cleaned.includes("images.unsplash.com/photo-1535813548-6601f6945379")) {
    return "/img/icon-logo.jpg";
  }

  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith("/")) {
    return cleaned;
  }

  return `/${encodeURI(cleaned)}`;
};

const normalizeStringArray = (value: unknown) => {
  const raw = typeof value === "string" ? (() => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  })() : value;

  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : null;
};

const normalizeProductRow = (row: Record<string, unknown>) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  category_id: toFiniteInteger(row.category_id, 0),
  price: toFiniteNumber(row.price, 0),
  stock: toFiniteInteger(row.stock, 0),
  image: normalizeImageSource(row.image),
  applications: normalizeStringArray(row.applications),
});

const normalizeAdRow = (row: Record<string, unknown>) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  priority: toFiniteInteger(row.priority, 0),
  discount_percent:
    row.discount_percent == null ? null : toFiniteInteger(row.discount_percent, 0),
  image_url: normalizeImageSource(row.image_url),
});

const normalizeFaqItems = (value: unknown) => {
  const raw = typeof value === "string" ? (() => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  })() : value;

  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = String((item as Record<string, unknown>).question || "").trim();
      const answer = String((item as Record<string, unknown>).answer || "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => item !== null);

  return items.length > 0 ? items : null;
};

// Addresses are stored lowercased and trimmed from here on. Lookups still compare with
// lower(email) rather than an exact match, so accounts created before this normalization
// (which may hold mixed case or stray whitespace) can still sign in.
const normalizeEmail = (value: string) => value.trim().toLowerCase();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts strings only: anything else (object, array, number) becomes null rather than being
// stringified into a text column by the driver. Trims, then caps length so a caller cannot
// push values up to the 1mb body limit into free-text columns.
const optionalText = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

const normalizeBlogRow = (row: Record<string, unknown>) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  title: String(row.title || "").trim(),
  slug: String(row.slug || "").trim(),
  excerpt: row.excerpt == null ? null : String(row.excerpt),
  content: row.content == null ? null : String(row.content),
  cover_image_url: normalizeImageSource(row.cover_image_url),
  cover_image_alt: row.cover_image_alt == null ? null : String(row.cover_image_alt).trim() || null,
  author_name: row.author_name == null ? null : String(row.author_name),
  status: row.status == null ? null : String(row.status),
  meta_title: row.meta_title == null ? null : String(row.meta_title),
  meta_description: row.meta_description == null ? null : String(row.meta_description),
  faq_items: normalizeFaqItems(row.faq_items),
});

const getExchangeRates = async (baseCurrency: string) => {
  const base = baseCurrency.toUpperCase();
  const cached = exchangeRateCache.get(base);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const fallbackProvider = "open-er-api";

  const fetchFromExchangeRateApi = async () => {
    if (!EXCHANGE_RATE_API_KEY) {
      throw new Error("Missing ExchangeRate-API key");
    }
    return fetchJson<Record<string, unknown>>(
      `https://v6.exchangerate-api.com/v6/${encodeURIComponent(EXCHANGE_RATE_API_KEY)}/latest/${encodeURIComponent(base)}`,
    );
  };

  const fetchFromOpenErApi = async () =>
    fetchJson<Record<string, unknown>>(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);

  let payload: Record<string, unknown>;
  try {
    payload = await fetchFromExchangeRateApi();
  } catch (error) {
    payload = await fetchFromOpenErApi();
    payload.provider = fallbackProvider;
  }

  exchangeRateCache.set(base, {
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
    payload,
  });

  return payload;
};

// Express 4 does not forward a rejected promise from an async route handler to the error
// middleware at the bottom of this file. The rejection escapes as an unhandledRejection,
// which terminates the process on Node >= 15, so one malformed request could take the whole
// API down. Every async handler is registered through this wrapper so failures reach next()
// and get the generic 500 response instead.
const asyncHandler =
  (
    handler: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => Promise<unknown>
  ): express.RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };

const getAuthTokenFromRequest = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  return readCookie(req.headers.cookie, "auth_token");
};

const verifyGoogleCredential = async (credential: string) => {
  const data = await fetchJson<{
    aud?: string;
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  }>(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);

  if (GOOGLE_CLIENT_ID && data.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google token audience mismatch");
  }
  if (!data.sub || !data.email) {
    throw new Error("Invalid Google token");
  }
  return data;
};

const getSessionUserId = (req: express.Request) => {
  const token = getAuthTokenFromRequest(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
};

const ensureProductEnquiriesSchema = async () => {
  try {
    await query(`ALTER TABLE public.product_enquiries ADD COLUMN IF NOT EXISTS thickness text`);
    await query(
      `ALTER TABLE public.product_enquiries ADD COLUMN IF NOT EXISTS user_id bigint REFERENCES public.users(id) ON DELETE SET NULL`
    );
  } catch (error) {
    console.error("Failed to ensure product_enquiries schema is up to date", error);
  }
};

const ensureCallTrackingSchema = async () => {
  try {
    await query(`ALTER TABLE public.visitor_logs ADD COLUMN IF NOT EXISTS visitor_id text`);
    await query(`CREATE INDEX IF NOT EXISTS visitor_logs_visitor_id_timestamp_idx ON public.visitor_logs (visitor_id, timestamp DESC)`);
    await query(`
      CREATE TABLE IF NOT EXISTS public.call_clicks (
        id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        visitor_id text,
        user_id bigint REFERENCES public.users(id) ON DELETE SET NULL,
        phone_number text NOT NULL,
        source text,
        last_page text,
        pages_viewed jsonb,
        user_agent text,
        referrer text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  } catch (error) {
    console.error("Failed to ensure call tracking schema is up to date", error);
  }
};

// Both migrations used to be kicked off unawaited at app construction, which on serverless
// means once per cold start with requests free to race ahead of the ALTER TABLE. Memoizing
// one promise lets the handlers that depend on these columns await it without re-running the
// DDL. Neither function rejects - each logs and swallows its own errors - so awaiting this is
// safe even when a migration fails.
let schemaReadyPromise: Promise<void> | null = null;
const ensureSchemaReady = () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await ensureProductEnquiriesSchema();
      await ensureCallTrackingSchema();
      await ensureCrmSyncSchema();
    })();
  }
  return schemaReadyPromise;
};

export function createApiApp() {
  const app = express();
  // The token's own expiry and the cookie's lifetime are derived from one value so they
  // can't drift apart. A token without an `expiresIn` stays valid forever and is accepted
  // as a Bearer header, where the cookie's maxAge gives no protection at all.
  const AUTH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
  const authCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: AUTH_TOKEN_TTL_SECONDS * 1000,
    secure: process.env.NODE_ENV === "production",
  };
  const signAuthToken = (user: { id: number; email: string; role: string }) =>
    jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: AUTH_TOKEN_TTL_SECONDS,
    });

  // Trust the first proxy hop (Vercel's edge network / any reverse proxy) so
  // req.ip reflects the real client IP for rate limiting instead of the proxy's.
  app.set("trust proxy", 1);

  // Start the migrations at boot so the common case is already settled by the first request;
  // the handlers that need these columns await the same promise before writing.
  void ensureSchemaReady();

  // CSP is left disabled here since it would need to allow Google Fonts, Unsplash,
  // Supabase storage, and Google Identity — safer to leave that to a follow-up pass
  // than ship an untested policy that silently breaks the page.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  app.use(express.json({ limit: "1mb" }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again in a few minutes." },
  });

  const enquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

  const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many messages. Please slow down and try again shortly." },
  });

  const callLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

  // Page-view logging fires on every navigation, so this ceiling is well above what a real
  // browsing session produces while still bounding how fast one client can grow the table.
  const analyticsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

  app.get("/api/auth/google/config", (_req, res) => {
    const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
    if (!clientId) {
      return res.json({ enabled: false });
    }
    res.json({
      enabled: true,
      clientId,
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });
  app.use((req, res, next) => {
    const sessionId = readCookie(req.headers.cookie, "site_session_id");
    if (!sessionId) {
      res.cookie("site_session_id", randomUUID(), { sameSite: "lax" });
    }
    next();
  });

  app.get("/api/localization/bootstrap", asyncHandler(async (req, res) => {
    const fallback = {
      countryCode: "IN",
      countryName: "India",
      currency: "INR",
      postalCode: "",
      city: "",
      region: "",
    };

    try {
      const requesterIp = getRequesterIp(req);
      const cacheKey = requesterIp || "check";
      const cached = localizationCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return res.json(cached.payload);
      }
      const endpoint = requesterIp === "check" ? "check" : encodeURIComponent(requesterIp);

      const fetchFromIpStack = async () => {
        if (!IPSTACK_API_KEY) {
          throw new Error("Missing ipstack API key");
        }
        const fields = encodeURIComponent("country_code,country_name,zip,city,region_name,currency");
        const geo = await fetchJson<{
          country_code?: string;
          country_name?: string;
          zip?: string;
          city?: string;
          region_name?: string;
          currency?: { code?: string };
        }>(
          `https://api.ipstack.com/${endpoint}?access_key=${encodeURIComponent(IPSTACK_API_KEY)}&fields=${fields}`,
        );

        return {
          countryCode: String(geo.country_code || fallback.countryCode).toUpperCase(),
          countryName: geo.country_name || fallback.countryName,
          currency: String(geo.currency?.code || fallback.currency).toUpperCase(),
          postalCode: geo.zip || "",
          city: geo.city || "",
          region: geo.region_name || "",
        };
      };

      const fetchFromIpApi = async () => {
        if (ipApiCooldownUntil > Date.now()) {
          throw new Error("ipapi provider cooling down after rate limit");
        }
        const url =
          requesterIp === "check"
            ? "https://ipapi.co/json/"
            : `https://ipapi.co/${encodeURIComponent(requesterIp)}/json/`;
        let geo: {
          country_code?: string;
          country_name?: string;
          postal?: string;
          city?: string;
          region?: string;
          currency?: string;
        };
        try {
          geo = await fetchJson(url);
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message.includes("status 429")) {
            ipApiCooldownUntil = Date.now() + 10 * 60 * 1000;
          }
          throw error;
        }

        return {
          countryCode: String(geo.country_code || fallback.countryCode).toUpperCase(),
          countryName: geo.country_name || fallback.countryName,
          currency: String(geo.currency || fallback.currency).toUpperCase(),
          postalCode: geo.postal || "",
          city: geo.city || "",
          region: geo.region || "",
        };
      };

      let localized = fallback;
      try {
        localized = await fetchFromIpStack();
      } catch {
        try {
          localized = await fetchFromIpApi();
        } catch {
          localized = fallback;
        }
      }

      pruneLocalizationCache();
      localizationCache.set(cacheKey, {
        expiresAt: Date.now() + 60 * 60 * 1000,
        payload: localized,
      });
      res.json(localized);
    } catch (error) {
      console.error("Failed to fetch IP localization", error);
      res.json(fallback);
    }
  }));

  app.get("/api/localization/countries", asyncHandler(async (_req, res) => {
    try {
      const countries = await fetchJson<unknown[]>(
        "https://restcountries.com/v3.1/all?fields=cca2,name,currencies",
      );
      res.json(countries);
    } catch (error) {
      console.error("Failed to fetch countries", error);
      res.status(502).json({ error: "Failed to fetch countries" });
    }
  }));

  app.get("/api/localization/exchange-rates", asyncHandler(async (req, res) => {
    const base = typeof req.query.base === "string" && req.query.base.trim()
      ? req.query.base.trim().toUpperCase()
      : "INR";

    try {
      const data = await getExchangeRates(base);
      const resolvedRates =
        (data.conversion_rates as Record<string, number> | undefined) ??
        (data.rates as Record<string, number> | undefined) ??
        { [base]: 1 };
      res.json({
        base,
        rates: resolvedRates,
        provider: data.provider || "exchangerate-api",
      });
    } catch (error) {
      console.error("Failed to fetch exchange rates", error);
      res.json({
        base,
        rates: { [base]: 1 },
        provider: "fallback",
      });
    }
  }));

  app.get("/api/localization/postal/:country/:postalCode", asyncHandler(async (req, res) => {
    const country = String(req.params.country || "").toLowerCase();
    const postalCode = String(req.params.postalCode || "").trim();

    if (!country || !postalCode) {
      return res.status(400).json({ error: "Country and postal code are required." });
    }

    try {
      const data = await fetchJson<{
        country?: string;
        places?: Array<{ "place name"?: string; state?: string }>;
      }>(
        `https://api.zippopotam.us/${encodeURIComponent(country)}/${encodeURIComponent(postalCode)}`,
      );

      const place = data.places?.[0];
      res.json({
        country: data.country || "",
        place: place?.["place name"] || "",
        state: place?.state || "",
      });
    } catch (error) {
      res.status(404).json({ error: "Postal code not found." });
    }
  }));

  // --- Auth Routes ---
  app.post("/api/auth/register", authLimiter, asyncHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      // The unique index on email is case-sensitive, so it alone would let User@x.com and
      // user@x.com both register and then collide with Google sign-in, which always
      // supplies a lowercased address.
      const existing = await queryOne<{ id: number }>("SELECT id FROM users WHERE lower(email) = $1", [
        normalizedEmail,
      ]);
      if (existing) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await queryOne<{ id: number; name: string; email: string; role: string }>(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role",
        [name.trim(), normalizedEmail, hashedPassword]
      );
      if (!user) return res.status(500).json({ error: "Failed to create user" });
      const token = signAuthToken(user);
      res.cookie("auth_token", token, authCookieOptions);
      void sendWelcomeEmail(user);
      res.json({ token, user });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  }));

  app.post("/api/auth/login", authLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    // Both fields are type-checked before use: bcrypt.compare throws on a non-string
    // password, which previously escaped this handler as an unhandled rejection.
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = await queryOne<any>("SELECT * FROM users WHERE lower(email) = $1", [normalizeEmail(email)]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signAuthToken(user);
    res.cookie("auth_token", token, authCookieOptions);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }));

  app.post("/api/auth/google", authLimiter, asyncHandler(async (req, res) => {
    const { credential } = req.body ?? {};
    if (!credential || typeof credential !== "string") {
      return res.status(400).json({ error: "Google credential is required." });
    }

    try {
      const profile = await verifyGoogleCredential(credential);
      const normalizedEmail = normalizeEmail(profile.email as string);
      const existing = await queryOne<{
        id: number;
        name: string;
        email: string;
        role: string;
      }>("SELECT id, name, email, role FROM users WHERE lower(email) = $1", [normalizedEmail]);

      let user = existing;
      const isNewUser = !existing;
      if (!existing) {
        const hashedPassword = await bcrypt.hash(randomUUID(), 10);
        user = await queryOne(
          `INSERT INTO users (name, email, password, role, provider, google_id, avatar_url)
           VALUES ($1, $2, $3, 'user', 'google', $4, $5)
           RETURNING id, name, email, role`,
          [profile.name || "Google User", normalizedEmail, hashedPassword, profile.sub, profile.picture || null]
        );
      } else {
        await query(
          `UPDATE users
           SET provider = 'google',
               google_id = $1,
               avatar_url = $2,
               name = COALESCE($3, name)
           WHERE id = $4`,
          [profile.sub, profile.picture || null, profile.name || null, existing.id]
        );
      }

      if (!user) {
        return res.status(500).json({ error: "Failed to save Google user." });
      }

      const token = signAuthToken(user);
      res.cookie("auth_token", token, authCookieOptions);
      if (isNewUser) {
        void sendWelcomeEmail(user);
      }
      res.json({ token, user });
    } catch (error) {
      console.error("Google sign-in failed", error);
      res.status(401).json({ error: "Google sign-in failed." });
    }
  }));

  app.get("/api/auth/session", asyncHandler(async (req, res) => {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return res.json({ user: null });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
      const user = await queryOne<{ id: number; name: string; email: string; role: string }>(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [decoded.id]
      );

      if (!user) {
        res.clearCookie("auth_token");
        return res.json({ user: null });
      }

      res.json({ user });
    } catch (error) {
      res.clearCookie("auth_token");
      res.json({ user: null });
    }
  }));

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("auth_token");
    res.sendStatus(204);
  });

  app.get("/api/user/preferences", asyncHandler(async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const prefs = await queryOne<{
        locale: string | null;
        country_code: string | null;
        currency: string | null;
        postal_code: string | null;
        preferences: Record<string, unknown> | null;
      }>(
        `SELECT locale, country_code, currency, postal_code, preferences
         FROM user_preferences
         WHERE user_id = $1`,
        [userId]
      );
      res.json(prefs ?? {});
    } catch (error) {
      console.error("Failed to load user preferences", error);
      res.status(500).json({ error: "Failed to load preferences" });
    }
  }));

  app.put("/api/user/preferences", asyncHandler(async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { locale, country_code, currency, postal_code, preferences } = req.body ?? {};
    // Short identifiers with fixed shapes; capping them keeps a 1mb body from landing in
    // free-text columns. `preferences` is a jsonb blob, so it is bounded by serialized size.
    const preferencesJson = preferences == null ? null : JSON.stringify(preferences);
    if (preferencesJson && preferencesJson.length > MAX_PREFERENCES_BYTES) {
      return res.status(400).json({ error: "Preferences payload is too large." });
    }

    try {
      const saved = await queryOne<{
        locale: string | null;
        country_code: string | null;
        currency: string | null;
        postal_code: string | null;
        preferences: Record<string, unknown> | null;
      }>(
        `INSERT INTO user_preferences
          (user_id, locale, country_code, currency, postal_code, preferences, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         ON CONFLICT (user_id)
         DO UPDATE SET
           locale = EXCLUDED.locale,
           country_code = EXCLUDED.country_code,
           currency = EXCLUDED.currency,
           postal_code = EXCLUDED.postal_code,
           preferences = EXCLUDED.preferences,
           updated_at = now()
         RETURNING locale, country_code, currency, postal_code, preferences`,
        [
          userId,
          optionalText(locale, 35),
          optionalText(country_code, 2),
          optionalText(currency, 3),
          optionalText(postal_code, 20),
          preferences ?? null,
        ]
      );
      res.json(saved ?? {});
    } catch (error) {
      console.error("Failed to save user preferences", error);
      res.status(500).json({ error: "Failed to save preferences" });
    }
  }));

  // --- Cart Routes ---
  app.get("/api/cart", asyncHandler(async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const items = await query(
        `SELECT p.*, ci.quantity
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.user_id = $1
         ORDER BY ci.created_at ASC`,
        [userId]
      );
      res.json(items.map((item) => ({
        ...normalizeProductRow(item as Record<string, unknown>),
        quantity: toFiniteInteger((item as Record<string, unknown>).quantity, 1),
      })));
    } catch (error) {
      console.error("Failed to load cart", error);
      res.status(500).json({ error: "Failed to load cart" });
    }
  }));

  app.put("/api/cart", asyncHandler(async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    if (rawItems.length > MAX_CART_ITEMS) {
      return res.status(400).json({ error: `A cart cannot contain more than ${MAX_CART_ITEMS} items.` });
    }

    const parsed = rawItems
      .map((item: any) => ({
        product_id: Number(item?.product_id ?? item?.productId ?? item?.id),
        // Capped as well as floored: quantity lands in an `integer` column, so a value like
        // 1e308 would clear the isFinite check below and then overflow on INSERT.
        quantity: Math.min(MAX_CART_QUANTITY, Math.max(1, Math.floor(Number(item?.quantity ?? 0)))),
      }))
      .filter((item: { product_id: number; quantity: number }) =>
        Number.isFinite(item.product_id) && item.product_id > 0 && Number.isFinite(item.quantity) && item.quantity > 0
      );

    // cart_items is unique on (user_id, product_id), so the same product listed twice would
    // abort the whole transaction. Collapse duplicates to the last quantity seen instead.
    const deduped = new Map<number, { product_id: number; quantity: number }>();
    for (const item of parsed) {
      deduped.set(item.product_id, item);
    }
    const items = [...deduped.values()];

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

      for (const item of items) {
        await client.query(
          `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)
           ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = now()`,
          [userId, item.product_id, item.quantity]
        );
      }

      await client.query("COMMIT");
      res.sendStatus(204);
    } catch (error) {
      // Same guard as /api/quotes: when the transaction failed because the connection
      // dropped, ROLLBACK fails too, and an unguarded await here would skip the logging
      // and response below.
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back cart transaction", rollbackError);
      }
      console.error("Failed to save cart", error);
      res.status(500).json({ error: "Failed to save cart" });
    } finally {
      client.release();
    }
  }));

  // --- Product Routes ---
  app.get("/api/products", asyncHandler(async (req, res) => {
    const { category, featured, search } = req.query;
    let sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
    const params: any[] = [];

    // Type-guarded like `search` below: a repeated query param (?category=a&category=b)
    // arrives as an array, which pg encodes as a Postgres array literal and Postgres then
    // rejects against a text column, turning a bad request into a 500.
    if (typeof category === "string" && category.trim()) {
      params.push(category.trim());
      sql += ` AND c.slug = $${params.length}`;
    }
    if (featured !== undefined) {
      sql += " AND p.is_featured = true";
    }
    if (typeof search === "string" && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern);
      const searchParam = `$${params.length}`;
      sql += ` AND (
        p.name ILIKE ${searchParam}
        OR p.description ILIKE ${searchParam}
        OR p.astm_value ILIKE ${searchParam}
        OR p.uns_value ILIKE ${searchParam}
        OR p.dimensions ILIKE ${searchParam}
        OR CAST(p.price AS TEXT) ILIKE ${searchParam}
        OR c.name ILIKE ${searchParam}
      )`;
    }

    try {
      const products = await query(sql, params);
      res.json(products.map((product) => normalizeProductRow(product as Record<string, unknown>)));
    } catch (e) {
      console.error("Failed to fetch products", e);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }));

  app.get("/api/products/suggestions", asyncHandler(async (req, res) => {
    const rawQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);

    if (!rawQuery) {
      return res.json([]);
    }

    try {
      const searchPattern = `${rawQuery}%`;
      const containsPattern = `%${rawQuery}%`;
      const suggestions = await query(
        `SELECT
          p.id,
          p.slug,
          p.name,
          c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.name ILIKE $1 OR p.name ILIKE $2
         ORDER BY
           CASE WHEN p.name ILIKE $1 THEN 0 ELSE 1 END,
           p.name ASC
         LIMIT $3`,
        [searchPattern, containsPattern, limit],
      );
      res.json(suggestions);
    } catch (error) {
      console.error("Failed to fetch product suggestions", error);
      res.status(500).json({ error: "Failed to fetch product suggestions" });
    }
  }));

  app.get("/api/products/:slug", asyncHandler(async (req, res) => {
    try {
      const product = await queryOne(
        "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1",
        [req.params.slug]
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(normalizeProductRow(product as Record<string, unknown>));
    } catch (e) {
      console.error("Failed to fetch product", e);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }));

  app.get("/api/categories", asyncHandler(async (req, res) => {
    try {
      const categories = await query("SELECT * FROM categories ORDER BY id");
      res.json(categories);
    } catch (e) {
      console.error("Failed to fetch categories", e);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }));

  // --- Blog Routes ---
  app.get("/api/blog-posts", asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 50);

    try {
      const posts = await query(
        `SELECT
          id,
          title,
          slug,
          -- The backslash must be doubled: this SQL lives in a JS template literal, where a
          -- lone \s collapses to a bare "s" and Postgres would strip the letter s from every
          -- generated excerpt instead of collapsing whitespace.
          COALESCE(NULLIF(excerpt, ''), LEFT(REGEXP_REPLACE(content, '\\s+', ' ', 'g'), 180)) AS excerpt,
          cover_image_url,
          cover_image_alt,
          author_name,
          status,
          meta_title,
          meta_description,
          published_at,
          created_at,
          updated_at
         FROM blog_posts
         WHERE status = 'published'
           AND (published_at IS NULL OR published_at <= now())
         ORDER BY published_at DESC NULLS LAST, created_at DESC
         LIMIT $1`,
        [limit]
      );
      res.json(posts.map((post) => normalizeBlogRow(post as Record<string, unknown>)));
    } catch (error) {
      console.error("Failed to fetch blog posts", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  }));

  app.get("/api/blog-posts/:slug", asyncHandler(async (req, res) => {
    const rawSlug = String(req.params.slug || "").trim();
    const normalizedSlug = (() => {
      if (!rawSlug) return rawSlug;
      try {
        return decodeURIComponent(rawSlug);
      } catch {
        return rawSlug;
      }
    })();

    try {
      const post = await queryOne(
        `SELECT
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image_url,
          cover_image_alt,
          author_name,
          status,
          meta_title,
          meta_description,
          faq_items,
          published_at,
          created_at,
          updated_at
         FROM blog_posts
         WHERE slug = $1
           AND status = 'published'
           AND (published_at IS NULL OR published_at <= now())
         LIMIT 1`,
        [normalizedSlug]
      );
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(normalizeBlogRow(post as Record<string, unknown>));
    } catch (error) {
      console.error("Failed to fetch blog post", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  }));

  // --- Blog Admin (API-key protected, used by the scheduled content routine) ---
  const blogAdminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

  const isValidAdminKey = (provided: string) => {
    const expected = (process.env.BLOG_ADMIN_API_KEY || "").trim();
    if (!expected || !provided) return false;
    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(expected);
    if (providedBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(providedBuf, expectedBuf);
  };

  app.post("/api/admin/blog-posts", blogAdminLimiter, asyncHandler(async (req, res) => {
    const providedKey = String(req.headers["x-admin-api-key"] || "");
    if (!isValidAdminKey(providedKey)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required" });
    }

    const slug = (typeof req.body?.slug === "string" && req.body.slug.trim() ? slugify(req.body.slug) : slugify(title));
    if (!slug) {
      return res.status(400).json({ error: "Could not derive a valid slug from title" });
    }

    const excerpt = typeof req.body?.excerpt === "string" ? req.body.excerpt.trim() || null : null;
    const coverImageUrl = typeof req.body?.coverImageUrl === "string" ? req.body.coverImageUrl.trim() || null : null;
    const coverImageAlt = typeof req.body?.coverImageAlt === "string" ? req.body.coverImageAlt.trim() || null : null;
    const metaTitle = typeof req.body?.metaTitle === "string" ? req.body.metaTitle.trim() || null : null;
    const metaDescription = typeof req.body?.metaDescription === "string" ? req.body.metaDescription.trim() || null : null;
    const status = req.body?.status === "draft" ? "draft" : "published";
    const faqItems = Array.isArray(req.body?.faqItems) ? JSON.stringify(req.body.faqItems) : null;

    try {
      const post = await queryOne(
        `INSERT INTO blog_posts (
           title, slug, excerpt, content, cover_image_url, cover_image_alt,
           status, meta_title, meta_description, faq_items, published_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CASE WHEN $7 = 'published' THEN now() ELSE NULL END)
         ON CONFLICT (slug) DO UPDATE SET
           title = excluded.title,
           excerpt = excluded.excerpt,
           content = excluded.content,
           cover_image_url = excluded.cover_image_url,
           cover_image_alt = excluded.cover_image_alt,
           status = excluded.status,
           meta_title = excluded.meta_title,
           meta_description = excluded.meta_description,
           faq_items = excluded.faq_items,
           published_at = CASE WHEN excluded.status = 'published' THEN COALESCE(blog_posts.published_at, now()) ELSE blog_posts.published_at END,
           updated_at = now()
         RETURNING id, slug, status`,
        [title, slug, excerpt, content, coverImageUrl, coverImageAlt, status, metaTitle, metaDescription, faqItems]
      );
      res.status(201).json(post);
    } catch (error) {
      console.error("Failed to create blog post", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  }));

  // --- Ads ---
  app.get("/api/ads/active", asyncHandler(async (_req, res) => {
    try {
      const ads = await query(
        `SELECT *
         FROM ads
         WHERE is_active = true
           AND (start_at IS NULL OR start_at <= now())
           AND (end_at IS NULL OR end_at >= now())
         ORDER BY priority DESC, created_at DESC`
      );
      res.json(ads.map((ad) => normalizeAdRow(ad as Record<string, unknown>)));
    } catch (e) {
      const error = e as { code?: string };
      if (error?.code === "42P01") {
        if (!adsTableMissingWarned) {
          console.warn("Ads table missing. Run supabase/setup.sql to create and seed it.");
          adsTableMissingWarned = true;
        }
        return res.json([]);
      }
      console.error("Failed to fetch ads", e);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  }));

  // --- Chatbot (offline keyword matcher over site data — no external API) ---
  app.post("/api/ai/chat", chatLimiter, asyncHandler(async (req, res) => {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const text = await answerFromKnowledgeBase(message);
      res.json({ text });
    } catch (e) {
      console.error("Chatbot error", e);
      res.status(500).json({ error: "Chatbot error" });
    }
  }));

  // --- Analytics ---
  app.post("/api/analytics/log", analyticsLimiter, asyncHandler(async (req, res) => {
    const { path, referrer, userAgent, geo, visitorId } = req.body ?? {};
    // Unauthenticated write path: every field is length-capped so a caller can't push
    // megabyte strings (up to the 1mb body limit) straight into visitor_logs.
    const cap = (value: unknown, max: number) =>
      typeof value === "string" ? value.slice(0, max) : null;
    try {
      const userId = getSessionUserId(req);
      await query(
        "INSERT INTO visitor_logs (user_id, path, referrer, user_agent, geo_location, visitor_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          userId,
          cap(path, 500),
          cap(referrer, 500),
          cap(userAgent, 500),
          JSON.stringify(geo ?? null).slice(0, 1000),
          cap(visitorId, 128),
        ]
      );
      res.sendStatus(200);
    } catch (e) {
      console.error("Failed to log analytics", e);
      res.status(500).json({ error: "Failed to log analytics" });
    }
  }));

  // --- Call tracking ---
  // Captures a "direct call" (or WhatsApp) click along with the visitor's page-view
  // trail, so sales can see what someone was looking at right before they reached out.
  app.post("/api/calls/log", callLimiter, asyncHandler(async (req, res) => {
    const phoneNumber = typeof req.body?.phoneNumber === "string" ? req.body.phoneNumber.trim().slice(0, 40) : "";
    const source = typeof req.body?.source === "string" ? req.body.source.trim().slice(0, 40) : null;
    const currentPage = typeof req.body?.currentPage === "string" ? req.body.currentPage.slice(0, 500) : null;
    const visitorId = typeof req.body?.visitorId === "string" ? req.body.visitorId.slice(0, 128) : null;

    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    // call_clicks and visitor_logs.visitor_id are both created by this migration.
    await ensureSchemaReady();

    try {
      const userId = getSessionUserId(req);

      let pagesViewed: string[] = [];
      if (visitorId) {
        const rows = await query<{ path: string | null }>(
          `SELECT path FROM visitor_logs WHERE visitor_id = $1 ORDER BY timestamp DESC LIMIT 25`,
          [visitorId]
        );
        pagesViewed = rows.map((row) => row.path).filter((path): path is string => !!path);
      }
      const lastPage = pagesViewed[0] || currentPage;
      if (currentPage && pagesViewed[0] !== currentPage) {
        pagesViewed = [currentPage, ...pagesViewed];
      }

      await query(
        `INSERT INTO call_clicks (visitor_id, user_id, phone_number, source, last_page, pages_viewed, user_agent, referrer)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          visitorId,
          userId,
          phoneNumber,
          source,
          lastPage,
          JSON.stringify(pagesViewed),
          req.headers["user-agent"] || null,
          req.headers.referer || null,
        ]
      );
      res.sendStatus(200);
    } catch (e) {
      console.error("Failed to log call click", e);
      res.status(500).json({ error: "Failed to log call click" });
    }
  }));

  // --- Product Enquiries ---
  app.post("/api/enquiries", enquiryLimiter, asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    // Previously these were only checked for truthiness, so a non-string (object, array,
    // number) was stringified into a text column, and a 1mb value was storable in any field.
    const productName = optionalText(body.productName, 200);
    const requirement = optionalText(body.requirement, 2000);
    const thickness = optionalText(body.thickness, 100);
    const fullName = optionalText(body.fullName, 200);
    const email = optionalText(body.email, 320);
    const phone = optionalText(body.phone, 40);
    const company = optionalText(body.company, 200);
    const location = optionalText(body.location, 200);
    const quantity = optionalText(body.quantity, 100);
    const message = optionalText(body.message, 5000);
    const productId = body.productId;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: "Full name, email, and phone are required." });
    }
    // Matches the check on /api/auth/register: a malformed address here still triggers a real
    // notification email and WhatsApp message to the sales inbox.
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    // product_enquiries.thickness and .user_id are both added by this migration.
    await ensureSchemaReady();

    const initialUserId = getSessionUserId(req);

    const insertEnquiry = (productIdValue: unknown, userIdValue: unknown) =>
      queryOne<{ id: number }>(
        `INSERT INTO product_enquiries
          (product_id, product_name, requirement, thickness, full_name, email, phone, company, location, quantity, message, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id`,
        [
          productIdValue ?? null,
          productName ?? null,
          requirement ?? null,
          thickness ?? null,
          fullName,
          email,
          phone,
          company ?? null,
          location ?? null,
          quantity ?? null,
          message ?? null,
          userIdValue ?? null,
        ]
      );

    try {
      let enquiry: { id: number } | null = null;
      let storedProductId = productId;
      let storedUserId = initialUserId;

      try {
        enquiry = await insertEnquiry(productId, initialUserId);
      } catch (insertError) {
        const pgError = insertError as { code?: string; constraint?: string };
        const failedOnProduct = pgError?.code === "23503" && pgError.constraint?.includes("product_id") && productId != null;
        const failedOnUser = pgError?.code === "23503" && pgError.constraint?.includes("user_id") && initialUserId != null;
        if (failedOnProduct || failedOnUser) {
          // A referenced product or session user no longer exists (deleted/stale login); retry without the stale link.
          storedProductId = failedOnProduct ? null : productId;
          storedUserId = failedOnUser ? null : initialUserId;
          enquiry = await insertEnquiry(storedProductId, storedUserId);
        } else {
          throw insertError;
        }
      }

      if (enquiry) {
        void enqueueLead(
          "enquiry",
          enquiry.id,
          buildEnquiryLead(
            enquiry.id,
            {
              productId: storedProductId,
              productName,
              requirement,
              thickness,
              fullName,
              email,
              phone,
              company,
              location,
              quantity,
              message,
            },
            storedUserId ?? null
          )
        );
      }

      sendEnquiryNotifications({
        productId,
        productName,
        requirement,
        thickness,
        fullName,
        email,
        phone,
        company,
        location,
        quantity,
        message,
      }).catch((notifyError) => {
        console.error("Failed to send enquiry notification", notifyError);
      });

      res.sendStatus(201);
    } catch (e) {
      const isDev = process.env.NODE_ENV !== "production";
      const pgError = e as { code?: string; message?: string; detail?: string; constraint?: string };
      const devDetail = isDev
        ? { code: pgError?.code, message: pgError?.message, detail: pgError?.detail, constraint: pgError?.constraint }
        : undefined;

      if (pgError?.code === "42P01") {
        console.error(
          "product_enquiries table is missing. Run supabase/setup.sql against your Supabase database to create it.",
          e
        );
        return res.status(503).json({
          error: "Enquiries are temporarily unavailable. Please try again shortly.",
          ...(devDetail ? { devDetail } : {}),
        });
      }
      console.error("Failed to submit enquiry", e);
      res.status(500).json({ error: "Failed to submit enquiry", ...(devDetail ? { devDetail } : {}) });
    }
  }));

  // --- Quote Requests (Cart/RFQ) ---
  app.post("/api/quotes", enquiryLimiter, asyncHandler(async (req, res) => {
    const { customer = {}, items = [], summary = {}, shipping_option, meta = {} } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items are required." });
    }
    // Each item becomes its own INSERT inside one transaction, so an oversized array would
    // hold a pooled connection open for thousands of round trips.
    if (items.length > MAX_QUOTE_ITEMS) {
      return res.status(400).json({ error: `A quote cannot contain more than ${MAX_QUOTE_ITEMS} items.` });
    }

    const userId = getSessionUserId(req);
    const itemsCount = items.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 0), 0);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const quoteResult = await client.query<{ id: number }>(
        `INSERT INTO quote_requests
          (user_id, phone_country_code, phone_number, phone_full, gst_number, pin_code, shipping_option,
           subtotal, gst, total, currency, locale, items_count, source, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING id`,
        [
          userId ?? null,
          customer.phone_country_code ?? null,
          customer.phone_number ?? null,
          customer.phone_full ?? null,
          customer.gst_number ?? null,
          customer.pin_code ?? null,
          shipping_option ?? null,
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
      if (!quote) {
        throw new Error("Failed to create quote request");
      }

      for (const item of items) {
        await client.query(
          `INSERT INTO quote_request_items
            (quote_request_id, product_id, product_name, category_name, quantity, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            quote.id,
            item.product_id ?? null,
            item.product_name ?? null,
            item.category_name ?? null,
            item.quantity ?? null,
            item.unit_price ?? null,
            item.line_total ?? null,
          ]
        );
      }

      await client.query("COMMIT");

      // The checkout form may only collect phone/GST/PIN, so fall back to the
      // signed-in account for a usable contact name and email.
      const account = userId
        ? await queryOne<{ name: string; email: string }>(
            "SELECT name, email FROM users WHERE id = $1",
            [userId]
          )
        : null;

      const leadBody = {
        ...(req.body ?? {}),
        customer: {
          ...customer,
          full_name: customer.full_name ?? account?.name ?? null,
          email: customer.email ?? account?.email ?? null,
        },
      };

      void enqueueLead(
        "quote",
        quote.id,
        buildQuoteLead(quote.id, leadBody, userId ?? null, itemsCount)
      );

      sendQuoteNotifications({ id: quote.id, customer: leadBody.customer, items, summary }).catch(
        (notifyError) => {
          console.error("Failed to send quote notification", notifyError);
        }
      );

      res.status(201).json({ id: quote.id });
    } catch (e) {
      // A dropped connection is the usual reason the transaction failed in the first place,
      // and ROLLBACK will then fail too. Unguarded, that second error escapes this catch
      // block entirely and takes the process down.
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back quote request transaction", rollbackError);
      }
      console.error("Failed to save quote request", e);
      // The raw driver message can carry schema and constraint details - keep it in the log.
      res.status(500).json({ error: "Failed to save quote request" });
    } finally {
      client.release();
    }
  }));

  // --- CRM / ERP sync ---
  // Used by the CRM when it cannot receive inbound webhooks, and for replaying
  // deliveries that exhausted their retries.
  const requireCrmApiKey = (req: express.Request, res: express.Response) => {
    if (!CRM_API_KEY) {
      res.status(503).json({ error: "CRM_API_KEY is not configured." });
      return false;
    }
    const provided = String(req.headers["x-api-key"] || "");
    const expected = CRM_API_KEY;
    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(expected);
    const ok =
      providedBuf.length === expectedBuf.length && timingSafeEqual(providedBuf, expectedBuf);
    if (!ok) {
      res.status(401).json({ error: "Unauthorized" });
      return false;
    }
    return true;
  };

  app.get("/api/crm/leads", asyncHandler(async (req, res) => {
    if (!requireCrmApiKey(req, res)) return;
    await ensureSchemaReady();

    const since = typeof req.query.since === "string" && req.query.since.trim() ? req.query.since.trim() : undefined;
    const status = typeof req.query.status === "string" && req.query.status.trim() ? req.query.status.trim() : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);

    res.json(await listLeads({ since, status, limit }));
  }));

  app.post("/api/crm/leads/:externalId/ack", asyncHandler(async (req, res) => {
    if (!requireCrmApiKey(req, res)) return;
    await ensureSchemaReady();

    const updated = await acknowledgeLead(req.params.externalId, req.body?.crm_record_id ?? null);
    if (!updated) return res.status(404).json({ error: "Lead not found" });
    res.json(updated);
  }));

  app.post("/api/crm/retry", asyncHandler(async (req, res) => {
    if (!requireCrmApiKey(req, res)) return;
    await ensureSchemaReady();

    res.json({ requeued: await retryFailedLeads(req.body?.external_id) });
  }));

  // The queue is drained in-process. On serverless this also runs per instance,
  // and FOR UPDATE SKIP LOCKED keeps concurrent drains from double-sending.
  void ensureSchemaReady().then(() => startCrmSyncWorker());

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found." });
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(error);
    }

    const requestError = error as {
      status?: number;
      statusCode?: number;
      type?: string;
    };
    const status = requestError.statusCode || requestError.status || 500;
    const isMalformedParam = error instanceof URIError && /decode param|URI malformed/i.test(error.message);

    if (isMalformedParam) {
      return res.status(400).json({ error: "Invalid URL encoding in path segment." });
    }

    if (status === 400 || requestError.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON payload." });
    }

    if (status === 404) {
      return res.status(404).json({ error: "API route not found." });
    }

    const safeStatus = status >= 400 && status < 600 ? status : 500;
    if (safeStatus >= 500) {
      console.error("Unhandled API error", error);
    }
    res.status(safeStatus).json({ error: safeStatus === 500 ? "Internal server error." : "Request failed." });
  });

  return app;
}

export default createApiApp;
