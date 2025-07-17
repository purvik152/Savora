
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUser, removeUser, saveUser, type User } from '@/lib/auth-data';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (username: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const storedUser = getUser();
    if (storedUser) {
        setUser(storedUser);
    }
    setLoading(false);
  }, []);
  
  const login = async (email: string, pass: string) => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
        });

        const data = await response.json();

        if (data.success) {
            setUser(data.user);
            saveUser(data.user); // Save user to localStorage
            return true;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
  };

  const signup = async (username: string, email: string, pass: string) => {
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password: pass }),
        });

        const data = await response.json();
        
        if (data.success) {
            setUser(data.user);
            saveUser(data.user);
            return true;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error("Signup failed:", error);
        throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    removeUser(); // Clear user from localStorage
    router.push('/login');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
  }, [router, toast]);


  const value = {
    user,
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
