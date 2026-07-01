import { useEffect, useRef, useState } from 'react';
import { submitLead } from '../lib/supabase.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import './Landing.css';

// Spam protection — minimum seconds between page open and form submit.
// Bots fill instantly; humans take >3 sec to type. Tune if false-positives.
const MIN_SUBMIT_SECONDS = 3;
const RATE_LIMIT_KEY = 'landing_last_submit';
const RATE_LIMIT_HOURS = 1;

const FAQ_ITEMS = [
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
];

export default function Landing() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [openFaq, setOpenFaq] = useState(0);
  const [honeypot, setHoneypot] = useState('');
  const openedAtRef = useRef(Date.now());

  const [faqRef, faqVisible] = useScrollReveal();

  useEffect(() => {
    document.title = 'נווה שגיב | נכסים ממכרזים במחיר נמוך מהשוק';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'נכסים ממכרזים במחיר נמוך מהשוק. השאירו פרטים ונחזור אליכם תוך 24 שעות.'
    );

    // Track UTM source for analytics later
    const url = new URL(window.location.href);
    const utm = url.searchParams.get('utm_source');
    if (utm) sessionStorage.setItem('landing_utm', utm);
  }, []);

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
    <div className="landing-page" dir="rtl">
      {/* Minimal branding bar — no nav */}
      <header className="landing-brand">
        <div className="landing-brand-inner">
          <a href="/" className="landing-brand-logo">
            <span className="landing-brand-name">נווה שגיב</span>
            <span className="landing-brand-tag">ייעוץ בעסקאות מכרזים</span>
          </a>
        </div>
      </header>

      {/* HERO with lead form */}
      <section className="landing-hero">
        <div className="landing-hero-glow" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <span className="landing-hero-tag">📍 נכסים ממכרזים ומכינוסי נכסים</span>
            <h1 className="landing-hero-title">
              נכסים במחיר נמוך מהשוק.
              <span className="landing-hero-em">מבחר בכל הארץ.</span>
            </h1>
            <p className="landing-hero-sub">
              בכינוסי נכסים ובמכרזי בית משפט מתפרסמים נכסים במחיר נמוך משמעותית מהשוק. אנחנו מפרסמים את המבחר האחרון כאן.
              <br />
              <strong>השאירו פרטים ונחזור אליכם עם פרטים מלאים.</strong>
            </p>
            <ul className="landing-hero-bullets">
              <li><CheckIcon /> עשרות נכסים פעילים בכל הארץ</li>
              <li><CheckIcon /> מחירים משמעותית נמוכים מהשוק</li>
              <li><CheckIcon /> חזרה אישית תוך 24 שעות</li>
            </ul>
          </div>

          <form
            className={`landing-form ${status === 'success' ? 'is-success' : ''}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="landing-form-head">
              <h2>השאירו פרטים, נחזור תוך 24 שעות</h2>
              <p>בלי התחייבות, בלי עלות. שיחה ראשונית של עד 20 דקות.</p>
            </div>

            {status === 'success' ? (
              <div className="landing-form-success">
                <div className="landing-form-success-icon">✓</div>
                <h3>קיבלנו את הפרטים!</h3>
                <p>נחזור אליכם תוך 24 שעות עם רשימת הנכסים הרלוונטיים אליכם.</p>
                <button type="button" className="landing-form-success-back" onClick={() => setStatus('idle')}>
                  להשאיר פרטים נוספים
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
                  <label htmlFor="landing-name">שם מלא</label>
                  <input
                    id="landing-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="לדוגמה: דני כהן"
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-phone">טלפון</label>
                  <input
                    id="landing-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="050-1234567"
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-email">אימייל (לא חובה)</label>
                  <input
                    id="landing-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
                <div className="landing-form-field">
                  <label htmlFor="landing-message">מה מעניין אתכם? (לא חובה)</label>
                  <textarea
                    id="landing-message"
                    rows={2}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="לדוגמה: דירה 3 חדרים בתל אביב, תקציב עד 1.5 מיליון"
                  />
                </div>
                {status === 'error' && (
                  <div className="landing-form-error">
                    משהו השתבש. ודאו שמילאתם שם וטלפון, ונסו שוב.
                  </div>
                )}
                <button
                  type="submit"
                  className="landing-form-submit"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'שולח...' : 'שלחו לי פרטים, בלי התחייבות'}
                </button>
                <p className="landing-form-fine">
                  🔒 הפרטים שלכם לא ייחשפו לאיש ולא יישלחו ל-newsletters. שיחה אחת בלבד.
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
          <h2 className="landing-section-title">שאלות נפוצות</h2>
          <div className="landing-faq-list">
            {FAQ_ITEMS.map((item, i) => (
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

      {/* Mini footer — no nav */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p>© נווה שגיב • השקעות בנכסים ממכרזים • <a href="/privacy">פרטיות</a> · <a href="/terms">תנאי שימוש</a></p>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
