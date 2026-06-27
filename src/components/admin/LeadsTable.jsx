import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AdminTables.css';

function formatDate(iso) {
  return new Date(iso).toLocaleString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadsTable({ leads, onSelectLead, onExportCsv }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    return leads.filter((l) => {
      if (q) {
        const hay = `${l.name} ${l.phone} ${l.email} ${l.property_label}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (dateFilter === 'week') {
        if (now - new Date(l.date).getTime() > 7 * 864e5) return false;
      } else if (dateFilter === 'month') {
        if (now - new Date(l.date).getTime() > 30 * 864e5) return false;
      }
      return true;
    });
  }, [leads, search, statusFilter, dateFilter]);

  return (
    <>
      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder={t('admin.search_leads')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">{t('admin.filter_status_all', 'כל הסטטוסים')}</option>
          <option value="new">חדש</option>
          <option value="contacted">טופל</option>
          <option value="closed">סגור</option>
          <option value="irrelevant">לא רלוונטי</option>
        </select>
        <select
          className="admin-select"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">{t('admin.filter_date_all')}</option>
          <option value="week">{t('admin.filter_date_week')}</option>
          <option value="month">{t('admin.filter_date_month')}</option>
        </select>
        <button className="admin-btn-gold" onClick={onExportCsv}>
          {t('admin.export_csv')}
        </button>
      </div>

      <div className="admin-tablewrap">
        <div className="admin-tablescroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.column_date')}</th>
                <th>{t('admin.column_name')}</th>
                <th>{t('admin.column_phone')}</th>
                <th>{t('admin.column_property')}</th>
                <th>הגעה</th>
                <th>{t('admin.column_status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    {t('admin.no_leads')}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr
                    key={l.id}
                    className={`admin-row ${l.status === 'new' ? 'admin-row-unread' : ''}`}
                    onClick={() => onSelectLead(l)}
                  >
                    <td className="admin-date">{formatDate(l.date)}</td>
                    <td>
                      <div className="admin-name">{l.name}</div>
                      <div className="admin-cell-sub" dir="ltr">{l.email}</div>
                    </td>
                    <td className="admin-cell-sub" dir="ltr">{l.phone}</td>
                    <td>{l.property_label}</td>
                    <td>
                      <span className={`source-badge source-${l.source === 'דף נחיתה' ? 'landing' : 'site'}`}>
                        {l.source}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const label = t(`admin.filter_status_${status}`);
  return <span className={`status-badge status-${status}`}>{label}</span>;
}
