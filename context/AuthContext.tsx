'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/privacy';

interface AuthContextType {
  user: User | null;
  apiKey: string;
  selectedModel: string;
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  login: (role: UserRole, customEmail?: string, customName?: string) => void;
  logout: () => void;
  upgradeToPro: () => void;
  isProOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('privacyhelper_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [apiKey, setApiKeyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('privacyhelper_api_key') || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('privacyhelper_model') || 'meta/llama-3.1-70b-instruct';
      } catch (e) {
        return 'meta/llama-3.1-70b-instruct';
      }
    }
    return 'meta/llama-3.1-70b-instruct';
  });

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    try {
      if (key) {
        localStorage.setItem('privacyhelper_api_key', key);
      } else {
        localStorage.removeItem('privacyhelper_api_key');
      }
    } catch (e) {}
  };

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    try {
      localStorage.setItem('privacyhelper_model', model);
    } catch (e) {}
  };

  const login = (role: UserRole, customEmail?: string, customName?: string) => {
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email:
        customEmail ||
        (role === 'ADMIN'
          ? 'admin@privacyhelper.com'
          : role === 'PRO'
          ? 'pro_member@example.com'
          : 'user@example.com'),
      name:
        customName ||
        (role === 'ADMIN'
          ? '관리자 (Admin)'
          : role === 'PRO'
          ? '김프로 (PRO 회원)'
          : '이민수 (일반 회원)'),
      role: role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${role}_${Date.now()}`
    };
    setUser(newUser);
    try {
      localStorage.setItem('privacyhelper_user', JSON.stringify(newUser));
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('privacyhelper_user');
    } catch (e) {}
  };

  const upgradeToPro = () => {
    if (!user) {
      login('PRO');
      return;
    }
    const updated: User = {
      ...user,
      role: 'PRO',
      name: user.name.includes('(PRO)') ? user.name : `${user.name} (PRO)`
    };
    setUser(updated);
    try {
      localStorage.setItem('privacyhelper_user', JSON.stringify(updated));
    } catch (e) {}
  };

  const isProOrAdmin = Boolean(user && (user.role === 'PRO' || user.role === 'ADMIN'));

  return (
    <AuthContext.Provider
      value={{
        user,
        apiKey,
        selectedModel,
        setApiKey,
        setSelectedModel,
        login,
        logout,
        upgradeToPro,
        isProOrAdmin
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
