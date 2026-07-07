import { useEffect, useRef, useState } from 'react';
import { submitLead } from '../lib/supabase.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import './Landing.css';

// Spam protection — minimum seconds between page open and form submit.
// Bots fill instantly; humans take >3 sec to type. Tune if false-positives.
const MIN_SUBMIT_SECONDS = 3;
const RATE_LIMIT_KEY = 'landing_last_submit';
const RATE_LIMIT_HOURS = 1;

// WhatsApp click-to-chat — opens a chat with the message pre-filled
const WHATSAPP_PHONE = '972506666128';

const TRANSLATIONS = {
  he: {
    whatsappMsg: 'שלום, הגעתי דרך אתר נווה שגיב. מחפש נכס במחיר אטרקטיבי — אשמח לפרטים.',
    brandName: 'נווה שגיב',
    brandTag: 'ייעוץ בעסקאות מכרזים',
    heroTitle: 'רוצים לקנות את דירת חלומותיכם במחיר נמוך מהשוק?',
    heroSubtitle: 'גלו נכסים מדהימים בהנחות משמעותיות בזכות רכישה דרך מכרזים ומכינוסי נכסים.',
    heroCta: 'בואו ניצור קשר',
    sectionTag: '📍 נכסים ממכרזים ומכינוסי נכסים',
    sectionTitle: 'נכסים במחיר נמוך מהשוק.',
    sectionTitleEm: 'מבחר בכל הארץ.',
    sectionSub: 'בכינוסי נכסים ובמכרזי בית משפט מתפרסמים נכסים במחיר נמוך משמעותית מהשוק. אנחנו מפרסמים את המבחר האחרון כאן.\nהשאירו פרטים ונחזור אליכם עם פרטים מלאים.',
    bullet1: 'עשרות נכסים פעילים בכל הארץ',
    bullet2: 'מחירים משמעותית נמוכים מהשוק',
    bullet3: 'חזרה אישית תוך 24 שעות',
    formHeading: 'השאירו פרטים, נחזור תוך 24 שעות',
    formSubtitle: 'בלי התחייבות, בלי עלות. שיחה ראשונית של עד 20 דקות.',
    formName: 'שם מלא',
    formNamePlaceholder: 'לדוגמה: דני כהן',
    formPhone: 'טלפון',
    formPhonePlaceholder: '050-1234567',
    formEmail: 'אימייל (לא חובה)',
    formEmailPlaceholder: 'name@example.com',
    formMessage: 'מה מעניין אתכם? (לא חובה)',
    formMessagePlaceholder: 'לדוגמה: דירה 3 חדרים בתל אביב, תקציב עד 1.5 מיליון',
    formSubmit: 'שלחו לי פרטים, בלי התחייבות',
    formSubmitting: 'שולח...',
    formOr: 'או',
    formWhatsApp: 'שלחו לנו הודעה בוואטסאפ',
    formPrivacy: '🔒 הפרטים שלכם לא ייחשפו לאיש ולא יישלחו ל-newsletters. שיחה אחת בלבד.',
    formError: 'משהו השתבש. ודאו שמילאתם שם וטלפון, ונסו שוב.',
    formSuccessTitle: 'קיבלנו את הפרטים!',
    formSuccessMsg: 'נחזור אליכם תוך 24 שעות עם רשימת הנכסים הרלוונטיים אליכם.',
    formSuccessBack: 'להשאיר פרטים נוספים',
    faqTitle: 'שאלות נפוצות',
    faq: [
      {
        q: 'מה זה בעצם נכס במכרז?',
        a: 'נכס שבעליו לא עמדו בתשלומים (משכנתא, חוב לבנק או לרשות), ולכן בית המשפט מינה כונס נכסים שמוכר את הנכס במכרז. רוב הנכסים יוצאים במחיר נמוך משמעותית משווי השוק, אבל הליך המכרז מורכב ודורש הכנה. לעיתים נכס נמכר במכרז גם נוכח פירוק שיתוף בין שותפים או על ידי מנהלי עזבונות ואפוטרופסים.',
      },
      {
        q: 'למה מחיר הנכסים במכרז נמוך מהשוק?',
        a: 'ההליך המשפטי מורכב יותר מרכישה רגילה, יש לוחות זמנים קשוחים, וההיצע מוגבל לרוכשים שיודעים את התחום. השילוב הזה יוצר מחיר נמוך משמעותית משווי השוק - לרוב 20-40% מתחת.',
      },
      {
        q: 'כמה זמן לוקח התהליך מרגע איתור נכס ועד לרישום בעלות?',
        a: 'בדרך כלל 3 עד 6 חודשים, תלוי בנכס ובמכרז הספציפי.',
      },
      {
        q: 'האם באתר מופיעים כל הפרטים על כל נכס?',
        a: 'לא. באתר מוצג המבחר של הנכסים ותיאור בסיסי - עיר, סוג, גודל, ומחיר כללי. פרטים מלאים על כל נכס (כתובת מדויקת, סטטוס משפטי, לוחות זמנים) נמסרים בשיחה אישית.',
      },
    ],
    whatsAppFloating: 'צרו קשר בוואטסאפ',
    footerCopy: '© נווה שגיב • השקעות בנכסים ממכרזים • ',
    footerPrivacy: 'פרטיות',
    footerTerms: 'תנאי שימוש',
    pageTitle: 'נווה שגיב | נכסים ממכרזים במחיר נמוך מהשוק',
    pageDesc: 'נכסים ממכרזים במחיר נמוך מהשוק. השאירו פרטים ונחזור אליכם תוך 24 שעות.',
  },
  ru: {
    whatsappMsg: 'שלום, הגעתי דרך אתר נווה שגיב. מחפש נכס במחיר אטרקטיבי — אשמח לפרטים.\n\nЗдравствуйте! Пишу вам с сайта «Неве Сагив». Ищу недвижимость по привлекательной цене. Хотелось бы получить подробности.',
    brandName: 'Neve Sagiv',
    brandTag: 'Консультации по аукционам недвижимости',
    heroTitle: 'Хотите купить квартиру мечты по цене ниже рыночной?',
    heroSubtitle: 'Откройте для себя поразительные объекты с существенными скидками благодаря покупке через аукционы и торги недвижимости.',
    heroCta: 'Давайте свяжемся',
    sectionTag: '📍 Недвижимость на аукционах и торгах',
    sectionTitle: 'Недвижимость по цене ниже рыночной.',
    sectionTitleEm: 'Выбор по всей стране.',
    sectionSub: 'На аукционах и торгах суда размещается недвижимость по значительно более низким ценам, чем рыночная. Мы публикуем последний выбор здесь.\nОставьте свои данные, и мы вернемся к вам с полной информацией.',
    bullet1: 'Десятки активных объектов по всей стране',
    bullet2: 'Цены значительно ниже рыночных',
    bullet3: 'Личный ответ в течение 24 часов',
    formHeading: 'Оставьте свои данные, вернемся в течение 24 часов',
    formSubtitle: 'Без обязательств, бесплатно. Первоначальный разговор до 20 минут.',
    formName: 'Полное имя',
    formNamePlaceholder: 'Например: Иван Петров',
    formPhone: 'Телефон',
    formPhonePlaceholder: '050-1234567',
    formEmail: 'Email (необязательно)',
    formEmailPlaceholder: 'name@example.com',
    formMessage: 'Что вас интересует? (необязательно)',
    formMessagePlaceholder: 'Например: квартира с 3 спальнями в Тель-Авиве, бюджет до 1,5 млн',
    formSubmit: 'Отправьте мне детали без обязательств',
    formSubmitting: 'Отправка...',
    formOr: 'или',
    formWhatsApp: 'Отправьте нам сообщение в WhatsApp',
    formPrivacy: '🔒 Ваши данные не будут разглашены и не будут отправлены в рассылку. Один звонок только.',
    formError: 'Что-то пошло не так. Убедитесь, что вы заполнили имя и телефон, и попробуйте снова.',
    formSuccessTitle: 'Мы получили ваши данные!',
    formSuccessMsg: 'Мы вернемся к вам в течение 24 часов со списком релевантных объектов.',
    formSuccessBack: 'Оставить дополнительные данные',
    faqTitle: 'Часто задаваемые вопросы',
    faq: [
      {
        q: 'Что такое объект на аукционе?',
        a: 'Объект, владелец которого не выполнил платежи (ипотека, задолженность перед банком или органами), поэтому суд назначил управляющего для продажи объекта на аукционе. Большинство объектов продаются по цене, значительно ниже рыночной, но процесс аукциона сложен и требует подготовки. Иногда объект продается на аукционе в результате раздела между партнерами или управляющими имущества и опекунами.',
      },
      {
        q: 'Почему цены на аукционные объекты ниже рыночных?',
        a: 'Судебный процесс более сложный, чем обычная покупка, есть жесткие графики, и предложение ограничено покупателями, знающими область. Это создает цены значительно ниже рыночной стоимости - обычно на 20-40% ниже.',
      },
      {
        q: 'Сколько времени занимает процесс от поиска объекта до регистрации собственности?',
        a: 'Обычно от 3 до 6 месяцев в зависимости от объекта и конкретного аукциона.',
      },
      {
        q: 'На сайте отображены все детали каждого объекта?',
        a: 'Нет. На сайте отображается выбор объектов и основное описание - город, тип, размер и общую цену. Полные детали каждого объекта (точный адрес, юридический статус, сроки) передаются в личной беседе.',
      },
    ],
    whatsAppFloating: 'Свяжитесь с нами в WhatsApp',
    footerCopy: '© Neve Sagiv • Инвестиции в недвижимость на аукционах • ',
    footerPrivacy: 'Политика конфиденциальности',
    footerTerms: 'Условия использования',
    pageTitle: 'Neve Sagiv | Недвижимость по цене ниже рыночной',
    pageDesc: 'Недвижимость на аукционах по цене ниже рыночной. Оставьте свои данные, и мы вернемся к вам в течение 24 часов.',
  },
};

