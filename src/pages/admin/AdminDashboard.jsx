import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { adminLogout, getCurrentUser, subscribeToAuthChanges } from '../../lib/adminAuth.js';
import {
  fetchAllLeadsAdmin,
  fetchAllPropertiesAdmin,
  updateLeadStatus,
  togglePropertyPublishedAdmin,
  savePropertyAdmin,
  deletePropertyAdmin,
} from '../../lib/supabase.js';
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
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [selectedLead, setSelectedLead] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);

  async function reloadAll() {
    setLoading(true);
    setDataError(null);
    try {
      const [leadsData, propsData] = await Promise.all([
        fetchAllLeadsAdmin(),
        fetchAllPropertiesAdmin(),
      ]);
      setLeads(leadsData);
      setProperties(propsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
      setDataError(err.message || 'נכשל בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }

  async function reloadLeads() {
    try {
      const data = await fetchAllLeadsAdmin();
      setLeads(data);
    } catch (err) {
      console.error('Failed to reload leads', err);
    }
  }

  async function reloadProperties() {
    try {
      const data = await fetchAllPropertiesAdmin();
      setProperties(data);
    } catch (err) {
      console.error('Failed to reload properties', err);
    }
  }

  // Guard: must be authenticated (Supabase Auth)
  useEffect(() => {
    let active = true;
    getCurrentUser().then((user) => {
      if (!active) return;
      if (!user) {
        navigate('/admin', { replace: true });
      } else {
        setAuthChecked(true);
        reloadAll();
      }
    });
    // React to sign-out from another tab
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (!user) navigate('/admin', { replace: true });
    });
    return () => { active = false; unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Lead update (status change) — async, writes to Supabase
  const updateLead = async (id, patch) => {
    // Optimistic UI
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
    try {
      if (patch.status) {
        await updateLeadStatus(id, patch.status);
      }
      await reloadLeads();
    } catch (err) {
      console.error('Failed to update lead', err);
      alert('שגיאה בעדכון הליד: ' + (err.message || err));
      await reloadLeads();
    }
  };

  // Property toggle published / save / delete — async, writes to Supabase
  const togglePublished = async (id) => {
    const current = properties.find((p) => p.id === id);
    if (!current) return;
    const newValue = !current.is_published;
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_published: newValue } : p))
    );
    try {
      await togglePropertyPublishedAdmin(id, newValue);
    } catch (err) {
      console.error('Failed to toggle property', err);
      alert('שגיאה בשינוי סטטוס פרסום: ' + (err.message || err));
      await reloadProperties();
    }
  };

  const saveProperty = async (data) => {
    try {
      await savePropertyAdmin(data);
      await reloadProperties();
      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (err) {
      console.error('Failed to save property', err);
      alert('שגיאה בשמירת הנכס: ' + (err.message || err));
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm(t('admin.delete_confirm', 'למחוק את הנכס לצמיתות?'))) return;
    try {
      await deletePropertyAdmin(id);
      await reloadProperties();
      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (err) {
      console.error('Failed to delete property', err);
      alert('שגיאה במחיקת הנכס: ' + (err.message || err));
    }
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
