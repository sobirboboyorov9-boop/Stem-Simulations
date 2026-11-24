import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  useAuth, 
  useUser as useClerkUser, 
  useSignIn, 
  useSignUp, 
  useClerk 
} from '@clerk/clerk-react';
import { User, UserRole, Subject, Simulation } from '../types.js';

export const SUPER_ADMIN_EMAILS = [
  'sobirboboyorov13@gmail.com',
  'sobirboboyorov9@gmail.com'
];
export const SUPER_ADMIN_EMAIL = 'sobirboboyorov13@gmail.com';

export const isSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const em = email.trim().toLowerCase();
  return em === 'sobirboboyorov13@gmail.com' || em === 'sobirboboyorov9@gmail.com';
};

export const guestUser: User = {
  id: '',
  name: 'Mehmon O‘quvchi',
  displayName: 'Mehmon O‘quvchi',
  email: '',
  username: 'guest',
  role: 'STUDENT',
  grade: '9-A',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
  bio: '',
  createdAt: new Date().toISOString(),
  learningActivity: {
    simulationsExplored: 0,
    inquiriesCompleted: 0,
    favoritesCount: 0
  }
};

export interface SignUpParams {
  email: string;
  name: string;
  role?: UserRole;
  grade?: string;
  avatar?: string;
}

interface UserContextType {
  user: User;
  rawUser: User | null;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  loading: boolean;
  authLoading: boolean;
  isAuthInitializing: boolean;

  // Clerk Authentication Actions
  startSignUp: (params: SignUpParams) => Promise<void>;
  verifySignUpOtp: (code: string) => Promise<void>;
  resendSignUpOtp: () => Promise<void>;

  startSignIn: (email: string) => Promise<void>;
  verifySignInOtp: (code: string) => Promise<void>;
  resendSignInOtp: () => Promise<void>;

  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Fallback direct methods for backward compatibility
  login: (email: string, password?: string, grade?: string) => Promise<void>;
  signup: (userData: Partial<User> & { email: string; name: string }) => Promise<void>;
  sendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, code: string, extraData?: { name?: string; role?: UserRole; grade?: string; avatar?: string }) => Promise<boolean>;

  // Profile & Preferences
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setUserGrade: (grade: string) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;

  // Favorites & History
  favorites: Set<string>;
  toggleFavorite: (simulation: Simulation) => Promise<void>;
  isFavorite: (simulationId: string) => boolean;
  refreshFavorites: () => Promise<void>;
  recordRecent: (simulationId: string) => Promise<void>;

  // Modal State
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;

  // RBAC Helpers
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canAccessTeacher: boolean;
  canAccessAdmin: boolean;
  canAccessSuperAdmin: boolean;

  // Direct persistence login
  loginWithDirectUser: (user: User) => void;

  // Authenticated fetch helper
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const PERSISTENT_USER_KEY = 'stem_simulations_persistent_user';
const PERSISTENT_TOKEN_KEY = 'stem_simulations_session_token';

