import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import './Header.css';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label={t('brand.name')}>
          <span className="logo-name">{t('brand.name')}</span>
          <span className="logo-mark">·</span>
          <span className="logo-tagline">{t('brand.tagline')}</span>
        </Link>

        <div className="header-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
