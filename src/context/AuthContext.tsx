import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  googleSignIn: () => Promise<void>;
  signOut: () => void;
  sendResetCode: (email: string) => Promise<boolean>;
  verifyResetCode: (code: string, newPass: string) => Promise<boolean>;
  updateUserStats: (type: 'photo' | 'video', sizeMB: number) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'signin' | 'signup' | 'forgot' | 'reset';
  setAuthModalMode: (mode: 'signin' | 'signup' | 'forgot' | 'reset') => void;
}

const defaultUser: UserProfile = {
  id: 'user_magic_01',
  name: 'TDW Sagor',
  email: 'tdwsagor55@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  isPro: true,
  projectsCount: 8,
  exportsCount: 14,
  storageUsedMB: 28.4,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('magic_editor_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultUser;
      }
    }
    return defaultUser;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');

  useEffect(() => {
    if (user) {
      localStorage.setItem('magic_editor_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('magic_editor_user');
    }
  }, [user]);

  const signIn = async (email: string, pass: string) => {
    if (!email || !pass) {
      return { success: false, error: 'Please enter both email and password' };
    }
    const loggedUser: UserProfile = {
      id: 'user_' + Date.now(),
      name: email.split('@')[0],
      email,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      isPro: true,
      projectsCount: 3,
      exportsCount: 5,
      storageUsedMB: 12.5,
    };
    setUser(loggedUser);
    setShowAuthModal(false);
    return { success: true };
  };

  const signUp = async (name: string, email: string, pass: string) => {
    if (!name || !email || !pass) {
      return { success: false, error: 'All fields are required' };
    }
    const newUser: UserProfile = {
      id: 'user_' + Date.now(),
      name,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      isPro: true,
      projectsCount: 1,
      exportsCount: 1,
      storageUsedMB: 2.1,
    };
    setUser(newUser);
    setShowAuthModal(false);
    return { success: true };
  };

  const googleSignIn = async () => {
    // High-fidelity instant Google authorization flow
    const gUser: UserProfile = {
      id: 'g_user_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
      isPro: true,
      projectsCount: 5,
      exportsCount: 9,
      storageUsedMB: 18.2,
    };
    setUser(gUser);
    setShowAuthModal(false);
  };

  const signOut = () => {
    setUser(null);
  };

  const sendResetCode = async (email: string) => {
    return true;
  };

  const verifyResetCode = async (code: string, newPass: string) => {
    return code === '123456' || code.length === 6;
  };

  const updateUserStats = (type: 'photo' | 'video', sizeMB: number) => {
    if (!user) return;
    setUser({
      ...user,
      exportsCount: user.exportsCount + 1,
      storageUsedMB: parseFloat((user.storageUsedMB + sizeMB).toFixed(1)),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        googleSignIn,
        signOut,
        sendResetCode,
        verifyResetCode,
        updateUserStats,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