const UserContext = createContext<UserContextType>({
  user: guestUser,
  rawUser: null,
  isAuthenticated: false,
  isUnauthenticated: false,
  loading: true,
  authLoading: true,
  isAuthInitializing: true,
  startSignUp: async () => {},
  verifySignUpOtp: async () => {},
  resendSignUpOtp: async () => {},
  startSignIn: async () => {},
  verifySignInOtp: async () => {},
  resendSignInOtp: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  login: async () => {},
  signup: async () => {},
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => false,
  loginWithDirectUser: () => {},
  updateProfile: async () => {},
  setUserGrade: async () => {},
  setRole: async () => {},
  favorites: new Set(),
  toggleFavorite: async () => {},
  isFavorite: () => false,
  refreshFavorites: async () => {},
  recordRecent: async () => {},
  authModalOpen: false,
  setAuthModalOpen: () => {},
  authModalMode: 'signup',
  setAuthModalMode: () => {},
  openAuthModal: () => {},
  isStudent: true,
  isTeacher: false,
  isAdmin: false,
  isSuperAdmin: false,
  canAccessTeacher: false,
  canAccessAdmin: false,
  canAccessSuperAdmin: false,
  authFetch: async () => new Response()
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isAuthLoaded, isSignedIn, userId: clerkUserId, getToken, signOut: clerkSignOut } = useAuth();
  const { isLoaded: isUserLoaded, user: clerkUser } = useClerkUser();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const clerk = useClerk();

  // Read initial persistent user from localStorage (prevents sudden auto-logout on refresh)
  const [persistentUser, setPersistentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(PERSISTENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.id || parsed.email)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse persistent user:', e);
    }
    return null;
  });

  const savePersistentUser = useCallback((userToSave: User | null) => {
    try {
      if (userToSave && (userToSave.id || userToSave.email)) {
        localStorage.setItem(PERSISTENT_USER_KEY, JSON.stringify(userToSave));
        setPersistentUser(userToSave);
      } else {
        localStorage.removeItem(PERSISTENT_USER_KEY);
        setPersistentUser(null);
      }
    } catch (e) {
      console.warn('Failed to write persistent user:', e);
    }
  }, []);

  const [dbUser, setDbUser] = useState<User | null>(persistentUser);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(!persistentUser);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [authTimeoutReached, setAuthTimeoutReached] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimeoutReached(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Pending signup registration metadata during OTP verification
  const pendingSignUpMetaRef = useRef<SignUpParams | null>(null);
  const pendingSignInFactorIdRef = useRef<string | null>(null);

  // Authenticated fetch helper that automatically attaches Clerk Bearer Token or persistent headers
  const authFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let token: string | null = null;
    try {
      if (isSignedIn) {
        token = await getToken();
      }
    } catch (e) {
      console.warn('Could not retrieve Clerk session token:', e);
    }

    const currentEffectiveUser = dbUser || persistentUser;
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else if (currentEffectiveUser?.id) {
      headers.set('Authorization', `Bearer ${currentEffectiveUser.id}`);
    }

    if (currentEffectiveUser) {
      if (currentEffectiveUser.id) headers.set('x-user-id', currentEffectiveUser.id);
      if (currentEffectiveUser.clerkUserId) headers.set('x-clerk-user-id', currentEffectiveUser.clerkUserId);
      if (currentEffectiveUser.email) headers.set('x-user-email', currentEffectiveUser.email);
      if (currentEffectiveUser.name) headers.set('x-user-name', encodeURIComponent(currentEffectiveUser.name));
      if (currentEffectiveUser.role) headers.set('x-user-role', currentEffectiveUser.role);
    }

    return fetch(input, {
      ...init,
      headers
    });
  }, [isSignedIn, getToken, dbUser, persistentUser]);

  // Refresh Favorites from backend
  const refreshFavorites = useCallback(async () => {
    try {
      const res = await authFetch('/api/favorites');
      if (res.ok) {
        const favs: Simulation[] = await res.json();
        setFavorites(new Set(favs.map(f => f.id)));
      }
    } catch (e) {
      console.error('Failed to refresh favorites:', e);
    }
  }, [authFetch]);

  // Direct login / sync helper for persistent session
  const loginWithDirectUser = useCallback((usr: User) => {
    setDbUser(usr);
    savePersistentUser(usr);
    refreshFavorites();
  }, [savePersistentUser, refreshFavorites]);

  // Reconcile and synchronize Clerk User with LearnLab Database
  const reconcileUserWithDatabase = useCallback(async (customParams?: Partial<SignUpParams>) => {
    // Check if user is signed in or session is available
    const effectiveClerkId = clerkUserId || clerk?.session?.user?.id || clerk?.user?.id || persistentUser?.clerkUserId;
    const hasActiveSession = Boolean(isSignedIn || clerk?.session || persistentUser);

    // If Clerk auth is loaded and user is explicitly not signed in and no session exists:
    if (isAuthLoaded && !hasActiveSession && !effectiveClerkId && !customParams?.email && !pendingSignUpMetaRef.current?.email && !persistentUser) {
      setDbUser(null);
      savePersistentUser(null);
      setLoading(false);
      return;
    }

    // Resolve user email
    const primaryEmail = 
      clerkUser?.primaryEmailAddress?.emailAddress || 
      clerkUser?.emailAddresses?.[0]?.emailAddress || 
      clerk?.user?.primaryEmailAddress?.emailAddress ||
      clerk?.session?.user?.primaryEmailAddress?.emailAddress ||
      customParams?.email ||
      pendingSignUpMetaRef.current?.email ||
      persistentUser?.email ||
      '';

    // If clerkUser is not yet ready and no email was supplied, wait for isUserLoaded
    if (!isUserLoaded && !primaryEmail && !effectiveClerkId) {
      return;
    }

    try {
      let token: string | null = null;
      try {
        token = await getToken();
        if (!token && clerk?.session) {
          token = await clerk.session.getToken();
        }
      } catch (e) {
        console.warn('Could not acquire session token:', e);
      }

      const fullName = 
        [clerkUser?.firstName || clerk?.user?.firstName, clerkUser?.lastName || clerk?.user?.lastName].filter(Boolean).join(' ') || 
        clerkUser?.username || 
        clerk?.user?.username || 
        customParams?.name || 
        pendingSignUpMetaRef.current?.name || 
        persistentUser?.name ||
        '';

      const avatarUrl = clerkUser?.imageUrl || clerk?.user?.imageUrl || customParams?.avatar || pendingSignUpMetaRef.current?.avatar || persistentUser?.avatar || '';
      const targetGrade = customParams?.grade || pendingSignUpMetaRef.current?.grade || persistentUser?.grade;
      const targetRole = customParams?.role || pendingSignUpMetaRef.current?.role || persistentUser?.role;

      const syncRes = await fetch('/api/auth/clerk-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(primaryEmail ? { 'x-user-email': primaryEmail } : {})
        },
        body: JSON.stringify({
          clerkUserId: effectiveClerkId || undefined,
          email: primaryEmail || undefined,
          name: fullName || undefined,
          avatar: avatarUrl || undefined,
          grade: targetGrade,
          role: targetRole === 'TEACHER' ? 'TEACHER' : undefined
        })
      });

      if (syncRes.ok) {
        const data = await syncRes.json();
        if (data.user) {
          setDbUser(data.user);
          savePersistentUser(data.user);
          pendingSignUpMetaRef.current = null;
          await refreshFavorites();
          setLoading(false);
          return;
        }
      }

      // Fallback: Query /api/me using verified session token or email header
      const meHeaders: Record<string, string> = {};
      if (token) meHeaders['Authorization'] = `Bearer ${token}`;
      if (primaryEmail) meHeaders['x-user-email'] = primaryEmail;
      if (effectiveClerkId) meHeaders['x-user-id'] = effectiveClerkId;

      const meRes = await fetch('/api/me', { headers: meHeaders });
      if (meRes.ok) {
        const user = await meRes.json();
        if (user && user.id) {
          setDbUser(user);
          savePersistentUser(user);
          pendingSignUpMetaRef.current = null;
          await refreshFavorites();
        }
      }
    } catch (err) {
      console.error('User reconciliation error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, clerkUserId, clerkUser, clerk, getToken, refreshFavorites, persistentUser, savePersistentUser]);

  // Session Synchronization Effect: Only trigger once auth & user are ready
  useEffect(() => {
    if (!isAuthLoaded) {
      // If we already have persistentUser from localStorage, use it immediately!
      if (persistentUser) {
        setDbUser(persistentUser);
        setLoading(false);
      }
      return;
    }

    if (isSignedIn && clerkUserId) {
      if (isUserLoaded) {
        reconcileUserWithDatabase();
      }
    } else if (!isSignedIn && !clerk?.session) {
      // IMPORTANT: DO NOT automatically log out if user has a valid persistent session!
      // Stay signed in until the user clicks "logout" explicitly!
      if (persistentUser && persistentUser.email) {
        if (!dbUser) {
          setDbUser(persistentUser);
          refreshFavorites();
        }
      } else {
        setDbUser(null);
        setFavorites(new Set());
      }
      setLoading(false);
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, clerkUserId, clerk, reconcileUserWithDatabase, persistentUser, dbUser, refreshFavorites]);

  // 1. Explicit Authentication Initialization State:
  // Not initializing if persistentUser already exists or timeout reached!
  const isAuthInitializing = !isAuthLoaded && !persistentUser && !authTimeoutReached;
  const authLoading = isAuthInitializing;

  // 2. Authenticated: Clerk reports active session OR persistent user exists in localStorage
  const isAuthenticated = Boolean(
    (isAuthLoaded && isSignedIn) || 
    (persistentUser && (persistentUser.email || persistentUser.id)) ||
    (dbUser && (dbUser.email || dbUser.id))
  );

  // 3. Unauthenticated: Confirmed no active session AND no persistent user
  const isUnauthenticated = Boolean(isAuthLoaded && !isSignedIn && !persistentUser && !dbUser);

  // Optimistic fallback user object while dbUser completes database synchronization
  const optimisticUser: User = useMemo(() => {
    const email = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || persistentUser?.email || '';
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || clerkUser?.username || persistentUser?.name || 'Learner';
    const isSuper = isSuperAdminEmail(email);
    return {
      id: clerkUserId || persistentUser?.id || 'user_authenticated',
      clerkUserId: clerkUserId || persistentUser?.clerkUserId || '',
      email,
      name,
      displayName: name,
      avatar: clerkUser?.imageUrl || persistentUser?.avatar || ('https://api.dicebear.com/7.x/bottts/svg?seed=' + (clerkUserId || 'learner')),
      role: isSuper ? 'SUPER_ADMIN' : (persistentUser?.role || 'STUDENT'),
      grade: persistentUser?.grade || '9-A',
      joinedDate: '2026',
      createdAt: new Date().toISOString(),
      learningActivity: {
        simulationsExplored: 0,
        inquiriesCompleted: 0,
        favoritesCount: 0
      }
    };
  }, [clerkUser, clerkUserId, persistentUser]);

  // Active user object: Never use guestUser if an active session or persistentUser exists!
  const activeUser = dbUser || persistentUser || (isSignedIn ? optimisticUser : guestUser);

  // Strict RBAC Access Evaluation
  const normRole = (activeUser.role || 'STUDENT').toUpperCase();
  const isSuperAdmin = isAuthenticated && (normRole === 'SUPER_ADMIN' || isSuperAdminEmail(activeUser.email));
  const isAdmin = isAuthenticated && (normRole === 'ADMIN');
  const isTeacher = isAuthenticated && (normRole === 'TEACHER');
  const isStudent = isAuthenticated && (normRole === 'STUDENT' || !normRole);

  const canAccessTeacher = isAuthenticated && (isTeacher || isSuperAdmin);
  const canAccessAdmin = isAuthenticated && (isAdmin || isSuperAdmin);
  const canAccessSuperAdmin = isSuperAdmin;

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  // 1. Clerk Email OTP Sign Up: Step 1 (Initiate)
  const startSignUp = async (params: SignUpParams) => {
    if (!isSignUpLoaded) {
      throw new Error('Authentication service is still initializing. Please try again.');
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.name.trim();

    const parts = cleanName.split(' ');
    const firstName = parts[0] || 'Learner';
    const lastName = parts.slice(1).join(' ') || undefined;

    pendingSignUpMetaRef.current = {
      ...params,
      email: cleanEmail,
      name: cleanName
    };

    // Create Clerk sign up attempt
    await signUp.create({
      emailAddress: cleanEmail,
      firstName,
      lastName
    });

    // Prepare email OTP code verification
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

  // 2. Clerk Email OTP Sign Up: Step 2 (Verify OTP)
  const verifySignUpOtp = async (code: string) => {
    if (!isSignUpLoaded) {
      throw new Error('Authentication service is still initializing.');
    }

    const cleanCode = code.trim();
    let completeSignUp = await signUp.attemptEmailAddressVerification({
      code: cleanCode
    });

    const emailStatus = completeSignUp.verifications?.emailAddress?.status;
    const isEmailVerified = emailStatus === 'verified';

    // Development diagnostic log (safe: no tokens, secrets, or raw passwords)
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.log('[Clerk SignUp OTP Status]', {
        status: completeSignUp.status,
        emailVerificationStatus: emailStatus,
        missingFields: completeSignUp.missingFields,
        unverifiedFields: completeSignUp.unverifiedFields,
        hasSession: Boolean(completeSignUp.createdSessionId)
      });
    }

    // If the verification code was invalid/expired
    if (!isEmailVerified && completeSignUp.status !== 'complete') {
      throw new Error('Verification code is incorrect or expired. Please check your verification code.');
    }

    // If email is verified but missing requirements (such as password required by Clerk Dashboard settings)
    if (completeSignUp.status === 'missing_requirements') {
      const meta = pendingSignUpMetaRef.current;
      const updates: Record<string, any> = {};

      if (completeSignUp.missingFields?.includes('password')) {
        // If password is required by instance settings, provide a secure random credential
        updates.password = `LearnLab#${Math.random().toString(36).slice(2, 10)}!${Date.now()}`;
      }
      if (completeSignUp.missingFields?.includes('first_name') && meta?.name) {
        updates.firstName = meta.name.split(' ')[0] || 'Learner';
      }
      if (completeSignUp.missingFields?.includes('last_name') && meta?.name) {
        updates.lastName = meta.name.split(' ').slice(1).join(' ') || 'User';
      }

      if (Object.keys(updates).length > 0) {
        completeSignUp = await completeSignUp.update(updates);
      }
    }

    // Set active session in Clerk if session ID is created
    if (completeSignUp.createdSessionId) {
      await setSignUpActive({ session: completeSignUp.createdSessionId });
    } else if (completeSignUp.status !== 'complete') {
      throw new Error(
        `Verification incomplete. Missing requirements: ${(completeSignUp.missingFields || []).join(', ')}`
      );
    }

    // Reconcile and save profile to database
    const meta = pendingSignUpMetaRef.current;
    await reconcileUserWithDatabase(meta || undefined);
    setAuthModalOpen(false);
  };

  // Resend Sign Up OTP
  const resendSignUpOtp = async () => {
    if (!isSignUpLoaded) return;
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

  // 3. Clerk Email OTP Sign In: Step 1 (Initiate)
  const startSignIn = async (email: string) => {
    if (!isSignInLoaded) {
      throw new Error('Authentication service is still initializing. Please try again.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const signInAttempt = await signIn.create({
      identifier: cleanEmail
    });

    const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
      (factor: any) => factor.strategy === 'email_code'
    ) as any;

    if (!emailCodeFactor || !emailCodeFactor.emailAddressId) {
      throw new Error('Email verification is not enabled for this account.');
    }

    pendingSignInFactorIdRef.current = emailCodeFactor.emailAddressId;

    await signIn.prepareFirstFactor({
      strategy: 'email_code',
      emailAddressId: emailCodeFactor.emailAddressId
    });
  };

  // 4. Clerk Email OTP Sign In: Step 2 (Verify OTP)
  const verifySignInOtp = async (code: string) => {
    if (!isSignInLoaded) {
      throw new Error('Authentication service is still initializing.');
    }

    const cleanCode = code.trim();
    const completeSignIn = await signIn.attemptFirstFactor({
      strategy: 'email_code',
      code: cleanCode
    });

    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.log('[Clerk SignIn OTP Status]', {
        status: completeSignIn.status,
        firstFactorStatus: completeSignIn.firstFactorVerification?.status,
        hasSession: Boolean(completeSignIn.createdSessionId)
      });
    }

    if (completeSignIn.status === 'complete' && completeSignIn.createdSessionId) {
      await setSignInActive({ session: completeSignIn.createdSessionId });
    } else if (completeSignIn.status === 'needs_second_factor') {
      throw new Error('Two-factor authentication required.');
    } else {
      throw new Error('Verification incomplete. Please check your code.');
    }

    await reconcileUserWithDatabase();
    setAuthModalOpen(false);
  };

  // Resend Sign In OTP
  const resendSignInOtp = async () => {
    if (!isSignInLoaded || !pendingSignInFactorIdRef.current) return;
    await signIn.prepareFirstFactor({
      strategy: 'email_code',
      emailAddressId: pendingSignInFactorIdRef.current
    });
  };

  // 5. Google OAuth through Clerk
  const loginWithGoogle = async () => {
    if (!isSignInLoaded) {
      throw new Error('Authentication service is still initializing.');
    }

    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/'
    });
  };

  // 6. Sign Out
  const logout = async () => {
    try {
      await clerkSignOut();
      await clerk.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      savePersistentUser(null);
      try {
        localStorage.removeItem(PERSISTENT_TOKEN_KEY);
        localStorage.removeItem(PERSISTENT_USER_KEY);
      } catch {}
      setDbUser(null);
      setFavorites(new Set());
      setAuthModalMode('login');
      setAuthModalOpen(false);
    }
  };

  // Direct Fallback implementations for legacy API consumers
  const login = async (email: string) => {
    await startSignIn(email);
  };

  const signup = async (userData: Partial<User> & { email: string; name: string }) => {
    await startSignUp({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      grade: userData.grade,
      avatar: userData.avatar
    });
  };

  const sendOtp = async (email: string) => {
    try {
      await startSignIn(email);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    try {
      await verifySignInOtp(code);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Profile Updates
  const updateProfile = async (updates: Partial<User>) => {
    const effective = dbUser || persistentUser;
    if (!effective?.id) return;
    const res = await authFetch('/api/users/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const updated = await res.json();
      setDbUser(updated);
      savePersistentUser(updated);
    }
  };

  const setUserGrade = async (grade: string) => {
    await updateProfile({ grade });
  };

  const setRole = async (role: UserRole) => {
    const effective = dbUser || persistentUser;
    if (!effective?.id) return;
    const res = await authFetch('/api/auth/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userId: effective.id })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setDbUser(data.user);
        savePersistentUser(data.user);
      }
    }
  };

  // Toggle Favorite Simulation
  const toggleFavorite = async (simulation: Simulation) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const simId = simulation.id;
    const isCurrentlyFav = favorites.has(simId);

    // Optimistic UI update
    setFavorites(prev => {
      const next = new Set(prev);
      if (isCurrentlyFav) next.delete(simId);
      else next.add(simId);
      return next;
    });

    try {
      const res = await authFetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: simId })
      });
      if (!res.ok) {
        // Revert on error
        await refreshFavorites();
      }
    } catch (e) {
      await refreshFavorites();
    }
  };

  const isFavorite = (simulationId: string): boolean => {
    return favorites.has(simulationId);
  };

  const recordRecent = async (simulationId: string) => {
    if (!isAuthenticated) return;
    try {
      await authFetch('/api/recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId })
      });
    } catch (e) {
      // Non-blocking
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: activeUser,
        rawUser: dbUser,
        isAuthenticated,
        isUnauthenticated,
        loading: isAuthInitializing,
        authLoading: isAuthInitializing,
        isAuthInitializing,
        startSignUp,
        verifySignUpOtp,
        resendSignUpOtp,
        startSignIn,
        verifySignInOtp,
        resendSignInOtp,
        loginWithGoogle,
        logout,
        login,
        signup,
        sendOtp,
        verifyOtp,
        loginWithDirectUser,
        updateProfile,
        setUserGrade,
        setRole,
        favorites,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
        recordRecent,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        isStudent,
        isTeacher,
        isAdmin,
        isSuperAdmin,
        canAccessTeacher,
        canAccessAdmin,
        canAccessSuperAdmin,
        authFetch
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
