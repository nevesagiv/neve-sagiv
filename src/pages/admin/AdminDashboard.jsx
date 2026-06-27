import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { adminLogout, getCurrentUser, subscribeToAuthChanges } from '../../lib/adminAuth.js';
import { MOCK_LEADS, MOCK_PROPERTIES_ADMIN } from '../../lib/mockAdminData.js';
import LeadsTable from '../../components/admin/LeadsTable.jsx';
import PropertiesTable from '../../components/admin/PropertiesTable.jsx';
import LeadDetailModal from '../../components/admin/LeadDetailModal.jsx';
import PropertyFormModal from '../../components/admin/PropertyFormModal.jsx';
import './AdminDashboard.css';

const TABS = { LEADS: 'leads', PROPERTIES: 'properties' };

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tab, setTab] = useState(TABS.LEADS);
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [properties, setProperties] = useState(MOCK_PROPERTIES_ADMIN);

  const [selectedLead, setSelectedLead] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);

  // Guard: must be authenticated (Supabase Auth)
  useEffect(() => {
    let active = true;
    getCurrentUser().then((user) => {
      if (!active) return;
      if (!user) {
        navigate('/admin', { replace: true });
      } else {
        setAuthChecked(true);
      }
    });
    // React to sign-out from another tab
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (!user) navigate('/admin', { replace: true });
    });
    return () => { active = false; unsubscribe(); };
  }, [navigate]);

  const handleSignOut = async () => {
    await adminLogout();
    navigate('/admin', { replace: true });
  };

  // KPI calculations
  const kpis = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = leads.filter((l) => new Date(l.date) >= weekAgo).length;
    const pending = leads.filter((l) => l.status === 'new').length;
    const published = properties.filter((p) => p.is_published).length;
    return {
      total: leads.length,
      thisWeek,
      pending,
      published,
      totalProperties: properties.length,
    };
  }, [leads, properties]);

  // Lead update (status change, etc.)
  const updateLead = (id, patch) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  // Property toggle published / save / delete
  const togglePublished = (id) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_published: !p.is_published } : p))
    );
  };

  const saveProperty = (data) => {
    if (data.id) {
      setProperties((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
    } else {
      const id = Math.max(0, ...properties.map((p) => p.id)) + 1;
      const today = new Date().toISOString().slice(0, 10);
      setProperties((prev) => [{ ...data, id, added: today }, ...prev]);
    }
    setShowPropertyForm(false);
    setEditingProperty(null);
  };

  const deleteProperty = (id) => {
    if (!window.confirm(t('admin.delete_confirm'))) return;
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setShowPropertyForm(false);
    setEditingProperty(null);
  };

  const openPropertyForm = (prop = null) => {
    setEditingProperty(prop);
    setShowPropertyForm(true);
  };

  // CSV export
  const exportLeadsCsv = () => {
    const headers = ['Date', 'Name', 'Phone', 'Email', 'Property', 'Status', 'Message', 'Trustee', 'TrusteePhone'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [headers.join(',')];
    for (const l of leads) {
      rows.push([
        l.date,
        l.name,
        l.phone,
        l.email,
        l.property_label,
        l.status,
        l.message || '',
        l.trustee_name || '',
        l.trustee_phone || '',
      ].map(esc).join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authChecked) {
    return (
      <div className="admin-shell admin-shell-loading">
        <div className="admin-loading">טוען...</div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            {t('admin.dashboard_title')}
          </div>
          <button className="admin-signout" onClick={handleSignOut}>
            {t('admin.signout')}
          </button>
        </div>
      </header>

      <div className="admin-wrap">
        <h2 className="admin-section-title">{t('admin.overview')}</h2>
        <p className="admin-section-sub">{t('admin.overview_sub')}</p>

        <div className="kpi-grid">
          <KpiCard label={t('admin.kpi_total_leads')} value={kpis.total} hint={t('admin.kpi_hint_all_time')} />
          <KpiCard label={t('admin.kpi_this_week')} value={kpis.thisWeek} hint={t('admin.kpi_hint_last_7')} />
          <KpiCard
            label={t('admin.kpi_pending')}
            value={kpis.pending}
            hint={t('admin.kpi_hint_new')}
            urgent={kpis.pending > 0}
          />
          <KpiCard
            label={t('admin.kpi_published')}
            value={kpis.published}
            hint={t('admin.kpi_hint_total', { total: kpis.totalProperties })}
          />
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === TABS.LEADS ? 'active' : ''}`}
            onClick={() => setTab(TABS.LEADS)}
          >
            {t('admin.tab_leads')}
            {kpis.pending > 0 && <span className="admin-tab-badge">{kpis.pending}</span>}
          </button>
          <button
            className={`admin-tab ${tab === TABS.PROPERTIES ? 'active' : ''}`}
            onClick={() => setTab(TABS.PROPERTIES)}
          >
            {t('admin.tab_properties')}
          </button>
        </div>

        {tab === TABS.LEADS && (
          <LeadsTable
            leads={leads}
            onSelectLead={setSelectedLead}
            onExportCsv={exportLeadsCsv}
          />
        )}

        {tab === TABS.PROPERTIES && (
          <PropertiesTable
            properties={properties}
            onTogglePublished={togglePublished}
            onEdit={openPropertyForm}
            onAddNew={() => openPropertyForm(null)}
          />
        )}
      </div>

      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={(status) => updateLead(selectedLead.id, { status })}
      />

      {showPropertyForm && (
        <PropertyFormModal
          property={editingProperty}
          onSave={saveProperty}
          onDelete={editingProperty ? () => deleteProperty(editingProperty.id) : null}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
}

function KpiCard({ label, value, hint, urgent }) {
  return (
    <div className={`kpi-card ${urgent ? 'kpi-card-urgent' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-hint">{hint}</div>
    </div>
  );
}
