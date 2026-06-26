import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { localized } from '../lib/i18n-utils.js';
import { fetchPublishedProperties } from '../lib/supabase.js';
import PropertyCard from '../components/PropertyCard.jsx';
import LeadModal from '../components/LeadModal.jsx';
import {
  IconShield,
  IconHandshake,
  IconScroll,
  IconSearch,
  IconChat,
  IconKey,
  IconBalance,
  IconGlobe,
  IconChart,
  IconUsers,
  IconArrowDown,
} from '../components/Icons.jsx';
import './Home.css';

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [publicProperties, setPublicProperties] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedProperties()
      .then((rows) => { if (!cancelled) setPublicProperties(rows); })
      .catch((err) => console.error('Failed to load properties', err));
    return () => { cancelled = true; };
  }, []);

  const cities = useMemo(() => {
    const set = new Set();
    publicProperties.forEach((p) => {
      const value = localized(p.city, lang);
      if (value) set.add(value);
    });
    return [...set].sort((a, b) => a.localeCompare(b, lang));
  }, [publicProperties, lang]);

  const types = useMemo(() => {
    const set = new Set();
    publicProperties.forEach((p) => {
      const value = localized(p.property_type, lang);
      if (value) set.add(value);
    });
    return [...set].sort((a, b) => a.localeCompare(b, lang));
  }, [publicProperties, lang]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publicProperties.filter((p) => {
      const city = localized(p.city, lang) || '';
      const type = localized(p.property_type, lang) || '';
      if (cityFilter && city !== cityFilter) return false;
      if (typeFilter && type !== typeFilter) return false;
      if (q) {
        const hay = `${city} ${type} ${p.street || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [publicProperties, cityFilter, typeFilter, search, lang]);

  const reset = () => {
    setCityFilter('');
    setTypeFilter('');
    setSearch('');
  };

  const scrollToListings = () => {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToProcess = () => {
    document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-inner">
          <span className="hero-tag">{t('home.hero_tag')}</span>
          <h1 className="hero-title">
            {t('home.hero_title')}
            <span className="hero-title-em"> {t('home.hero_title_em')}</span>
          </h1>
          <p className="hero-subtitle">{t('home.hero_subtitle')}</p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={scrollToListings}>
              {t('home.hero_cta_primary')}
            </button>
            <button className="btn-hero-secondary" onClick={scrollToProcess}>
              <span>{t('home.hero_cta_secondary')}</span>
              <IconArrowDown width={18} height={18} strokeWidth={2.2} />
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{publicProperties.length}</div>
              <div className="hero-stat-label">{t('home.stat_properties')}</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">{cities.length}</div>
              <div className="hero-stat-label">{t('home.stat_cities')}</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">100%</div>
              <div className="hero-stat-label">{t('home.stat_service')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="listings-section" id="listings">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">{t('home.listings_tag')}</span>
            <h2 className="section-title">{t('home.listings_title')}</h2>
            <p className="section-sub">{t('home.listings_sub')}</p>
          </div>

          <div className="filters" role="search" aria-label="Property filters">
            <div className="filter-field">
              <label htmlFor="filter-city">{t('home.filter_city')}</label>
              <select
                id="filter-city"
                className="select"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">{t('home.filter_city_all')}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-type">{t('home.filter_type')}</label>
              <select
                id="filter-type"
                className="select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">{t('home.filter_type_all')}</option>
                {types.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field filter-field-grow">
              <label htmlFor="filter-search">{t('home.filter_search')}</label>
              <input
                id="filter-search"
                className="input"
                type="search"
                placeholder={t('home.filter_search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button type="button" className="btn btn-primary filter-reset" onClick={reset}>
              {t('home.filter_reset')}
            </button>
          </div>

          <div className="listings-meta">
            <span className="muted">{t('home.count_properties', { count: filtered.length })}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>{t('home.no_results')}</p>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onInterested={setSelectedProperty}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROCESS STEPS */}
      <section className="process-section" id="process">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">{t('home.process_tag')}</span>
            <h2 className="section-title">{t('home.process_title')}</h2>
          </div>
          <div className="process-grid">
            <ProcessStep n={1} icon={<IconSearch />} title={t('home.process_1_t')} desc={t('home.process_1_d')} />
            <ProcessStep n={2} icon={<IconChat />} title={t('home.process_2_t')} desc={t('home.process_2_d')} />
            <ProcessStep n={3} icon={<IconScroll />} title={t('home.process_3_t')} desc={t('home.process_3_d')} />
            <ProcessStep n={4} icon={<IconBalance />} title={t('home.process_4_t')} desc={t('home.process_4_d')} />
          </div>
        </div>
      </section>

      {/* VALUE PROPS (Why Us) */}
      <section className="value-section">
        <div className="container">
          <div className="section-head section-head-light">
            <span className="section-tag section-tag-light">{t('home.value_tag')}</span>
            <h2 className="section-title section-title-light">{t('home.value_title')}</h2>
          </div>
          <div className="value-grid">
            <ValueItem icon={<IconChart />} title={t('home.value_1_t')} desc={t('home.value_1_d')} />
            <ValueItem icon={<IconGlobe />} title={t('home.value_2_t')} desc={t('home.value_2_d')} />
            <ValueItem icon={<IconShield />} title={t('home.value_3_t')} desc={t('home.value_3_d')} />
            <ValueItem icon={<IconUsers />} title={t('home.value_4_t')} desc={t('home.value_4_d')} />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container container-narrow">
          <span className="section-tag">{t('home.final_cta_tag')}</span>
          <h2 className="final-cta-title">{t('home.final_cta_title')}</h2>
          <p className="final-cta-sub">{t('home.final_cta_sub')}</p>
          <button className="btn-final-cta" onClick={scrollToListings}>
            {t('home.final_cta_button')}
          </button>
        </div>
      </section>

      <LeadModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </>
  );
}

function TrustItem({ icon, title, desc }) {
  return (
    <div className="trust-item">
      <div className="trust-icon">{icon}</div>
      <h3 className="trust-title">{title}</h3>
      <p className="trust-desc">{desc}</p>
    </div>
  );
}

function ProcessStep({ n, icon, title, desc }) {
  return (
    <div className="process-step">
      <div className="process-step-num">0{n}</div>
      <div className="process-step-icon">{icon}</div>
      <h3 className="process-step-title">{title}</h3>
      <p className="process-step-desc">{desc}</p>
    </div>
  );
}

function ValueItem({ icon, title, desc }) {
  return (
    <div className="value-item">
      <div className="value-icon">{icon}</div>
      <h3 className="value-title">{title}</h3>
      <p className="value-desc">{desc}</p>
    </div>
  );
}
