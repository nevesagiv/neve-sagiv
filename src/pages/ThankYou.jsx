import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ThankYou.css';

export default function ThankYou() {
  const { t } = useTranslation();

  return (
    <div className="thankyou-page container-narrow">
      <div className="thankyou-card">
        <div className="check">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="4,12 10,18 20,7" />
          </svg>
        </div>
        <h1>{t('thank_you.title')}</h1>
        <p className="sub">{t('thank_you.subtitle')}</p>

        <div className="timeline">
          <div className="timeline-title">{t('thank_you.timeline_title')}</div>
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-text">{t('thank_you.step_1')}</div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-text">
              <strong>{t('thank_you.step_2_strong')}</strong> {t('thank_you.step_2')}
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-text">{t('thank_you.step_3')}</div>
          </div>
        </div>

        <div className="actions">
          <Link to="/" className="btn btn-primary">
            {t('thank_you.back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
