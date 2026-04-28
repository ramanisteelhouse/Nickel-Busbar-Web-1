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
  if (!amount || amount <= 0) {
    return { strike: amount, discountPercent: 0 };
  }
  const strike = Math.max(amount, Math.round(amount * (1 + markup)));
  const discountPercent = Math.max(0, Math.round(((strike - amount) / strike) * 100));
  return { strike, discountPercent };
}

export function normalizeProductUnit(unit?: string | null) {
  const next = unit?.trim().toLowerCase();
  return next || 'kg';
}

export function getProductUnitLabel(unit?: string | null) {
  return `/${normalizeProductUnit(unit)}`;
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
