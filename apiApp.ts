import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import pool, { query, queryOne } from "./db.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "industrial-secret-2026";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const ENQUIRY_NOTIFY_EMAILS = (process.env.ENQUIRY_NOTIFY_EMAILS || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const ENQUIRY_NOTIFY_WHATSAPP = process.env.ENQUIRY_NOTIFY_WHATSAPP;
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const IPSTACK_API_KEY = process.env.IPSTACK_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

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

type EnquiryNotificationPayload = {
  productId?: string | number | null;
  productName?: string | null;
  requirement?: string | null;
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

const sendEnquiryNotifications = async (payload: EnquiryNotificationPayload) => {
  const tasks: Promise<unknown>[] = [];
  const message = formatEnquiryMessage(payload);

  if (emailTransporter && ENQUIRY_NOTIFY_EMAILS.length > 0) {
    const fromAddress = SMTP_FROM || SMTP_USER || "ramanioffice@gmail.com";
    tasks.push(
      emailTransporter.sendMail({
        from: fromAddress,
        to: ENQUIRY_NOTIFY_EMAILS,
        subject: `New Product Enquiry - ${payload.productName || "General"}`,
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
      console.error("Failed to send enquiry notification", result.reason);
    }
  });
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

export function createApiApp() {
  const app = express();
  const authCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
  };

  app.use(express.json());

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

  app.get("/api/localization/bootstrap", async (req, res) => {
    const fallback = {
      countryCode: "US",
      countryName: "United States",
      currency: "USD",
      postalCode: "",
      city: "",
      region: "",
    };

    if (!IPSTACK_API_KEY) {
      return res.json(fallback);
    }

    try {
      const requesterIp = getRequesterIp(req);
      const endpoint = requesterIp === "check" ? "check" : encodeURIComponent(requesterIp);
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

      res.json({
        countryCode: String(geo.country_code || fallback.countryCode).toUpperCase(),
        countryName: geo.country_name || fallback.countryName,
        currency: String(geo.currency?.code || fallback.currency).toUpperCase(),
        postalCode: geo.zip || "",
        city: geo.city || "",
        region: geo.region_name || "",
      });
    } catch (error) {
      console.error("Failed to fetch IP localization", error);
      res.json(fallback);
    }
  });

  app.get("/api/localization/exchange-rates", async (req, res) => {
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
  });

  app.get("/api/localization/postal/:country/:postalCode", async (req, res) => {
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
  });

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await queryOne<{ id: number; name: string; email: string; role: string }>(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role",
        [name, email, hashedPassword]
      );
      if (!user) return res.status(500).json({ error: "Failed to create user" });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.cookie("auth_token", token, authCookieOptions);
      res.json({ token, user });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await queryOne<any>("SELECT * FROM users WHERE email = $1", [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.cookie("auth_token", token, authCookieOptions);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post("/api/auth/google", async (req, res) => {
    const { credential } = req.body ?? {};
    if (!credential || typeof credential !== "string") {
      return res.status(400).json({ error: "Google credential is required." });
    }

    try {
      const profile = await verifyGoogleCredential(credential);
      const existing = await queryOne<{
        id: number;
        name: string;
        email: string;
        role: string;
      }>("SELECT id, name, email, role FROM users WHERE email = $1", [profile.email]);

      let user = existing;
      if (!existing) {
        const hashedPassword = await bcrypt.hash(randomUUID(), 10);
        user = await queryOne(
          `INSERT INTO users (name, email, password, role, provider, google_id, avatar_url)
           VALUES ($1, $2, $3, 'user', 'google', $4, $5)
           RETURNING id, name, email, role`,
          [profile.name || "Google User", profile.email, hashedPassword, profile.sub, profile.picture || null]
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

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.cookie("auth_token", token, authCookieOptions);
      res.json({ token, user });
    } catch (error) {
      console.error("Google sign-in failed", error);
      res.status(401).json({ error: "Google sign-in failed." });
    }
  });

  app.get("/api/auth/session", async (req, res) => {
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
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("auth_token");
    res.sendStatus(204);
  });

  app.get("/api/user/preferences", async (req, res) => {
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
  });

  app.put("/api/user/preferences", async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { locale, country_code, currency, postal_code, preferences } = req.body ?? {};

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
          locale ?? null,
          country_code ?? null,
          currency ?? null,
          postal_code ?? null,
          preferences ?? null,
        ]
      );
      res.json(saved ?? {});
    } catch (error) {
      console.error("Failed to save user preferences", error);
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  // --- Cart Routes ---
  app.get("/api/cart", async (req, res) => {
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
      res.json(items);
    } catch (error) {
      console.error("Failed to load cart", error);
      res.status(500).json({ error: "Failed to load cart" });
    }
  });

  app.put("/api/cart", async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const items = rawItems
      .map((item: any) => ({
        product_id: Number(item?.product_id ?? item?.productId ?? item?.id),
        quantity: Math.max(1, Math.floor(Number(item?.quantity ?? 0))),
      }))
      .filter((item: { product_id: number; quantity: number }) =>
        Number.isFinite(item.product_id) && item.product_id > 0 && Number.isFinite(item.quantity) && item.quantity > 0
      );

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

      for (const item of items) {
        await client.query(
          "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)",
          [userId, item.product_id, item.quantity]
        );
      }

      await client.query("COMMIT");
      res.sendStatus(204);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to save cart", error);
      res.status(500).json({ error: "Failed to save cart" });
    } finally {
      client.release();
    }
  });

  // --- Product Routes ---
  app.get("/api/products", async (req, res) => {
    const { category, featured, search } = req.query;
    let sql = "SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1";
    const params: any[] = [];

    if (category) {
      params.push(category);
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
      res.json(products);
    } catch (e) {
      console.error("Failed to fetch products", e);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await queryOne(
        "SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = $1",
        [req.params.slug]
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (e) {
      console.error("Failed to fetch product", e);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await query("SELECT * FROM categories ORDER BY id");
      res.json(categories);
    } catch (e) {
      console.error("Failed to fetch categories", e);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // --- Ads ---
  app.get("/api/ads/active", async (_req, res) => {
    try {
      const ads = await query(
        `SELECT *
         FROM ads
         WHERE is_active = true
           AND (start_at IS NULL OR start_at <= now())
           AND (end_at IS NULL OR end_at >= now())
         ORDER BY priority DESC, created_at DESC`
      );
      res.json(ads);
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
  });

  // --- AI Chatbot ---
  app.post("/api/ai/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: "AI Key not configured" });

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-1.5-flash", // Using a standard model
        contents: [
          { role: "user", parts: [{ text: `You are an expert industrial product assistant for Ramani Steel House. We sell Stainless Steel, Titanium Alloys, Valves, and Fasteners. Answer the user's question professionally. User says: ${message}` }] }
        ],
      });
      const response = await model;
      res.json({ text: response.text });
    } catch (e) {
      res.status(500).json({ error: "AI error" });
    }
  });

  // --- Analytics ---
  app.post("/api/analytics/log", async (req, res) => {
    const { path, referrer, userAgent, geo } = req.body;
    try {
      const userId = getSessionUserId(req);
      await query(
        "INSERT INTO visitor_logs (user_id, path, referrer, user_agent, geo_location) VALUES ($1, $2, $3, $4, $5)",
        [userId, path, referrer, userAgent, JSON.stringify(geo)]
      );
      res.sendStatus(200);
    } catch (e) {
      console.error("Failed to log analytics", e);
      res.status(500).json({ error: "Failed to log analytics" });
    }
  });

  // --- Product Enquiries ---
  app.post("/api/enquiries", async (req, res) => {
    const { productId, productName, requirement, fullName, email, phone, company, location, quantity, message } = req.body;
    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: "Full name, email, and phone are required." });
    }

    try {
      const userId = getSessionUserId(req);
      await query(
        `INSERT INTO product_enquiries
          (product_id, product_name, requirement, full_name, email, phone, company, location, quantity, message, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          productId ?? null,
          productName ?? null,
          requirement ?? null,
          fullName,
          email,
          phone,
          company ?? null,
          location ?? null,
          quantity ?? null,
          message ?? null,
          userId ?? null,
        ]
      );
      void sendEnquiryNotifications({
        productId,
        productName,
        requirement,
        fullName,
        email,
        phone,
        company,
        location,
        quantity,
        message,
      });
      res.sendStatus(201);
    } catch (e) {
      console.error("Failed to submit enquiry", e);
      res.status(500).json({ error: "Failed to submit enquiry" });
    }
  });

  // --- Quote Requests (Cart/RFQ) ---
  app.post("/api/quotes", async (req, res) => {
    const { customer = {}, items = [], summary = {}, shipping_option, meta = {} } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items are required." });
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
      res.status(201).json({ id: quote.id });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Failed to save quote request", e);
      const message = e instanceof Error ? e.message : "Failed to save quote request";
      res.status(500).json({ error: message });
    } finally {
      client.release();
    }
  });

  return app;
}

export default createApiApp;
