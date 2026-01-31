import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'viewer' | 'editor' | 'admin';
  login: (password: string, name: string) => boolean;
  logout: () => void;
  showError: (message: string) => void;
  error: string | null;
  setUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password for access
const ACCESS_PASSWORD = 'only-design-rubric-magic';

// Check if running on localhost (skip password)
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
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('editor'); // Default to editor for password access
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount, auto-auth on localhost
  useEffect(() => {
    // Auto-authenticate on localhost for development
    if (isLocalhost()) {
      const storedName = sessionStorage.getItem('rubric_user_name');
      if (storedName) {
        setUser({
          name: storedName,
          email: 'dev@localhost',
          picture: ''
        });
        setRole('editor');
      }
      // If no stored name on localhost, we'll prompt for it
      setIsLoading(false);
      return;
    }
    
    // Check for stored auth on production
    const storedAuth = sessionStorage.getItem('rubric_auth');
    const storedName = sessionStorage.getItem('rubric_user_name');
    if (storedAuth === 'authenticated' && storedName) {
      setUser({
        name: storedName,
        email: 'user@deel.com',
        picture: ''
      });
      setRole('editor');
    }
    setIsLoading(false);
  }, []);

  const login = (password: string, name: string): boolean => {
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem('rubric_auth', 'authenticated');
      sessionStorage.setItem('rubric_user_name', name);
      setUser({
        name: name,
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

  // Set user name (for localhost name prompt)
  const setUserName = (name: string) => {
    sessionStorage.setItem('rubric_user_name', name);
    setUser({
      name: name,
      email: isLocalhost() ? 'dev@localhost' : 'user@deel.com',
      picture: ''
    });
    setRole('editor');
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
        error,
        setUserName
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

// Export for checking if Supabase is configured and localhost detection
export { isSupabaseConfigured };
export { isLocalhost };
