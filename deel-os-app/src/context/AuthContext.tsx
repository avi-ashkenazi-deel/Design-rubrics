import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  showError: (message: string) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAIN = 'deel.com';

// Decode JWT payload
function decodeJwtPayload(token: string): Record<string, string> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    console.error('Failed to decode JWT');
    return null;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('deelos_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem('deelos_user');
      }
    }
  }, []);

  // Expose handleGoogleSignIn to window for Google callback
  useEffect(() => {
    (window as Window & { handleGoogleSignIn?: (response: { credential: string }) => void }).handleGoogleSignIn = (response: { credential: string }) => {
      const payload = decodeJwtPayload(response.credential);
      
      if (!payload) {
        setError('Failed to process sign-in. Please try again.');
        return;
      }

      const email = payload.email || '';
      const domain = email.split('@')[1];

      if (domain !== ALLOWED_DOMAIN) {
        setError(`Access denied. Only @${ALLOWED_DOMAIN} accounts are allowed.`);
        return;
      }

      const newUser: User = {
        name: payload.name || '',
        email: payload.email || '',
        picture: payload.picture || ''
      };

      sessionStorage.setItem('deelos_user', JSON.stringify(newUser));
      setUser(newUser);
      setError(null);
    };

    return () => {
      delete (window as Window & { handleGoogleSignIn?: unknown }).handleGoogleSignIn;
    };
  }, []);

  const login = (newUser: User) => {
    sessionStorage.setItem('deelos_user', JSON.stringify(newUser));
    setUser(newUser);
    setError(null);
  };

  const logout = () => {
    sessionStorage.removeItem('deelos_user');
    setUser(null);
    // Reload page to reset Google state
    window.location.reload();
  };

  const showError = (message: string) => {
    setError(message);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      showError,
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

