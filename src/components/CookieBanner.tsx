import React from 'react';
import { deleteCookie, setCookie, getCookie } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageProvider';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const { t } = useLanguage();

  React.useEffect(() => {
    const consent = getCookie('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    setCookie('cookie_consent', 'accepted', 365);
    window.dispatchEvent(new Event('cookie-consent-changed'));
    setVisible(false);
  };

  const declineCookies = () => {
    setCookie('cookie_consent', 'declined', 365);
    deleteCookie('site_language');
    deleteCookie('site_country');
    deleteCookie('site_currency');
    deleteCookie('site_postal');
    window.dispatchEvent(new Event('cookie-consent-changed'));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-4 pb-5">
      <div className="pointer-events-auto mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white text-brand shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">{t('cookies.title')}</p>
            <p className="text-xs text-[#5B757E] mt-1 max-w-2xl">
              {t('cookies.desc')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={declineCookies}
              className="rounded-full border border-brand/20 px-4 py-2 text-xs font-semibold text-brand hover:bg-[#f5f5f5] transition-colors"
            >
              {t('cookies.decline')}
            </button>
            <button
              type="button"
              onClick={acceptCookies}
              className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              {t('cookies.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

