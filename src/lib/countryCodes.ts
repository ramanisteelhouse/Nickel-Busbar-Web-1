import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { Country } from '../types';

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

const toFlagEmoji = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export const getCountryOptions = (): Country[] => {
  return getCountries()
    .map((code) => {
      const dial = `+${getCountryCallingCode(code as CountryCode)}`;
      const name = regionNames ? regionNames.of(code) ?? code : code;
      return {
        code,
        dial_code: dial,
        name,
        flag: toFlagEmoji(code),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};
