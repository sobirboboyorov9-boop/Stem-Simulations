import React from 'react';
import { Link } from 'wouter';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Compass className="size-7" />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-800">
        404 — Page Not Found
      </h1>
      <p className="mt-2 text-xs text-slate-500">
        The simulation or laboratory route you requested could not be located.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    </div>
  );
};
