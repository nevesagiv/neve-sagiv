import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { localized } from '../lib/i18n-utils.js';
import { submitLead } from '../lib/supabase.js';
import './LeadModal.css';

export default function LeadModal({ property, isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Spam protection: track when modal opened so we can require a minimum time
  // between open and submit. Real bots fill instantly.
  const openedAtRef = useRef(0);
  // Honeypot field — hidden from real users, bots will fill it.
  const [honeypot, setHoneypot] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now();
      setError(null);
      setConsent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lang = i18n.language;
  const city = localized(property?.city, lang);
  const type = localized(property?.property_type, lang);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // Spam check: honeypot must be empty
    if (honeypot) {
      // Pretend to submit but go nowhere
      navigate('/thank-you');
      return;
    }

    // Spam check: at least 3 seconds since opening
    if (Date.now() - openedAtRef.current < 3000) {
      setError(t('lead_form.error'));
      return;
    }

    // Legal: require explicit consent for data storage
    if (!consent) {
      setError(t('lead_form.consent_required'));
      return;
    }

    setSending(true);

    const formData = new FormData(event.currentTarget);

    try {
      await submitLead({
        propertyId: property?.id ?? null,
        fullName: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        message: formData.get('notes'),
      });
      onClose();
      navigate('/thank-you');
    } catch (err) {
      console.error(err);
      setError(t('lead_form.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="modal-bg"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
        <h3 id="lead-modal-title">{t('lead_form.title')}</h3>
        <p className="modal-sub">{t('lead_form.subtitle')}</p>
        {property && (
          <div className="modal-property">
            <strong>
              {type} {city && `· ${city}`}
              {property.street && ` · ${t('card.street_prefix')} ${property.street}`}
            </strong>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Honeypot: hidden field for bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="honeypot"
            aria-hidden="true"
          />

          <div className="form-group">
            <label htmlFor="name">{t('lead_form.name')}</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input"
              placeholder={t('lead_form.name_placeholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">{t('lead_form.phone')}</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="input"
              placeholder={t('lead_form.phone_placeholder')}
              dir="ltr"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('lead_form.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder={t('lead_form.email_placeholder')}
              dir="ltr"
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">{t('lead_form.notes')}</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              className="textarea"
              placeholder={t('lead_form.notes_placeholder')}
            />
          </div>

          <div className="form-group consent-group">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                {t('lead_form.consent_label')}{' '}
                <Link to="/privacy" target="_blank">
                  {t('lead_form.consent_link')}
                </Link>
                .
              </span>
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('lead_form.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? t('lead_form.sending') : t('lead_form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
