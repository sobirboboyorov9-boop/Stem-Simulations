import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Plus, 
  Hash, 
  User as UserIcon, 
  ShieldAlert, 
  Smile, 
  Sparkles, 
  Paperclip, 
  MoreVertical, 
  Flag, 
  Trash2, 
  Search, 
  Volume2, 
  GraduationCap, 
  Check, 
  CheckCheck,
  AlertCircle,
  X,
  Filter,
  School,
  Edit3,
  Lock,
  LogIn
} from 'lucide-react';
import { useUser } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';
import { CommunityConversation, CommunityMessage, Subject, Simulation } from '../types.js';

const AVAILABLE_EMOJIS = ['👍', '🔬', '💡', '👏', '❤️', '🔥'];
const GRADES_LIST = ['5', '6', '7', '8', '9', '10', '11'];
const CLASS_SECTIONS = ['A', 'B', 'D', 'V', 'G', 'E'];
const POPULAR_CLASSES = [
  '5-A', '5-B', '6-A', '6-B',
  '7-A', '7-B', '8-A', '8-B',
  '9-A', '9-B', '9-D', '9-V',
  '10-A', '10-B', '11-A', '11-B'
];

export const CommunityChatPage: React.FC = () => {
  const { user, setUserGrade, isTeacher, isAdmin, isSuperAdmin, isAuthenticated, openAuthModal, authFetch } = useUser();
  const { t, language } = useI18n();

  const [conversations, setConversations] = useState<CommunityConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Grade Filter for teachers / admins
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>(user.grade || 'all');
  const [showChangeGradeModal, setShowChangeGradeModal] = useState(false);
  const [customGradeInput, setCustomGradeInput] = useState('');

  // New channel modal
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelSubject, setNewChannelSubject] = useState<Subject>('Physics');
  const [newChannelGrade, setNewChannelGrade] = useState<string>(user.grade || '9-A');

  // Report Modal
  const [reportModalMessage, setReportModalMessage] = useState<CommunityMessage | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Simulation picker attachment
  const [showSimPicker, setShowSimPicker] = useState(false);
  const [allSims, setAllSims] = useState<Simulation[]>([]);
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPrivileged = isTeacher || isAdmin || isSuperAdmin;
  const hasGrade = Boolean(user?.grade);

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const queryParam = isPrivileged && selectedGradeFilter !== 'all' ? `?grade=${selectedGradeFilter}` : '';
        const res = await authFetch(`/api/community/conversations${queryParam}`);
        if (res.ok) {
          const list: CommunityConversation[] = await res.json();
          setConversations(list);
          if (list.length > 0) {
            setActiveConvId(prev => {
              if (prev && list.some(c => c.id === prev)) {
                return prev;
              }
              return list[0].id;
            });
          } else {
            setActiveConvId('');
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [user?.id, user?.grade, selectedGradeFilter, isPrivileged, authFetch]);

  const handleSelectGrade = async (grade: string) => {
    try {
      await setUserGrade(grade);
      setShowChangeGradeModal(false);
    } catch (err) {
      console.error('Failed to update user grade:', err);
    }
  };

  // Load simulations for attachment
  useEffect(() => {
    async function loadSims() {
      try {
        const res = await fetch('/api/simulations');
        if (res.ok) {
          const data = await res.json();
          setAllSims(data.items || []);
        }
      } catch (e) {
        // ignore
      }
    }
    loadSims();
  }, []);

  // Load active conversation messages
  useEffect(() => {
    if (!activeConvId) return;
    async function loadMessages() {
      try {
        const res = await authFetch(`/api/community/conversations/${activeConvId}/messages`);
        if (res.ok) {
          const data: CommunityMessage[] = await res.json();
          setMessages(data);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    }
    loadMessages();
  }, [activeConvId, authFetch]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedSim) return;
    if (!activeConvId) return;

    setSending(true);
    try {
      const res = await authFetch(`/api/community/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputText.trim(),
          isAnnouncement,
          simulationAttachment: selectedSim ? {
            id: selectedSim.id,
            title: selectedSim.title,
            subject: selectedSim.subject,
            thumbnail: selectedSim.thumbnail
          } : undefined
        })
      });

      if (res.ok) {
        const newMsg: CommunityMessage = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setSelectedSim(null);
        setIsAnnouncement(false);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await authFetch(`/api/community/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, emoji })
      });

      if (res.ok) {
        const updatedMsg: CommunityMessage = await res.json();
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      }
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await authFetch(`/api/community/messages/${messageId}?conversationId=${activeConvId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const res = await authFetch('/api/community/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName.trim(),
          type: 'group',
          subject: newChannelSubject,
          grade: newChannelGrade,
          description: newChannelDesc.trim()
        })
      });

      if (res.ok) {
        const created: CommunityConversation = await res.json();
        setConversations(prev => [created, ...prev]);
        setActiveConvId(created.id);
        setShowNewChannelModal(false);
        setNewChannelName('');
        setNewChannelDesc('');
      }
    } catch (err) {
      console.error('Create channel error:', err);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalMessage || !reportReason.trim()) return;

    try {
      const res = await authFetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'message',
          targetId: reportModalMessage.id,
          targetContent: reportModalMessage.content,
          reason: reportReason.trim()
        })
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setReportModalMessage(null);
          setReportReason('');
        }, 1500);
      }
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.subject && c.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // If user is a student and has NO grade set, show the Grade Gating Prompt
  if (isAuthenticated && !isPrivileged && !hasGrade) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-100 bg-linear-to-b from-indigo-50/60 to-white p-8 sm:p-12 text-center shadow-lg">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md mb-6">
            <School className="size-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('community_grade_gate_title')}
          </h2>

          <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {t('community_grade_gate_desc')}
          </p>

          {/* Granular Grade & Section Selector */}
          <div className="mt-8 max-w-xl mx-auto space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                {language === 'uz' ? 'Ommabop sinflar (Bir marta bosish orqali):' : 'Popular Classes:'}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_CLASSES.map(cls => (
                  <button
                    key={cls}
                    onClick={() => handleSelectGrade(cls)}
                    className="rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-bold text-indigo-900 shadow-2xs hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition"
                  >
                    {cls} sinf
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Class Builder */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                {language === 'uz' ? 'Yoki aniq sinf va harfni tanlang:' : 'Or choose specific grade and letter:'}
              </span>
              
              <div className="grid grid-cols-7 gap-1.5">
                {GRADES_LIST.map(grade => (
                  <button
                    key={grade}
                    onClick={() => {
                      const letter = customGradeInput.split('-')[1] || 'A';
                      setCustomGradeInput(`${grade}-${letter}`);
                    }}
                    className={`py-1.5 text-center rounded-lg text-xs font-bold transition border ${
                      customGradeInput.startsWith(grade)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">
                  {language === 'uz' ? 'Harf:' : 'Section:'}
                </span>
                {CLASS_SECTIONS.map(letter => (
                  <button
                    key={letter}
                    onClick={() => {
                      const num = customGradeInput.split('-')[0] || '9';
                      setCustomGradeInput(`${num}-${letter}`);
                    }}
                    className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition border ${
                      customGradeInput.endsWith(letter)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={customGradeInput}
                  onChange={(e) => setCustomGradeInput(e.target.value.toUpperCase())}
                  placeholder="masalan: 9-D yoki 9B"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
                <button
                  onClick={() => {
                    if (customGradeInput.trim()) {
                      handleSelectGrade(customGradeInput.trim());
                    }
                  }}
                  disabled={!customGradeInput.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-40"
                >
                  {language === 'uz' ? 'Tasdiqlash' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Header bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="size-6 text-indigo-600" />
              <span>{t('community_title')}</span>
            </h1>

            {/* Current user's grade tag */}
            {user.grade && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                <School className="size-3.5" />
                <span>{user.grade === 'all' ? (language === 'uz' ? 'Barcha sinflar' : 'All Grades') : `${user.grade}-sinf guruhi`}</span>
                {!isPrivileged && (
                  <button
                    onClick={() => {
                      setCustomGradeInput(user.grade || '9-A');
                      setShowChangeGradeModal(true);
                    }}
                    className="ml-1 text-indigo-500 hover:text-indigo-800"
                    title={language === 'uz' ? "Sinfni o'zgartirish" : "Change class"}
                  >
                    <Edit3 className="size-3" />
                  </button>
                )}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1">
            {t('community_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grade filter for privileged users (teachers / admins) */}
          {isPrivileged && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <Filter className="size-3.5 text-slate-500 ml-1.5" />
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none pr-2 py-1 cursor-pointer"
              >
                <option value="all">{language === 'uz' ? 'Barcha sinflar' : 'All Grades'}</option>
                {POPULAR_CLASSES.map(g => (
                  <option key={g} value={g}>{g}-sinf</option>
                ))}
                {GRADES_LIST.map(g => (
                  <option key={g} value={g}>{language === 'uz' ? `${g}-sinf (Umumiy)` : `Grade ${g} (All)`}</option>
                ))}
              </select>
            </div>
          )}

          {isPrivileged && (
            <button
              onClick={() => {
                setNewChannelGrade(user.grade || '9-A');
                setNewChannelName(`${user.grade || '9-A'} ${newChannelSubject} Laboratoriyasi`);
                setShowNewChannelModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="size-4" />
              <span>{t('community_new_channel')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[720px] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* Sidebar Channels List (4 columns) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          
          {/* Search Box */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('community_search_channels')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Channels / Direct Messages List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.map(conv => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition ${
                    isActive
                      ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-900 shadow-xs'
                      : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                      {conv.avatar ? (
                        <img src={conv.avatar} alt={conv.name} className="size-full object-cover" />
                      ) : (
                        <Hash className="size-5 text-slate-600" />
                      )}
                    </div>
                    {conv.type === 'group' && (
                      <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] text-white">
                        #
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold truncate text-slate-900">
                        {conv.name}
                      </h4>
                      {conv.lastMessageTimestamp && (
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessageTimestamp}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {conv.grade && (
                        <span className="rounded-sm bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700">
                          {conv.grade === 'all' ? (language === 'uz' ? 'Umumiy' : 'All') : `${conv.grade}-sinf`}
                        </span>
                      )}
                      {conv.teacherName && (
                        <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                          <GraduationCap className="size-3" />
                          <span className="truncate">{conv.teacherName}</span>
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {conv.lastMessage || conv.description || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                {t('community_no_channels')}
              </div>
            )}
          </div>
        </div>

        {/* Message Area (8 columns) */}
        <div className="md:col-span-8 flex flex-col bg-white">
          
          {/* Active Conversation Top Bar */}
          {activeConv ? (
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Hash className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {activeConv.name}
                    </h3>
                    {activeConv.grade && (
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                        {activeConv.grade === 'all' ? (language === 'uz' ? 'Barcha sinflar' : 'All Grades') : `${activeConv.grade}-sinf`}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeConv.description || `${activeConv.members.length} participants`}
                  </p>
                </div>
              </div>

              {activeConv.teacherName && (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-semibold text-amber-800">
                  <GraduationCap className="size-3.5 text-amber-600" />
                  <span>{activeConv.teacherName}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="border-b border-slate-200 px-6 py-4 text-xs font-semibold text-slate-400">
              Select a conversation
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => {
              const isOwn = msg.senderId === user.id;
              const canDelete = isOwn || isTeacher || isAdmin || isSuperAdmin;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {/* Sender Avatar */}
                  <div className="size-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                    {msg.senderAvatar ? (
                      <img src={msg.senderAvatar} alt={msg.senderName} className="size-full object-cover" />
                    ) : (
                      <UserIcon className="size-4 text-slate-500 m-2" />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`max-w-[75%] space-y-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                    
                    {/* Header info */}
                    <div className={`flex items-center gap-2 text-[11px] ${isOwn ? 'justify-end' : ''}`}>
                      <span className="font-bold text-slate-800">{msg.senderName}</span>
                      {msg.senderRole && (
                        <span className="rounded-xs bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                          {msg.senderRole}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    {/* Announcement Banner tag */}
                    {msg.isAnnouncement && (
                      <div className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                        <Volume2 className="size-3" />
                        <span>ANNOUNCEMENT</span>
                      </div>
                    )}

                    {/* Content Box */}
                    <div
                      className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                        msg.isAnnouncement
                          ? 'border border-amber-300 bg-amber-50/90 text-amber-950'
                          : isOwn
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Attached Simulation Card */}
                      {msg.simulationAttachment && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white text-slate-900 p-2.5 flex items-center gap-3">
                          {msg.simulationAttachment.thumbnail && (
                            <img
                              src={msg.simulationAttachment.thumbnail}
                              alt={msg.simulationAttachment.title}
                              className="size-12 rounded-lg object-cover bg-slate-100"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold uppercase text-indigo-600">
                              {msg.simulationAttachment.subject}
                            </span>
                            <h5 className="text-xs font-bold truncate">
                              {msg.simulationAttachment.title}
                            </h5>
                          </div>
                          <a
                            href={`/sim/${msg.simulationAttachment.id}`}
                            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            Explore
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Reactions & Actions Row */}
                    <div className={`flex items-center gap-1.5 ${isOwn ? 'justify-end' : ''}`}>
                      
                      {/* Active Reaction Pills */}
                      {msg.reactions && Object.entries(msg.reactions).map(([emoji, rawUserIds]) => {
                        const userIds = (rawUserIds as string[]) || [];
                        if (userIds.length === 0) return null;
                        const hasReacted = userIds.includes(user.id);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border transition ${
                              hasReacted
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{userIds.length}</span>
                          </button>
                        );
                      })}

                      {/* Quick Reaction Bar (shows on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-xs">
                        {AVAILABLE_EMOJIS.slice(0, 4).map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="hover:scale-125 transition text-xs p-0.5"
                          >
                            {emoji}
                          </button>
                        ))}

                        {/* Report button */}
                        {!isOwn && (
                          <button
                            onClick={() => setReportModalMessage(msg)}
                            title="Report message"
                            className="p-0.5 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Flag className="size-3" />
                          </button>
                        )}

                        {/* Delete button */}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Delete message"
                            className="p-0.5 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected Simulation Attachment preview */}
          {selectedSim && (
            <div className="border-t border-slate-200 bg-indigo-50/50 p-2.5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Attaching: <strong>{selectedSim.title}</strong> ({selectedSim.subject})
                </span>
              </div>
              <button
                onClick={() => setSelectedSim(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          {!isAuthenticated ? (
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-medium">
                {language === 'uz' ? 'Xabar yozish va muhokamalarda qatnashish uchun hisobingizga kiring.' : 'Sign in to participate in discussions and send messages.'}
              </span>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer shrink-0"
              >
                <LogIn className="size-3.5" />
                <span>{language === 'uz' ? 'Kirish' : 'Sign In'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4 bg-white">
              <div className="flex items-center gap-2">
                
                {/* Attach simulation button */}
                <button
                  type="button"
                  onClick={() => setShowSimPicker(prev => !prev)}
                  className={`rounded-xl p-2 transition ${
                    selectedSim
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                  title="Attach Simulation to discuss"
                >
                  <Paperclip className="size-5" />
                </button>

                {/* Announcement toggle for Teacher/Admin */}
                {(isTeacher || isAdmin || isSuperAdmin) && (
                  <button
                    type="button"
                    onClick={() => setIsAnnouncement(prev => !prev)}
                    className={`rounded-xl p-2 transition text-xs font-bold flex items-center gap-1 ${
                      isAnnouncement
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    title="Toggle official announcement"
                  >
                    <Volume2 className="size-4" />
                  </button>
                )}

                {/* Text Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('community_placeholder')}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={sending || (!inputText.trim() && !selectedSim)}
                  className="flex items-center justify-center rounded-xl bg-indigo-600 p-2.5 text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Simulation Picker Modal */}
      {showSimPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                <span>Attach Simulation to Discussion</span>
              </h3>
              <button onClick={() => setShowSimPicker(false)}>
                <X className="size-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {allSims.map(sim => (
                <button
                  key={sim.id}
                  onClick={() => {
                    setSelectedSim(sim);
                    setShowSimPicker(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-indigo-500 hover:bg-indigo-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={sim.thumbnail} alt={sim.title} className="size-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{sim.title}</h4>
                      <span className="text-[10px] text-slate-500">{sim.subject}</span>
                    </div>
                  </div>
                  <Plus className="size-4 text-indigo-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="size-4 text-indigo-600" />
                <span>{t('community_new_channel')}</span>
              </h3>
              <button onClick={() => setShowNewChannelModal(false)}>
                <X className="size-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject (Fan) *
                </label>
                <select
                  value={newChannelSubject}
                  onChange={(e) => {
                    const subj = e.target.value as Subject;
                    setNewChannelSubject(subj);
                    if (!newChannelName || newChannelName.includes('Laboratoriyasi') || newChannelName.includes('Guruh')) {
                      setNewChannelName(`${newChannelGrade !== 'all' ? `${newChannelGrade} ` : ''}${subj} Laboratoriyasi`);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Physics">Physics (Fizika)</option>
                  <option value="Chemistry">Chemistry (Kimyo)</option>
                  <option value="Math">Mathematics (Matematika)</option>
                  <option value="Biology">Biology (Biologiya)</option>
                  <option value="Geography">Geography (Geografiya)</option>
                  <option value="IT / Computer Science">IT / Computer Science (Informatika)</option>
                  <option value="Robotics">Robotics (Robototexnika)</option>
                </select>
              </div>

              {/* Granular Grade & Section Configuration */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === 'uz' ? 'Guruh / Sinf Darajasi:' : 'Target Grade / Class:'}
                  </label>
                  <span className="rounded-md bg-indigo-600 text-white font-mono px-2 py-0.5 text-[11px] font-bold">
                    {newChannelGrade === 'all' ? 'Umumiy' : `${newChannelGrade}-sinf`}
                  </span>
                </div>

                {/* Popular Quick Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChannelGrade('all');
                      setNewChannelName(`Umumiy ${newChannelSubject} Munozara Guruhi`);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                      newChannelGrade === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {language === 'uz' ? 'Barcha sinflar (Umumiy)' : 'All Grades'}
                  </button>
                  {['9-A', '9-B', '9-D', '9-V', '10-A', '10-B', '11-A', '8-A'].map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setNewChannelGrade(cls);
                        setNewChannelName(`${cls} ${newChannelSubject} Laboratoriyasi`);
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                        newChannelGrade === cls
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>

                {/* Number + Letter Selector Grid */}
                <div className="grid grid-cols-7 gap-1 pt-1.5 border-t border-slate-200">
                  {GRADES_LIST.map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        const letter = newChannelGrade.includes('-') ? newChannelGrade.split('-')[1] : 'A';
                        const updated = `${num}-${letter}`;
                        setNewChannelGrade(updated);
                        setNewChannelName(`${updated} ${newChannelSubject} Laboratoriyasi`);
                      }}
                      className={`py-1 text-center rounded-md text-xs font-bold transition border ${
                        newChannelGrade.startsWith(num)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 pt-1.5 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                    {language === 'uz' ? 'Harf:' : 'Letter:'}
                  </span>
                  {CLASS_SECTIONS.map(letter => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => {
                        const num = newChannelGrade.split('-')[0].replace(/[^\d]/g, '') || '9';
                        const updated = `${num}-${letter}`;
                        setNewChannelGrade(updated);
                        setNewChannelName(`${updated} ${newChannelSubject} Laboratoriyasi`);
                      }}
                      className={`flex-1 py-1 text-center rounded-md text-xs font-bold transition border ${
                        newChannelGrade.endsWith(letter)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                {/* Custom text for grade */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    {language === 'uz' ? 'Yoki yozing:' : 'Custom:'}
                  </span>
                  <input
                    type="text"
                    value={newChannelGrade}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setNewChannelGrade(val);
                    }}
                    placeholder="e.g. 9-D"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Channel Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Channel Name (Guruh Nomi) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewChannelName(`${newChannelGrade !== 'all' ? `${newChannelGrade} ` : ''}${newChannelSubject} Laboratoriyasi`)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    {language === 'uz' ? 'Avto-nom berish' : 'Auto generate name'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="masalan: 9-D Fizika Laboratoriyasi"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Tavsif)
                </label>
                <textarea
                  rows={2}
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Guruhning asosiy maqsadlari va mavzulari..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <ShieldAlert className="size-4" />
                <span>{t('community_report_btn')}</span>
              </h3>
              <button onClick={() => setReportModalMessage(null)}>
                <X className="size-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold text-center">
                Report submitted to STEM-Simulations Safety Reviewers. Thank you.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1">{reportModalMessage.senderName}:</p>
                  <p className="italic">"{reportModalMessage.content}"</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for report *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe inappropriate content, harassment, or spam..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalMessage(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Change Grade Modal */}
      {showChangeGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="size-4 text-indigo-600" />
                <span>{language === 'uz' ? "Sinfingizni tanlang" : "Select Your Grade"}</span>
              </h3>
              <button onClick={() => setShowChangeGradeModal(false)}>
                <X className="size-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {language === 'uz' 
                ? "Sinfingizga mos chat guruhlari va munozaralarni ko'rish uchun sinf va harfni tanlang:" 
                : "Choose your grade level and section to see matching class group discussions:"}
            </p>

            {/* Popular Class Badges */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {language === 'uz' ? 'Ommabop sinflar:' : 'Quick Selection:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CLASSES.map(cls => (
                  <button
                    key={cls}
                    onClick={() => handleSelectGrade(cls)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition border ${
                      user.grade === cls
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Number + Letter Selector */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-2">
              <div className="grid grid-cols-7 gap-1">
                {GRADES_LIST.map(grade => (
                  <button
                    key={grade}
                    onClick={() => {
                      const letter = customGradeInput.split('-')[1] || 'A';
                      setCustomGradeInput(`${grade}-${letter}`);
                    }}
                    className={`py-1 text-center rounded-lg text-xs font-bold transition border ${
                      customGradeInput.startsWith(grade)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 pt-1.5 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                  {language === 'uz' ? 'Harf:' : 'Letter:'}
                </span>
                {CLASS_SECTIONS.map(letter => (
                  <button
                    key={letter}
                    onClick={() => {
                      const num = customGradeInput.split('-')[0] || '9';
                      setCustomGradeInput(`${num}-${letter}`);
                    }}
                    className={`flex-1 py-1 text-center rounded-md text-xs font-bold transition border ${
                      customGradeInput.endsWith(letter)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={customGradeInput}
                  onChange={(e) => setCustomGradeInput(e.target.value.toUpperCase())}
                  placeholder="masalan: 9-D"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (customGradeInput.trim()) {
                      handleSelectGrade(customGradeInput.trim());
                    }
                  }}
                  disabled={!customGradeInput.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-40"
                >
                  {language === 'uz' ? 'Tanlash' : 'Select'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
