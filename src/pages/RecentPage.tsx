import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { History, Trash2, ArrowRight } from 'lucide-react';
import { Simulation } from '../types.js';
import { SimulationCard } from '../components/SimulationCard.js';

export const RecentPage: React.FC = () => {
  const [recentSims, setRecentSims] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recent');
      if (res.ok) {
        const data = await res.json();
        setRecentSims(data);
      }
    } catch (e) {
      console.error('Failed to load recent activity:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleClearHistory = async () => {
    try {
      await fetch('/api/recent', { method: 'DELETE' });
      setRecentSims([]);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <History className="size-3.5 text-indigo-600" />
            <span>User Workspace</span>
          </div>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-800">
            Recent Activity
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Your recently launched and experimented simulations in chronological order.
          </p>
        </div>

        {recentSims.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-xs"
          >
            <Trash2 className="size-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : recentSims.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentSims.map((sim) => (
            <SimulationCard key={sim.id} simulation={sim} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <History className="size-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-800">
            No recent activity
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Whenever you launch a simulation, your inquiry activity is automatically tracked here.
          </p>
          <Link
            href="/catalog"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <span>Start Exploring</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
