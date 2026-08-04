import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type AuthError,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const ADMIN_EMAIL = 'spotifypremiumfor3month@gmail.com';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Complete a redirect-based sign-in when the browser returns from Google.
    getRedirectResult(auth).catch((error: AuthError) => {
      console.error('Google redirect sign-in failed:', error.code, error.message);
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const authError = error as AuthError;
      // Replit previews and some mobile browsers block popups. Redirect is
      // the reliable fallback and returns to this app after Google completes.
      if (
        authError.code === 'auth/popup-blocked' ||
        authError.code === 'auth/operation-not-supported-in-this-environment' ||
        authError.code === 'auth/web-storage-unsupported' ||
        authError.code === 'auth/internal-error'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw error;
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.email === ADMIN_EMAIL,
        signInWithGoogle,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
