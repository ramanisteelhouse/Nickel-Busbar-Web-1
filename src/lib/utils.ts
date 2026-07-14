import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = 'en-US', currency = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getStrikePrice(amount: number, markup = 0.18) {
  const safeAmount = Number.isFinite(amount) ? amount : Number(String(amount).replace(/,/g, "").trim());
  const safeMarkup = Number.isFinite(markup) && markup > 0 ? markup : 0.18;

  if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
    return { strike: 0, discountPercent: 0 };
  }

  const rawStrike = safeAmount * (1 + safeMarkup);
  let strike = Number(rawStrike.toFixed(2));

  // Guarantee strike value is always above the actual value.
  if (strike <= safeAmount) {
    strike = Number((safeAmount + 0.01).toFixed(2));
  }

  const discountPercent = Math.max(0, Math.round(((strike - safeAmount) / strike) * 100));
  return { strike, discountPercent };
}

export function normalizeProductUnit(unit?: string | null) {
  const next = unit?.trim().toLowerCase();
  return next || 'kg';
}

export function getProductUnitLabel(unit?: string | null) {
  return `/${normalizeProductUnit(unit)}`;
}

export function resolveImageSrc(src?: string | null) {
  const trimmed = src?.trim() || '';
  if (!trimmed) return '';
  try {
    return new URL(trimmed, window.location.origin).href;
  } catch {
    return trimmed;
  }
}

const IMAGE_ALT_SITE_SUFFIX = 'Ramani Steel House, nickel strip manufacturer in Mumbai, India';

/**
 * Builds SEO-friendly alt text: a description of the image subject plus the
 * brand/site context, instead of a bare product or article name.
 */
export function buildImageAlt(subject?: string | null, kind: string = 'product') {
  const cleanSubject = subject?.trim();
  const label = cleanSubject || `Nickel strip ${kind}`;
  return `${label} - ${IMAGE_ALT_SITE_SUFFIX}`;
}

export function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string) {
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const match = cookies.find(cookie => cookie.startsWith(`${encodeURIComponent(name)}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

export function deleteCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getCookieConsentState() {
  const consent = getCookie('cookie_consent');
  if (consent === 'accepted' || consent === 'declined') {
    return consent;
  }
  return '';
}

export function getSessionValue(key: string) {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(key) ?? '';
}

export function setSessionValue(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(key, value);
}

export function getOrCreateSessionId() {
  const key = 'site_session_id';
  const existing = getSessionValue(key) || getCookie(key);
  if (existing) return existing;
  const next = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}`;
  setSessionValue(key, next);
  setCookie(key, next, 1);
  return next;
}

/**
 * Logs a click-to-call (or WhatsApp) action so the enquiry can be traced back to the
 * visitor's session and the pages they viewed beforehand. Fire-and-forget — never
 * blocks or interferes with the underlying tel:/wa.me navigation.
 */
export function logCallClick(phoneNumber: string, source: string) {
  try {
    fetch('/api/calls/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        source,
        currentPage: typeof window !== 'undefined' ? window.location.pathname : '',
        visitorId: getOrCreateSessionId(),
      }),
      keepalive: true,
    }).catch(() => {
      // Ignore call-tracking failures — never block the call/WhatsApp action.
    });
  } catch {
    // Ignore — e.g. fetch unavailable in this environment.
  }
}

// React Router and Express can choke on raw "%" in path params.
// Double-encode percent so one decode pass still leaves a safe escape.
export function encodePathSegment(value: string) {
  return encodeURIComponent(value).replace(/%25/g, '%2525');
}

const RICH_TEXT_ALLOWED_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'br',
  'hr',
  'a',
]);

const RICH_TEXT_ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
};

const normalizeSmartQuotes = (value: string) =>
  value
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

const isSafeHref = (href: string) => {
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export function sanitizeRichHtml(input: string) {
  const normalized = normalizeSmartQuotes(input || '').trim();
  if (!normalized) return '';
  // No DOM available (e.g. a future SSR context) — fail safe rather than
  // returning unsanitized HTML that could later be rendered via dangerouslySetInnerHTML.
  if (typeof window === 'undefined') return '';

  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<div>${normalized}</div>`, 'text/html');
  const sourceRoot = parsed.body.firstElementChild;
  if (!sourceRoot) return '';

  const outputDoc = document.implementation.createHTMLDocument('');
  const outputRoot = outputDoc.createElement('div');

  const sanitizeNode = (node: Node, parent: HTMLElement) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(outputDoc.createTextNode(node.textContent || ''));
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as Element;
    const tag = element.tagName.toLowerCase();

    if (!RICH_TEXT_ALLOWED_TAGS.has(tag)) {
      Array.from(element.childNodes).forEach((child) => sanitizeNode(child, parent));
      return;
    }

    const clean = outputDoc.createElement(tag);
    const allowedAttrs = RICH_TEXT_ALLOWED_ATTRS[tag];

    if (allowedAttrs) {
      Array.from(element.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        const attrValue = normalizeSmartQuotes(attr.value || '').trim();
        if (!allowedAttrs.has(attrName) || !attrValue) return;

        if (tag === 'a' && attrName === 'href') {
          if (!isSafeHref(attrValue)) return;
          clean.setAttribute('href', attrValue);
          return;
        }

        if (tag === 'a' && attrName === 'target') {
          const target = attrValue === '_blank' ? '_blank' : '_self';
          clean.setAttribute('target', target);
          return;
        }

        clean.setAttribute(attrName, attrValue);
      });
    }

    if (tag === 'a' && clean.getAttribute('target') === '_blank') {
      clean.setAttribute('rel', 'noopener noreferrer');
    }

    Array.from(element.childNodes).forEach((child) => sanitizeNode(child, clean));
    parent.appendChild(clean);
  };

  Array.from(sourceRoot.childNodes).forEach((child) => sanitizeNode(child, outputRoot));
  return outputRoot.innerHTML;
}
