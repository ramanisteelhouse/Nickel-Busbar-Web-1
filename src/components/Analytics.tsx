import React from 'react';
import { useLocation } from 'react-router-dom';
import { getCookieConsentState } from '../lib/utils';

/**
 * Google Analytics 4, loaded only after the visitor accepts cookies.
 *
 * The SEO audit reported no analytics tool on the site: the only measurement here is the
 * first-party POST to /api/analytics/log in App.tsx, which no external crawler can see and
 * which gives no acquisition or behaviour reporting.
 *
 * The measurement ID comes from VITE_GA4_MEASUREMENT_ID rather than being hardcoded, so this
 * component is inert until that variable is set in the Vercel project — there is no second
 * code change to make once the property exists.
 *
 * gtag is attached only on 'accepted'. On 'declined', or before a choice is made, nothing is
 * requested from googletagmanager.com at all, which is stricter than Consent Mode's denied
 * state (that still loads the library) and keeps the declined case free of third-party
 * requests entirely.
 */
const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID ?? '';
const SCRIPT_ID = 'ga4-loader';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const loadGa4 = () => {
  if (document.getElementById(SCRIPT_ID)) return;

  window.dataLayer = window.dataLayer || [];
  // The arguments object, not an array: gtag.js reads dataLayer entries by index and treats a
  // real array as a different message shape.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  // SPA route changes are sent explicitly from the effect below, so the automatic pageview
  // would double-count the landing page.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
};

export const Analytics: React.FC = () => {
  const { pathname, search } = useLocation();
  const [consent, setConsent] = React.useState(() => getCookieConsentState());

  React.useEffect(() => {
    const sync = () => setConsent(getCookieConsentState());
    window.addEventListener('cookie-consent-changed', sync);
    return () => window.removeEventListener('cookie-consent-changed', sync);
  }, []);

  React.useEffect(() => {
    if (!MEASUREMENT_ID || consent !== 'accepted') return;
    loadGa4();
  }, [consent]);

  React.useEffect(() => {
    if (!MEASUREMENT_ID || consent !== 'accepted' || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_path: `${pathname}${search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [consent, pathname, search]);

  return null;
};
