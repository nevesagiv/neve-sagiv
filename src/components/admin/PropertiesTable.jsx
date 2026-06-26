import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AdminTables.css';

export default function PropertiesTable({ properties, onTogglePublished, onEdit, onAddNew }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => {
      const hay = `${p.city} ${p.street || ''} ${p.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [properties, search]);

  return (
    <>
      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder={t('admin.search_properties')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="admin-btn-gold" onClick={onAddNew}>
          + {t('admin.add_property')}
        </button>
      </div>

      <div className="admin-tablewrap">
        <div className="admin-tablescroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.column_added')}</th>
                <th>{t('admin.column_city')}</th>
                <th>{t('admin.column_street')}</th>
                <th>{t('admin.column_type')}</th>
                <th>{t('admin.column_rooms')}</th>
                <th>{t('admin.column_area')}</th>
                <th>{t('admin.column_trustee')}</th>
                <th>{t('admin.column_published')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    {t('admin.no_properties')}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="admin-row" onClick={() => onEdit(p)}>
                    <td className="admin-date">{p.added}</td>
                    <td className="admin-name">{p.city}</td>
                    <td>{p.street || '—'}</td>
                    <td>{p.type}</td>
                    <td>{p.rooms ?? '—'}</td>
                    <td>{p.area ?? '—'}</td>
                    <td className="admin-cell-sub">
                      <div>{p.trustee_name || '—'}</div>
                      {p.trustee_phone && (
                        <div dir="ltr" style={{ fontSize: '12px', opacity: 0.7 }}>
                          {p.trustee_phone}
                        </div>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`toggle-switch ${p.is_published ? 'on' : ''}`}
                        onClick={() => onTogglePublished(p.id)}
                        aria-label={p.is_published ? 'Unpublish' : 'Publish'}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="admin-table-footer">
          {t('admin.showing', { shown: filtered.length, total: properties.length })}
        </p>
      </div>
    </>
  );
}
