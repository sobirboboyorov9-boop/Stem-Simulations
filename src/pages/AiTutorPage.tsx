import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  Lightbulb, 
  Calculator, 
  Target, 
  Globe, 
  Check, 
  BookOpen, 
  Compass,
  AlertCircle,
  Search,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  HelpCircle,
  Copy,
  ThumbsUp,
  FlaskConical,
  GraduationCap,
  PanelLeftClose,
  PanelLeft,
  Lock,
  LogIn
} from 'lucide-react';
import { useUser } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';
import { AiConversation, Subject } from '../types.js';
import { AiMessageRenderer } from '../components/AiMessageRenderer.js';

const SUBJECT_LIST: Subject[] = [
  'Physics',
  'Chemistry',
  'Math',
  'Biology',
  'Geography',
  'IT / Computer Science',
  'Robotics'
];

export const AiTutorPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useUser();
  const { t, language } = useI18n();

  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [activeConv, setActiveConv] = useState<AiConversation | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics');
  const [mode, setMode] = useState<'explain' | 'formula' | 'challenge' | 'realworld'>('explain');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Renaming state
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  // Audio Speech Synthesis state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Copied indicator
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        const uid = user?.id || 'user_super_admin';
        const res = await fetch('/api/ai/conversations', {
          headers: { 'x-user-id': uid }
        });
        if (res.ok) {
          const list: AiConversation[] = await res.json();
          setConversations(list);
          if (list.length > 0) {
            setActiveConvId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load AI conversations:', err);
      }
    }
    loadConversations();
  }, [user?.id]);

  // Load active conversation
  useEffect(() => {
    if (!activeConvId) return;
    async function loadActive() {
      try {
        const uid = user?.id || 'user_super_admin';
        const res = await fetch(`/api/ai/conversations/${activeConvId}`, {
          headers: { 'x-user-id': uid }
        });
        if (res.ok) {
          const data: AiConversation = await res.json();
          setActiveConv(data);
          if (data.subject) setSelectedSubject(data.subject);
          scrollToBottom(true);
        }
      } catch (err) {
        console.error('Failed to load active conversation:', err);
      }
    }
    loadActive();
  }, [activeConvId, user?.id]);

  const scrollToBottom = (instant = false) => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: instant ? 'auto' : 'smooth'
        });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
      }
    }, 50);
  };

  const handleNewConversation = async () => {
    try {
      const defaultTitle = language === 'uz' 
        ? `Yangi ${selectedSubject} suhbati`
        : `New ${selectedSubject} Chat`;

      const uid = user?.id || 'user_super_admin';
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': uid
        },
        body: JSON.stringify({
          title: defaultTitle,
          subject: selectedSubject
        })
      });

      if (res.ok) {
        const created: AiConversation = await res.json();
        setConversations(prev => [created, ...prev]);
        setActiveConvId(created.id);
        setActiveConv(created);
      }
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(language === 'uz' ? 'Ushbu suhbatni o‘chirmoqchimisiz?' : 'Delete this conversation?')) return;

    try {
      const uid = user?.id || 'user_super_admin';
      const res = await fetch(`/api/ai/conversations/${id}`, { 
        method: 'DELETE',
        headers: { 'x-user-id': uid }
      });
      if (res.ok) {
        const updated = conversations.filter(c => c.id !== id);
        setConversations(updated);
        if (activeConvId === id) {
          if (updated.length > 0) {
            setActiveConvId(updated[0].id);
          } else {
            handleNewConversation();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleClearChat = async () => {
    if (!activeConvId) return;
    if (!confirm(language === 'uz' ? 'Suhbat xabarlarini tozalashni xohlaysizmi?' : 'Clear chat messages?')) return;

    try {
      const uid = user?.id || 'user_super_admin';
      const res = await fetch(`/api/ai/conversations/${activeConvId}/clear`, { 
        method: 'POST',
        headers: { 'x-user-id': uid }
      });
      if (res.ok) {
        if (activeConv) {
          setActiveConv({ ...activeConv, messages: [] });
        }
      }
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const handleExportChat = () => {
    if (!activeConv) return;
    const text = activeConv.messages.map(m => `### ${m.role === 'user' ? 'Siz' : 'STEM-Simulations AI'} (${m.timestamp}):\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'stem_simulations_chat'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRename = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;

    try {
      const uid = user?.id || 'user_super_admin';
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': uid
        },
        body: JSON.stringify({ title: editedTitle.trim() })
      });

      if (res.ok) {
        const updated: AiConversation = await res.json();
        setConversations(prev => prev.map(c => c.id === id ? updated : c));
        if (activeConv?.id === id) {
          setActiveConv(updated);
        }
        setEditingTitleId(null);
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\$#\*`_]+/g, ' ').slice(0, 400);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuery || input;
    if (!queryText.trim() || loading || !activeConvId) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Optimistically update UI
    if (activeConv) {
      const optimisticMsg = {
        id: `usr_${Date.now()}`,
        role: 'user' as const,
        content: queryText.trim(),
        timestamp: userTimestamp
      };
      setActiveConv({
        ...activeConv,
        messages: [...activeConv.messages, optimisticMsg]
      });
    }

    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const uid = user?.id || 'user_super_admin';
      const res = await fetch(`/api/ai/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': uid
        },
        body: JSON.stringify({
          content: queryText.trim(),
          mode,
          subject: selectedSubject
        })
      });

      if (res.ok) {
        const aiMsg = await res.json();
        if (activeConv) {
          setActiveConv(prev => prev ? {
            ...prev,
            messages: [...prev.messages, aiMsg]
          } : null);
        }
        // Refresh conversation list to update titles if changed
        const convListRes = await fetch('/api/ai/conversations', {
          headers: { 'x-user-id': uid }
        });
        if (convListRes.ok) {
          const list = await convListRes.json();
          setConversations(list);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const fallbackMsg = {
          id: `err_${Date.now()}`,
          role: 'assistant' as const,
          content: errData.error || (language === 'uz' 
            ? 'Kechirasiz, xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.'
            : 'Sorry, a temporary network error occurred. Please try again.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        if (activeConv) {
          setActiveConv(prev => prev ? {
            ...prev,
            messages: [...prev.messages, fallbackMsg]
          } : null);
        }
      }
    } catch (err) {
      console.error('AI message send error:', err);
      const networkErrMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant' as const,
        content: language === 'uz'
          ? 'Tarmoqqa ulanishda uzilish bo‘ldi. Iltimos, qaytadan yuboring.'
          : 'Network connection interrupted. Please try re-sending your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (activeConv) {
        setActiveConv(prev => prev ? {
          ...prev,
          messages: [...prev.messages, networkErrMsg]
        } : null);
      }
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Guest Access Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 via-white to-white p-8 sm:p-12 text-center shadow-lg">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
            <Lock className="size-10" />
          </div>
          <span className="rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-bold text-indigo-700">
            {language === 'uz' ? 'Autentifikatsiya Talab Qilinadi' : 'Authentication Required'}
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900">
            {language === 'uz' ? 'STEM-Simulations AI Tyutoriga Xush Kelibsiz!' : 'Welcome to STEM-Simulations AI Tutor!'}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 leading-relaxed">
            {language === 'uz' 
              ? 'Mehmon rejimida AI Tyutor va ilmiy muloqotdan foydalanib bo‘lmaydi. Barcha fanlar bo‘yicha formulasozlik, tushuntirish va suhbatlar tarixini saqlash uchun iltimos hisobingizga kiring yoki ro‘yxatdan o‘ting.'
              : 'AI Science Tutor is restricted for guests. Please log in or create an account to unlock interactive pedagogical explanations, formula generation, and synchronized chat history.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition cursor-pointer"
            >
              <LogIn className="size-4" />
              <span>{language === 'uz' ? 'Tizimga Kirish' : 'Sign In'}</span>
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <span>{language === 'uz' ? 'Ro‘yxatdan O‘tish' : 'Create Account'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Header Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <span>{t('ai_tutor_title')}</span>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-700">
              Gemini 3.7 Pro STEM
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('ai_tutor_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* History Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            title={isSidebarOpen ? (language === 'uz' ? 'Tarix panelini yopish' : 'Hide History') : (language === 'uz' ? 'Tarix panelini ochish' : 'Show History')}
          >
            {isSidebarOpen ? <PanelLeftClose className="size-4 text-slate-500" /> : <PanelLeft className="size-4 text-indigo-600" />}
            <span>{isSidebarOpen ? (language === 'uz' ? 'Tarixni yashirish' : 'Hide History') : (language === 'uz' ? 'Tarixni ko‘rish' : 'Show History')}</span>
          </button>

          <button
            onClick={handleNewConversation}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{t('ai_tutor_new_chat')}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout (Collapsible Left Sidebar + Flexible Main Area) */}
      <div className="flex h-[760px] max-h-[85vh] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* Left Sidebar: Past Conversations */}
        {isSidebarOpen && (
          <div className="w-80 md:w-84 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/70 h-full min-h-0 overflow-hidden transition-all duration-300">
            
            {/* Search box & Chat count */}
            <div className="shrink-0 p-3 border-b border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('ai_tutor_conversations')}
                  </span>
                  <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {conversations.length}
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="size-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="size-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('ai_tutor_search_chats')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 overscroll-contain">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <MessageSquare className="size-8 text-slate-300 mx-auto mb-2 opacity-60" />
                  <p>{t('ai_tutor_no_chats')}</p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isActive = conv.id === activeConvId;
                  const isRenaming = editingTitleId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full group flex items-center justify-between rounded-xl p-3 text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50/90 border border-indigo-200 text-indigo-900 shadow-2xs font-semibold'
                          : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className={`size-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        
                        {isRenaming ? (
                          <form onSubmit={(e) => handleRename(conv.id, e)} className="flex-1 mr-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              autoFocus
                              onBlur={() => setEditingTitleId(null)}
                              className="w-full rounded-md border border-indigo-300 bg-white px-2 py-1 text-xs outline-none"
                            />
                          </form>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold truncate">
                              {conv.title}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {conv.subject || 'Physics'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions (Rename, Delete) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(conv.id);
                            setEditedTitle(conv.title);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                          title="Rename"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Subject Focus Selector at Bottom of Sidebar */}
            <div className="shrink-0 p-3 border-t border-slate-200 bg-white">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                {language === 'uz' ? 'Asosiy Fan Yo‘nalishi' : 'Subject Focus'}
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                {SUBJECT_LIST.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Right Area: Conversation Messages & Input (Stretches 100% when collapsed) */}
        <div className="flex-1 flex flex-col bg-slate-900 text-slate-200 h-full min-h-0 overflow-hidden">
          
          {/* Top Bar with Modes & Controls */}
          <div className="shrink-0 flex flex-wrap items-center justify-between border-b border-slate-800 px-4 sm:px-6 py-3 bg-slate-950/90 gap-3">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Show History Sidebar"
                >
                  <PanelLeft className="size-4 text-indigo-400" />
                  <span className="text-[11px] font-bold hidden sm:inline">{language === 'uz' ? 'Tarix' : 'History'}</span>
                </button>
              )}
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-4 text-indigo-400" />
                  <span className="truncate max-w-[200px] sm:max-w-md">{activeConv?.title || 'Open STEM Consultation'}</span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  {selectedSubject} • {language === 'uz' ? 'Tabiiy va Aniq Fanlar Tyutori' : 'Academic Science & STEM Mentor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mode Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMode('explain')}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                    mode === 'explain' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('ai_tutor_preset_explain')}
                </button>
                <button
                  onClick={() => setMode('formula')}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                    mode === 'formula' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('ai_tutor_preset_formula')}
                </button>
                <button
                  onClick={() => setMode('challenge')}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                    mode === 'challenge' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('ai_tutor_preset_challenge')}
                </button>
              </div>

              {/* Utility Tools: Clear & Export */}
              <button
                onClick={handleClearChat}
                title={language === 'uz' ? 'Xabarlarni tozalash' : 'Clear Chat'}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                onClick={handleExportChat}
                title={language === 'uz' ? 'Suhbatni yuklab olish' : 'Export Chat'}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <Download className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
            {activeConv && activeConv.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="size-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="size-6" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    {language === 'uz' ? 'STEM-Simulations AI bilan suhbatni boshlang' : 'Start your inquiry with STEM-Simulations AI'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'uz' 
                      ? 'Fizika, Kimyo, Biologiya, Matematika yoki Dasturlash bo‘yicha istalgan savolingizni bering. Istasangiz, oddiy so‘zlar bilan tushuntirishni so‘rang!'
                      : 'Ask anything about physics, chemistry, biology, math, algorithms, or natural science! Ask for simpler wording anytime.'}
                  </p>
                </div>

                {/* Quick starter cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full mt-2">
                  <button
                    onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Gravitatsiya qonuni va uning formulasini oddiy qilib tushuntirib bering.' : 'Explain the law of gravity and its formula in simple terms.')}
                    className="p-3 text-left rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/60 hover:bg-slate-900 transition text-xs space-y-1 text-slate-300"
                  >
                    <span className="font-bold text-indigo-400 block">
                      {language === 'uz' ? '⚡ Gravitatsiya qonuni' : '⚡ Law of Gravity'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {language === 'uz' ? 'Formulasi va amaliy misollar' : 'Formula and real-world examples'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Fotosintez nima va u biologik jihatdan qanday bosqichlarda kechadi?' : 'What is photosynthesis and what are its core biological stages?')}
                    className="p-3 text-left rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/60 hover:bg-slate-900 transition text-xs space-y-1 text-slate-300"
                  >
                    <span className="font-bold text-emerald-400 block">
                      {language === 'uz' ? '🌿 Fotosintez jarayoni' : '🌿 Photosynthesis'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {language === 'uz' ? 'Yorug‘lik va qorong‘ulik bosqichlari' : 'Light and dark reaction stages'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Pifagor teoremasining isboti va amaliy tadbiqini ko‘rsatib ber.' : 'Show the proof and practical application of the Pythagorean Theorem.')}
                    className="p-3 text-left rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/60 hover:bg-slate-900 transition text-xs space-y-1 text-slate-300"
                  >
                    <span className="font-bold text-amber-400 block">
                      {language === 'uz' ? '📐 Pifagor teoremasi' : '📐 Pythagorean Theorem'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {language === 'uz' ? 'Geometrik isboti va formulasi' : 'Geometric proof and formula'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Kompyuter qanday qilib ikkilik sanoq sistemasida (0 va 1) hisoblaydi?' : 'How does a computer calculate using binary (0 and 1)?')}
                    className="p-3 text-left rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/60 hover:bg-slate-900 transition text-xs space-y-1 text-slate-300"
                  >
                    <span className="font-bold text-cyan-400 block">
                      {language === 'uz' ? '💻 Ikkilik sanoq tizimi' : '💻 Binary Computation'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {language === 'uz' ? 'Mantiqiy elementlar va tranzistorlar' : 'Logic gates and transistors'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              activeConv && activeConv.messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isUser
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs'
                      }`}
                    >
                      {isUser ? 'U' : <Sparkles className="size-4" />}
                    </div>

                    <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-slate-800/90 border border-slate-700/80 rounded-tl-xs'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <AiMessageRenderer content={msg.content} />
                        )}
                      </div>

                      {/* Message footer tools (Speak, Copy, Timestamp) */}
                      <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <>
                            <button
                              onClick={() => handleSpeakText(msg.id, msg.content)}
                              className={`p-1 rounded hover:bg-slate-800 transition ${
                                speakingMsgId === msg.id ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                              }`}
                              title={speakingMsgId === msg.id ? 'Ovozni to‘xtatish' : 'Tinglash / Listen'}
                            >
                              {speakingMsgId === msg.id ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
                            </button>
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                              title="Nusxa olish"
                            >
                              {copiedMsgId === msg.id ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white animate-pulse">
                  <Sparkles className="size-4" />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-slate-700/80 bg-slate-800/90 p-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-indigo-400 animate-bounce" />
                    <div className="size-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="size-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-2 font-mono text-[11px] text-indigo-300">
                      {language === 'uz' ? 'Ilmiy tahlil va mantiqiy xulosalar shakllanmoqda...' : 'Formulating conversational STEM analysis...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-Up Inquiry Chips */}
          <div className="shrink-0 flex items-center gap-2 overflow-x-auto border-t border-slate-800 bg-slate-950/40 p-2.5 px-6">
            <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">
              {language === 'uz' ? 'Tezkor murojaat:' : 'Quick Follow-up:'}
            </span>
            <button
              onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Buni yana ham oddiyroq, tushunarli so‘zlar bilan tushuntirib bera olasizmi?' : 'Can you explain this even simpler with everyday analogies?')}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-indigo-300 hover:bg-slate-700 whitespace-nowrap transition flex items-center gap-1"
            >
              <Lightbulb className="size-3" />
              <span>{language === 'uz' ? 'Oddiyroq tushuntir' : 'Simpler wording'}</span>
            </button>
            <button
              onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Bunga hayotdan yoki zamonaviy texnologiyadan aniq bir misol keltiring.' : 'Give a real-world everyday or modern technology example of this.')}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-slate-700 whitespace-nowrap transition flex items-center gap-1"
            >
              <Globe className="size-3" />
              <span>{language === 'uz' ? 'Hayotiy misol' : 'Real-world example'}</span>
            </button>
            <button
              onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Mavzuni tushunganimni tekshirish uchun menga 2 ta sinov savoli bering.' : 'Ask me 2 quick test questions to verify if I understood.')}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-amber-300 hover:bg-slate-700 whitespace-nowrap transition flex items-center gap-1"
            >
              <HelpCircle className="size-3" />
              <span>{language === 'uz' ? 'Menga savol ber' : 'Quiz me'}</span>
            </button>
            <button
              onClick={() => handleSendMessage(undefined, language === 'uz' ? 'Ushbu qonuniyatning matematik formulasi va o‘lchov birliklarini ko‘rsatib bering.' : 'Show the mathematical formula, derivation, and standard units.')}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-purple-300 hover:bg-slate-700 whitespace-nowrap transition flex items-center gap-1"
            >
              <Calculator className="size-3" />
              <span>{language === 'uz' ? 'Formulasi qanday?' : 'Show formula'}</span>
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="shrink-0 border-t border-slate-800 p-4 bg-slate-950">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('ai_tutor_input_placeholder')}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex items-center justify-center rounded-xl bg-indigo-600 p-2.5 text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};
