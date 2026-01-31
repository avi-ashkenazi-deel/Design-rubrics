import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'viewer' | 'editor' | 'admin';
  login: (password: string) => boolean;
  logout: () => void;
  showError: (message: string) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password for access
const ACCESS_PASSWORD = 'only-design-rubric-magic';

interface AuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('editor'); // Default to editor for password access
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('rubric_auth');
    if (storedAuth === 'authenticated') {
      setUser({
        name: 'Deel User',
        email: 'user@deel.com',
        picture: ''
      });
      setRole('editor');
    }
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem('rubric_auth', 'authenticated');
      setUser({
        name: 'Deel User',
        email: 'user@deel.com',
        picture: ''
      });
      setRole('editor');
      setError(null);
      return true;
    } else {
      setError('Incorrect password');
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('rubric_auth');
    setUser(null);
    setRole('viewer');
  };

  const showError = (message: string) => {
    setError(message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
