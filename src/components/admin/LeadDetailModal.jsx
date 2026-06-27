import { useTranslation } from 'react-i18next';
import './AdminModals.css';

function formatDate(iso) {
  return new Date(iso).toLocaleString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadDetailModal({ lead, onClose, onUpdateStatus, onDelete }) {
  const { t } = useTranslation();
  if (!lead) return null;

  const copyPhone = () => {
    navigator.clipboard?.writeText(lead.phone);
  };

  const handleDelete = () => {
    if (window.confirm(`למחוק לצמיתות את הליד של ${lead.name}?\n\nפעולה זו לא ניתנת לביטול. אם הליד נסגר בהצלחה, עדיף לסמן "טופל" במקום למחוק.`)) {
      onDelete?.(lead.id);
    }
  };

  return (
    <div
      className="admin-modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal" role="dialog" aria-modal="true">
        <div className="admin-modal-head">
          <div>
            <h3>{lead.name}</h3>
            <p className="admin-modal-sub">
              {t('admin.lead_modal_received')}{formatDate(lead.date)}
            </p>
          </div>
          <button className="admin-modal-close" onClick={onClose} aria-label={t('admin.action_close')}>
            ×
          </button>
        </div>

        <div className="admin-modal-grid">
          <div>
            <div className="admin-modal-k">{t('admin.column_phone')}</div>
            <div className="admin-modal-v" dir="ltr">
              <a href={`tel:${lead.phone}`}>{lead.phone}</a>
            </div>
          </div>
          <div>
            <div className="admin-modal-k">{t('admin.column_email')}</div>
            <div className="admin-modal-v" dir="ltr">
              <a href={`mailto:${lead.email}`}>{lead.email}</a>
            </div>
          </div>
          <div className="admin-modal-fullrow">
            <div className="admin-modal-k">{t('admin.lead_modal_property')}</div>
            <div className="admin-modal-v">{lead.property_label}</div>
          </div>
          <div>
            <div className="admin-modal-k">{t('admin.column_status')}</div>
            <div className="admin-modal-v">
              <span className={`status-badge status-${lead.status}`}>
                {t(`admin.filter_status_${lead.status}`)}
              </span>
            </div>
          </div>
        </div>

        {lead.message && (
          <>
            <div className="admin-modal-section-h">{t('admin.lead_modal_message')}</div>
            <div className="admin-modal-msg">{lead.message}</div>
          </>
        )}

        {(lead.trustee_name || lead.trustee_phone) && (
          <>
            <div className="admin-modal-section-h trustee-h">
              🔒 {t('admin.lead_modal_trustee')}
            </div>
            <div className="trustee-box">
              {lead.trustee_name && <div>{lead.trustee_name}</div>}
              {lead.trustee_phone && (
                <div dir="ltr">
                  <a href={`tel:${lead.trustee_phone}`}>{lead.trustee_phone}</a>
                </div>
              )}
            </div>
          </>
        )}

        <div className="admin-modal-actions">
          {lead.status !== 'contacted' && (
            <button className="admin-btn-primary" onClick={() => onUpdateStatus('contacted')}>
              סמן בתהליך
            </button>
          )}
          {lead.status !== 'closed' && (
            <button className="admin-btn-primary" onClick={() => onUpdateStatus('closed')}>
              סמן כטופל
            </button>
          )}
          {lead.status !== 'new' && (
            <button className="admin-btn-ghost" onClick={() => onUpdateStatus('new')}>
              החזר לחדש
            </button>
          )}
          <button className="admin-btn-ghost" onClick={copyPhone}>
            העתק טלפון
          </button>
          {onDelete && (
            <button className="admin-btn-danger" onClick={handleDelete}>
              מחק לצמיתות
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
