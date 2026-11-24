import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  Layers, 
  Play, 
  BarChart3, 
  RefreshCw,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { TeacherActivity } from '../types.js';
import { useUser } from '../hooks/useUser.js';

export const AdminPage: React.FC = () => {
  const { authFetch } = useUser();
  const [submissions, setSubmissions] = useState<TeacherActivity[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState<{ [id: string]: string }>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, statRes] = await Promise.all([
        authFetch('/api/admin/submissions'),
        authFetch('/api/admin/summary')
      ]);

      if (revRes.ok) {
        const data = await revRes.json();
        setSubmissions(data);
      }
      if (statRes.ok) {
        const s = await statRes.json();
        setStats(s);
      }
    } catch (e) {
      console.error('Failed to load admin review data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await authFetch(`/api/admin/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', feedback: reviewNote[id] || 'Curriculum aligned and verified.' })
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    const note = reviewNote[id] || 'Please refine discussion questions to include more concrete observational variables.';
    try {
      await authFetch(`/api/admin/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', feedback: note })
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Content Management</span>
          </div>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-800">
            Admin Review Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review teacher inquiry activities, check curriculum alignment, and monitor platform analytics.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Platform Analytics Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Simulations</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{stats.totalSimulations || 119}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pending Reviews</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{stats.pendingReviews || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Approved Plans</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.approvedActivities || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Activities</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{stats.totalActivities || 0}</p>
          </div>
        </div>
      )}

      {/* Submissions Review Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            Pending Submissions ({submissions.length})
          </h3>
        </div>

        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
        ) : submissions.length > 0 ? (
          <div className="grid gap-4">
            {submissions.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                        <Clock className="size-3" />
                        Awaiting Review
                      </span>
                      <span className="text-xs font-semibold text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">Grade {item.grade}</span>
                      <span className="text-xs font-semibold text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">{item.subject}</span>
                    </div>

                    <h4 className="mt-1.5 text-base font-bold text-slate-800">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Target Simulation: <strong className="text-slate-700">{item.simulationTitle}</strong>
                    </p>
                  </div>

                  <a
                    href={`/simulations/${item.simulationId}/play`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Launch Target Sim</span>
                  </a>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1.5">
                  <div>
                    <strong className="text-slate-800">Objective:</strong> {item.objective}
                  </div>
                  {item.questions && item.questions.length > 0 && (
                    <div>
                      <strong className="text-slate-800">Inquiry Prompts:</strong>
                      <ul className="mt-1 list-inside list-disc space-y-0.5 text-slate-600">
                        {item.questions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Review note input & action buttons */}
                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Add feedback / approval comments..."
                    value={reviewNote[item.id] || ''}
                    onChange={(e) => setReviewNote({ ...reviewNote, [item.id]: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(item.id)}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <X className="size-3.5" />
                      <span>Request Revision</span>
                    </button>

                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      <Check className="size-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <FileCheck className="mx-auto size-10 text-emerald-600" />
            <h4 className="mt-3 text-base font-bold text-slate-800">
              Queue is clear
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              All submitted teacher inquiry activities have been reviewed and published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
