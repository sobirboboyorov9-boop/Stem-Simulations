import React, { useState } from 'react';
import { Link } from 'wouter';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export const BannerNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="border-b border-border bg-sidebar px-4 py-2.5 text-sidebar-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between text-xs font-medium sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 truncate">
          <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30 shadow-xs">
            <Sparkles className="size-3 fill-current" />
            119 STEM SIMS
          </span>
          <span className="truncate text-sidebar-foreground/90 text-xs font-normal">
            Complete interactive simulation library with real-time AI guided inquiry & classroom collaboration.
          </span>
          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-accent hover:underline decoration-accent/60 underline-offset-2 transition"
          >
            <span>Explore catalog</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition"
          aria-label="Dismiss banner"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
