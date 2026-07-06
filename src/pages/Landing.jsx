import { useEffect, useRef, useState } from 'react';
import { submitLead } from '../lib/supabase.js';
import './Landing.css';

const MIN_SUBMIT_SECONDS = 3;
const RATE_LIMIT_KEY = 'landing_last_submit';
const RATE_LIMIT_HOURS = 1;
const WHATSAPP_PHONE = '972506666128';
const WHATSAPP_HE = 'היי, הגעתי דרך אתר נווה שגיב. אני מעוניין בנכס במחיר נמוך';

export default function Landing() {
  const [lang, setLang] = useState('he');
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [honeypot, setHoneypot] = useState('');
  const openedAtRef = useRef(Date.now());

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_HE)}`;

  useEffect(() => {
    document.title = 'נווה שגיב | דירת חלומות במחיר נמוך מהשוק';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'רוצים לקנות דירת חלומות במחיר נמוך מהשוק? גלו נכסים מדהימים');
  }, []);

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
    <div className="landing-page">
      {/* Minimal branding bar */}
      <header className="landing-brand">
        <div className="landing-brand-inner">
          <a href="/" className="landing-brand-logo">
            <span className="landing-brand-name">נווה שגיב</span>
            <span className="landing-brand-tag">ייעוץ בעסקאות מכרזים</span>
          </a>
        </div>
      </header>

      {/* HERO with apartment image */}
      <section className="landing-apartment-hero">
        <img src="/apartment-hero.webp" alt="Dream Apartment" className="landing-apartment-image" />
        <div className="landing-apartment-overlay" />
        <div className="landing-apartment-content">
          <h1 className="landing-apartment-title">
            רוצים לקנות את דירת חלומותיכם במחיר נמוך מהשוק?
          </h1>
          <p className="landing-apartment-subtitle">
            גלו נכסים מדהימים בהנחות משמעותיות בזכות רכישה דרך מכרזים ומכינוסי נכסים.
          </p>
          <button type="button" className="landing-cta-btn" onClick={scrollToForm}>
            בואו ניצור קשר
          </button>
        </div>
      </section>

      {/* Contact form */}
      <section className="landing-contact">
        <div className="landing-contact-inner">
          <h2>צור קשר איתנו</h2>
          <p className="landing-contact-sub">
            השאיר פרטים ונשלח לך את הנכסים הרלוונטיים ביותר תוך 24 שעות
          </p>

          <form className={`landing-form ${status === 'success' ? 'is-success' : ''}`} onSubmit={handleSubmit} noValidate>
            {status === 'success' ? (
              <div className="landing-form-success">
                <div className="landing-form-success-icon">✓</div>
                <h3>קיבלנו את הפרטים שלך!</h3>
                <p>
                  נחזור אליך תוך 24 שעות עם רשימת הנכסים הרלוונטיים.
                </p>
                <button
                  type="button"
                  className="landing-form-success-back"
                  onClick={() => setStatus('idle')}
                >
                  להשאיר פרטים נוספים
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
                  {status === 'submitting' ? 'שולח...' : 'שלחו לי פרטים'}
                </button>

                <div className="landing-form-or" aria-hidden="true">
                  <span>או</span>
                </div>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="landing-whatsapp-btn">
                  <WhatsAppIcon />
                  שלחו לנו הודעה בוואטסאפ
                </a>

                <p className="landing-form-fine">
                  🔒 הפרטים שלכם לא ייחשפו לאיש. שיחה אחת בלבד.
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
        aria-label="צרו קשר בוואטסאפ"
        title="צרו קשר בוואטסאפ"
      >
        <WhatsAppIcon />
      </a>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <p>© נווה שגיב • השקעות בנכסים ממכרזים</p>
            <div className="landing-footer-links">
              <a href="/privacy">פרטיות</a>
              <span className="landing-footer-sep">·</span>
              <a href="/terms">תנאי שימוש</a>
              <span className="landing-footer-sep">·</span>
              <a href="https://www.neve-sagiv.co.il/" target="_blank" rel="noopener noreferrer">
                האתר הראשי
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
