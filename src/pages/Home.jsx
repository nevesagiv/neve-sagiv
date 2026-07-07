import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { localized } from '../lib/i18n-utils.js';
import { fetchPublishedProperties } from '../lib/supabase.js';
import { useCountUp } from '../hooks/useCountUp.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import PropertyCard from '../components/PropertyCard.jsx';
import LeadModal from '../components/LeadModal.jsx';
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
      const value = localized(p.city, lang, 'city');
      if (value) set.add(value);
    });
    return [...set].sort((a, b) => a.localeCompare(b, lang));
  }, [publicProperties, lang]);

  const types = useMemo(() => {
    const set = new Set();
    publicProperties.forEach((p) => {
      const value = localized(p.property_type, lang, 'type');
      if (value) set.add(value);
    });
    return [...set].sort((a, b) => a.localeCompare(b, lang));
  }, [publicProperties, lang]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publicProperties.filter((p) => {
      const city = localized(p.city, lang, 'city') || '';
      const type = localized(p.property_type, lang, 'type') || '';
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

  // Animated counters for hero stats
  const propertyCount = useCountUp(publicProperties.length, { duration: 1400 });
  const citiesCount = useCountUp(cities.length, { duration: 1600 });

  // Scroll-reveal refs for each section
  const [listingsRef, listingsVisible] = useScrollReveal();
  const [ctaRef, ctaVisible] = useScrollReveal();

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <video
          className="hero-video"
          src="/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="hero-video-overlay" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
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
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{propertyCount}</div>
              <div className="hero-stat-label">{t('home.stat_properties')}</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">{citiesCount}</div>
              <div className="hero-stat-label">{t('home.stat_cities')}</div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="hero-scroll-cue"
          onClick={scrollToListings}
          aria-label={t('home.hero_cta_primary')}
        >
          <span className="hero-scroll-cue-dot" />
        </button>
      </section>

      {/* LISTINGS */}
      <section
        ref={listingsRef}
        className={`listings-section reveal ${listingsVisible ? 'is-visible' : ''}`}
        id="listings"
      >
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

      {/* FINAL CTA */}
      <section
        ref={ctaRef}
        className={`final-cta reveal ${ctaVisible ? 'is-visible' : ''}`}
      >
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

