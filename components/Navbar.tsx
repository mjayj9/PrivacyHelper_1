'use client';

import React, { useState } from 'react';
import { Shield, Key, Sparkles, LogIn, Bell, CheckCircle2, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  onOpenApiKey: () => void;
  onOpenAuth: () => void;
  onOpenPro: () => void;
  hasCustomKey: boolean;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  onResetToHome: () => void;
}

export function Navbar({
  onOpenApiKey,
  onOpenAuth,
  onOpenPro,
  hasCustomKey,
  user,
  onLogout,
  onResetToHome
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E2E8F0]/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <button
          id="btn-nav-home"
          onClick={onResetToHome}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A7C59] to-[#3B6548] flex items-center justify-center text-white shadow-sm shadow-[#4A7C59]/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#1A202C]">개약풀</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F3EC] text-[#3B6548] border border-[#D1E6D8]">
                PrivacyHelper
              </span>
            </div>
            <p className="text-[11px] text-[#718096] hidden sm:block">개인정보 약관 AI 정밀 분석</p>
          </div>
        </button>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PRO Plan Trigger */}
          <button
            id="btn-nav-pro"
            onClick={onOpenPro}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#FFF8E7] to-[#FFF0D4] text-[#975A16] border border-[#FEEBC8] hover:shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D69E2E]" />
            <span>PRO 개정안 비교</span>
          </button>

          {/* NVIDIA NIM Key Setup Button */}
          <button
            id="btn-nav-apikey"
            onClick={onOpenApiKey}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              hasCustomKey
                ? 'bg-[#EBF8F0] text-[#2F855A] border-[#C6F6D5] hover:bg-[#E2F6E9]'
                : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:bg-[#F7FAFC] shadow-2xs'
            }`}
            title="NVIDIA NIM API Key 및 모델 설정"
          >
            <Key className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span className="hidden sm:inline">{hasCustomKey ? 'NVIDIA Key 활성' : 'API Key 설정'}</span>
            {hasCustomKey && <span className="w-1.5 h-1.5 rounded-full bg-[#38A169]"></span>}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="btn-nav-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-[#4A5568] hover:bg-white hover:text-[#1A202C] border border-transparent hover:border-[#E2E8F0] transition-colors"
              aria-label="알림"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E05252] ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* User Auth state */}
          {user ? (
            <div className="relative">
              <button
                id="btn-nav-user-menu"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F7FAFC] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#4A7C59] text-white text-xs flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-[#2D3748] max-w-[90px] truncate">{user.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#EDF2F7]">
                    <p className="text-xs font-semibold text-[#1A202C]">{user.name}</p>
                    <p className="text-[11px] text-[#718096] truncate">{user.email}</p>
                  </div>
                  <button
                    id="btn-nav-logout"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#E05252] hover:bg-[#FFF5F5] font-medium"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#4A7C59] text-white hover:bg-[#3B6548] transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
