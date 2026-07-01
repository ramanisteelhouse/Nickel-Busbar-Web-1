import React from 'react';
import {
  deleteCookie,
  formatCurrency,
  getCookie,
  getCookieConsentState,
  getOrCreateSessionId,
  getSessionValue,
  setCookie,
  setSessionValue,
} from '../lib/utils';
import { getCountryOptions } from '../lib/countryCodes';
import { languageMeta, LanguageCode } from './languages';
import { translations, TranslationKey } from './translations';
import { getLocaleForCountry, languageMaps, normalizeLocaleKey, toFlagEmoji, validatePostalCode } from '../lib/localization';

type CountryOption = {
  code: string;
  name: string;
  flag: string;
  currency?: string;
};

type PostalDetails = {
  place?: string;
  state?: string;
  country?: string;
};

type LocalizationBootstrap = {
  countryCode?: string;
  countryName?: string;
  currency?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  locale?: string;
};

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  locale: string;
  currency: string;
  country: string;
  countryName: string;
  countryFlag: string;
  countries: CountryOption[];
  setCountry: (code: string) => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  postalStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  postalDetails: PostalDetails | null;
  exchangeRate: number;
  formatPrice: (amountInInr: number) => string;
};

type SessionUser = {
  id: number;
  email: string;
  name?: string;
  role?: string;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const interpolate = (value: string, params?: Record<string, string | number>) => {
  if (!params) return value;
  return Object.keys(params).reduce((acc, key) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(params[key]));
  }, value);
};

const languageNameToCode: Record<string, LanguageCode> = {
  english: 'en',
  german: 'de',
  portuguese: 'pt',
  spanish: 'es',
  french: 'fr',
  italian: 'it',
  hindi: 'hi',
  russian: 'ru',
  korean: 'ko',
  japanese: 'ja',
  arabic: 'ar',
  thai: 'th',
  turkish: 'tr',
  vietnamese: 'vi',
  dutch: 'nl',
  hebrew: 'he',
  indonesian: 'id',
  chinese: 'zh',
};

const storageKeys = {
  language: 'site_language',
  country: 'site_country',
  currency: 'site_currency',
  postal: 'site_postal',
};

const defaultCountry = 'IN';
const defaultCurrency = 'INR';

const resolveLanguageFromLocale = (locale: string) => {
  const normalized = normalizeLocaleKey(locale);
  const mappedName = languageMaps[normalized as keyof typeof languageMaps];
  if (mappedName && languageNameToCode[mappedName]) {
    return languageNameToCode[mappedName];
  }
  const prefix = normalized.split('_')[0];
  if (prefix && prefix in languageMeta) {
    return prefix as LanguageCode;
  }
  return 'en';
};

const toStoredLocale = (language: LanguageCode) => {
  const meta = languageMeta[language] ?? languageMeta.en;
  return normalizeLocaleKey(meta.locale || 'en-US');
};

const getRegionNames = (locale: string) => {
  if (typeof Intl === 'undefined' || !('DisplayNames' in Intl)) {
    return null;
  }
  return new Intl.DisplayNames([locale], { type: 'region' });
};

const getCountryLabel = (code: string, locale: string) => {
  if (!code) return '';
  const regionNames = getRegionNames(locale);
  return regionNames ? regionNames.of(code) ?? code : code;
};

const readStoredValue = (key: string, legacyKey: string) => {
  if (typeof window === 'undefined') return '';
  return (
    getSessionValue(key) ||
    window.localStorage.getItem(key) ||
    window.localStorage.getItem(legacyKey) ||
    getCookie(key)
  );
};

const persistPreference = (storageKey: string, legacyKey: string, value: string) => {
  if (typeof window === 'undefined') return;
  if (value) {
    setSessionValue(storageKey, value);
  } else {
    window.sessionStorage.removeItem(storageKey);
  }
  const consent = getCookieConsentState();

  if (consent === 'accepted') {
    if (value) {
      window.localStorage.setItem(storageKey, value);
      window.localStorage.setItem(legacyKey, value);
      setCookie(storageKey, value, 365);
    } else {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(legacyKey);
      deleteCookie(storageKey);
    }
    return;
  }

  window.localStorage.removeItem(storageKey);
  window.localStorage.removeItem(legacyKey);
  if (consent === 'declined') {
    deleteCookie(storageKey);
  }
};

