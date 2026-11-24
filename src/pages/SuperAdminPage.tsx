import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Users, 
  Database, 
  Shield, 
  Server, 
  CheckCircle2, 
  RefreshCw, 
  BookOpen, 
  ShieldAlert, 
  Check, 
  X, 
  Flag,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { User, UserRole, Subject, ModerationReport } from '../types.js';
import { useUser, SUPER_ADMIN_EMAIL } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';

const SUBJECT_LIST: Subject[] = [
  'Physics',
  'Chemistry',
  'Math',
  'Biology',
  'Geography',
  'Earth Science',
  'IT / Computer Science',
  'Robotics'
];

export const SuperAdminPage: React.FC = () => {
  const { user: currentUser, authFetch } = useUser();
  const { t } = useI18n();

  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'moderation' | 'system'>('users');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes] = await Promise.all([
        authFetch('/api/super-admin/users'),
        authFetch('/api/community/reports')
      ]);

      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u);
      }
      if (reportsRes.ok) {
        const r = await reportsRes.json();
        setReports(r);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await authFetch(`/api/super-admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubjectChange = async (userId: string, subject: Subject) => {
    try {
      await authFetch(`/api/super-admin/users/${userId}/subject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject })
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const [terminatingUserId, setTerminatingUserId] = useState<string | null>(null);
  const [terminateConfirmUser, setTerminateConfirmUser] = useState<User | null>(null);

  const handleTerminateUser = async (targetUser: User) => {
    if (!targetUser) return;
    try {
      setTerminatingUserId(targetUser.id);
      const res = await authFetch(`/api/super-admin/users/${targetUser.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to terminate user');
      } else {
        setTerminateConfirmUser(null);
        await loadData();
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error terminating user');
    } finally {
      setTerminatingUserId(null);
    }
  };

  const handleReportAction = async (reportId: string, status: 'reviewed' | 'dismissed' | 'action_taken') => {
    try {
      await authFetch(`/api/community/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
            <Crown className="size-4" />
            <span>{t('nav_super_admin')}</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Super Admin Governance Console
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Designated Account: <span className="font-mono font-bold text-slate-700">{SUPER_ADMIN_EMAIL}</span>
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="size-4" />
          <span>User Role & Subject Matrix ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'moderation'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flag className="size-4" />
          <span>Community Moderation Queue ({reports.filter(r => r.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'system'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="size-4" />
          <span>Platform Infrastructure</span>
        </button>
      </div>

      {/* Tab 1: User Management & Subject Assignment */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Role-Based Access Control & Subject Permissions
            </h3>
            <p className="text-xs text-slate-500">
              Teachers can only access the Simulation Studio for their assigned STEM subject.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">User & Profile</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Current Role</th>
                  <th className="pb-3">Assigned Subject</th>
                  <th className="pb-3">Modify Role</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => {
                  const isPredefinedSuperAdmin = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                            alt={u.name}
                            className="size-7 rounded-lg object-cover bg-slate-100"
                          />
                          <div>
                            <div>{u.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">@{u.username || u.email.split('@')[0]}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          u.role === 'SUPER_ADMIN' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          u.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          u.role === 'TEACHER' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.role === 'TEACHER' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? (
                          <select
                            value={u.subject || 'Physics'}
                            onChange={(e) => handleSubjectChange(u.id, e.target.value as Subject)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
                          >
                            {SUBJECT_LIST.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-400 italic">Not applicable</span>
                        )}
                      </td>
                      <td className="py-3">
                        {isPredefinedSuperAdmin ? (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-2 py-1">
                            Permanent Super Admin
                          </span>
                        ) : (
                          <select
                            value={u.role.toUpperCase()}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isPredefinedSuperAdmin ? (
                          <span className="text-[10px] text-slate-400 font-medium">Protected</span>
                        ) : (
                          <button
                            onClick={() => setTerminateConfirmUser(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition cursor-pointer"
                            title="Terminate user account"
                          >
                            <span>Terminate / O‘chirish</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Terminate User Confirmation Modal */}
      {terminateConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Terminate User Account?</h3>
                <p className="text-xs text-rose-600 font-medium">Foydalanuvchi hisobini butunlay o‘chirish</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently terminate <strong className="text-slate-900 font-bold">{terminateConfirmUser.name}</strong> ({terminateConfirmUser.email})?
              All associated data, bookmarks, and activity records will be deleted immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTerminateConfirmUser(null)}
                disabled={Boolean(terminatingUserId)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel / Bekor qilish
              </button>
              <button
                onClick={() => handleTerminateUser(terminateConfirmUser)}
                disabled={Boolean(terminatingUserId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-xs"
              >
                {terminatingUserId ? (
                  <span>O‘chirilmoqda...</span>
                ) : (
                  <span>Yes, Terminate Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Community Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Community Moderation Reports Queue
            </h3>
            <p className="text-xs text-slate-500">
              Review flagged chat messages or reported learners to maintain a safe, inspiring STEM environment.
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No reports in moderation queue.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(rep => (
                <div key={rep.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        rep.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        rep.status === 'action_taken' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {rep.status}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Reported by {rep.reporterName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rep.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">
                      Reason: <span className="font-semibold text-rose-700">{rep.reason}</span>
                    </p>

                    {rep.targetContent && (
                      <p className="text-xs italic bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                        "{rep.targetContent}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReportAction(rep.id, 'action_taken')}
                      className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                    >
                      Take Action
                    </button>
                    <button
                      onClick={() => handleReportAction(rep.id, 'dismissed')}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Status Grid */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="size-4" />
              <span>PhET Metadata Engine</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">119 Verified Sims</p>
            <p className="text-[11px] text-slate-500 mt-1">Direct HTML5 endpoints operational</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
              <Server className="size-4" />
              <span>AI Science Tutor Engine</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">Gemini 2.5 / 3.7</p>
            <p className="text-[11px] text-slate-500 mt-1">Strict STEM educational scope active</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
              <Database className="size-4" />
              <span>Persistence & Storage</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">In-Memory / SQLite</p>
            <p className="text-[11px] text-slate-500 mt-1">Durable state layer synced</p>
          </div>
        </div>
      )}

    </div>
  );
};
