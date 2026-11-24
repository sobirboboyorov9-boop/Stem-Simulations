import React, { useState } from 'react';
import { Link } from 'wouter';
import { Heart, Play, Sparkles, Atom } from 'lucide-react';
import { Simulation } from '../types.js';
import { useUser } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';

interface SimulationCardProps {
  simulation: Simulation;
  onFavoriteToggle?: (sim: Simulation) => void;
}

export const SimulationCard: React.FC<SimulationCardProps> = ({
  simulation,
  onFavoriteToggle
}) => {
  const { isFavorite, toggleFavorite } = useUser();
  const { t } = useI18n();
  const [imageError, setImageError] = useState(false);
  const favorite = isFavorite(simulation.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(simulation);
    } else {
      toggleFavorite(simulation);
    }
  };

  return (
    <article
      data-testid={`card-simulation-${simulation.id}`}
      className="group flex flex-col justify-between overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
    >
      <div>
        {/* Card Thumbnail / Preview */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted/60">
          <Link href={`/simulations/${simulation.id}`} className="block size-full">
            {!imageError && simulation.thumbnail ? (
              <img
                src={simulation.thumbnail}
                alt={simulation.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="lab-grid relative grid size-full place-items-center overflow-hidden bg-muted/40">
                <div className="absolute -right-8 -top-8 size-28 rounded-full border-[14px] border-primary/10" />
                <div className="relative grid size-12 place-items-center rounded-xl bg-card text-primary shadow-xs border border-border">
                  <Atom className="size-6 animate-pulse" />
                </div>
              </div>
            )}
          </Link>

          {/* Subject Badge Top-Right */}
          <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[10px] font-bold text-foreground shadow-xs backdrop-blur-md border border-border/80">
            {simulation.subject}
          </div>

          {/* Featured Ribbon Top-Left */}
          {simulation.featured && (
            <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
              <Sparkles className="size-2.5 fill-current text-accent" />
              {t('sim_featured')}
            </div>
          )}

          {/* Quick Play Hover Button */}
          <Link
            href={`/simulations/${simulation.id}/play`}
            className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 hover:scale-105 hover:bg-primary/90"
            title={t('sim_launch')}
          >
            <Play className="size-4 fill-current ml-0.5" />
          </Link>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/simulations/${simulation.id}`} className="block flex-1">
              <h3 className="line-clamp-1 font-display text-sm sm:text-base font-bold text-foreground transition-colors group-hover:text-primary">
                {simulation.title}
              </h3>
            </Link>

            <button
              type="button"
              data-testid={`button-favorite-${simulation.id}`}
              onClick={handleHeartClick}
              className={`grid size-8 place-items-center rounded-lg transition-colors ${
                favorite
                  ? 'bg-destructive/10 text-destructive'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-label={favorite ? t('sim_saved_fav') : t('sim_save_fav')}
            >
              <Heart className={`size-4 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {simulation.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Grades & Action */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs bg-muted/20">
        <div className="flex flex-wrap gap-1.5">
          {simulation.grades?.slice(0, 2).map((g) => (
            <span key={g} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground border border-border">
              {g}
            </span>
          ))}
        </div>

        <Link
          href={`/simulations/${simulation.id}`}
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 group/link"
        >
          <span>{t('sim_details')}</span>
          <span className="transition-transform group-hover/link:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
};
