'use client';

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';
import { User, UserRole } from '@/types/privacy';

interface AuthContextType {
  user: User | null;
  apiKey: string;
  selectedModel: string;
  isServerConfigured: boolean;
  serverKeyMasked: string;
  serverModel: string;
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  saveServerApiKey: (key: string, model?: string) => Promise<{ success: boolean; message?: string }>;
  refreshServerStatus: () => Promise<void>;
  login: (role: UserRole, customEmail?: string, customName?: string) => void;
  logout: () => void;
  upgradeToPro: () => void;
  isProOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage event bus for instant in-tab and multi-tab sync
const storageListeners = new Set<() => void>();
const notifyStorageListeners = () => {
  storageListeners.forEach((l) => l());
};

const subscribeToStorage = (callback: () => void) => {
  storageListeners.add(callback);
  const onStorage = () => callback();
  window.addEventListener('storage', onStorage);
  return () => {
    storageListeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
};

let cachedUserRaw: string | null = null;
let cachedUserParsed: User | null = null;

const getUserSnapshot = (): User | null => {
  try {
    const raw = localStorage.getItem('privacyhelper_user');
    if (raw !== cachedUserRaw) {
      cachedUserRaw = raw;
      cachedUserParsed = raw ? JSON.parse(raw) : null;
    }
    return cachedUserParsed;
  } catch {
    return null;
  }
};

const getApiKeySnapshot = (): string => {
  try {
    return localStorage.getItem('privacyhelper_api_key') || '';
  } catch {
    return '';
  }
};

const getModelSnapshot = (): string => {
  try {
    return localStorage.getItem('privacyhelper_model') || 'z-ai/glm-5.2';
  } catch {
    return 'z-ai/glm-5.2';
  }
};

const getServerUserSnapshot = (): User | null => null;
const getServerApiKeySnapshot = (): string => '';
const getServerModelSnapshot = (): string => 'z-ai/glm-5.2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSyncExternalStore(subscribeToStorage, getUserSnapshot, getServerUserSnapshot);
  const apiKey = useSyncExternalStore(subscribeToStorage, getApiKeySnapshot, getServerApiKeySnapshot);
  const selectedModel = useSyncExternalStore(subscribeToStorage, getModelSnapshot, getServerModelSnapshot);

  const [isServerConfigured, setIsServerConfigured] = useState(false);
  const [serverKeyMasked, setServerKeyMasked] = useState('');
  const [serverModel, setServerModel] = useState('z-ai/glm-5.2');

  const refreshServerStatus = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setIsServerConfigured(Boolean(json.data.isConfigured));
          setServerKeyMasked(json.data.keyMasked || '');
          setServerModel(json.data.selectedModel || 'z-ai/glm-5.2');
        }
      }
    } catch (err) {
      console.warn('Could not check server AI config status:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/admin/config');
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            setIsServerConfigured(Boolean(json.data.isConfigured));
            setServerKeyMasked(json.data.keyMasked || '');
            setServerModel(json.data.selectedModel || 'z-ai/glm-5.2');
          }
        }
      } catch (err) {
        console.warn('Could not check server AI config status:', err);
      }
    };
    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveServerApiKey = async (key: string, model: string = 'z-ai/glm-5.2') => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key, model })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshServerStatus();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || '저장 실패' };
    } catch (err: any) {
      return { success: false, message: err.message || '서버 통신 실패' };
    }
  };

  const setApiKey = (key: string) => {
    try {
      if (key) {
        localStorage.setItem('privacyhelper_api_key', key);
      } else {
        localStorage.removeItem('privacyhelper_api_key');
      }
      notifyStorageListeners();
    } catch (e) {
      console.warn('Failed to save API key:', e);
    }
  };

  const setSelectedModel = (model: string) => {
    try {
      localStorage.setItem('privacyhelper_model', model);
      notifyStorageListeners();
    } catch (e) {
      console.warn('Failed to save model:', e);
    }
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
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${role}_demo`
    };
    try {
      localStorage.setItem('privacyhelper_user', JSON.stringify(newUser));
      notifyStorageListeners();
    } catch (e) {
      console.warn('Failed to save user login:', e);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('privacyhelper_user');
      notifyStorageListeners();
    } catch (e) {
      console.warn('Failed to remove user on logout:', e);
    }
  };

  const upgradeToPro = () => {
    const current = user;
    if (!current) {
      login('PRO');
      return;
    }
    const updated: User = {
      ...current,
      role: 'PRO',
      name: current.name.includes('(PRO)') ? current.name : `${current.name} (PRO)`
    };
    try {
      localStorage.setItem('privacyhelper_user', JSON.stringify(updated));
      notifyStorageListeners();
    } catch (e) {
      console.warn('Failed to upgrade user to PRO:', e);
    }
  };

  const isProOrAdmin = Boolean(user && (user.role === 'PRO' || user.role === 'ADMIN'));

  return (
    <AuthContext.Provider
      value={{
        user,
        apiKey,
        selectedModel,
        isServerConfigured,
        serverKeyMasked,
        serverModel,
        setApiKey,
        setSelectedModel,
        saveServerApiKey,
        refreshServerStatus,
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
