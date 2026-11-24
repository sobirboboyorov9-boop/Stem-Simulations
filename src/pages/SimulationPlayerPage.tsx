import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { 
  ArrowLeft, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Simulation } from '../types.js';
import { useUser } from '../hooks/useUser.js';
import { AiTutorDrawer } from '../components/AiTutorDrawer.js';
import { useI18n } from '../hooks/useI18n.js';

export const SimulationPlayerPage: React.FC = () => {
  const [, params] = useRoute<{ id: string }>('/simulations/:id/play');
  const simId = params?.id || '';
  const { recordRecent } = useUser();
  const { t } = useI18n();

  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [useLocalSource, setUseLocalSource] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const localSimPath = simulation 
    ? `/simulations/phet-sims/${simulation.file?.split('/').pop() || `${simulation.id}_all.html`}`
    : '';

  const activeSrc = useLocalSource && localSimPath ? localSimPath : (simulation?.directUrl || '');

  useEffect(() => {
    async function loadSim() {
      if (!simId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/simulations/${simId}`);
        if (res.ok) {
          const data: Simulation = await res.json();
          setSimulation(data);
          recordRecent(data.id);
        }
      } catch (err) {
        console.error('Failed to load simulation for player:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSim();
  }, [simId]);

  const handleReload = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto size-8 animate-spin text-indigo-400" />
          <p className="text-xs font-semibold text-slate-300">{t('sim_loading')}</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 p-6 text-white text-center">
        <h2 className="text-xl font-bold">{t('sim_not_found')}</h2>
        <p className="mt-1 text-xs text-slate-400">"{simId}"</p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="size-3.5" />
          {t('sim_back_to_catalog')}
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-full flex-col bg-slate-900 text-white overflow-hidden select-none"
    >
      {/* Top Player Control Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            href={`/simulations/${simulation.id}`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            title={t('btn_back')}
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">{t('btn_back')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {simulation.title}
            </h1>
            <span className="hidden rounded bg-indigo-900/80 border border-indigo-700 px-2 py-0.5 text-[10px] font-bold text-indigo-300 sm:inline">
              {simulation.subject}
            </span>

            {/* Source indicator */}
            <button
              onClick={() => {
                setUseLocalSource(!useLocalSource);
                setIframeLoading(true);
              }}
              className="flex items-center gap-1 rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              title={useLocalSource ? 'Lokal rejimda. Bulutga o‘tish uchun bosing.' : 'Bulut rejimida. Lokal rejimga o‘tish uchun bosing.'}
            >
              <span className={`size-1.5 rounded-full ${useLocalSource ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{useLocalSource ? 'Lokal' : 'CDN'}</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          
          {/* Reload Sim */}
          <button
            onClick={handleReload}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            title="Qayta yuklash"
          >
            <RotateCw className="size-3.5" />
          </button>

          {/* AI Science Tutor */}
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs"
            title={t('nav_ai_tutor')}
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">{t('nav_ai_tutor')}</span>
          </button>

          {/* Direct Link */}
          <a
            href={simulation.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            title="Yangi oynada ochish"
          >
            <ExternalLink className="size-3.5" />
          </a>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            title={isFullscreen ? 'Oynani kichraytirish' : t('sim_fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative flex-1 bg-black">
        {iframeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-white">
            <Loader2 className="size-8 animate-spin text-indigo-400" />
            <p className="mt-3 text-xs font-semibold text-slate-400">
              {simulation.title} {t('loading')}
            </p>
          </div>
        )}

        <iframe
          key={`${iframeKey}-${activeSrc}`}
          src={activeSrc}
          title={simulation.title}
          allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onLoad={() => setIframeLoading(false)}
          className="size-full border-0 bg-white"
        />
      </main>

      {/* Embedded AI Science Companion Drawer */}
      <AiTutorDrawer
        simulation={simulation}
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </div>
  );
};
