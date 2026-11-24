import React from 'react';
import { Link } from 'wouter';
import { Compass, Atom, Sparkles, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { StemLogo } from './StemLogo.js';
import { useI18n } from '../hooks/useI18n.js';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="mt-20 border-t border-border bg-card text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="inline-block group">
              <StemLogo size="md" showText={true} subtext="COMPUTATIONAL LABS" />
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t('footer_desc')}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-foreground">{t('footer_active_labs')}</span>
            </div>
          </div>

          {/* Subjects Col */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/80 flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span>{t('footer_domains')}</span>
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/catalog?subject=Physics" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span>{t('subject_physics')}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">44</span>
                </Link>
              </li>
              <li>
                <Link href="/catalog?subject=Math" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span>{t('subject_math')}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">42</span>
                </Link>
              </li>
              <li>
                <Link href="/catalog?subject=Chemistry" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span>{t('subject_chemistry')}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">25</span>
                </Link>
              </li>
              <li>
                <Link href="/catalog?subject=Biology" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span>{t('subject_biology')}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">4</span>
                </Link>
              </li>
              <li>
                <Link href="/catalog?subject=Earth%20Science" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span>{t('subject_earth_science')}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">4</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Workflows Col */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/80 flex items-center gap-1.5">
              <Compass className="size-3.5 text-primary" />
              <span>{t('footer_tools')}</span>
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/catalog" className="hover:text-primary transition-colors">
                  {t('catalog_heading')}
                </Link>
              </li>
              <li>
                <Link href="/ai-tutor" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('nav_ai_tutor')}</span>
                  <span className="rounded-md bg-accent/20 px-1.5 py-0.2 text-[9px] font-bold text-accent-foreground">PRO</span>
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-primary transition-colors">
                  {t('community_channels')}
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-primary transition-colors">
                  {t('nav_saved')}
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-primary transition-colors">
                  {t('teacher_studio_badge')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Attribution & Standards Col */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/80 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-accent" />
              <span>{t('footer_open_science')}</span>
            </h4>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {t('footer_phet_license')}
            </p>
            <div className="mt-4 rounded-[var(--radius)] border border-border bg-background p-3.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Atom className="size-4 text-primary" />
                <span>{t('footer_nextgen_badge')}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                {t('footer_nextgen_desc')}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {t('footer_copyright')}</p>
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="hover:text-foreground transition-colors">{t('nav_catalog')}</Link>
            <Link href="/ai-tutor" className="hover:text-foreground transition-colors">{t('nav_ai_tutor')}</Link>
            <Link href="/community" className="hover:text-foreground transition-colors">{t('nav_community')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