const FAQ_ITEMS = TRANSLATIONS.he.faq;

export default function Landing() {
  const [lang, setLang] = useState(() => localStorage.getItem('landing_lang') || 'he');
  const t = TRANSLATIONS[lang];
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [openFaq, setOpenFaq] = useState(0);
  const [honeypot, setHoneypot] = useState('');
  const openedAtRef = useRef(Date.now());

  const [faqRef, faqVisible] = useScrollReveal();

  const whatsappUrl = `https://wa.me/972506666128?text=${encodeURIComponent(t.whatsappMsg)}`;

  function toggleLanguage() {
    const newLang = lang === 'he' ? 'ru' : 'he';
    setLang(newLang);
    localStorage.setItem('landing_lang', newLang);
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.title = t.pageTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', t.pageDesc);

    // Track UTM source for analytics later
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

    // Spam: honeypot must be empty (bots fill hidden fields)
    if (honeypot) {
      // Fake success — don't reveal that the form was rejected
      setStatus('success');
      return;
    }

    // Spam: enforce minimum dwell time
    const secondsOpen = (Date.now() - openedAtRef.current) / 1000;
    if (secondsOpen < MIN_SUBMIT_SECONDS) {
      setStatus('error');
      return;
    }

    // Rate limit: 1 submission per hour per browser
    try {
      const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
      if (last && Date.now() - last < RATE_LIMIT_HOURS * 3600 * 1000) {
        setStatus('success'); // Don't reveal limit hit
        return;
      }
    } catch { /* localStorage blocked — proceed */ }

    setStatus('submitting');
    try {
      const utm = sessionStorage.getItem('landing_utm') || 'landing-direct';
      await submitLead({
        propertyId: null,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        message: `[מקור: דף נחיתה / ${utm}]${form.message ? '\n' + form.message : ''}`,
      });
      try { localStorage.setItem(RATE_LIMIT_KEY, String(Date.now())); } catch { /* ignore */ }
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
      // Wait for scroll to settle, then focus the input
      setTimeout(() => nameInput.focus({ preventScroll: true }), 600);
    } else {
      // Fallback if form already submitted (success state)
      document.querySelector('.landing-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return (
    <div className="landing-page">
      {/* Minimal branding bar — no nav */}
      <header className="landing-brand">
        <div className="landing-brand-inner">
          <a href="/" className="landing-brand-logo">
            <span className="landing-brand-name">{t.brandName}</span>
            <span className="landing-brand-tag">{t.brandTag}</span>
          </a>
          <button
            type="button"
            className="landing-lang-toggle"
            onClick={toggleLanguage}
            aria-label={lang === 'he' ? 'Switch to Russian' : 'Switch to Hebrew'}
          >
            {lang === 'he' ? 'Русский' : 'עברית'}
          </button>
        </div>
      </header>

      {/* APARTMENT HERO */}
      <section className="landing-apartment-hero">
        <img src="/apartment-hero.webp" alt="Dream Apartment" className="landing-apartment-image" />
        <div className="landing-apartment-overlay" />
        <div className="landing-apartment-content">
          <h1 className="landing-apartment-title">
            {t.heroTitle}
          </h1>
          <p className="landing-apartment-subtitle">
            {t.heroSubtitle}
          </p>
          <button type="button" className="landing-cta-btn" onClick={scrollToForm}>
            {t.heroCta}
          </button>
        </div>
      </section>

      {/* HERO with lead form */}
      <section className="landing-hero">
        <div className="landing-hero-glow" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <span className="landing-hero-tag">{t.sectionTag}</span>
            <h1 className="landing-hero-title">
              {t.sectionTitle}
              <span className="landing-hero-em">{t.sectionTitleEm}</span>
            </h1>
            <p className="landing-hero-sub">
              {t.sectionSub.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {i === 1 && <strong>{line}</strong>}
                  {i !== 1 && line}
                </span>
              ))}
            </p>
            <ul className="landing-hero-bullets">
              <li><CheckIcon /> {t.bullet1}</li>
              <li><CheckIcon /> {t.bullet2}</li>
              <li><CheckIcon /> {t.bullet3}</li>
            </ul>
          </div>

          <form
            className={`landing-form ${status === 'success' ? 'is-success' : ''}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="landing-form-head">
              <h2>{t.formHeading}</h2>
              <p>{t.formSubtitle}</p>
            </div>

            {status === 'success' ? (
              <div className="landing-form-success">
                <div className="landing-form-success-icon">✓</div>
                <h3>{t.formSuccessTitle}</h3>
                <p>{t.formSuccessMsg}</p>
                <button type="button" className="landing-form-success-back" onClick={() => setStatus('idle')}>
                  {t.formSuccessBack}
                </button>
              </div>
            ) : (
              <>
                {/* Honeypot — hidden from users, bots will fill it */}
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
                  <label htmlFor="landing-name">{t.formName}</label>
                  <input
                    id="landing-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder={t.formNamePlaceholder}
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-phone">{t.formPhone}</label>
                  <input
                    id="landing-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder={t.formPhonePlaceholder}
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-email">{t.formEmail}</label>
                  <input
                    id="landing-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder={t.formEmailPlaceholder}
                    dir="ltr"
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-message">{t.formMessage}</label>
                  <textarea
                    id="landing-message"
                    rows={2}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder={t.formMessagePlaceholder}
                  />
                </div>
                {status === 'error' && (
                  <div className="landing-form-error">
                    {t.formError}
                  </div>
                )}
                <button
                  type="submit"
                  className="landing-form-submit"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? t.formSubmitting : t.formSubmit}
                </button>
                <div className="landing-form-or" aria-hidden="true">
                  <span>{t.formOr}</span>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-whatsapp-btn"
                >
                  <WhatsAppIcon />
                  {t.formWhatsApp}
                </a>
                <p className="landing-form-fine">
                  {t.formPrivacy}
                </p>
              </>
            )}
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section
        ref={faqRef}
        className={`landing-faq reveal ${faqVisible ? 'is-visible' : ''}`}
      >
        <div className="landing-container landing-container-narrow">
          <h2 className="landing-section-title">{t.faqTitle}</h2>
          <div className="landing-faq-list">
            {t.faq.map((item, i) => (
              <div key={i} className={`landing-faq-item ${openFaq === i ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="landing-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className="landing-faq-icon" aria-hidden="true">+</span>
                </button>
                <div className="landing-faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating WhatsApp button — always visible */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="landing-whatsapp-float"
        aria-label={t.whatsAppFloating}
        title={t.whatsAppFloating}
      >
        <WhatsAppIcon />
      </a>

      {/* Mini footer — no nav */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p>
            {t.footerCopy}<a href="/privacy">{t.footerPrivacy}</a> · <a href="/terms">{t.footerTerms}</a>
          </p>
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
