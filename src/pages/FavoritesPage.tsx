import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Bookmark, ArrowRight, Heart, Lock, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { Simulation } from '../types.js';
import { SimulationCard } from '../components/SimulationCard.js';
import { useUser } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';

export const FavoritesPage: React.FC = () => {
  const { user, isAuthenticated, isAuthInitializing, openAuthModal, authFetch } = useUser();
  const { language, t } = useI18n();
  const [favorites, setFavorites] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    if (isAuthInitializing) {
      return;
    }
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthInitializing) {
      loadFavorites();
    }
  }, [user.id, isAuthenticated, isAuthInitializing]);

  if (isAuthInitializing || (isAuthenticated && loading)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 animate-pulse">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <h3 className="font-display text-base font-bold text-foreground">
          {language === 'uz' ? 'Saqlangan laboratoriyalar yuklanmoqda...' : 'Loading saved experiments...'}
        </h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-500/30 bg-card p-8 sm:p-12 text-center shadow-lg">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-4">
            <Lock className="size-8" />
          </div>
          <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">
            {language === 'uz' ? 'Mehmon (Guest) Rejimi' : 'Guest Mode Restricted'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {language === 'uz'
              ? 'Siz laboratoriyalarni saqlay olmaysiz'
              : 'You cannot save labs as a guest'}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {language === 'uz'
              ? 'Laboratoriyalarni o‘zingizning profilingizga saqlash, darslarda tezkor ishga tushirish va laboratoriya yutuqlarini kuzatish uchun iltimos ro‘yxatdan o‘ting yoki tizimga kiring.'
              : 'To bookmark simulations to your workspace and resume experiments anytime, please sign in or create an account.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('signup')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition cursor-pointer"
            >
              <UserPlus className="size-4" />
              <span>{language === 'uz' ? 'Ro‘yxatdan o‘tish (Bepul)' : 'Create Free Account'}</span>
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer shadow-2xs"
            >
              <LogIn className="size-4 text-muted-foreground" />
              <span>{language === 'uz' ? 'Tizimga kirish' : 'Sign In'}</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>{language === 'uz' ? 'Katalogdagi laboratoriyalarni ko‘rish' : 'Browse Catalog Simulations'}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Bookmark className="size-3.5 text-rose-500" />
            <span>{language === 'uz' ? 'Shaxsiy Ish Maydoni' : 'User Workspace'}</span>
          </div>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-foreground">
            {t('nav_saved')}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {language === 'uz' 
              ? 'Darslar va mustaqil tadqiqotlar uchun saqlangan laboratoriyalar.' 
              : 'Pinned simulations for rapid access during classes and research.'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs">
          <Heart className="size-3.5 fill-current text-rose-500" />
          <span>{favorites.length} {language === 'uz' ? 'ta saqlangan laboratoriya' : (favorites.length === 1 ? 'Saved Simulation' : 'Saved Simulations')}</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {favorites.map((sim) => (
            <SimulationCard
              key={sim.id}
              simulation={sim}
              onFavoriteToggle={() => loadFavorites()}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-2xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Bookmark className="size-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-foreground">
            {language === 'uz' ? 'Hozircha saqlangan laboratoriyalar yo‘q' : 'No saved simulations yet'}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {language === 'uz'
              ? 'Katalogdagi istalgan laboratoriya kartochkasidagi yurakcha (saqlash) belgisini bosib o‘zingizga qo‘shing.'
              : 'Click the heart icon on any simulation card across the catalog to add it to your favorites.'}
          </p>
          <Link
            href="/catalog"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
          >
            <span>{language === 'uz' ? 'Katalogni ko‘rish' : 'Explore Simulations'}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
