
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<User | null>;
  signupWithEmail: (email: string, pass: string, username: string) => Promise<User | null>;
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Check for redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast({
            title: "Login Successful",
            description: `Welcome back, ${result.user.displayName}!`
          });
          router.push('/dashboard');
        }
      })
      .catch((error) => {
        console.error("Redirect result error", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "An unexpected error occurred during redirect."
        })
      });

    return () => unsubscribe();
  }, [router, toast]);

  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        return userCredential.user;
    } catch (error) {
        console.error("Email/Password login error", error);
        throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, username: string): Promise<User | null> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        if(userCredential.user) {
            await updateProfile(userCredential.user, { displayName: username });
            // Manually update the user state as onAuthStateChanged might not fire immediately
            setUser({ ...userCredential.user, displayName: username });
        }
        return userCredential.user;
    } catch (error) {
        console.error("Email/Password signup error", error);
        throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
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
