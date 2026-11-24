import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Compass, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Atom, 
  Calculator, 
  FlaskConical, 
  Dna, 
  Globe2, 
  Play, 
  GraduationCap,
  Cpu,
  Bot,
  Users,
  Layers,
  BookOpen,
  Trophy
} from 'lucide-react';
import { Simulation, SubjectSummary } from '../types.js';
import { SimulationCard } from '../components/SimulationCard.js';
import { useI18n } from '../hooks/useI18n.js';
import { useUser } from '../hooks/useUser.js';

export const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const { canAccessTeacher } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredSims, setFeaturedSims] = useState<Simulation[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [simsRes, subRes] = await Promise.all([
          fetch('/api/simulations?featured=true'),
          fetch('/api/subjects')
        ]);

        if (simsRes.ok) {
          const simData = await simsRes.json();
          setFeaturedSims(simData.items?.slice(0, 8) || []);
        }

        if (subRes.ok) {
          const subData = await subRes.json();
          setSubjects(subData);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      setLocation('/catalog');
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Physics': return <Atom className="size-5 text-primary" />;
      case 'Math': return <Calculator className="size-5 text-accent" />;
      case 'Chemistry': return <FlaskConical className="size-5 text-destructive" />;
      case 'Biology': return <Dna className="size-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Geography': return <Globe2 className="size-5 text-cyan-600 dark:text-cyan-400" />;
      case 'Earth Science': return <Globe2 className="size-5 text-primary" />;
      case 'IT / Computer Science': return <Cpu className="size-5 text-primary" />;
      case 'Robotics': return <Bot className="size-5 text-accent" />;
      default: return <Compass className="size-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-12 lg:space-y-16 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-rise">
      
      {/* Competition Presentation & Demo Banner for Judges */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-primary/10 to-accent/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0 shadow-md">
            <Trophy className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Tanlov Uchun Maxsus Taqdimot & Jonli Demo</span>
              <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                Pitch Edition
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Muammo & yechim, 1-5 daqiqalik interaktiv demo video, ishlaydigan prototip, jamoa, roadmap va jonli API konsoli.
            </p>
          </div>
        </div>

        <Link
          href="/showcase"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 text-xs transition shadow-xs shrink-0"
        >
          <span>Taqdimotni Ko‘rish</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Geometric Balanced Hero Banner */}
      <section className="relative overflow-hidden rounded-[calc(var(--radius)+8px)] bg-sidebar text-sidebar-foreground p-8 sm:p-12 lg:p-14 shadow-lg border border-sidebar-border">
        {/* Lab Grid Decorative Background */}
        <div className="lab-grid absolute inset-0 opacity-20 pointer-events-none" />
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 size-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-12 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-sidebar-accent border border-sidebar-border px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent shadow-xs">
            <Sparkles className="size-3.5 fill-current" />
            <span>{t('hero_badge')}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-sidebar-foreground">
            {t('hero_title')}
          </h1>

          <p className="text-sidebar-foreground/80 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            {t('hero_subtitle')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              href="/simulations/forces-and-motion-basics/play"
              className="rounded-xl bg-accent px-6 py-3 text-xs sm:text-sm font-bold text-accent-foreground shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play className="size-4 fill-current ml-0.5" />
              <span>{t('hero_btn_explore')}</span>
            </Link>

            <Link
              href="/ai-tutor"
              className="rounded-xl bg-sidebar-accent border border-sidebar-border px-5 py-3 text-xs sm:text-sm font-bold text-sidebar-foreground transition hover:bg-sidebar-accent/80 flex items-center gap-2 backdrop-blur-sm"
            >
              <Sparkles className="size-4 text-accent" />
              <span>{t('nav_ai_tutor')}</span>
            </Link>

            <Link
              href="/catalog"
              className="rounded-xl bg-transparent border border-sidebar-foreground/20 px-5 py-3 text-xs sm:text-sm font-semibold text-sidebar-foreground/90 transition hover:bg-sidebar-accent/40"
            >
              {t('hero_browse_all')}
            </Link>
          </div>
        </div>

        {/* Decorative Geometric Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-[-12deg] translate-x-1/2 pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 size-72 rounded-full border-[24px] border-sidebar-primary/10 pointer-events-none" />
      </section>

      {/* Quick Search and Filter Bar */}
      <section className="rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full rounded-xl bg-background py-3 pl-11 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary border border-border"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-primary px-7 py-3 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary/90 active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <Compass className="size-4" />
            <span>{t('nav_catalog')}</span>
          </button>
        </form>
      </section>

      {/* Interactive Hub Features (AI Tutor + Community) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AI Tutor Card */}
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="size-4 text-accent" />
              <span>{t('nav_ai_tutor')}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
              {t('ai_tutor_title')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              {t('ai_tutor_subtitle')}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Gemini 2.5 / 3.7 Socratic Reasoning
            </span>
            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 group/btn"
            >
              <span>{t('launch_tutor')}</span>
              <ArrowRight className="size-3.5 transition-transform group-btn:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Community Chat Card */}
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2.5">
              <Users className="size-4" />
              <span>{t('community_title')}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
              {t('community_channels')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              {t('community_subtitle')}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              {t('community_channels')}
            </span>
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 group/btn"
            >
              <span>{t('open_channels')}</span>
              <ArrowRight className="size-3.5 transition-transform group-btn:translate-x-1" />
            </Link>
          </div>
        </div>

      </section>

      {/* Catalog Library: Subject Portals */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {t('subjects_title')}
            </h2>
            <h3 className="font-display text-2xl font-extrabold text-foreground mt-0.5">
              {t('subjects_subtitle')}
            </h3>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{t('catalog_view_all')}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((sub) => (
            <Link
              key={sub.subject}
              href={`/catalog?subject=${encodeURIComponent(sub.subject)}`}
              className="group flex flex-col justify-between rounded-[var(--radius)] border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-background border border-border">
                    {getSubjectIcon(sub.subject)}
                  </div>
                  <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-[10px] font-bold text-secondary-foreground">
                    {sub.count} {t('labs_count_suffix')}
                  </span>
                </div>
                <h4 className="mt-3.5 font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {sub.subject}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {sub.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
                <span>{t('explore_subject')}</span>
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Simulations Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {t('featured_simulations')}
            </h2>
            <h3 className="font-display text-2xl font-extrabold text-foreground mt-0.5">
              {t('simulations_count')}
            </h3>
          </div>

          <Link
            href="/catalog"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>{t('catalog_view_all')}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredSims.map((sim) => (
            <SimulationCard key={sim.id} simulation={sim} />
          ))}
        </div>
      </section>

      {/* Teacher Activity Studio Banner */}
      {canAccessTeacher && (
        <section className="rounded-[var(--radius)] border border-border bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-accent">
                <GraduationCap className="size-4" />
                <span className="uppercase tracking-wider">{t('teacher_studio_badge')}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                {t('teacher_studio_banner_title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                {t('teacher_studio_banner_desc')}
              </p>
            </div>

            <div className="md:col-span-4 flex md:justify-end">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs sm:text-sm font-bold text-accent-foreground shadow-xs transition hover:scale-105 active:scale-95"
              >
                <span>{t('open_studio')}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
