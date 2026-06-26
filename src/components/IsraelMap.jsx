import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './IsraelMap.css';

const CITY_DOTS = [
  { id: 'naharia', he: 'נהריה', ru: 'Нагария', left: 17, top: 6 },
  { id: 'haifa', he: 'חיפה', ru: 'Хайфа', left: 22, top: 11 },
  { id: 'nazareth', he: 'נצרת', ru: 'Назарет', left: 40, top: 14 },
  { id: 'netanya', he: 'נתניה', ru: 'Нетания', left: 13, top: 25 },
  { id: 'tel-aviv', he: 'תל אביב', ru: 'Тель-Авив', left: 11, top: 33 },
  { id: 'bat-yam', he: 'בת ים', ru: 'Бат-Ям', left: 11, top: 36 },
  { id: 'ashdod', he: 'אשדוד', ru: 'Ашдод', left: 12, top: 40 },
  { id: 'jerusalem', he: 'ירושלים', ru: 'Иерусалим', left: 35, top: 43 },
  { id: 'netivot', he: 'נתיבות', ru: 'Нетивот', left: 14, top: 52 },
  { id: 'beer-sheva', he: 'באר שבע', ru: 'Беэр-Шева', left: 19, top: 56 },
];

export default function IsraelMap({ onCitySelect, propertiesPerCity = {} }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [hovered, setHovered] = useState(null);

  const cities = useMemo(
    () =>
      CITY_DOTS.map((c) => ({
        ...c,
        label: lang === 'ru' ? c.ru : c.he,
        count: propertiesPerCity[c.he] ?? 0,
      })),
    [lang, propertiesPerCity]
  );

  return (
    <section className="israel-map-section">
      <div className="container">
        <div className="map-head">
          <span className="map-tag">{t('map.tag', 'בחר עיר')}</span>
          <h2 className="map-title">{t('map.title', 'נכסים על מפת ישראל')}</h2>
          <p className="map-sub">
            {t('map.sub', 'לחץ על נקודה זהובה כדי לראות את הנכסים הפעילים בעיר')}
          </p>
        </div>

        <div className="map-wrap">
          <div className="map-stage">
            <div className="map-image-wrap">
              <img
                src="/israel1.jpg"
                alt="מפת ישראל"
                className="map-image"
                draggable={false}
              />
              {cities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`city-dot-btn ${c.count > 0 ? 'is-active' : ''} ${hovered === c.id ? 'is-hovered' : ''}`}
                  style={{ left: `${c.left}%`, top: `${c.top}%` }}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(c.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onCitySelect?.(c.he)}
                  aria-label={`${c.label}${c.count > 0 ? ` — ${c.count} נכסים` : ''}`}
                >
                  <span className="city-dot-pulse" aria-hidden="true" />
                  <span className="city-dot-core" aria-hidden="true" />
                  {(hovered === c.id || c.count > 0) && (
                    <span className="city-dot-tip">
                      <span className="city-dot-tip-name">{c.label}</span>
                      {c.count > 0 && (
                        <span className="city-dot-tip-count">{c.count}</span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="map-side">
            <h3 className="map-side-title">
              {t('map.cities_title', 'ערים פעילות')}
            </h3>
            <ul className="map-city-list">
              {cities
                .filter((c) => c.count > 0)
                .map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="map-city-btn"
                      onClick={() => onCitySelect?.(c.he)}
                    >
                      <span className="map-city-name">{c.label}</span>
                      <span className="map-city-count">{c.count}</span>
                    </button>
                  </li>
                ))}
            </ul>
            <p className="map-side-hint">
              {t(
                'map.hint',
                'הנקודות הזהובות מציינות ערים עם נכסים פעילים. לחץ עליהן כדי לראות את הנכסים.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
