import { useState, useEffect, createContext, useContext } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'freelancer' | 'recruiter') => Promise<{ error: any; message?: string; emailSent?: boolean; devVerificationUrl?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ error: any; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, role: 'freelancer' | 'recruiter') => {
    try {
      const result = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      // New signup flow returns message instead of user
      return { error: null, message: result.message, emailSent: result.emailSent, devVerificationUrl: result.devVerificationUrl };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Signup failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await apiRequest('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
    return { error: null };
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const result = await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { error: null, message: result.message };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Failed to resend verification email' } };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};