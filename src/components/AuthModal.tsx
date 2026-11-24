import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  User as UserIcon,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  LogIn,
  UserPlus,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useUser, SignUpParams } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';
import { StemLogo } from './StemLogo.js';
import { UserRole } from '../types.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

type AuthStep = 'FORM' | 'OTP_VERIFICATION' | 'SUCCESS';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup'
}) => {
  const { 
    startSignUp, 
    verifySignUpOtp, 
    resendSignUpOtp, 
    startSignIn, 
    verifySignInOtp, 
    resendSignInOtp, 
    loginWithGoogle,
    loginWithDirectUser
  } = useUser();
  const { language } = useI18n();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [step, setStep] = useState<AuthStep>('FORM');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [grade, setGrade] = useState('8');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Synchronize modal state on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'signup');
      setStep('FORM');
      setError(null);
      setSuccessNotice(null);
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Focus first OTP input on step change
  useEffect(() => {
    if (step === 'OTP_VERIFICATION') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  // Step 1: Initiate Sign Up or Sign In (Triggers Clerk Email OTP dispatch)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (mode === 'signup' && !cleanName) {
      setError(language === 'uz' ? 'Iltimos, ism va familiyangizni kiriting' : 'Please enter your full name');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(language === 'uz' ? 'Iltimos, haqiqiy elektron pochta (Gmail) manzilini kiriting' : 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const params: SignUpParams = {
          email: cleanEmail,
          name: cleanName,
          role: role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
          grade: role === 'STUDENT' ? grade : undefined,
          avatar: selectedAvatar
        };
        try {
          await startSignUp(params);
        } catch (clerkErr) {
          console.warn('Clerk signup initiate failed, falling back to server OTP:', clerkErr);
          const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail })
          });
          if (!res.ok) throw clerkErr;
        }
      } else {
        try {
          await startSignIn(cleanEmail);
        } catch (clerkErr) {
          console.warn('Clerk signin initiate failed, falling back to server OTP:', clerkErr);
          const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail })
          });
          if (!res.ok) throw clerkErr;
        }
      }

      setResendCountdown(60);
      setStep('OTP_VERIFICATION');
    } catch (err: any) {
      // Map Clerk error codes to localized friendly messages
      let msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || '';
      if (msg.includes('already exists') || msg.includes('identifier_already_signed_in')) {
        msg = language === 'uz' 
          ? 'Bu elektron pochta bilan hisob allaqachon mavjud. Iltimos, Kirish bo‘limidan kiring.' 
          : 'An account with this email already exists. Please sign in instead.';
      } else if (msg.includes("Couldn't find your account") || msg.includes('identifier_not_found')) {
        msg = language === 'uz'
          ? 'Bunday hisob topilmadi. Iltimos, avval Ro‘yxatdan o‘ting.'
          : "Couldn't find an account with this email. Please sign up first.";
      } else if (!msg) {
        msg = language === 'uz' 
          ? 'Tasdiqlash kodini yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.' 
          : 'Failed to send verification code. Please try again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Digits Input
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    // Handle full Paste
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(chars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 3: Verify OTP Code with Clerk & Server Fallback
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setError(language === 'uz' ? 'Iltimos, 6 xonali tasdiqlash kodini to‘liq kiriting' : 'Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);
    let verified = false;

    try {
      if (mode === 'signup') {
        await verifySignUpOtp(fullCode);
        verified = true;
      } else {
        await verifySignInOtp(fullCode);
        verified = true;
      }
    } catch (err: any) {
      console.warn('Clerk verification failed, attempting server verification:', err);
      // Fallback: Verify through server endpoint
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: fullCode,
            name: name.trim() || email.split('@')[0],
            role,
            grade,
            avatar: selectedAvatar
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            loginWithDirectUser(data.user);
            verified = true;
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback verification error:', fallbackErr);
      }

      if (!verified) {
        let msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || '';
        if (msg.includes('incorrect') || msg.includes('invalid') || msg.includes('verification_failed')) {
          msg = language === 'uz'
            ? 'Tasdiqlash kodi noto‘g‘ri. Iltimos, pochtangizdagi kodni tekshiring.'
            : 'Incorrect verification code. Please check your email.';
        } else if (msg.includes('expired')) {
          msg = language === 'uz'
            ? 'Tasdiqlash kodining muddati tugagan. Qayta kod so‘rang.'
            : 'Verification code has expired. Please request a new code.';
        } else if (!msg) {
          msg = language === 'uz' ? 'Tasdiqlashda xatolik yuz berdi' : 'Verification failed';
        }
        setError(msg);
        setLoading(false);
        return;
      }
    }

    if (verified) {
      setStep('SUCCESS');
      setTimeout(() => {
        onClose();
      }, 600);
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    if (resendCountdown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        try {
          await resendSignUpOtp();
        } catch {
          await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase() })
          });
        }
      } else {
        try {
          await resendSignInOtp();
        } catch {
          await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase() })
          });
        }
      }
      setResendCountdown(60);
      setSuccessNotice(
        language === 'uz' 
          ? 'Yangi tasdiqlash kodi pochtangizga yuborildi.' 
          : 'A new verification code was sent to your email.'
      );
    } catch (err: any) {
      setError(err.message || (language === 'uz' ? 'Kodni qayta yuborib bo‘lmadi' : 'Failed to resend code'));
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleOAuth = async () => {
    setError(null);
    setOauthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Direct Google redirect error, trying server Google login:', err);
      // Fallback: If user has an email entered, or using designated super admin / user email
      const targetEmail = email.trim().toLowerCase() || 'sobirboboyorov13@gmail.com';
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetEmail,
            name: name.trim() || 'Google Foydalanuvchisi',
            avatar: selectedAvatar
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            loginWithDirectUser(data.user);
            setStep('SUCCESS');
            setTimeout(() => {
              onClose();
            }, 600);
            return;
          }
        }
      } catch (e) {
        console.error('Google fallback error:', e);
      }

      setError(err.message || (language === 'uz' ? 'Google orqali kirishda xatolik yuz berdi' : 'Google Sign-In failed'));
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div 
        id="learnlab-auth-modal"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card border border-border text-card-foreground shadow-2xl transition-all my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Accent header bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 z-20 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-1">
              <StemLogo size={44} showText={false} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
              {step === 'OTP_VERIFICATION'
                ? (language === 'uz' ? 'Tasdiqlash kodi' : 'Email Verification')
                : mode === 'signup'
                  ? (language === 'uz' ? 'Ro‘yxatdan o‘tish' : 'Create an Account')
                  : (language === 'uz' ? 'Tizimga kirish' : 'Sign In')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {step === 'OTP_VERIFICATION'
                ? (language === 'uz' 
                    ? `${email} manziliga yuborilgan 6 xonali kodni kiriting`
                    : `Enter the 6-digit code sent to ${email}`)
                : (language === 'uz' 
                    ? 'LearnLab — Interaktiv Ilmiy Simulyatsiyalar Platformasi' 
                    : 'LearnLab — Interactive STEM Simulation Platform')}
            </p>
          </div>

          {/* Mode Switcher Tabs (Only visible in FORM step) */}
          {step === 'FORM' && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 border border-border">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-card text-foreground shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="size-3.5" />
                <span>{language === 'uz' ? 'Kirish' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="size-3.5" />
                <span>{language === 'uz' ? 'Ro‘yxatdan o‘tish' : 'Sign Up'}</span>
              </button>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive animate-in slide-in-from-top-1">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 animate-in slide-in-from-top-1">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS FORM */}
          {step === 'FORM' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Google OAuth Button */}
              <button
                type="button"
                id="btn-google-auth"
                onClick={handleGoogleOAuth}
                disabled={loading || oauthLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.99] transition cursor-pointer disabled:opacity-60"
              >
                {oauthLoading ? (
                  <RefreshCw className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                  </svg>
                )}
                <span>
                  {mode === 'signup'
                    ? (language === 'uz' ? 'Google orqali ro‘yxatdan o‘tish' : 'Sign up with Google')
                    : (language === 'uz' ? 'Google orqali kirish' : 'Continue with Google')}
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <span className="relative bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {language === 'uz' ? 'yoki email orqali' : 'or with email'}
                </span>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-3.5">
                {/* Full Name (Sign Up only) */}
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {language === 'uz' ? 'Ism va familiyangiz' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        id="input-auth-name"
                        type="text"
                        required
                        placeholder={language === 'uz' ? 'Sobir Boboyorov' : 'John Doe'}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {language === 'uz' ? 'Elektron pochta (Gmail)' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      id="input-auth-email"
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Role & Grade Selection (Sign Up only) */}
                {mode === 'signup' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          {language === 'uz' ? 'Foydalanuvchi turi' : 'Role'}
                        </label>
                        <select
                          id="select-auth-role"
                          value={role}
                          onChange={e => setRole(e.target.value as UserRole)}
                          disabled={loading}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                        >
                          <option value="STUDENT">{language === 'uz' ? 'O‘quvchi / Talaba' : 'Student'}</option>
                          <option value="TEACHER">{language === 'uz' ? 'O‘qituvchi / Ustoz' : 'Teacher'}</option>
                        </select>
                      </div>

                      {role === 'STUDENT' ? (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            {language === 'uz' ? 'Sinf / Bosqich' : 'Grade'}
                          </label>
                          <select
                            id="select-auth-grade"
                            value={grade}
                            onChange={e => setGrade(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                          >
                            <option value="5">5-sinf</option>
                            <option value="6">6-sinf</option>
                            <option value="7">7-sinf</option>
                            <option value="8">8-sinf</option>
                            <option value="9">9-sinf</option>
                            <option value="10">10-sinf</option>
                            <option value="11">11-sinf</option>
                            <option value="College">{language === 'uz' ? 'Litsey / Kollej' : 'College'}</option>
                            <option value="University">{language === 'uz' ? 'Universitet' : 'University'}</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 p-2 text-xs text-accent">
                          <GraduationCap className="size-4 shrink-0" />
                          <span className="text-[11px] font-medium leading-tight">
                            {language === 'uz' ? 'Studio ruxsati beriladi' : 'Studio access granted'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Avatar Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        {language === 'uz' ? 'Profil rasmini tanlang:' : 'Choose avatar:'}
                      </label>
                      <div className="flex items-center gap-2">
                        {AVATAR_OPTIONS.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(imgUrl)}
                            className={`relative size-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                              selectedAvatar === imgUrl
                                ? 'border-primary ring-2 ring-primary/30 scale-105'
                                : 'border-border/60 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} alt="Avatar" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={loading || !email.trim() || (mode === 'signup' && !name.trim())}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer mt-3"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'signup'
                          ? (language === 'uz' ? 'Tasdiqlash kodini olish' : 'Send Verification Code')
                          : (language === 'uz' ? 'Kodni olish va Kirish' : 'Send Code & Continue')}
                      </span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION SCREEN */}
          {step === 'OTP_VERIFICATION' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
              <div className="rounded-xl bg-muted/40 border border-border p-3.5 text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                  {language === 'uz' 
                    ? 'Elektron pochtangizga yuborilgan 6 xonali tasdiqlash kodini kiriting:' 
                    : 'Enter the 6-digit verification code sent to:'}
                </p>
                <div className="font-semibold text-sm text-foreground flex items-center justify-center gap-1.5">
                  <Mail className="size-3.5 text-primary" />
                  <span>{email}</span>
                </div>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="space-y-2">
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => {
                        otpInputRefs.current[idx] = el;
                      }}
                      id={`otp-input-${idx}`}
                      aria-label={`Digit ${idx + 1}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      disabled={loading}
                      className="size-11 sm:size-12 text-center text-lg sm:text-xl font-bold rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-xs"
                    />
                  ))}
                </div>

                {/* Resend Timer & Action */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('FORM');
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>{language === 'uz' ? 'Emailni o‘zgartirish' : 'Change email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCountdown > 0 || loading}
                    className="text-primary hover:underline font-semibold disabled:opacity-50 disabled:no-underline transition cursor-pointer"
                  >
                    {resendCountdown > 0
                      ? (language === 'uz' ? `Qayta yuborish (${resendCountdown}s)` : `Resend in ${resendCountdown}s`)
                      : (language === 'uz' ? 'Qayta kod yuborish' : 'Resend code')}
                  </button>
                </div>
              </div>

              {/* Submit Verification */}
              <button
                id="btn-verify-otp-submit"
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    <span>
                      {language === 'uz' ? 'Kodni tasdiqlash va Kirish' : 'Verify Code & Sign In'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'SUCCESS' && (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {language === 'uz' ? 'Muvaffaqiyatli tasdiqlandi!' : 'Successfully Authenticated!'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {language === 'uz' ? 'Platformaga yo‘naltirilmoqda...' : 'Entering LearnLab platform...'}
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center border-t border-border/60">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary shrink-0" />
              <span>
                {language === 'uz'
                  ? 'Clerk xavfsiz autentifikatsiyasi orqali himoyalangan.'
                  : 'Protected by Clerk production authentication.'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
