import { useEffect, useState } from 'react';
import { submitLead } from '../lib/supabase.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import './Landing.css';

const FAQ_ITEMS = [
  {
    q: 'מה זה בעצם נכס במכרז?',
    a: 'נכס שבעליו לא עמדו בתשלומים (משכנתא, חוב לבנק או לרשות), ולכן בית המשפט מינה כונס נכסים שמוכר את הנכס במכרז. רוב הנכסים יוצאים במחיר נמוך משמעותית משווי השוק, אבל הליך המכרז מורכב ודורש הכנה. לעיתים נכס נמכר במכרז גם נוכח פירוק שיתוף בין שותפים או על ידי מנהלי עזבונות ואפוטרופסים.',
  },
  {
    q: 'כמה זמן לוקח התהליך?',
    a: 'מרגע שאתה משאיר פרטים ועד לקבלת מפתח, בדרך כלל 3 עד 6 חודשים, תלוי בנכס ובמכרז הספציפי. אנחנו מלווים אותך לאורך כל הדרך, ללא הפתעות.',
  },
  {
    q: 'מה אני משלם, ולמי?',
    a: 'הליווי שלנו ניתן בעמלת הצלחה. תשלום רק אם עברנו את ההליך בהצלחה וקיבלת את המפתח. אנחנו שקופים לחלוטין לגבי כל עלות בתהליך (אגרות, שמאות, עו"ד), בלי הפתעות.',
  },
  {
    q: 'מה אם בסוף לא אבחר לרכוש?',
    a: 'אתה לא מחויב לכלום. שיחת הייעוץ הראשונית ללא עלות, וגם בהמשך אתה חופשי לסגת בכל שלב לפני המכרז. ההחלטה תמיד שלך.',
  },
  {
    q: 'איך אני יודע שאני לא קונה "חתול בשק"?',
    a: 'מעבר לחוזה הליווי הברור שאתה מקבל מראש, אנחנו עובדים גם עם עו"ד חיצוני שמייצג אותך, לא אותנו. השקיפות שלנו היא הדבר שמבדיל אותנו.',
  },
];

