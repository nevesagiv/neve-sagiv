import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitLead } from '../lib/supabase.js';
import './Landing.css';

// Spam protection — minimum seconds between page open and form submit.
const MIN_SUBMIT_SECONDS = 3;
const RATE_LIMIT_KEY = 'landing_last_submit';
const RATE_LIMIT_HOURS = 1;

// WhatsApp click-to-chat
const WHATSAPP_PHONE = '972506666128';

const WHATSAPP_MESSAGES = {
  he: 'היי, הגעתי דרך אתר נווה שגיב. אני מעוניין בנכס במחיר נמוך',
  ru: 'Привет, я пришел с сайта Neve Sagiv. Я заинтересован в недвижимости по низкой цене',
};

export default function Landing() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'he';

  const [form, setForm] = useState({ fullName: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [honeypot, setHoneypot] = useState('');
  const openedAtRef = useRef(Date.now());

  const whatsappMessage = WHATSAPP_MESSAGES[lang] || WHATSAPP_MESSAGES.he;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    const titleKey = lang === 'ru' ? 'landing.seoTitleRu' : 'landing.seoTitleHe';
    const descKey = lang === 'ru' ? 'landing.seoDescRu' : 'landing.seoDescHe';
    document.title = t(titleKey) || 'Neve Sagiv | Properties from Auctions';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', t(descKey) || 'Dream apartment at a lower price than the market');

    const url = new URL(window.location.href);
    const utm = url.searchParams.get('utm_source');
    if (utm) sessionStorage.setItem('landing_utm', utm);
  }, [lang, t]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'submitting') return;
    if (!form.fullName.trim() || !form.phone.trim()) {
      setStatus('error');
      return;
    }

    if (honeypot) {
      setStatus('success');
      return;
    }

    const secondsOpen = (Date.now() - openedAtRef.current) / 1000;
    if (secondsOpen < MIN_SUBMIT_SECONDS) {
      setStatus('error');
      return;
    }

    try {
      const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
      if (last && Date.now() - last < RATE_LIMIT_HOURS * 3600 * 1000) {
        setStatus('success');
        return;
      }
    } catch { /* localStorage blocked */ }

    setStatus('submitting');
    try {
      const utm = sessionStorage.getItem('landing_utm') || 'landing-direct';
      await submitLead({
        propertyId: null,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        message: `[Source: Apartment Landing / ${utm}]${form.message ? '\n' + form.message : ''}`,
      });
      try { localStorage.setItem(RATE_LIMIT_KEY, String(Date.now())); } catch { }
      setStatus('success');
      setForm({ fullName: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  function scrollToForm() {
    const nameInput = document.getElementById('landing-name');
    if (nameInput) {
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => nameInput.focus({ preventScroll: true }), 600);
    }
  }

  return (
    <div className={`landing-page ${lang === 'ru' ? 'landing-ru' : 'landing-he'}`} dir={lang === 'ru' ? 'ltr' : 'rtl'}>
      {/* Minimal branding bar */}
      <header className="landing-brand">
        <div className="landing-brand-inner">
          <div className="landing-brand-left">
            <a href="/" className="landing-brand-logo">
              <span className="landing-brand-name">{lang === 'ru' ? 'Neve Sagiv' : 'נווה שגיב'}</span>
              <span className="landing-brand-tag">{lang === 'ru' ? 'Консультации по торгам недвижимости' : 'ייעוץ בעסקאות מכרזים'}</span>
            </a>
          </div>
          <div className="landing-lang-switcher">
            <button
              className={`landing-lang-btn ${lang === 'he' ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('he')}
              type="button"
              aria-label="Hebrew"
            >
              עברית
            </button>
            <button
              className={`landing-lang-btn ${lang === 'ru' ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('ru')}
              type="button"
              aria-label="Russian"
            >
              Русский
            </button>
          </div>
        </div>
      </header>

      {/* HERO with apartment image */}
      <section className="landing-apartment-hero">
        <img src="/apartment-hero.webp" alt="Dream Apartment" className="landing-apartment-image" />
        <div className="landing-apartment-overlay" />
        <div className="landing-apartment-content">
          <h1 className="landing-apartment-title">
            {lang === 'ru'
              ? 'Хотите купить квартиру мечты по цене ниже рыночной?'
              : 'רוצים לקנות את דירת חלומותיכם במחיר נמוך מהשוק?'}
          </h1>
          <p className="landing-apartment-subtitle">
            {lang === 'ru'
              ? 'Найдите невероятную недвижимость на аукционах и торгах по сниженным ценам.'
              : 'גלו נכסים מדהימים בהנחות משמעותיות בזכות רכישה דרך מכרזים ומכינוסי נכסים.'}
          </p>
          <button type="button" className="landing-cta-btn" onClick={scrollToForm}>
            {lang === 'ru' ? 'Получить информацию' : 'בואו ניצור קשר'}
          </button>
        </div>
      </section>

      {/* Contact form */}
      <section className="landing-contact">
        <div className="landing-contact-inner">
          <h2>{lang === 'ru' ? 'Свяжитесь с нами' : 'צור קשר איתנו'}</h2>
          <p className="landing-contact-sub">
            {lang === 'ru'
              ? 'Оставьте свои данные и узнайте о доступных объектах за 24 часа'
              : 'השאיר פרטים ונשלח לך את הנכסים הרלוונטיים ביותר תוך 24 שעות'}
          </p>

          <form className={`landing-form ${status === 'success' ? 'is-success' : ''}`} onSubmit={handleSubmit} noValidate>
            {status === 'success' ? (
              <div className="landing-form-success">
                <div className="landing-form-success-icon">✓</div>
                <h3>{lang === 'ru' ? 'Ваша заявка получена!' : 'קיבלנו את הפרטים שלך!'}</h3>
                <p>
                  {lang === 'ru'
                    ? 'Мы свяжемся с вами в течение 24 часов с информацией о подходящей недвижимости.'
                    : 'נחזור אליך תוך 24 שעות עם רשימת הנכסים הרלוונטיים.'}
                </p>
                <button
                  type="button"
                  className="landing-form-success-back"
                  onClick={() => setStatus('idle')}
                >
                  {lang === 'ru' ? 'Оставить еще данные' : 'להשאיר פרטים נוספים'}
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                />
                <div className="landing-form-field">
                  <label htmlFor="landing-name">{lang === 'ru' ? 'Полное имя' : 'שם מלא'}</label>
                  <input
                    id="landing-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder={lang === 'ru' ? 'Например: Иван Петров' : 'לדוגמה: דני כהן'}
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-phone">{lang === 'ru' ? 'Телефон' : 'טלפון'}</label>
                  <input
                    id="landing-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder={lang === 'ru' ? '+7 (999) 123-45-67' : '050-1234567'}
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-email">{lang === 'ru' ? 'Email (необязательно)' : 'אימייל (לא חובה)'}</label>
                  <input
                    id="landing-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder={lang === 'ru' ? 'name@example.com' : 'name@example.com'}
                    dir="ltr"
                  />
                </div>
                {status === 'error' && (
                  <div className="landing-form-error">
                    {lang === 'ru'
                      ? 'Что-то пошло не так. Пожалуйста, проверьте данные и попробуйте снова.'
                      : 'משהו השתבש. ודאו שמילאתם שם וטלפון, ונסו שוב.'}
                  </div>
                )}
                <button
                  type="submit"
                  className="landing-form-submit"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting'
                    ? (lang === 'ru' ? 'Отправка...' : 'שולח...')
                    : (lang === 'ru' ? 'Отправить запрос' : 'שלחו לי פרטים')}
                </button>

                <div className="landing-form-or" aria-hidden="true">
                  <span>{lang === 'ru' ? 'или' : 'או'}</span>
                </div>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="landing-whatsapp-btn">
                  <WhatsAppIcon />
                  {lang === 'ru' ? 'Напишите в WhatsApp' : 'שלחו לנו הודעה בוואטסאפ'}
                </a>

                <p className="landing-form-fine">
                  🔒 {lang === 'ru' ? 'Ваши данные защищены и не будут распространяться.' : 'הפרטים שלכם לא ייחשפו לאיש. שיחה אחת בלבד.'}
                </p>
              </>
            )}
          </form>
        </div>
      </section>

      {/* Floating WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="landing-whatsapp-float"
        aria-label={lang === 'ru' ? 'Связаться в WhatsApp' : 'צרו קשר בוואטסאפ'}
        title={lang === 'ru' ? 'Связаться в WhatsApp' : 'צרו קשר בוואטסאפ'}
      >
        <WhatsAppIcon />
      </a>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <p>
              © {lang === 'ru' ? 'Neve Sagiv • Консультации по недвижимости на торгах' : 'נווה שגיב • השקעות בנכסים ממכרזים'}
            </p>
            <div className="landing-footer-links">
              <a href="/privacy">{lang === 'ru' ? 'Конфиденциальность' : 'פרטיות'}</a>
              <span className="landing-footer-sep">·</span>
              <a href="/terms">{lang === 'ru' ? 'Условия использования' : 'תנאי שימוש'}</a>
              <span className="landing-footer-sep">·</span>
              <a href="https://www.neve-sagiv.co.il/" target="_blank" rel="noopener noreferrer">
                {lang === 'ru' ? 'Основной сайт' : 'האתר הראשי'}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
