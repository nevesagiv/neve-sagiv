import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import AccessibilityWidget from './AccessibilityWidget.jsx';
import './Layout.css';

export default function Layout() {
  const { i18n } = useTranslation();
  const skipLabel = i18n.language === 'ru' ? 'Перейти к содержанию' : 'דלג לתוכן הראשי';

  return (
    <div className="layout">
      {/* Skip-to-content link for screen readers (legal accessibility requirement) */}
      <a href="#main-content" className="skip-to-content">
        {skipLabel}
      </a>

      <Header />
      <main id="main-content" className="layout-main" tabIndex="-1">
        <Outlet />
      </main>
      <Footer />
      <AccessibilityWidget />
    </div>
  );
}
