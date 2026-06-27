import { useTranslation } from 'react-i18next';
import { localized } from '../lib/i18n-utils.js';
import './PropertyCard.css';

export default function PropertyCard({ property, onInterested }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const city = localized(property.city, lang, 'city');
  const type = localized(property.property_type, lang, 'type');
  const street = property.street;

  return (
    <article className="card">
      <div className="card-header">
        <div className="card-type">{type}</div>
        <div className="card-title">{city}</div>
        <div className="card-subtitle">
          {street ? `${t('card.street_prefix')} ${street}` : t('card.region_general')}
        </div>
      </div>
      <div className="card-body">
        <div className="card-attrs">
          <div className="attr">
            <div className="attr-label">{t('card.rooms')}</div>
            <div className="attr-value">{property.rooms ?? '—'}</div>
          </div>
          <div className="attr">
            <div className="attr-label">{t('card.area')}</div>
            <div className="attr-value">{property.area ?? '—'}</div>
          </div>
        </div>
        <p className="card-note">{t('card.details_note')}</p>
        <button
          type="button"
          className="card-cta"
          onClick={() => onInterested(property)}
        >
          {t('card.cta_interested')}
        </button>
      </div>
    </article>
  );
}
