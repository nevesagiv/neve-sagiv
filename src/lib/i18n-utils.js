import { CITY_HE_TO_RU, PROPERTY_TYPE_HE_TO_RU } from './i18n-dict.js';

// Used by the public site to render city/type strings in the active language.
// Fallback chain when target language is missing:
//   1. The admin-entered translation (field[lang])
//   2. A best-effort dictionary lookup (city/type only)
//   3. The Hebrew original
export function localized(field, lang, kind) {
  if (!field) return null;
  if (typeof field === 'string') return field;

  // 1. Admin filled it in
  if (field[lang]) return field[lang];

  // 2. Dictionary fallback for Russian
  if (lang === 'ru' && field.he) {
    if (kind === 'city' && CITY_HE_TO_RU[field.he.trim()]) {
      return CITY_HE_TO_RU[field.he.trim()];
    }
    if (kind === 'type' && PROPERTY_TYPE_HE_TO_RU[field.he.trim()]) {
      return PROPERTY_TYPE_HE_TO_RU[field.he.trim()];
    }
  }

  // 3. Hebrew original
  return field.he || null;
}
