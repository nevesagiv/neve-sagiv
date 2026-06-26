import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './AccessibilityWidget.css';

const STORAGE_KEY = 'shlomo-adiv-a11y';

const DEFAULTS = {
  fontScale: 1, // 1, 1.15, 1.3, 1.5
  contrast: 'normal', // 'normal' | 'high' | 'inverted'
  highlightLinks: false,
  pauseAnimations: false,
  readableFont: false,
};

function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota errors */
  }
}

function applyPreferencesToDom(prefs) {
  const root = document.documentElement;
  root.style.setProperty('--a11y-font-scale', String(prefs.fontScale));
  root.dataset.a11yContrast = prefs.contrast;
  root.dataset.a11yHighlightLinks = prefs.highlightLinks ? 'on' : 'off';
  root.dataset.a11yPauseAnimations = prefs.pauseAnimations ? 'on' : 'off';
  root.dataset.a11yReadableFont = prefs.readableFont ? 'on' : 'off';
}

export default function AccessibilityWidget() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => loadPreferences());
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Apply preferences whenever they change
  useEffect(() => {
    applyPreferencesToDom(prefs);
    savePreferences(prefs);
  }, [prefs]);

  // Close panel on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const update = (patch) => setPrefs((p) => ({ ...p, ...patch }));
  const reset = () => setPrefs({ ...DEFAULTS });

  const labels = i18n.language === 'ru' ? LABELS_RU : LABELS_HE;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="a11y-toggle"
        aria-label={labels.toggle_aria}
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Universal accessibility icon (figure with outstretched arms) */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path
            d="M5.5 8.5 L9.5 10 L9.5 14 L7 21 M18.5 8.5 L14.5 10 L14.5 14 L17 21 M9.5 10 L14.5 10 M12 10 L12 14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          className="a11y-panel"
          role="dialog"
          aria-modal="false"
          aria-label={labels.panel_aria}
        >
          <header className="a11y-panel-head">
            <h2>{labels.title}</h2>
            <button
              type="button"
              className="a11y-close"
              onClick={() => setOpen(false)}
              aria-label={labels.close_aria}
            >
              ×
            </button>
          </header>

          <section className="a11y-section">
            <h3>{labels.text_size}</h3>
            <div className="a11y-buttons">
              <button
                type="button"
                onClick={() => update({ fontScale: 0.9 })}
                className={prefs.fontScale === 0.9 ? 'active' : ''}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => update({ fontScale: 1 })}
                className={prefs.fontScale === 1 ? 'active' : ''}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => update({ fontScale: 1.15 })}
                className={prefs.fontScale === 1.15 ? 'active' : ''}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => update({ fontScale: 1.3 })}
                className={prefs.fontScale === 1.3 ? 'active' : ''}
              >
                A++
              </button>
            </div>
          </section>

          <section className="a11y-section">
            <h3>{labels.contrast}</h3>
            <div className="a11y-buttons">
              <button
                type="button"
                onClick={() => update({ contrast: 'normal' })}
                className={prefs.contrast === 'normal' ? 'active' : ''}
              >
                {labels.contrast_normal}
              </button>
              <button
                type="button"
                onClick={() => update({ contrast: 'high' })}
                className={prefs.contrast === 'high' ? 'active' : ''}
              >
                {labels.contrast_high}
              </button>
              <button
                type="button"
                onClick={() => update({ contrast: 'inverted' })}
                className={prefs.contrast === 'inverted' ? 'active' : ''}
              >
                {labels.contrast_inverted}
              </button>
            </div>
          </section>

          <section className="a11y-section">
            <h3>{labels.options}</h3>
            <label className="a11y-checkbox">
              <input
                type="checkbox"
                checked={prefs.highlightLinks}
                onChange={(e) => update({ highlightLinks: e.target.checked })}
              />
              <span>{labels.highlight_links}</span>
            </label>
            <label className="a11y-checkbox">
              <input
                type="checkbox"
                checked={prefs.pauseAnimations}
                onChange={(e) => update({ pauseAnimations: e.target.checked })}
              />
              <span>{labels.pause_animations}</span>
            </label>
            <label className="a11y-checkbox">
              <input
                type="checkbox"
                checked={prefs.readableFont}
                onChange={(e) => update({ readableFont: e.target.checked })}
              />
              <span>{labels.readable_font}</span>
            </label>
          </section>

          <footer className="a11y-foot">
            <button type="button" className="a11y-reset" onClick={reset}>
              {labels.reset}
            </button>
            <Link to="/accessibility" className="a11y-statement" onClick={() => setOpen(false)}>
              {labels.statement_link}
            </Link>
          </footer>
        </div>
      )}
    </>
  );
}

const LABELS_HE = {
  toggle_aria: 'פתיחת תפריט נגישות',
  panel_aria: 'תפריט נגישות',
  close_aria: 'סגירה',
  title: 'הגדרות נגישות',
  text_size: 'גודל טקסט',
  contrast: 'ניגודיות',
  contrast_normal: 'רגיל',
  contrast_high: 'גבוה',
  contrast_inverted: 'מהופך',
  options: 'אפשרויות נוספות',
  highlight_links: 'הדגשת קישורים',
  pause_animations: 'עצירת אנימציות',
  readable_font: 'גופן קריא',
  reset: 'איפוס הגדרות',
  statement_link: 'להצהרת הנגישות המלאה ←',
};

const LABELS_RU = {
  toggle_aria: 'Открыть меню доступности',
  panel_aria: 'Меню доступности',
  close_aria: 'Закрыть',
  title: 'Настройки доступности',
  text_size: 'Размер текста',
  contrast: 'Контраст',
  contrast_normal: 'Обычный',
  contrast_high: 'Высокий',
  contrast_inverted: 'Инверсия',
  options: 'Дополнительно',
  highlight_links: 'Выделить ссылки',
  pause_animations: 'Остановить анимации',
  readable_font: 'Читаемый шрифт',
  reset: 'Сбросить',
  statement_link: 'Полное заявление о доступности →',
};
