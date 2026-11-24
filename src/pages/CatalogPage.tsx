import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Compass, RefreshCw, X, Filter } from 'lucide-react';
import { Simulation } from '../types.js';
import { SimulationCard } from '../components/SimulationCard.js';
import { useI18n } from '../hooks/useI18n.js';

export const CatalogPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t, language } = useI18n();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse initial query params from URL search
  const queryParams = new URLSearchParams(window.location.search);
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(queryParams.get('subject') || '');
  const [selectedGrade, setSelectedGrade] = useState<string>(queryParams.get('grade') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(queryParams.get('difficulty') || '');

  // Keep state synced with URL search params if user navigated
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('search') !== null) setSearchTerm(p.get('search') || '');
    if (p.get('subject') !== null) setSelectedSubject(p.get('subject') || '');
    if (p.get('grade') !== null) setSelectedGrade(p.get('grade') || '');
    if (p.get('difficulty') !== null) setSelectedDifficulty(p.get('difficulty') || '');
  }, [window.location.search]);

  // Fetch filtered simulations from backend
  useEffect(() => {
    async function fetchSims() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedSubject) params.set('subject', selectedSubject);
        if (selectedGrade) params.set('grade', selectedGrade);

        const res = await fetch(`/api/simulations?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          let items: Simulation[] = data.items || [];

          if (selectedDifficulty) {
            items = items.filter(s => s.difficulty === selectedDifficulty);
          }

          setSimulations(items);
        }
      } catch (err) {
        console.error('Failed to fetch simulations catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchSims, 150);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedSubject, selectedGrade, selectedDifficulty]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedDifficulty('');
    window.history.pushState({}, '', '/catalog');
  };

  const hasActiveFilters = Boolean(searchTerm || selectedSubject || selectedGrade || selectedDifficulty);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-rise">
      
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            <Compass className="size-3.5" />
            <span>{t('catalog_badge')}</span>
          </div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t('catalog_heading')}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-2xl">
            {t('catalog_desc')}
          </p>
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-2xs">
          <span className="flex size-2 rounded-full bg-primary animate-pulse" />
          <span>{simulations.length} {t('catalog_available_badge')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4 shadow-xs lg:flex-row lg:items-center">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_placeholder')}
            className="h-10 w-full rounded-xl bg-background pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary border border-border"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t('catalog_all_subjects')} (5)</option>
          <option value="Physics">{t('subject_physics')} (44)</option>
          <option value="Math">{t('subject_math')} (42)</option>
          <option value="Chemistry">{t('subject_chemistry')} (25)</option>
          <option value="Biology">{t('subject_biology')} (4)</option>
          <option value="Earth Science">{t('subject_earth_science')} (4)</option>
        </select>

        {/* Grade Filter */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t('catalog_all_grades')}</option>
          <option value="K-2">{t('grade_k2')}</option>
          <option value="3-5">{t('grade_35')}</option>
          <option value="6-8">{t('grade_68')}</option>
          <option value="9-12">{t('grade_912')}</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t('catalog_all_levels')}</option>
          <option value="Exploratory">{t('diff_exploratory')}</option>
          <option value="Intermediate">{t('diff_intermediate')}</option>
          <option value="Advanced">{t('diff_advanced')}</option>
        </select>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 text-xs font-bold text-destructive hover:bg-destructive/20 transition"
          >
            <X className="size-3.5" />
            <span>{t('catalog_reset_filters')}</span>
          </button>
        )}
      </div>

      {/* Grid of Simulation Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-[var(--radius)] bg-muted/60 border border-border" />
          ))}
        </div>
      ) : simulations.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {simulations.map((sim) => (
            <SimulationCard key={sim.id} simulation={sim} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-[var(--radius)] border border-border bg-card p-12 text-center shadow-xs">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border">
            <Compass className="size-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-foreground">
            {t('catalog_no_match')}
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
            {t('catalog_no_match_desc')}
          </p>
          <button
            onClick={clearFilters}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
          >
            <RefreshCw className="size-3.5" />
            <span>{t('catalog_reset_filters')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
