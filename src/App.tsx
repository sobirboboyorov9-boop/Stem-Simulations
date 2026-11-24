import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { ClerkProvider, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { UserProvider, useUser } from './hooks/useUser.js';
import { I18nProvider, useI18n } from './hooks/useI18n.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { BannerNotice } from './components/BannerNotice.js';
import { HomePage } from './pages/HomePage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { SimulationDetailPage } from './pages/SimulationDetailPage.js';
import { SimulationPlayerPage } from './pages/SimulationPlayerPage.js';
import { SimulationStudioPage } from './pages/SimulationStudioPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { RecentPage } from './pages/RecentPage.js';
import { TeacherPage } from './pages/TeacherPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { SuperAdminPage } from './pages/SuperAdminPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { CommunityChatPage } from './pages/CommunityChatPage.js';
import { AiTutorPage } from './pages/AiTutorPage.js';
import { ShowcasePage } from './pages/ShowcasePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ThemeProvider } from './hooks/useTheme.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { ShieldAlert, Compass, Loader2, LogIn, Lock } from 'lucide-react';

const CLERK_PUBLISHABLE_KEY = 
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CLERK_PUBLISHABLE_KEY || 
  'pk_live_a2V5LWdhbm5ldC0zNi5jbGVyay5hY2NvdW50cy5kZXYk';

// Reusable Loading State for Authentication Initialization
const AuthInitializingScreen: React.FC<{ message?: string }> = ({ message = 'Verifying authentication...' }) => (
  <div className="mx-auto max-w-xl px-4 py-24 text-center">
    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 animate-pulse">
      <Loader2 className="size-6 animate-spin" />
    </div>
    <h3 className="font-display text-base font-bold text-foreground">{message}</h3>
    <p className="mt-1 text-xs text-muted-foreground">Please wait a moment while your secure session is verified.</p>
  </div>
);

// Protected Route Guards
const TeacherRoute: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => {
  const { canAccessTeacher, isAuthInitializing, isAuthenticated, openAuthModal } = useUser();
  const { t } = useI18n();

  // 1. Wait for Clerk session restoration and database reconciliation
  if (isAuthInitializing) {
    return <AuthInitializingScreen message="Verifying educator clearance..." />;
  }

  // 2. Unauthenticated: Prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20">
          <Lock className="size-8 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">Sign In Required</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Please sign in with your verified teacher account to access the simulation studio.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
        >
          <LogIn className="size-4" />
          <span>Sign In</span>
        </button>
      </div>
    );
  }

  // 3. Authenticated but insufficient role
  if (!canAccessTeacher) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground border border-accent/30">
          <ShieldAlert className="size-8 text-accent" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{t('rbac_teacher_required')}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          This studio module is restricted to certified STEM educators and platform administrators.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
        >
          <Compass className="size-4" />
          <span>{t('nav_catalog')}</span>
        </a>
      </div>
    );
  }
  return <Component />;
};

const AdminRoute: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => {
  const { canAccessAdmin, isAuthInitializing, isAuthenticated, openAuthModal } = useUser();
  const { t } = useI18n();

  // 1. Wait for Clerk session restoration and database reconciliation
  if (isAuthInitializing) {
    return <AuthInitializingScreen message="Verifying administrator clearance..." />;
  }

  // 2. Unauthenticated: Prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/20">
          <Lock className="size-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">Sign In Required</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Administrator level authentication is required to review lab submissions.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
        >
          <LogIn className="size-4" />
          <span>Sign In</span>
        </button>
      </div>
    );
  }

  // 3. Authenticated but insufficient role
  if (!canAccessAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/20">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{t('rbac_admin_required')}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Administrator level permissions are required to review lab submissions.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
        >
          <Compass className="size-4" />
          <span>{t('nav_catalog')}</span>
        </a>
      </div>
    );
  }
  return <Component />;
};

const SuperAdminRoute: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => {
  const { canAccessSuperAdmin, isAuthInitializing, isAuthenticated, openAuthModal } = useUser();
  const { t } = useI18n();

  // 1. Wait for Clerk session restoration and database reconciliation
  if (isAuthInitializing) {
    return <AuthInitializingScreen message="Verifying Super Admin clearance..." />;
  }

  // 2. Unauthenticated: Prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/20">
          <Lock className="size-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">Sign In Required</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Super Admin clearance is strictly enforced. Please authenticate first.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
        >
          <LogIn className="size-4" />
          <span>Sign In</span>
        </button>
      </div>
    );
  }

  // 3. Authenticated but insufficient role
  if (!canAccessSuperAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/20">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{t('rbac_super_admin_required')}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Super Admin clearance is strictly enforced.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
        >
          <Compass className="size-4" />
          <span>{t('nav_catalog')}</span>
        </a>
      </div>
    );
  }
  return <Component />;
};

const AppContent: React.FC = () => {
  const [location] = useLocation();
  const isPlayerMode = location.includes('/play');
  const isStudioMode = location.startsWith('/studio');
  const isShowcaseMode = location === '/showcase' || location === '/pitch' || location === '/demo';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent/30 selection:text-foreground">
      {!isPlayerMode && !isStudioMode && !isShowcaseMode && <BannerNotice />}
      {!isPlayerMode && !isShowcaseMode && <Navbar />}

      <main className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/showcase" component={ShowcasePage} />
          <Route path="/pitch" component={ShowcasePage} />
          <Route path="/demo" component={ShowcasePage} />
          <Route path="/catalog" component={CatalogPage} />
          <Route path="/subjects" component={CatalogPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/community" component={CommunityChatPage} />
          <Route path="/ai-tutor" component={AiTutorPage} />
          
          <Route path="/studio">
            {() => <TeacherRoute component={SimulationStudioPage} />}
          </Route>
          
          <Route path="/simulations/:id/play" component={SimulationPlayerPage} />
          <Route path="/sim/:id/play" component={SimulationPlayerPage} />
          <Route path="/simulations/:id" component={SimulationDetailPage} />
          <Route path="/sim/:id" component={SimulationDetailPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/recent" component={RecentPage} />
          
          <Route path="/teacher">
            {() => <TeacherRoute component={TeacherPage} />}
          </Route>
          
          <Route path="/admin">
            {() => <AdminRoute component={AdminPage} />}
          </Route>
          
          <Route path="/super-admin">
            {() => <SuperAdminRoute component={SuperAdminPage} />}
          </Route>

          <Route path="/sso-callback">
            {() => <AuthenticateWithRedirectCallback signInForceRedirectUrl="/" signUpForceRedirectUrl="/" />}
          </Route>

          <Route component={NotFoundPage} />
        </Switch>
      </main>

      {!isPlayerMode && !isStudioMode && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <I18nProvider>
            <UserProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </UserProvider>
          </I18nProvider>
        </ClerkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
