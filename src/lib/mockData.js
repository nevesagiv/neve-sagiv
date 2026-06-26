// Mock property data used until Supabase is wired up.
// Cities have a Russian translation embedded so the language switcher works
// during local development without calling the translation API.

export const MOCK_PROPERTIES = [
  {
    id: 1,
    city: { he: 'תל אביב', ru: 'Тель-Авив' },
    street: 'סירקין',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: 3,
    area: 70,
    is_published: true,
  },
  {
    id: 2,
    city: { he: 'באר שבע', ru: 'Беэр-Шева' },
    street: 'מקור חיים',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: 4,
    area: 85,
    is_published: true,
  },
  {
    id: 3,
    city: { he: 'נתיבות', ru: 'Нетивот' },
    street: 'הרב הרצוג',
    property_type: { he: 'בית מגורים', ru: 'Жилой дом' },
    rooms: null,
    area: 68,
    is_published: true,
  },
  {
    id: 4,
    city: { he: 'תל אביב', ru: 'Тель-Авив' },
    street: 'בית אלפא',
    property_type: { he: 'מקרקעין', ru: 'Земельный участок' },
    rooms: null,
    area: 1113,
    is_published: true,
  },
  {
    id: 5,
    city: { he: 'נצרת', ru: 'Назарет' },
    street: '4011',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: 5,
    area: 99,
    is_published: true,
  },
  {
    id: 6,
    city: { he: 'נהריה', ru: 'Нагария' },
    street: 'בלפור',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: null,
    area: 111,
    is_published: true,
  },
  {
    id: 7,
    city: { he: 'תל אביב', ru: 'Тель-Авив' },
    street: 'אורי צבי גרינברג',
    property_type: { he: 'דופלקס', ru: 'Дуплекс' },
    rooms: null,
    area: null,
    is_published: true,
  },
  {
    id: 8,
    city: { he: 'יקנעם', ru: 'Йокнеам' },
    street: null,
    property_type: { he: 'קרקע חקלאית', ru: 'Сельхозземля' },
    rooms: null,
    area: 8587,
    is_published: true,
  },
  {
    id: 9,
    city: { he: 'בת ים', ru: 'Бат-Ям' },
    street: 'בלפור',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: 4,
    area: 92,
    is_published: true,
  },
  {
    id: 10,
    city: { he: 'ירושלים', ru: 'Иерусалим' },
    street: 'הרצוג',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: 3,
    area: 75,
    is_published: true,
  },
  {
    id: 11,
    city: { he: 'חיפה', ru: 'Хайфа' },
    street: 'הנשיא',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: 4,
    area: 110,
    is_published: true,
  },
  {
    id: 12,
    city: { he: 'רמת גן', ru: 'Рамат-Ган' },
    street: 'ביאליק',
    property_type: { he: 'דירה', ru: 'Квартира' },
    rooms: 3.5,
    area: 80,
    is_published: true,
  },
];

// Helper: get the translated value for the current language, falling back to Hebrew.
export function localized(field, lang) {
  if (!field) return null;
  if (typeof field === 'string') return field;
  return field[lang] || field.he || null;
}
