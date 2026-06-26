import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './InfoPage.css';

// Reusable wrapper for static info pages (privacy, accessibility, terms).
// Pass title key + tag key + content as children.
export default function InfoPage({ tagKey, titleKey, updatedKey, children }) {
  const { t } = useTranslation();

  return (
    <div className="info-page container-narrow">
      <span className="info-tag">{t(tagKey)}</span>
      <h1>{t(titleKey)}</h1>
      <p className="info-updated">{t(updatedKey)}</p>

      <div className="info-content">
        {children}
        <Link to="/" className="info-back">
          {t('back_link')}
        </Link>
      </div>
    </div>
  );
}
