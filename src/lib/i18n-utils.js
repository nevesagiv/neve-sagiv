export function localized(field, lang) {
  if (!field) return null;
  if (typeof field === 'string') return field;
  return field[lang] || field.he || null;
}
