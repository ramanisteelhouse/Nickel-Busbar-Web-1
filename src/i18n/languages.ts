export type LanguageCode =
  | 'en'
  | 'zh'
  | 'nl'
  | 'fr'
  | 'de'
  | 'it'
  | 'es'
  | 'tr'
  | 'hi'
  | 'pt'
  | 'ru'
  | 'ko'
  | 'ja'
  | 'ar'
  | 'th'
  | 'vi'
  | 'he'
  | 'id';

export const languageMeta: Record<LanguageCode, { label: string; locale: string; currency: string }> = {
  en: { label: 'English', locale: 'en-US', currency: 'USD' },
  zh: { label: 'Chinese', locale: 'zh-CN', currency: 'CNY' },
  nl: { label: 'Dutch', locale: 'nl-NL', currency: 'EUR' },
  fr: { label: 'French', locale: 'fr-FR', currency: 'EUR' },
  de: { label: 'German', locale: 'de-DE', currency: 'EUR' },
  it: { label: 'Italian', locale: 'it-IT', currency: 'EUR' },
  es: { label: 'Spanish', locale: 'es-ES', currency: 'EUR' },
  tr: { label: 'Turkish', locale: 'tr-TR', currency: 'TRY' },
  hi: { label: 'Hindi', locale: 'hi-IN', currency: 'INR' },
  pt: { label: 'Portuguese', locale: 'pt-PT', currency: 'EUR' },
  ru: { label: 'Russian', locale: 'ru-RU', currency: 'RUB' },
  ko: { label: 'Korean', locale: 'ko-KR', currency: 'KRW' },
  ja: { label: 'Japanese', locale: 'ja-JP', currency: 'JPY' },
  ar: { label: 'Arabic', locale: 'ar-SA', currency: 'SAR' },
  th: { label: 'Thai', locale: 'th-TH', currency: 'THB' },
  vi: { label: 'Vietnamese', locale: 'vi-VN', currency: 'VND' },
  he: { label: 'Hebrew', locale: 'he-IL', currency: 'ILS' },
  id: { label: 'Indonesian', locale: 'id-ID', currency: 'IDR' },
};
