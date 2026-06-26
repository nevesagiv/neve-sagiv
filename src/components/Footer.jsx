import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-tagline">
          <strong>{t('brand.name')}</strong> · {t('footer.tagline')}
        </p>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/accessibility">{t('footer.accessibility')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
        </nav>
        <p className="footer-rights">{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
