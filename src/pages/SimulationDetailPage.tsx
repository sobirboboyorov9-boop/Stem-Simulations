import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { 
  Play, 
  Heart, 
  Sparkles, 
  ArrowLeft, 
  Atom, 
  BookOpen,
  Share2,
  Check
} from 'lucide-react';
import { Simulation } from '../types.js';
import { useUser } from '../hooks/useUser.js';
import { SimulationCard } from '../components/SimulationCard.js';
import { AiTutorDrawer } from '../components/AiTutorDrawer.js';
import { useI18n } from '../hooks/useI18n.js';

export const SimulationDetailPage: React.FC = () => {
  const [, params] = useRoute<{ id: string }>('/simulations/:id');
  const simId = params?.id || '';
  const { isFavorite, toggleFavorite, recordRecent } = useUser();
  const { t } = useI18n();

  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSim() {
      if (!simId) return;
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/simulations/${simId}`);
        if (res.ok) {
          const data = await res.json();
          setSimulation(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load simulation detail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadSim();
  }, [simId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center animate-rise">
        <div className="mx-auto size-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-muted-foreground">{t('sim_loading')}</p>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center animate-rise">
        <h2 className="font-display text-xl font-bold text-foreground">{t('sim_not_found')}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          "{simId}"
        </p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
        >
          <ArrowLeft className="size-3.5" />
          {t('sim_back_to_catalog')}
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(simulation.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-rise">
      
      {/* Back button */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>{t('sim_back_to_catalog')}</span>
        </Link>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        
        {/* Left Column: Visual Preview Card */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card p-2.5 shadow-xs">
            <div className="relative aspect-[1.4] overflow-hidden rounded-xl bg-muted">
              {simulation.thumbnail ? (
                <img
                  src={simulation.thumbnail}
                  alt={simulation.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="lab-grid grid size-full place-items-center bg-muted">
                  <div className="relative grid size-16 place-items-center rounded-2xl bg-card text-primary shadow-xs border border-border">
                    <Atom className="size-8" />
                  </div>
                </div>
              )}

              {/* Subject watermark tag */}
              <span className="absolute bottom-3 left-3 rounded-lg bg-card/90 px-3 py-1 text-xs font-bold text-foreground shadow-xs backdrop-blur-xs border border-border">
                {simulation.subject}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {simulation.subject}
            </span>
            {simulation.featured && (
              <span className="flex items-center gap-1 rounded-lg bg-accent/20 border border-accent/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                <Sparkles className="size-3 fill-current text-accent" />
                {t('sim_featured')}
              </span>
            )}
            <span className="rounded-lg bg-secondary border border-border px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              {simulation.difficulty || t('diff_exploratory')}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {simulation.title}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {simulation.description}
          </p>

          {/* Learning Goals */}
          {simulation.learningGoals && (
            <div className="rounded-[var(--radius)] border border-border bg-card p-4 text-xs shadow-xs">
              <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-1.5 font-display text-sm">
                <BookOpen className="size-4 text-primary" />
                {t('sim_inquiry_goals')}
              </h4>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {simulation.learningGoals}
              </p>
            </div>
          )}

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="font-semibold text-muted-foreground self-center mr-1">{t('catalog_filter_grade')}:</span>
            {simulation.grades?.map((g) => (
              <span key={g} className="rounded-lg bg-secondary border border-border px-2.5 py-0.5 font-medium text-secondary-foreground">
                {g}
              </span>
            ))}
            <span className="rounded-lg bg-secondary border border-border px-2.5 py-0.5 font-medium text-secondary-foreground">
              HTML5 WebGL
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            
            {/* Launch Button */}
            <Link
              href={`/simulations/${simulation.id}/play`}
              onClick={() => recordRecent(simulation.id)}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs sm:text-sm font-bold text-accent-foreground shadow-md transition hover:scale-105 active:scale-95"
              id="button-open-simulation"
            >
              <Play className="size-3.5 fill-current ml-0.5" />
              <span>{t('sim_launch')}</span>
            </Link>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(simulation)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-3 text-xs font-bold transition ${
                favorite
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              <Heart className={`size-3.5 ${favorite ? 'fill-current' : ''}`} />
              <span>{favorite ? t('sim_saved_fav') : t('sim_save_fav')}</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/20 transition"
            >
              <Sparkles className="size-3.5 text-accent" />
              <span>{t('nav_ai_tutor')}</span>
            </button>

            {/* Share Link */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-3 text-xs font-bold text-muted-foreground hover:text-foreground transition"
              title={t('sim_share')}
            >
              {copied ? <Check className="size-3.5 text-primary" /> : <Share2 className="size-3.5" />}
              <span>{copied ? t('sim_copied') : t('sim_share')}</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Version {simulation.version || '1.0'} • PhET HTML5
          </p>
        </div>
      </div>

      {/* "More Like This" Section */}
      {simulation.related && simulation.related.length > 0 && (
        <section className="border-t border-border pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              {t('sim_related_title')}
            </h2>
            <Link href="/catalog" className="text-xs font-bold text-primary hover:underline">
              {t('catalog_view_all')} →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {simulation.related.slice(0, 3).map((rel) => (
              <SimulationCard key={rel.id} simulation={rel} />
            ))}
          </div>
        </section>
      )}

      {/* AI Tutor Drawer */}
      <AiTutorDrawer
        simulation={simulation}
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </div>
  );
};
