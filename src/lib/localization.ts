export const languageMaps = {
  en_US: 'english',
  de_DE: 'german',
  pt_PT: 'portuguese',
  es_ES: 'spanish',
  fr_FR: 'french',
  it_IT: 'italian',
  hi_IN: 'hindi',
  ru_RU: 'russian',
  ko_KR: 'korean',
  ja_JP: 'japanese',
  ar_SA: 'arabic',
  th_TH: 'thai',
  tr_TR: 'turkish',
  vi_VN: 'vietnamese',
  nl_NL: 'dutch',
  iw_IL: 'hebrew',
  in_ID: 'indonesian',
  zh_CN: 'chinese',
} as const;

/**
 * The locale associated with each country — what the language picker offers for it.
 *
 * This is not the same question as "what language should a visitor from here be shown by
 * default": see `autoLanguageCountryOverrides` in i18n/LanguageProvider.tsx, which overrides
 * India to English because the site's content is English throughout.
 */
export const supportedCountryLocales = {
  US: 'en_US',
  DE: 'de_DE',
  PT: 'pt_PT',
  ES: 'es_ES',
  FR: 'fr_FR',
  IT: 'it_IT',
  IN: 'hi_IN',
  RU: 'ru_RU',
  KR: 'ko_KR',
  JP: 'ja_JP',
  SA: 'ar_SA',
  TH: 'th_TH',
  TR: 'tr_TR',
  VN: 'vi_VN',
  NL: 'nl_NL',
  IL: 'iw_IL',
  ID: 'in_ID',
  CN: 'zh_CN',
} as const;

export const localeToCountry = Object.fromEntries(
  Object.entries(supportedCountryLocales).map(([country, locale]) => [locale, country]),
) as Record<keyof typeof languageMaps, string>;

export const normalizeLocaleKey = (locale: string) => {
  const normalized = locale.replace('-', '_');
  const [lang, region] = normalized.split('_');
  if (region) {
    return `${lang}_${region.toUpperCase()}`;
  }
  return normalized;
};

export const getLocaleForCountry = (countryCode: string) => {
  const upper = countryCode.toUpperCase();
  return supportedCountryLocales[upper as keyof typeof supportedCountryLocales] ?? 'en_US';
};

export const toFlagEmoji = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const postalPatterns: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  IN: /^\d{6}$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
  AU: /^\d{4}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Z]{2}$/,
  SE: /^\d{3}\s?\d{2}$/,
  NO: /^\d{4}$/,
  BR: /^\d{5}-?\d{3}$/,
  RU: /^\d{6}$/,
  CN: /^\d{6}$/,
  JP: /^\d{3}-?\d{4}$/,
  KR: /^\d{5}$/,
  SG: /^\d{6}$/,
  AE: /^\d{5}$/,
  SA: /^\d{5}$/,
  ZA: /^\d{4}$/,
};

export const validatePostalCode = (countryCode: string, value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const pattern = postalPatterns[countryCode.toUpperCase()];
  if (!pattern) return trimmed.length >= 3;
  return pattern.test(trimmed);
};