const isRtlLanguage = (language: LanguageCode) => language === 'ar' || language === 'he';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = React.useState<LanguageCode>('en');
  const [country, setCountryState] = React.useState(defaultCountry);
  const [currency, setCurrencyState] = React.useState(defaultCurrency);
  const [countries, setCountries] = React.useState<CountryOption[]>([]);
  const [exchangeRates, setExchangeRates] = React.useState<Record<string, number>>({});
  const [postalCode, setPostalCodeState] = React.useState('');
  const [postalStatus, setPostalStatus] = React.useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [postalDetails, setPostalDetails] = React.useState<PostalDetails | null>(null);
  const [consentVersion, setConsentVersion] = React.useState(0);
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    getOrCreateSessionId();

    const storedLanguage = readStoredValue(storageKeys.language, 'language');
    const storedCountry = readStoredValue(storageKeys.country, 'country');
    const storedCurrency = readStoredValue(storageKeys.currency, 'currency');
    const storedPostal = readStoredValue(storageKeys.postal, 'postal');

    if (storedLanguage) {
      setLanguageState(resolveLanguageFromLocale(storedLanguage));
    } else if (typeof navigator !== 'undefined') {
      const navigatorLocale = navigator.languages?.[0] ?? navigator.language ?? 'en-US';
      setLanguageState(resolveLanguageFromLocale(navigatorLocale));
    }

    if (!storedCountry) {
      setCountryState(defaultCountry);
    }

    if (!storedCurrency) {
      setCurrencyState(defaultCurrency);
    }

    if (storedCountry) setCountryState(storedCountry.toUpperCase());
    if (storedCurrency) setCurrencyState(storedCurrency.toUpperCase());
    if (storedPostal) setPostalCodeState(storedPostal);
  }, []);

  React.useEffect(() => {
    let isActive = true;

    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data) => {
        if (!isActive) return null;
        const user = data?.user ?? null;
        setSessionUser(user);
        if (!user) return null;
        return fetch('/api/user/preferences');
      })
      .then((response) => {
        if (!response || !response.ok) return null;
        return response.json();
      })
      .then((prefs) => {
        if (!isActive || !prefs) return;

        const storedLanguage = readStoredValue(storageKeys.language, 'language');
        const storedCountry = readStoredValue(storageKeys.country, 'country');
        const storedCurrency = readStoredValue(storageKeys.currency, 'currency');
        const storedPostal = readStoredValue(storageKeys.postal, 'postal');

        if (!storedLanguage && prefs.locale) {
          setLanguageState(resolveLanguageFromLocale(String(prefs.locale)));
        }
        if (!storedCountry && prefs.country_code) {
          setCountryState(String(prefs.country_code).toUpperCase());
        }
        if (!storedCurrency && prefs.currency) {
          setCurrencyState(String(prefs.currency).toUpperCase());
        }
        if (!storedPostal && prefs.postal_code) {
          setPostalCodeState(String(prefs.postal_code));
        }
      })
      .catch(() => {
        if (!isActive) return;
        setSessionUser(null);
      });

    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleConsentChange = () => setConsentVersion((current) => current + 1);
    window.addEventListener('cookie-consent-changed', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-changed', handleConsentChange);
  }, []);

  React.useEffect(() => {
    let isActive = true;

    fetch('/api/localization/countries')
      .then((res) => res.json())
      .then((data) => {
        if (!isActive || !Array.isArray(data)) return;
        const mapped = data
          .map((item) => {
            if (!item?.cca2 || !item?.name?.common) return null;
            const currencyCodes = item.currencies ? Object.keys(item.currencies) : [];
            return {
              code: String(item.cca2).toUpperCase(),
              name: String(item.name.common),
              flag: toFlagEmoji(String(item.cca2)),
              currency: currencyCodes[0],
            } as CountryOption;
          })
          .filter(Boolean) as CountryOption[];

        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
      })
      .catch(() => {
        const fallback = getCountryOptions().map((option) => ({
          code: option.code,
          name: option.name,
          flag: option.flag,
        }));
        setCountries(fallback);
      });

    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedCountry = readStoredValue(storageKeys.country, 'country');
    const storedLanguage = readStoredValue(storageKeys.language, 'language');
    const storedCurrency = readStoredValue(storageKeys.currency, 'currency');
    const storedPostal = readStoredValue(storageKeys.postal, 'postal');

    let isActive = true;

    fetch('/api/localization/bootstrap')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unable to load localization defaults');
        }
        return res.json() as Promise<LocalizationBootstrap>;
      })
      .then((data) => {
        if (!isActive || !data) return;

        const nextCountry = String(data.countryCode || '').toUpperCase();
        if (nextCountry && !storedCountry) {
          setCountryState(nextCountry);
        }

        if (data.currency && !storedCurrency) {
          setCurrencyState(String(data.currency).toUpperCase());
        }

        if (data.postalCode && !storedPostal) {
          setPostalCodeState(String(data.postalCode));
        }

        if (!storedLanguage) {
          const fallbackLocale = data.locale || (nextCountry ? getLocaleForCountry(nextCountry) : 'en_US');
          setLanguageState(resolveLanguageFromLocale(fallbackLocale));
        }

        if (!storedPostal && (data.city || data.region || data.countryName)) {
          setPostalDetails({
            place: data.city,
            state: data.region,
            country: data.countryName,
          });
        }
      })
      .catch(() => {
        // Ignore bootstrap errors and keep local defaults.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const currencyByCountry = React.useMemo(() => {
    const map: Record<string, string> = {};
    countries.forEach((option) => {
      if (option.currency) {
        map[option.code] = option.currency;
      }
    });
    return map;
  }, [countries]);

  React.useEffect(() => {
    if (!country) return;
    const mappedLanguage = resolveLanguageFromLocale(getLocaleForCountry(country));
    setLanguageState((current) => (current === mappedLanguage ? current : mappedLanguage));
  }, [country]);

  React.useEffect(() => {
    if (!country) return;
    const derivedCurrency = currencyByCountry[country];
    if (derivedCurrency && derivedCurrency !== currency) {
      setCurrencyState(derivedCurrency);
    }
  }, [country, currencyByCountry, currency]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const ratesKey = 'exchange_rates_INR';
    const tsKey = 'exchange_rates_INR_ts';
    const cached = getSessionValue(ratesKey) || window.localStorage.getItem(ratesKey);
    if (cached) {
      try {
        setExchangeRates(JSON.parse(cached));
      } catch {
        // Ignore invalid cache.
      }
    }

    const refreshRates = () => {
      fetch('/api/localization/exchange-rates?base=INR')
        .then((res) => {
          if (!res.ok) {
            throw new Error('Unable to load exchange rates');
          }
          return res.json();
        })
        .then((data) => {
          if (!data?.rates) return;
          const serialized = JSON.stringify(data.rates);
          setExchangeRates(data.rates);
          setSessionValue(ratesKey, serialized);
          setSessionValue(tsKey, String(Date.now()));

          if (getCookieConsentState() === 'accepted') {
            window.localStorage.setItem(ratesKey, serialized);
            window.localStorage.setItem(tsKey, String(Date.now()));
          }
        })
        .catch(() => {
          // Ignore exchange rate errors.
        });
    };

    refreshRates();
    const interval = window.setInterval(refreshRates, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!country) return;
    persistPreference(storageKeys.country, 'country', country);
  }, [country]);

  React.useEffect(() => {
    if (!currency) return;
    persistPreference(storageKeys.currency, 'currency', currency);
  }, [currency, consentVersion]);

  React.useEffect(() => {
    const locale = toStoredLocale(language);
    persistPreference(storageKeys.language, 'language', locale);
  }, [language, consentVersion]);

  React.useEffect(() => {
    if (!postalCode) {
      persistPreference(storageKeys.postal, 'postal', '');
      return;
    }
    persistPreference(storageKeys.postal, 'postal', postalCode);
  }, [postalCode, consentVersion]);

  React.useEffect(() => {
    if (!sessionUser) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: toStoredLocale(language),
          country_code: country,
          currency,
          postal_code: postalCode || null,
          preferences: null,
        }),
        signal: controller.signal,
      }).catch(() => {
        // Ignore preference sync errors.
      });
    }, 600);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [sessionUser, language, country, currency, postalCode]);

  React.useEffect(() => {
    if (!postalCode) {
      setPostalStatus('idle');
      return;
    }

    if (!validatePostalCode(country, postalCode)) {
      setPostalStatus('invalid');
      setPostalDetails(null);
      return;
    }

    let isActive = true;
    setPostalStatus('checking');
    const timer = window.setTimeout(() => {
      fetch(`/api/localization/postal/${country.toLowerCase()}/${encodeURIComponent(postalCode.trim())}`)
        .then((res) => {
          if (!res.ok) throw new Error('Invalid postal code');
          return res.json();
        })
        .then((data) => {
          if (!isActive) return;
          setPostalDetails({
            place: data?.place ?? undefined,
            state: data?.state ?? undefined,
            country: data?.country ?? undefined,
          });
          setPostalStatus('valid');
        })
        .catch(() => {
          if (!isActive) return;
          setPostalStatus('invalid');
          setPostalDetails(null);
        });
    }, 400);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [postalCode, country]);

  const setLanguage = React.useCallback((next: LanguageCode) => {
    setLanguageState(next);
  }, []);

  const setCountry = React.useCallback((next: string) => {
    setCountryState(next.toUpperCase());
  }, []);

  const setPostalCode = React.useCallback((value: string) => {
    setPostalCodeState(value);
  }, []);

  const t = React.useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const table = translations[language] ?? translations.en;
      const fallback = translations.en[key] ?? key;
      const value = table[key] ?? fallback;
      return interpolate(value, params);
    },
    [language]
  );

  const meta = languageMeta[language] ?? languageMeta.en;
  const resolvedLocale = meta.locale || 'en-US';
  const selectedCountry = countries.find((option) => option.code === country);
  const resolvedCurrency = currency || selectedCountry?.currency || meta.currency || 'USD';
  const exchangeRate = resolvedCurrency === 'INR' ? 1 : exchangeRates[resolvedCurrency] ?? 1;
  const countryName = selectedCountry?.name ?? getCountryLabel(country, resolvedLocale);
  const countryFlag = selectedCountry?.flag ?? (country ? toFlagEmoji(country) : '');

  const formatPrice = React.useCallback(
    (amountInInr: number) => {
      const safeAmount = Number.isFinite(amountInInr) ? amountInInr : 0;
      const converted = safeAmount * exchangeRate;
      return formatCurrency(converted, resolvedLocale, resolvedCurrency);
    },
    [exchangeRate, resolvedLocale, resolvedCurrency]
  );

  React.useEffect(() => {
    document.documentElement.lang = resolvedLocale || language;
    document.documentElement.dir = isRtlLanguage(language) ? 'rtl' : 'ltr';
  }, [resolvedLocale, language]);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      locale: resolvedLocale,
      currency: resolvedCurrency,
      country,
      countryName,
      countryFlag,
      countries,
      setCountry,
      postalCode,
      setPostalCode,
      postalStatus,
      postalDetails,
      exchangeRate,
      formatPrice,
    }),
    [
      language,
      setLanguage,
      t,
      resolvedLocale,
      resolvedCurrency,
      country,
      countryName,
      countryFlag,
      countries,
      setCountry,
      postalCode,
      setPostalCode,
      postalStatus,
      postalDetails,
      exchangeRate,
      formatPrice,
    ]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};