export default function Landing() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [openFaq, setOpenFaq] = useState(0);

  const [valueRef, valueVisible] = useScrollReveal();
  const [processRef, processVisible] = useScrollReveal();
  const [whyRef, whyVisible] = useScrollReveal();
  const [faqRef, faqVisible] = useScrollReveal();
  const [ctaRef, ctaVisible] = useScrollReveal();

  useEffect(() => {
    document.title = 'נווה שגיב | השקעה בנכסים ממכרזים | ליווי מקצועי A עד Z';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'נכסים ממכרזים במחיר נמוך מהשוק. ליווי משפטי מלא מהבדיקה ועד למפתח. השאר פרטים ונחזור תוך 24 שעות.'
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
            <span className="landing-hero-tag">📍 השקעה חכמה. ליווי מקצועי.</span>
            <h1 className="landing-hero-title">
              נכסים ממכרזים במחיר נמוך מהשוק
              <span className="landing-hero-em">עם ליווי משפטי מקצועי</span>
            </h1>
            <p className="landing-hero-sub">
              לרוב הציבור אין גישה לעולם של מכרזים מכינוס נכסים, מנהלי עזבונות וכדומה. מורכבות משפטית, חוסר וודאות, וסיכון לטעויות יקרות.
              <br />
              <strong>אצלנו תקבל ליווי מלא מהבדיקה ועד למפתח, בלי הפתעות.</strong>
            </p>
            <ul className="landing-hero-bullets">
              <li><CheckIcon /> ליווי משפטי כלול בתהליך</li>
              <li><CheckIcon /> אפס עמלות מקדמיות. תשלום רק על הצלחה</li>
              <li><CheckIcon /> חזרה אישית תוך 24 שעות</li>
            </ul>
          </div>

          <form
            className={`landing-form ${status === 'success' ? 'is-success' : ''}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="landing-form-head">
              <h2>השאר פרטים, נחזור תוך 24 שעות</h2>
              <p>בלי התחייבות, בלי עלות. שיחה ראשונית של עד 20 דקות.</p>
            </div>

            {status === 'success' ? (
              <div className="landing-form-success">
                <div className="landing-form-success-icon">✓</div>
                <h3>קיבלנו את הפרטים!</h3>
                <p>נחזור אליך תוך 24 שעות עם רשימת הנכסים הרלוונטיים אליך.</p>
                <button type="button" className="landing-form-success-back" onClick={() => setStatus('idle')}>
                  להשאיר פרטים נוספים
                </button>
              </div>
            ) : (
              <>
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
                  <label htmlFor="landing-message">מה מעניין אותך? (לא חובה)</label>
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
                  {status === 'submitting' ? 'שולח...' : 'שלח לי פרטים, בלי התחייבות'}
                </button>
                <p className="landing-form-fine">
                  🔒 הפרטים שלך לא ייחשפו לאיש ולא יישלחו ל-newsletters. שיחה אחת בלבד.
                </p>
              </>
            )}
          </form>
        </div>
      </section>

      {/* VALUE PROPS — replaces stats */}
      <section
        ref={valueRef}
        className={`landing-value reveal ${valueVisible ? 'is-visible' : ''}`}
      >
        <div className="landing-container">
          <h2 className="landing-section-title">3 סיבות שמשקיעים בוחרים בנו</h2>
          <div className="landing-value-grid">
            <ValueCard
              icon="💰"
              title="מחיר נמוך מהשוק"
              desc="במכרזים, נכסים יוצאים לעיתים קרובות 20-40% מתחת לשווי שוק. תפקידנו לזהות איזה נכס באמת שווה את ההצעה."
            />
            <ValueCard
              icon="⚖️"
              title="ליווי משפטי מלא"
              desc='עורך דין שמלווה אותך מבדיקת הנכס, דרך הגשת ההצעה, ועד לרישום הבעלות. בלי שיגעון בירוקרטי לבד. ההתקשרות עם עורך הדין היא ישירות בין הלקוח לעורך הדין.'
            />
            <ValueCard
              icon="🛡️"
              title="שקיפות מלאה"
              desc="לפני המכרז אתה יודע בדיוק מה אתה קונה: סטטוס משפטי, חובות, שעבודים, מצב פיזי. בלי הפתעות אחרי הקנייה."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps */}
      <section
        ref={processRef}
        className={`landing-process reveal ${processVisible ? 'is-visible' : ''}`}
      >
        <div className="landing-container">
          <h2 className="landing-section-title landing-section-title-light">איך זה עובד ב-3 צעדים פשוטים</h2>
          <div className="landing-process-grid">
            <ProcessCard
              n={1}
              title="אתה משאיר פרטים"
              desc="טופס קצר בדף הזה. שיחה ראשונית של עד 20 דקות, ללא עלות וללא התחייבות."
            />
            <ProcessCard
              n={2}
              title="אנחנו בודקים נכסים מתאימים"
              desc="לפי התקציב והאזור שלך, אנחנו מסננים את כל הנכסים שזמינים במכרזים ומציגים לך רק את הרלוונטיים."
            />
            <ProcessCard
              n={3}
              title="ליווי A עד Z עד למפתח"
              desc="הגשת הצעה, ניצחון במכרז, חתימה, רישום. אנחנו לצידך בכל שלב, בלי הפתעות ובלי לבד."
            />
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section
        ref={whyRef}
        className={`landing-why reveal ${whyVisible ? 'is-visible' : ''}`}
      >
        <div className="landing-container">
          <h2 className="landing-section-title">למה דווקא נווה שגיב?</h2>
          <div className="landing-why-grid">
            <WhyCard
              title="התמחות ייעודית"
              desc={'לא סוכן נדל"ן רגיל. אנחנו מתמחים אך ורק במכרזים, מכירים את הכונסים, את עורכי הדין, ואת מערכת המכרזים.'}
            />
            <WhyCard
              title="ליווי אישי"
              desc="כל לקוח מקבל ליווי אישי, פנים אל פנים. לא צ'אט-בוט, לא נציג מתחלף, אדם אחד מהתחלה ועד הסוף."
            />
            <WhyCard
              title="גישה לנכסים בלעדיים"
              desc="חלק מהנכסים שאנחנו מציעים זמינים לפני שמגיעים לציבור הרחב, דרך קשרים בתחום."
            />
            <WhyCard
              title="תשלום על הצלחה"
              desc="אנחנו לא לוקחים שקל מקדמה. רק כשהמפתח אצלך, אז משלמים. הסיכון על המתווך."
            />
          </div>
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

      {/* FINAL CTA */}
      <section
        id="landing-final-cta"
        ref={ctaRef}
        className={`landing-final reveal ${ctaVisible ? 'is-visible' : ''}`}
      >
        <div className="landing-container landing-container-narrow">
          <h2 className="landing-final-title">מוכן להתחיל?</h2>
          <p className="landing-final-sub">
            השקעה בנכסים יכולה להיות הצעד הכי חכם שתעשה השנה, אם תעשה אותו נכון.
            <br />
            השאר פרטים עכשיו, ונחזור אליך תוך 24 שעות.
          </p>
          <button type="button" className="landing-final-btn" onClick={scrollToForm}>
            השאר פרטים עכשיו →
          </button>
        </div>
      </section>

      {/* Mini footer — no nav */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p>© נווה שגיב • ליווי השקעות בנכסים ממכרזים • <a href="/privacy">פרטיות</a> · <a href="/terms">תנאי שימוש</a></p>
        </div>
      </footer>
    </div>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="landing-value-card">
      <div className="landing-value-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function ProcessCard({ n, title, desc }) {
  return (
    <div className="landing-process-card">
      <div className="landing-process-num">{n}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function WhyCard({ title, desc }) {
  return (
    <div className="landing-why-card">
      <div className="landing-why-check">✓</div>
      <h3>{title}</h3>
      <p>{desc}</p>
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
