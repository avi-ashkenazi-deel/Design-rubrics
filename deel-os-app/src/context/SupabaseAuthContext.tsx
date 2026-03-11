import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, UserPermissions } from '../types';
import { DEFAULT_PERMISSIONS } from '../types';
import { getAllowedDisciplines, isAdmin } from '../data/disciplineAccess';
import { fetchUserPermissions, fetchAllUserPermissions } from '../utils/supabaseApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: UserPermissions;
  realPermissions: UserPermissions;
  allowedDisciplines: string[] | null;
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  error: string | null;
  setUserEmail: (email: string) => void;
  reloadPermissions: () => Promise<void>;
  // Impersonation (admin only)
  isImpersonating: boolean;
  impersonatingEmail: string | null;
  impersonate: (email: string) => Promise<void>;
  stopImpersonating: () => void;
  allUsers: UserPermissions[];
  loadAllUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isLocalhost = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

interface AuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realPermissions, setRealPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [impersonatedPermissions, setImpersonatedPermissions] = useState<UserPermissions | null>(null);
  const [impersonatingEmail, setImpersonatingEmail] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserPermissions[]>([]);
  const [error, setError] = useState<string | null>(null);

  const permissions = impersonatedPermissions ?? realPermissions;
  const isImpersonating = impersonatedPermissions !== null;

  const nameFromEmail = (email: string): string => {
    const local = email.split('@')[0];
    return local
      .split(/[._-]/)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  };

  const ADMIN_PERMISSIONS: UserPermissions = {
    email: '',
    role: 'admin',
    canEdit: true,
    visibleViews: ['competencies', 'rubrics', 'ladders', 'admin'],
    visibleTracks: [],
    allowedDisciplines: null,
    designerLevel: null,
  };

  const loadPermissions = useCallback(async (email: string): Promise<UserPermissions> => {
    if (isAdmin(email)) {
      return { ...ADMIN_PERMISSIONS, email };
    }

    try {
      const perms = await fetchUserPermissions(email);
      if (perms) return perms;
    } catch {
      // Supabase unavailable — fall back
    }

    const allowed = getAllowedDisciplines(email);
    return {
      ...DEFAULT_PERMISSIONS,
      email,
      allowedDisciplines: allowed,
    };
  }, []);

  const applySession = useCallback(async (email: string) => {
    const perms = await loadPermissions(email);
    setUser({ name: nameFromEmail(email), email, picture: '' });
    setRealPermissions(perms);
  }, [loadPermissions]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const isDeelEmail = (e: string) => e.toLowerCase().endsWith('@deel.com');

    supabase!.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email && isDeelEmail(session.user.email)) {
        await applySession(session.user.email);
      } else if (session?.user?.email) {
        await supabase!.auth.signOut();
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        if (!isDeelEmail(session.user.email)) {
          await supabase!.auth.signOut();
          setError('Only @deel.com email addresses are allowed');
          return;
        }
        await applySession(session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRealPermissions(DEFAULT_PERMISSIONS);
        setImpersonatedPermissions(null);
        setImpersonatingEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  useEffect(() => {
    if (!isLocalhost()) return;

    const storedEmail = sessionStorage.getItem('rubric_user_email');
    if (storedEmail) {
      applySession(storedEmail).then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [applySession]);

  const sendMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.toLowerCase().endsWith('@deel.com')) {
      const msg = 'Only @deel.com email addresses are allowed';
      setError(msg);
      return { success: false, error: msg };
    }

    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const redirectTo = `${window.location.origin}${window.location.pathname}`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (authError) {
      setError(authError.message);
      return { success: false, error: authError.message };
    }

    setError(null);
    return { success: true };
  };

  const setUserEmail = (email: string) => {
    if (!email.toLowerCase().endsWith('@deel.com')) {
      setError('Only @deel.com email addresses are allowed');
      return;
    }
    sessionStorage.setItem('rubric_user_email', email);
    applySession(email);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('rubric_user_email');
    setUser(null);
    setRealPermissions(DEFAULT_PERMISSIONS);
    setImpersonatedPermissions(null);
    setImpersonatingEmail(null);
  };

  const reloadPermissions = useCallback(async () => {
    if (!user) return;
    const perms = await loadPermissions(user.email);
    setRealPermissions(perms);
  }, [user, loadPermissions]);

  const loadAllUsers = useCallback(async () => {
    const users = await fetchAllUserPermissions();
    setAllUsers(users);
  }, []);

  const impersonate = useCallback(async (email: string) => {
    if (realPermissions.role !== 'admin') return;
    const perms = await loadPermissions(email);
    setImpersonatedPermissions(perms);
    setImpersonatingEmail(email);
  }, [realPermissions.role, loadPermissions]);

  const stopImpersonating = useCallback(() => {
    setImpersonatedPermissions(null);
    setImpersonatingEmail(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    permissions,
    realPermissions,
    allowedDisciplines: permissions.allowedDisciplines,
    sendMagicLink,
    logout,
    error,
    setUserEmail,
    reloadPermissions,
    isImpersonating,
    impersonatingEmail,
    impersonate,
    stopImpersonating,
    allUsers,
    loadAllUsers,
  }), [user, isLoading, permissions, realPermissions, error, reloadPermissions,
       isImpersonating, impersonatingEmail, impersonate, stopImpersonating,
       allUsers, loadAllUsers]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

export { isSupabaseConfigured };
export { isLocalhost };
