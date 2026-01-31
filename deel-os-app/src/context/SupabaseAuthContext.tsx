import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'viewer' | 'editor' | 'admin';
  login: () => Promise<void>;
  logout: () => Promise<void>;
  showError: (message: string) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAIN = 'deel.com';

interface AuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSessionChange(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionChange = async (session: Session | null) => {
    setSession(session);
    setSupabaseUser(session?.user || null);

    if (session?.user) {
      const email = session.user.email || '';
      const domain = email.split('@')[1];

      // Check domain restriction
      if (domain !== ALLOWED_DOMAIN) {
        setError(`Access denied. Only @${ALLOWED_DOMAIN} accounts are allowed.`);
        await supabase?.auth.signOut();
        setUser(null);
        return;
      }

      // Set user info
      setUser({
        name: session.user.user_metadata?.full_name || session.user.email || '',
        email: session.user.email || '',
        picture: session.user.user_metadata?.avatar_url || ''
      });

      // Fetch role from profiles table
      if (supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileData = data as any;
        if (profileData?.role) {
          setRole(profileData.role as 'viewer' | 'editor' | 'admin');
        }
      }

      setError(null);
    } else {
      setUser(null);
      setRole('viewer');
    }
  };

  const login = async () => {
    if (!supabase) {
      setError('Authentication not configured. Please set up Supabase.');
      return;
    }

    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          hd: ALLOWED_DOMAIN, // Restrict to deel.com domain
          prompt: 'select_account'
        },
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setError(error.message);
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    setRole('viewer');
  };

  const showError = (message: string) => {
    setError(message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!user,
        isLoading,
        role,
        login,
        logout,
        showError,
        error
      }}
    >
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

// Export for checking if Supabase is configured
export { isSupabaseConfigured };
