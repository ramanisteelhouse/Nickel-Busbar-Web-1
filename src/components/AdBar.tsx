import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Ad } from '../types';
import { cn } from '../lib/utils';

const dismissKeyForAd = (id: number) => `adbar_dismissed_${id}`;

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

export const AdBar: React.FC<{ className?: string }> = ({ className }) => {
  const [ads, setAds] = React.useState<Ad[]>([]);
  const [dismissedIds, setDismissedIds] = React.useState<number[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const bannerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let isActive = true;
    const loadAds = () => {
      fetch('/api/ads/active')
        .then(res => res.json())
        .then((data) => {
          if (!isActive) return;
          setAds(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!isActive) return;
          setAds([]);
        });
    };
    loadAds();
    const interval = window.setInterval(loadAds, 60000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, []);

  const bannerAds = React.useMemo(() => {
    const candidates = ads.filter(ad => ad.show_banner);
    if (typeof window === 'undefined') {
      return candidates;
    }
    return candidates.filter((ad) => {
      const dismissed = window.sessionStorage.getItem(dismissKeyForAd(ad.id)) === '1';
      return !dismissed && !dismissedIds.includes(ad.id);
    });
  }, [ads, dismissedIds]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [bannerAds.length]);

  React.useEffect(() => {
    if (bannerAds.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % bannerAds.length);
    }, 12000);
    return () => window.clearInterval(interval);
  }, [bannerAds.length]);

  const safeIndex = bannerAds.length > 0 ? activeIndex % bannerAds.length : 0;
  const bannerAd = bannerAds[safeIndex];

  const ctaText = bannerAd?.cta_text ?? 'View Offers';
  const ctaUrl = bannerAd?.cta_url ?? '/products';

  const handleDismiss = () => {
    if (!bannerAd) return;
    setDismissedIds((prev) => (prev.includes(bannerAd.id) ? prev : [...prev, bannerAd.id]));
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(dismissKeyForAd(bannerAd.id), '1');
    }
  };

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const setHeight = (height: number) => {
      document.documentElement.style.setProperty('--adbar-height', `${Math.max(0, Math.ceil(height))}px`);
    };

    if (bannerAds.length === 0) {
      setHeight(0);
      return;
    }

    const element = bannerRef.current;
    if (!element) {
      setHeight(0);
      return;
    }

    const updateHeight = () => setHeight(element.getBoundingClientRect().height);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      const interval = window.setInterval(updateHeight, 300);
      return () => window.clearInterval(interval);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [bannerAds.length, bannerAd?.id]);

  React.useEffect(() => {
    return () => {
      if (typeof document === 'undefined') return;
      document.documentElement.style.setProperty('--adbar-height', '0px');
    };
  }, []);

  if (bannerAds.length === 0 || !bannerAd) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={bannerRef}
        key={bannerAd.id}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative z-30 w-full border-b border-[#314e58]/20 bg-gradient-to-r from-[#314e58] via-[#304e58] to-[#3f6671] text-white",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
              <Sparkles size={12} />
              {bannerAd.badge ?? 'New Drop'}
            </span>
            {typeof bannerAd.discount_percent === 'number' ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
                Save {bannerAd.discount_percent}%
              </span>
            ) : null}
            <span className="text-sm sm:text-base font-semibold">
              {bannerAd.title}
            </span>
            {bannerAd.subtitle ? (
              <span className="text-xs sm:text-sm text-white/90">
                {bannerAd.subtitle}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={`avatar-${index}`}
                  className="h-6 w-6 rounded-full bg-white/20 border border-white/30"
                />
              ))}
            </div>
            {isExternalUrl(ctaUrl) ? (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white text-[#304e58] px-4 py-1.5 text-xs font-bold hover:bg-white/90 transition-colors inline-flex items-center gap-2"
              >
                {ctaText}
                <ArrowRight size={12} />
              </a>
            ) : (
              <Link
                to={ctaUrl}
                className="rounded-full bg-white text-[#304e58] px-4 py-1.5 text-xs font-bold hover:bg-white/90 transition-colors inline-flex items-center gap-2"
              >
                {ctaText}
                <ArrowRight size={12} />
              </Link>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="text-white/90 hover:text-white text-xs font-semibold"
              aria-label="Dismiss promotion"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

