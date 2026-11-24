import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  RotateCcw, 
  Lightbulb, 
  Calculator, 
  Target, 
  BookOpen, 
  Globe,
  Compass,
  AlertCircle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  HelpCircle,
  FlaskConical
} from 'lucide-react';
import { Simulation, Subject } from '../types.js';
import { useI18n } from '../hooks/useI18n.js';
import { AiMessageRenderer } from './AiMessageRenderer.js';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  simulation?: Simulation | null;
  subject?: Subject;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  simulation,
  subject = 'Physics'
}) => {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'explain' | 'formula' | 'challenge' | 'realworld'>('explain');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting tailored to simulation or subject in user's language
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const simTitle = simulation ? simulation.title : subject;
      const initialGreeting = language === 'uz'
        ? `### STEM-Simulations AI Ilmiy Tyutori
Salom! Men sizning sun'iy intellekt ilmiy yordamchingizman. **${simTitle}** laboratoriyasi bo‘yicha qanday tushuntirish yoki yordam kerak?

Quyidagi tugmalardan birini tanlashingiz yoki istalgan savolingizni berishingiz mumkin:
- Qonuniyatning oddiy tushuntirishi
- Formulalar va o‘lchov birliklari
- Laboratoriyada sinash uchun amaliy topshiriqlar`
        : `### STEM-Simulations AI Science Tutor
Hello! I am your AI STEM inquiry mentor. How can I help you explore **${simTitle}** today?

Feel free to ask any question about the core principles, formulas, or testable experiments!`;

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, simulation, subject, messages.length, language]);

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

  const handleSend = async (questionText?: string) => {
    const text = questionText || input;
    if (!text.trim() || loading) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: userTimestamp
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId: simulation?.id,
          question: text.trim(),
          mode,
          subject: simulation?.subject || subject,
          history: nextHistory.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('AI service response error');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Warning: Unable to reach Gemini AI services at this moment. Please check your network or try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col min-h-0 overflow-hidden">
        
        {/* Drawer Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t('ai_tutor_title')}</span>
                <span className="rounded-full bg-indigo-950 border border-indigo-700 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                  STEM 3.7
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {simulation ? simulation.title : `${subject} Inquiry Session`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              title={language === 'uz' ? 'Qaytadan boshlash' : 'Reset conversation'}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Inquiry Modes Selector */}
        <div className="shrink-0 grid grid-cols-4 gap-1 border-b border-slate-800 bg-slate-950/40 p-2">
          <button
            onClick={() => setMode('explain')}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10px] font-semibold transition ${
              mode === 'explain'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="size-3.5" />
            <span>{t('ai_tutor_preset_explain')}</span>
          </button>

          <button
            onClick={() => setMode('formula')}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10px] font-semibold transition ${
              mode === 'formula'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Calculator className="size-3.5" />
            <span>{t('ai_tutor_preset_formula')}</span>
          </button>

          <button
            onClick={() => setMode('challenge')}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10px] font-semibold transition ${
              mode === 'challenge'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Target className="size-3.5" />
            <span>{t('ai_tutor_preset_challenge')}</span>
          </button>

          <button
            onClick={() => setMode('realworld')}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10px] font-semibold transition ${
              mode === 'realworld'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Globe className="size-3.5" />
            <span>{t('ai_tutor_preset_realworld')}</span>
          </button>
        </div>

        {/* Message Thread */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {messages.map((msg) => {
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
                  
                  {/* Footer actions */}
                  <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <>
                        <button
                          onClick={() => handleSpeakText(msg.id, msg.content)}
                          className={`p-1 rounded hover:bg-slate-800 transition ${
                            speakingMsgId === msg.id ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                          }`}
                          title="Tinglash"
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
          })}

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
                    {language === 'uz' ? 'Ilmiy tahlil tuzilmoqda...' : 'Formulating scientific analysis...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Follow-Up Chips */}
        <div className="shrink-0 flex items-center gap-2 overflow-x-auto border-t border-slate-800 bg-slate-950/40 p-2.5 px-6">
          <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">
            {language === 'uz' ? 'Tezkor:' : 'Quick:'}
          </span>
          <button
            onClick={() => handleSend(language === 'uz' ? 'Buni yana ham oddiyroq tushuntirib ber.' : 'Explain this in simpler terms.')}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-indigo-300 hover:bg-slate-700 whitespace-nowrap transition"
          >
            {language === 'uz' ? 'Oddiyroq tushuntir' : 'Simpler'}
          </button>
          <button
            onClick={() => handleSend(language === 'uz' ? 'Buning asosiy matematik formulasini ko‘rsat.' : 'Show core mathematical formulas.')}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-slate-700 whitespace-nowrap transition"
          >
            {language === 'uz' ? 'Formulalar' : 'Formulas'}
          </button>
          <button
            onClick={() => handleSend(language === 'uz' ? 'Ushbu tajribada sinash uchun 2 ta topshiriq ber.' : 'Give 2 experiment challenges for this lab.')}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-amber-300 hover:bg-slate-700 whitespace-nowrap transition"
          >
            {language === 'uz' ? 'Tajriba topshirig‘i' : 'Lab Challenge'}
          </button>
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="shrink-0 border-t border-slate-800 p-4 bg-slate-950">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai_tutor_input_placeholder')}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
  );
};
