import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  GraduationCap, 
  Plus, 
  Send, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play,
  X,
  Sparkles
} from 'lucide-react';
import { TeacherActivity, Simulation, Subject, Difficulty, ActivityStatus } from '../types.js';
import { useUser } from '../hooks/useUser.js';

export const TeacherPage: React.FC = () => {
  const { authFetch } = useUser();
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TeacherActivity | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSimId, setFormSimId] = useState('');
  const [formSubject, setFormSubject] = useState<Subject>('Physics');
  const [formGrade, setFormGrade] = useState('6-8');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('Exploratory');
  const [formObjective, setFormObjective] = useState('');
  const [formQuestions, setFormQuestions] = useState<string[]>(['']);
  const [formTemplate, setFormTemplate] = useState<'guided-inquiry' | 'concept-challenge' | 'free-exploration' | 'lab-worksheet'>('guided-inquiry');

  const loadData = async () => {
    setLoading(true);
    try {
      const [actRes, simRes] = await Promise.all([
        authFetch('/api/teacher/simulations'),
        fetch('/api/simulations')
      ]);

      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData);
      }
      if (simRes.ok) {
        const simData = await simRes.json();
        setSimulations(simData.items || []);
        if (simData.items?.length > 0 && !formSimId) {
          setFormSimId(simData.items[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load teacher data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormSimId(simulations[0]?.id || 'gravity-and-orbits');
    setFormSubject('Physics');
    setFormGrade('6-8');
    setFormDifficulty('Exploratory');
    setFormObjective('');
    setFormQuestions(['']);
    setFormTemplate('guided-inquiry');
    setShowModal(true);
  };

  const openEditModal = (act: TeacherActivity) => {
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormSimId(act.simulationId);
    setFormSubject(act.subject);
    setFormGrade(act.grade);
    setFormDifficulty(act.difficulty);
    setFormObjective(act.objective);
    setFormQuestions(act.questions && act.questions.length > 0 ? act.questions : ['']);
    setFormTemplate(act.templateId);
    setShowModal(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formTitle,
      simulationId: formSimId,
      subject: formSubject,
      grade: formGrade,
      difficulty: formDifficulty,
      objective: formObjective,
      questions: formQuestions.filter(q => q.trim().length > 0),
      templateId: formTemplate
    };

    try {
      if (editingActivity) {
        await authFetch(`/api/teacher/simulations/${editingActivity.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await authFetch('/api/teacher/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to save activity:', err);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      await authFetch(`/api/teacher/simulations/${id}/submit`, { method: 'POST' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await authFetch(`/api/teacher/simulations/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
            <CheckCircle2 className="size-3" />
            Approved
          </span>
        );
      case 'submitted':
      case 'under_review':
        return (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
            <Clock className="size-3" />
            In Review
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
            <AlertCircle className="size-3" />
            Needs Revision
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
            Draft
          </span>
        );
    }
  };

  const draftsCount = activities.filter(a => a.status === 'draft').length;
  const inReviewCount = activities.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const approvedCount = activities.filter(a => a.status === 'approved').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <GraduationCap className="size-3.5 text-indigo-600" />
            <span>Curriculum Studio</span>
          </div>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-800">
            Teacher Activity Studio
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Design guided inquiry lesson plans, experiments, and reflection questions for students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-950 hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <Sparkles className="size-4" />
            <span>Launch Simulation Studio</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            id="button-create-activity"
          >
            <Plus className="size-4" />
            <span>Create Lab Worksheet</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Activities</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{activities.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Drafts</p>
          <p className="mt-1 text-2xl font-bold text-slate-600">{draftsCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Under Review</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{inReviewCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Approved & Live</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{approvedCount}</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">
          Lesson Plans & Inquiry Activities
        </h3>

        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
        ) : activities.length > 0 ? (
          <div className="grid gap-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center hover:border-slate-300"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(act.status)}
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {act.subject}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      Grade {act.grade}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-800">
                    {act.title}
                  </h4>

                  <p className="text-xs text-slate-500">
                    Anchored to: <strong className="text-slate-700">{act.simulationTitle}</strong> • {act.templateId.replace('-', ' ')}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {act.objective}
                  </p>

                  {act.feedback && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
                      <strong>Review Note:</strong> {act.feedback}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={`/simulations/${act.simulationId}/play`}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Run Lab</span>
                  </Link>

                  <button
                    onClick={() => openEditModal(act)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Edit</span>
                  </button>

                  {act.status === 'draft' && (
                    <button
                      onClick={() => handleSubmitForReview(act.id)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                    >
                      <Send className="size-3.5" />
                      <span>Submit for Review</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(act.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete activity"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <GraduationCap className="mx-auto size-10 text-indigo-600" />
            <h4 className="mt-3 text-base font-bold text-slate-800">
              No activities created yet
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Create your first guided inquiry lesson anchored to any simulation in our catalog.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              <span>Create First Activity</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingActivity ? 'Edit Lab Activity' : 'Create Guided Lab Activity'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="mt-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="E.g. Forces & Velocity Analysis"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Simulation
                  </label>
                  <select
                    value={formSimId}
                    onChange={(e) => {
                      setFormSimId(e.target.value);
                      const s = simulations.find(item => item.id === e.target.value);
                      if (s) setFormSubject(s.subject);
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none"
                  >
                    {simulations.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Template
                  </label>
                  <select
                    value={formTemplate}
                    onChange={(e) => setFormTemplate(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none"
                  >
                    <option value="guided-inquiry">Guided Inquiry (Observe & Predict)</option>
                    <option value="concept-challenge">Concept Challenge (Aha Moments)</option>
                    <option value="lab-worksheet">Lab Worksheet (Variables & Calculations)</option>
                    <option value="free-exploration">Free Exploration Prompt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Math">Math</option>
                    <option value="Biology">Biology</option>
                    <option value="Earth Science">Earth Science</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900"
                  >
                    <option value="K-2">Grades K–2</option>
                    <option value="3-5">Grades 3–5</option>
                    <option value="6-8">Grades 6–8</option>
                    <option value="9-12">Grades 9–12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900"
                  >
                    <option value="Exploratory">Exploratory</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Learning Objective
                </label>
                <textarea
                  rows={2}
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  placeholder="What concepts should students explore and verify?"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Discussion Questions
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormQuestions([...formQuestions, ''])}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-2">
                  {formQuestions.map((q, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const copy = [...formQuestions];
                          copy[idx] = e.target.value;
                          setFormQuestions(copy);
                        }}
                        placeholder={`Question ${idx + 1}...`}
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900"
                      />
                      {formQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormQuestions(formQuestions.filter((_, i) => i !== idx))}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  {editingActivity ? 'Save Changes' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
