
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { 
    type User, 
    type UserRole, 
    authenticateUser, 
    registerUser, 
    getUserByEmail, 
    initializeUsers 
} from '@/lib/auth-data';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (email: string, pass: string, username: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
);

const SESSION_KEY = 'savora-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initialize default users if not already present
    initializeUsers();

    try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            const sessionUser = JSON.parse(session);
            const fullUser = getUserByEmail(sessionUser.email);
            if (fullUser) {
                setUser(fullUser);
                setUserRole(fullUser.role);
            }
        }
    } catch (error) {
        console.error("Failed to parse user session:", error);
        localStorage.removeItem(SESSION_KEY);
    } finally {
        setLoading(false);
    }
  }, []);

  const signup = async (email: string, password: string, username: string): Promise<User | null> => {
    const newUser = registerUser({ email, password, displayName: username, role: 'user' });
    if (newUser) {
      return newUser;
    }
    throw new Error("User with this email already exists.");
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    const authenticatedUser = authenticateUser(email, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setUserRole(authenticatedUser.role);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
      return authenticatedUser;
    }
    throw new Error("Invalid email or password.");
  };

  const logout = useCallback(() => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem(SESSION_KEY);
    // The redirect will be handled by the pages themselves
  }, []);

  const value = {
    user,
    userRole,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
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
