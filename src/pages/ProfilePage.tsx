import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  User as UserIcon, 
  Crown, 
  GraduationCap, 
  ShieldCheck, 
  Compass, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Calendar, 
  Bookmark, 
  Activity, 
  Award, 
  Sparkles, 
  BookOpen, 
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Layers,
  Info,
  Loader2
} from 'lucide-react';
import { useUser } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';
import { Subject } from '../types.js';

const GRADE_NUMBERS = ['5', '6', '7', '8', '9', '10', '11'];
const SECTION_LETTERS = ['A', 'B', 'D', 'E', 'F', 'G', 'T'];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isTeacher, isAdmin, isSuperAdmin, favorites, isAuthInitializing } = useUser();
  const { t, language } = useI18n();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [grade, setGrade] = useState(user.grade || '9-A');
  const [subject, setSubject] = useState<Subject>(user.subject || 'Physics');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local form inputs when user rehydrates from Clerk / DB
  useEffect(() => {
    if (!isEditing) {
      setName(user.name);
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setGrade(user.grade || '9-A');
      setSubject((user.subject as Subject) || 'Physics');
    }
  }, [user, isEditing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar,
        grade: isTeacher ? grade : grade,
        subject: (isTeacher || isAdmin || isSuperAdmin) ? subject : undefined
      });
      setIsEditing(false);
      setSuccessMessage(t('saved_successfully'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = (role || 'STUDENT').toUpperCase();
    if (r === 'SUPER_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700 shadow-xs">
          <Crown className="size-3.5" />
          {t('role_super_admin')}
        </span>
      );
    }
    if (r === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
          <ShieldCheck className="size-3.5" />
          {t('role_admin')}
        </span>
      );
    }
    if (r === 'TEACHER') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 shadow-xs">
          <GraduationCap className="size-3.5" />
          {t('role_teacher')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 shadow-xs">
        <Compass className="size-3.5" />
        {t('role_student')}
      </span>
    );
  };

  const formattedJoinDate = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    day: 'numeric'
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm animate-fade-in">
          <CheckCircle2 className="size-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Banner Graphic Header */}
        <div className="h-32 bg-gradient-to-r from-indigo-900 via-indigo-700 to-purple-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        </div>

        {/* User Info Bar */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 mb-4">
            
            {/* Avatar & Photo Upload */}
            <div className="relative group">
              <div className="size-28 rounded-2xl border-4 border-white bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                {avatar || user.avatar ? (
                  <img
                    src={avatar || user.avatar}
                    alt={user.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserIcon className="size-12 text-slate-400" />
                )}
              </div>
              
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                  >
                    <Camera className="size-6" />
                    <span className="text-[10px] font-bold mt-1">{t('profile_change_photo')}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setName(user.name);
                    setUsername(user.username || '');
                    setBio(user.bio || '');
                    setAvatar(user.avatar || '');
                    setGrade(user.grade || '9-A');
                    setSubject(user.subject || 'Physics');
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                  id="button-edit-profile"
                >
                  <Edit3 className="size-4 text-indigo-600" />
                  <span>{t('profile_edit_btn')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    <X className="size-4" />
                    <span>{t('profile_cancel_btn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    <Save className="size-4" />
                    <span>{saving ? t('loading') : t('profile_save_btn')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details Form or View */}
          {!isEditing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                {getRoleBadge(user.role)}
                
                {/* Grade Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                  <Layers className="size-3.5 text-indigo-600" />
                  <span>{user.grade === 'all' ? (language === 'uz' ? 'Barcha sinflar (Default)' : 'All Grades (Default)') : `${user.grade} sinf`}</span>
                </span>

                {user.subject && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    <BookOpen className="size-3.5 text-indigo-600" />
                    <span>{user.subject}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="font-mono text-slate-700 font-semibold">@{user.username || user.email?.split('@')[0] || 'user'}</span>
                {user.email && (
                  <>
                    <span>•</span>
                    <span>{user.email}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {t('profile_joined_date')}: {formattedJoinDate}
                </span>
              </div>

              {user.bio ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-600 max-w-2xl">
                  {user.bio}
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-slate-400">
                  {t('profile_bio_placeholder')}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('auth_display_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('auth_username')}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Grade Selector (Student and Teacher) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth_grade_select')}
                </label>
                {isTeacher && (
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setGrade('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        grade === 'all'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      ✓ {language === 'uz' ? 'Barcha sinflar (Ustoz default)' : 'All Grades (Teacher default)'}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      {language === 'uz' ? 'Sinf raqami (5-11):' : 'Grade (5-11):'}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {GRADE_NUMBERS.map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            const sec = grade.includes('-') ? grade.split('-')[1] : 'A';
                            setGrade(`${num}-${sec}`);
                          }}
                          className={`py-1 text-center rounded-lg text-xs font-bold transition ${
                            grade.startsWith(`${num}-`)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      {language === 'uz' ? 'Harf (A, B, D, E, F, G, T):' : 'Section (A, B, D, E, F, G, T):'}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {SECTION_LETTERS.map(letter => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => {
                            const num = grade.includes('-') ? grade.split('-')[0] : '9';
                            setGrade(`${num}-${letter}`);
                          }}
                          className={`py-1 text-center rounded-lg text-xs font-bold transition ${
                            grade.endsWith(`-${letter}`)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {(isTeacher || isAdmin || isSuperAdmin) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('auth_subject_select')}
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    className="w-full sm:w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Math">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Geography">Geography</option>
                    <option value="Earth Science">Earth Science</option>
                    <option value="IT / Computer Science">IT / Computer Science</option>
                    <option value="Robotics">Robotics</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('profile_bio_placeholder')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Stats and Learning Activity Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="size-5 text-indigo-600" />
          <span>{t('profile_stats_title')}</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('profile_sims_explored')}
              </span>
              <Sparkles className="size-4" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {user.learningActivity?.simulationsExplored || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">PhET HTML5 Interactive Labs</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('profile_saved_count')}
              </span>
              <Bookmark className="size-4" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {favorites.size}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Saved for fast access</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('profile_inquiries_done')}
              </span>
              <Award className="size-4" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {user.learningActivity?.inquiriesCompleted || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Completed Inquiry Labs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
