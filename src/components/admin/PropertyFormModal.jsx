import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AdminModals.css';

const EMPTY = {
  id: null,
  city: '',
  street: '',
  type: '',
  rooms: '',
  area: '',
  trustee_name: '',
  trustee_phone: '',
  is_published: true,
};

export default function PropertyFormModal({ property, onSave, onDelete, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() =>
    property
      ? {
          ...EMPTY,
          ...property,
          rooms: property.rooms ?? '',
          area: property.area ?? '',
        }
      : { ...EMPTY }
  );

  useEffect(() => {
    if (property) {
      setForm({ ...EMPTY, ...property, rooms: property.rooms ?? '', area: property.area ?? '' });
    } else {
      setForm({ ...EMPTY });
    }
  }, [property]);

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (publish) => {
    const payload = {
      ...form,
      rooms: form.rooms === '' ? null : Number(form.rooms),
      area: form.area === '' ? null : Number(form.area),
      is_published: publish,
    };
    onSave(payload);
  };

  const isEdit = !!form.id;

  return (
    <div
      className="admin-modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true">
        <div className="admin-modal-head">
          <h3>
            {isEdit ? t('admin.property_form_title_edit') : t('admin.property_form_title_new')}
          </h3>
          <button className="admin-modal-close" onClick={onClose} aria-label={t('admin.cancel')}>
            ×
          </button>
        </div>
        <p className="admin-modal-sub">{t('admin.property_form_sub')}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
        >
          {/* Public section */}
          <div className="form-section-h">{t('admin.section_public')}</div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="city">{t('admin.field_city')} *</label>
              <input
                id="city"
                type="text"
                required
                value={form.city}
                onChange={update('city')}
                placeholder={t('admin.field_city_placeholder')}
              />
            </div>
            <div className="form-field">
              <label htmlFor="street">{t('admin.field_street')}</label>
              <input
                id="street"
                type="text"
                value={form.street}
                onChange={update('street')}
                placeholder={t('admin.field_street_placeholder')}
              />
            </div>
            <div className="form-field">
              <label htmlFor="type">{t('admin.field_type')} *</label>
              <input
                id="type"
                type="text"
                required
                value={form.type}
                onChange={update('type')}
                placeholder={t('admin.field_type_placeholder')}
              />
            </div>
            <div className="form-field">
              <label htmlFor="rooms">{t('admin.field_rooms')}</label>
              <input
                id="rooms"
                type="number"
                min="0"
                step="0.5"
                value={form.rooms}
                onChange={update('rooms')}
                placeholder={t('admin.field_rooms_placeholder')}
              />
            </div>
            <div className="form-field">
              <label htmlFor="area">{t('admin.field_area')}</label>
              <input
                id="area"
                type="number"
                min="0"
                value={form.area}
                onChange={update('area')}
                placeholder={t('admin.field_area_placeholder')}
              />
            </div>
          </div>

          {/* Private section */}
          <div className="form-section-h private-h">
            🔒 {t('admin.section_private')}
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="trustee_name">{t('admin.field_trustee_name')}</label>
              <input
                id="trustee_name"
                type="text"
                value={form.trustee_name}
                onChange={update('trustee_name')}
                placeholder={t('admin.field_trustee_name_placeholder')}
              />
            </div>
            <div className="form-field">
              <label htmlFor="trustee_phone">{t('admin.field_trustee_phone')}</label>
              <input
                id="trustee_phone"
                type="tel"
                dir="ltr"
                value={form.trustee_phone}
                onChange={update('trustee_phone')}
                placeholder={t('admin.field_trustee_phone_placeholder')}
              />
            </div>
          </div>

          <div className="admin-modal-actions form-actions">
            <button type="submit" className="admin-btn-primary">
              {t('admin.save_publish')}
            </button>
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => handleSave(false)}
            >
              {t('admin.save_draft')}
            </button>
            {onDelete && (
              <button
                type="button"
                className="admin-btn-danger"
                onClick={onDelete}
              >
                {t('admin.delete')}
              </button>
            )}
            <button type="button" className="admin-btn-ghost" onClick={onClose}>
              {t('admin.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
