import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const switchTo = (lng) => {
    if (lng !== current) i18n.changeLanguage(lng);
  };

  return (
    <div className="lang-switcher" role="group" aria-label="Language switcher">
      <button
        type="button"
        className={current === 'he' ? 'active' : ''}
        onClick={() => switchTo('he')}
        aria-pressed={current === 'he'}
      >
        עברית
      </button>
      <button
        type="button"
        className={current === 'ru' ? 'active' : ''}
        onClick={() => switchTo('ru')}
        aria-pressed={current === 'ru'}
      >
        Русский
      </button>
    </div>
  );
}
