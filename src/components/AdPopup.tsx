import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ad } from '../types';
import { resolveImageSrc } from '../lib/utils';

const dismissKeyForAd = (id: number) => `adpopup_dismissed_${id}`;

const resolveInternalPath = (url: string) => {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  if (typeof window === 'undefined') return null;

  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return null;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

export const AdPopup: React.FC = () => {
  const [popupAd, setPopupAd] = React.useState<Ad | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    let isActive = true;
    fetch('/api/ads/active')
      .then(res => res.json())
      .then((data: Ad[]) => {
        if (!isActive || !Array.isArray(data)) return;
        const candidates = data.filter(ad => ad.show_popup);
        if (candidates.length === 0) return;
        const sorted = [...candidates].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
        setPopupAd(sorted[0]);
      })
      .catch(() => {
        // Ignore ad errors.
      });
    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!popupAd || typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem(dismissKeyForAd(popupAd.id));
    setDismissed(stored === '1');
  }, [popupAd]);

  if (!popupAd || dismissed) return null;

  const ctaText = popupAd.cta_text ?? 'View Offers';
  const ctaUrl = popupAd.cta_url ?? '/products';
  const internalCtaPath = resolveInternalPath(ctaUrl);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(dismissKeyForAd(popupAd.id), '1');
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
        >
          <div className="absolute inset-0 bg-black/50" onClick={handleDismiss} />
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-500 hover:text-slate-900"
              aria-label="Close promotion"
            >
              <X size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[220px] bg-slate-100">
                {popupAd.image_url ? (
                  <img
                    src={resolveImageSrc(popupAd.image_url)}
                    alt={popupAd.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#304e58] via-[#314e58] to-[#3b606a]" />
                )}
              </div>
              <div className="p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#314e58]">New Offer</p>
                <h3 className="mt-3 text-2xl font-display font-bold text-[#304e58]">{popupAd.title}</h3>
                {popupAd.subtitle ? (
                  <p className="mt-3 text-sm text-slate-600">{popupAd.subtitle}</p>
                ) : null}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {!internalCtaPath ? (
                    <a
                      href={ctaUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleDismiss}
                      className="rounded-full bg-[#304e58] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#314e58] transition-colors text-center"
                    >
                      {ctaText}
                    </a>
                  ) : (
                    <Link
                      to={internalCtaPath}
                      onClick={handleDismiss}
                      className="rounded-full bg-[#304e58] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#314e58] transition-colors text-center"
                    >
                      {ctaText}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-full border border-[#314e58]/30 px-5 py-2.5 text-xs font-semibold text-[#304e58] hover:bg-slate-50 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

