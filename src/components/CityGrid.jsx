import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './CityGrid.css';

const CITY_LIST = [
  { id: 'naharia', he: 'נהריה', ru: 'Нагария', region: 'צפון' },
  { id: 'haifa', he: 'חיפה', ru: 'Хайфа', region: 'צפון' },
  { id: 'nazareth', he: 'נצרת', ru: 'Назарет', region: 'צפון' },
  { id: 'netanya', he: 'נתניה', ru: 'Нетания', region: 'מרכז' },
  { id: 'tel-aviv', he: 'תל אביב', ru: 'Тель-Авив', region: 'מרכז' },
  { id: 'bat-yam', he: 'בת ים', ru: 'Бат-Ям', region: 'מרכז' },
  { id: 'ashdod', he: 'אשדוד', ru: 'Ашдод', region: 'דרום' },
  { id: 'jerusalem', he: 'ירושלים', ru: 'Иерусалим', region: 'מרכז' },
  { id: 'netivot', he: 'נתיבות', ru: 'Нетивот', region: 'דרום' },
  { id: 'beer-sheva', he: 'באר שבע', ru: 'Беэр-Шева', region: 'דרום' },
];

function HouseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export default function CityGrid({ onCitySelect, propertiesPerCity = {} }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const cities = useMemo(
    () =>
      CITY_LIST.map((c) => ({
        ...c,
        label: lang === 'ru' ? c.ru : c.he,
        count: propertiesPerCity[c.he] ?? 0,
      })).sort((a, b) => b.count - a.count),
    [lang, propertiesPerCity]
  );

  const activeCount = cities.filter((c) => c.count > 0).length;
  const totalProperties = cities.reduce((sum, c) => sum + c.count, 0);

  return (
    <section className="city-grid-section">
      <div className="container">
        <div className="city-grid-head">
          <span className="city-grid-tag">{t('cityGrid.tag', 'אזורים פעילים')}</span>
          <h2 className="city-grid-title">{t('cityGrid.title', 'בחר עיר לחיפוש נכסים')}</h2>
          <p className="city-grid-sub">
            {t('cityGrid.sub', 'לחץ על עיר כדי לראות את הנכסים הפעילים בה')}
          </p>
          <div className="city-grid-stats">
            <div className="city-grid-stat">
              <span className="city-grid-stat-num">{activeCount}</span>
              <span className="city-grid-stat-label">{t('cityGrid.active_cities', 'ערים פעילות')}</span>
            </div>
            <div className="city-grid-stat-divider" />
            <div className="city-grid-stat">
              <span className="city-grid-stat-num">{totalProperties}</span>
              <span className="city-grid-stat-label">{t('cityGrid.total_props', 'נכסים זמינים')}</span>
            </div>
          </div>
        </div>

        <div className="city-grid">
          {cities.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`city-card ${c.count > 0 ? 'is-active' : 'is-empty'}`}
              onClick={() => c.count > 0 && onCitySelect?.(c.he)}
              disabled={c.count === 0}
              aria-label={
                c.count > 0
                  ? `${c.label} — ${c.count} נכסים`
                  : `${c.label} — אין נכסים זמינים כרגע`
              }
            >
              <div className="city-card-region">{c.region}</div>
              <div className="city-card-icon" aria-hidden="true">
                <HouseIcon />
              </div>
              <h3 className="city-card-name">{c.label}</h3>
              {c.count > 0 ? (
                <div className="city-card-meta">
                  <span className="city-card-count">{c.count}</span>
                  <span className="city-card-count-label">
                    {c.count === 1
                      ? t('cityGrid.one_prop', 'נכס פעיל')
                      : t('cityGrid.many_props', 'נכסים פעילים')}
                  </span>
                </div>
              ) : (
                <div className="city-card-meta city-card-meta-empty">
                  <span className="city-card-soon">{t('cityGrid.soon', 'בקרוב')}</span>
                </div>
              )}
              {c.count > 0 && (
                <div className="city-card-cta" aria-hidden="true">
                  <span>{t('cityGrid.enter', 'צפה בנכסים')}</span>
                  <ArrowIcon />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
