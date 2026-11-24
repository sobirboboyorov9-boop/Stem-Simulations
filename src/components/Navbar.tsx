import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Sparkles, 
  FlaskConical, 
  Compass, 
  ShieldCheck, 
  Crown, 
  GraduationCap, 
  Layers, 
  Bookmark, 
  Clock, 
  Menu, 
  X, 
  Globe, 
  Users, 
  User as UserIcon, 
  LogOut, 
  Settings,
  ChevronDown,
  LogIn,
  UserPlus,
  Loader2,
  Trophy,
  Moon,
  Sun
} from 'lucide-react';
import { useUser } from '../hooks/useUser.js';
import { useI18n } from '../hooks/useI18n.js';
import { useTheme } from '../hooks/useTheme.js';
import { AuthModal } from './AuthModal.js';
import { StemLogo } from './StemLogo.js';
import { UserRole } from '../types.js';

export const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { 
    user, 
    isAuthenticated,
    isUnauthenticated,
    isAuthInitializing,
    logout, 
    favorites, 
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    openAuthModal,
    canAccessTeacher,
    canAccessAdmin,
    canAccessSuperAdmin
  } = useUser();
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'uz' ? 'en' : 'uz');
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    openAuthModal(mode);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isCurrent = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Banner for Guest Users (Only shown after Clerk confirms unauthenticated state) */}
      {isUnauthenticated && (
        <div className="bg-amber-500/10 border-b border-amber-500/25 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <span className="flex size-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="truncate">
              {language === 'uz'
                ? 'Siz hozirda mehmon (Guest) rejimidasiz. Laboratoriyalarni saqlash va to‘liq imkoniyatlardan foydalanish uchun iltimos ro‘yxatdan o‘ting.'
                : 'You are currently browsing as a guest. Please sign in or create an account to save labs and unlock all features.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenAuth('signup')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition shadow-2xs cursor-pointer"
            >
              {language === 'uz' ? 'Ro‘yxatdan o‘tish' : 'Sign Up'}
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <StemLogo size="md" showText={true} subtext="INQUIRY LABS" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              
              {/* Simulations Catalog */}
              <Link
                href="/catalog"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isCurrent('/catalog')
                    ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Compass className="size-4" />
                <span>{t('nav_catalog')}</span>
              </Link>

              {/* AI Science Tutor */}
              <Link
                href="/ai-tutor"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isCurrent('/ai-tutor')
                    ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Sparkles className="size-4 text-accent" />
                <span>{t('nav_ai_tutor')}</span>
              </Link>

              {/* Community & Class Chat */}
              <Link
                href="/community"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isCurrent('/community')
                    ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Users className="size-4" />
                <span>{t('nav_community')}</span>
              </Link>

              {/* Saved Labs / Favorites */}
              <Link
                href="/favorites"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isCurrent('/favorites')
                    ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Bookmark className="size-4" />
                <span>{t('nav_saved')}</span>
                {favorites.size > 0 && isAuthenticated && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {favorites.size}
                  </span>
                )}
              </Link>

              {/* Teacher Simulation Studio (Visible to Teacher & Super Admin only) */}
              {canAccessTeacher && (
                <Link
                  href="/studio"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isCurrent('/studio')
                      ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold'
                      : 'text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
                >
                  <FlaskConical className="size-4 text-amber-600" />
                  <span>{t('nav_studio')}</span>
                </Link>
              )}

              {/* Admin Console (Visible to Admin & Super Admin) */}
              {canAccessAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isCurrent('/admin')
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>{t('nav_admin')}</span>
                </Link>
              )}

              {/* Super Admin Console (Visible to Super Admin ONLY) */}
              {canAccessSuperAdmin && (
                <Link
                  href="/super-admin"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isCurrent('/super-admin')
                      ? 'bg-destructive/15 text-destructive font-bold'
                      : 'text-destructive hover:bg-destructive/10'
                  }`}
                >
                  <Crown className="size-4 text-destructive" />
                  <span>{t('nav_super_admin')}</span>
                </Link>
              )}

              {/* Competition Pitch & Showcase Link */}
              <Link
                href="/showcase"
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition shadow-2xs border ${
                  isCurrent('/showcase') || isCurrent('/pitch')
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="Tanlov Taqdimoti va Jonli Demo"
              >
                <Trophy className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>🏆 Taqdimot & Demo</span>
              </Link>

            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer"
              title={theme === 'dark' ? 'Yorug‘ rejimga o‘tish (Light mode)' : 'Qorong‘u rejimga o‘tish (Dark mode)'}
              id="button-theme-switcher"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Yorug‘</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-sky-400" />
                  <span className="hidden sm:inline text-[11px]">Qorong‘u</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer"
              title="Switch language / Tilni almashtirish"
              id="button-language-switcher"
            >
              <Globe className="size-3.5 text-primary" />
              <span>{language === 'uz' ? '🇺🇿 UZ' : '🇬🇧 EN'}</span>
            </button>

            {/* Right Action Tools: 3-State Handling */}
            {isAuthInitializing ? (
              /* State 1: Authentication is initializing / restoring */
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground animate-pulse shadow-2xs">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span className="hidden sm:inline text-[11px] font-medium">{language === 'uz' ? 'Tekshirilmoqda...' : 'Checking...'}</span>
              </div>
            ) : isAuthenticated ? (
              /* State 2: Authenticated User */
              <>
                {/* Saved Bookmarks shortcut */}
                <Link
                  href="/favorites"
                  className="relative hidden sm:flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-primary transition"
                  title={t('nav_saved')}
                >
                  <Bookmark className="size-4" />
                  {favorites.size > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {favorites.size}
                    </span>
                  )}
                </Link>

                {/* User Profile / Auth Button */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background p-1 pl-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs"
                    id="button-user-profile-menu"
                  >
                    <div className="size-7 rounded-lg bg-muted overflow-hidden border border-border flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="size-full object-cover" />
                      ) : (
                        <UserIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col text-left leading-tight">
                      <span className="max-w-[100px] truncate text-xs font-bold text-foreground">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-primary font-semibold truncate">
                        {user.role === 'SUPER_ADMIN' ? 'Super Admin' : (user.role === 'ADMIN' ? 'Admin' : (user.role === 'TEACHER' ? 'Ustoz' : (user.grade ? `${user.grade} sinf` : 'Student')))}
                      </span>
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground pr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 animate-fade-in">
                      <div className="border-b border-border px-3 py-2 mb-1">
                        <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            user.role === 'SUPER_ADMIN' ? 'bg-destructive/15 text-destructive border border-destructive/25' :
                            user.role === 'ADMIN' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25' :
                            user.role === 'TEACHER' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25' :
                            'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {user.role}
                          </span>
                          {user.grade && (
                            <span className="inline-block rounded-full bg-secondary border border-border px-2 py-0.5 text-[9px] font-bold text-secondary-foreground">
                              {user.grade === 'all' ? 'Barcha sinflar' : `${user.grade} sinf`}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        <UserIcon className="size-4 text-muted-foreground" />
                        <span>{t('nav_profile')}</span>
                      </Link>

                      {/* Teacher Studio (Teacher & Super Admin) */}
                      {canAccessTeacher && (
                        <Link
                          href="/studio"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                        >
                          <FlaskConical className="size-4 text-amber-600" />
                          <span>{t('nav_studio')}</span>
                        </Link>
                      )}

                      {/* Admin Console (Admin & Super Admin) */}
                      {canAccessAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                        >
                          <ShieldCheck className="size-4 text-emerald-600" />
                          <span>{t('nav_admin')}</span>
                        </Link>
                      )}

                      {/* Super Admin Console (Super Admin ONLY) */}
                      {canAccessSuperAdmin && (
                        <Link
                          href="/super-admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
                        >
                          <Crown className="size-4 text-destructive" />
                          <span>{t('nav_super_admin')}</span>
                        </Link>
                      )}

                      <Link
                        href="/favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        <Bookmark className="size-4 text-muted-foreground" />
                        <span>{t('nav_saved')}</span>
                      </Link>

                      <Link
                        href="/recent"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        <Clock className="size-4 text-muted-foreground" />
                        <span>{t('nav_recent')}</span>
                      </Link>

                      <div className="border-t border-border my-1" />

                      <button
                        onClick={() => handleOpenAuth('login')}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        <Settings className="size-4 text-muted-foreground" />
                        <span>{t('auth_switch_account')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
                      >
                        <LogOut className="size-4" />
                        <span>{t('auth_signout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* State 3: Confirmed Unauthenticated (Guest Mode) */
              <div className="flex items-center gap-2">
                {/* Guest Account Badge & Avatar Button (Clicking triggers AuthModal) */}
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/90 dark:bg-amber-950/40 p-1 pl-2 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-2xs cursor-pointer group"
                  id="button-navbar-guest-account"
                  title={language === 'uz' ? 'Siz guestsiz. Ro‘yxatdan o‘tish uchun bosing' : 'You are a guest. Click to sign up'}
                >
                  <div className="size-6 rounded-lg bg-amber-200/90 dark:bg-amber-800 flex items-center justify-center text-amber-800 dark:text-amber-100 group-hover:scale-105 transition">
                    <UserIcon className="size-3.5" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 truncate">
                      {language === 'uz' ? 'Siz guestsiz' : 'You are a guest'}
                    </span>
                    <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">
                      {language === 'uz' ? 'Ro‘yxatdan o‘tish' : 'Click to register'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleOpenAuth('login')}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-2xs"
                  id="button-navbar-login"
                >
                  <LogIn className="size-3.5 text-muted-foreground" />
                  <span>{t('auth_btn_login')}</span>
                </button>

                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
                  id="button-navbar-signup"
                >
                  <UserPlus className="size-3.5" />
                  <span>{t('auth_btn_signup')}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted transition"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-2 animate-fade-in">
            <Link
              href="/showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25"
            >
              <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
              <span>🏆 Tanlov Taqdimoti & Demo</span>
            </Link>

            <Link
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Compass className="size-5 text-primary" />
              <span>{t('nav_catalog')}</span>
            </Link>

            <Link
              href="/ai-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Sparkles className="size-5 text-accent" />
              <span>{t('nav_ai_tutor')}</span>
            </Link>

            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Users className="size-5 text-primary" />
              <span>{t('nav_community')}</span>
            </Link>

            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Bookmark className="size-5 text-primary" />
              <span>{t('nav_saved')}</span>
              {favorites.size > 0 && isAuthenticated && (
                <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                  {favorites.size}
                </span>
              )}
            </Link>

            {canAccessTeacher && (
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <FlaskConical className="size-5 text-amber-600" />
                <span>{t('nav_studio')}</span>
              </Link>
            )}

            {canAccessAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-500/10"
              >
                <ShieldCheck className="size-5 text-emerald-600" />
                <span>{t('nav_admin')}</span>
              </Link>
            )}

            {canAccessSuperAdmin && (
              <Link
                href="/super-admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                <Crown className="size-5 text-destructive" />
                <span>{t('nav_super_admin')}</span>
              </Link>
            )}

            <div className="border-t border-border pt-2 space-y-1">
              {isAuthInitializing ? (
                <div className="flex items-center justify-center gap-2 p-3 text-xs text-muted-foreground animate-pulse">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>{language === 'uz' ? 'Tekshirilmoqda...' : 'Checking authentication...'}</span>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <UserIcon className="size-5 text-muted-foreground" />
                    <span>{t('nav_profile')} ({user.name})</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="size-5" />
                    <span>{t('auth_signout')}</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 p-2.5 text-xs font-bold text-amber-900 dark:text-amber-200"
                  >
                    <UserIcon className="size-4 text-amber-600" />
                    <span>{language === 'uz' ? 'Siz guestsiz (Ro‘yxatdan o‘tish)' : 'You are a guest (Register)'}</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenAuth('login')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-bold text-foreground"
                    >
                      <LogIn className="size-4" />
                      <span>{t('auth_btn_login')}</span>
                    </button>
                    <button
                      onClick={() => handleOpenAuth('signup')}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-xs"
                    >
                      <UserPlus className="size-4" />
                      <span>{t('auth_btn_signup')}</span>
                    </button>
                  </div>

                </div>
              )}

              {/* Mobile Theme & Language Switchers (Available for everyone) */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-sky-400" />}
                  <span>{theme === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘u'}</span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <Globe className="size-4 text-primary" />
                  <span>{language === 'uz' ? '🇺🇿 UZ' : '🇬🇧 EN'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Authenticator Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};
