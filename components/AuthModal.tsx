'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, User, Zap, Lock, X, Mail } from 'lucide-react';
import { UserRole } from '@/types/privacy';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  if (!isOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    login(role);
    onClose();
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const role: UserRole = emailInput.includes('admin') ? 'ADMIN' : emailInput.includes('pro') ? 'PRO' : 'FREE';
    login(role, emailInput.trim(), nameInput.trim() || emailInput.split('@')[0]);
    onClose();
  };

  const handleGoogleLogin = () => {
    login('FREE', 'mjayj9@gmail.com', '김민준');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-gray-100">
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-[#4A7C59] mb-2 border border-emerald-100">
            <ShieldCheck className="w-6 h-6 text-[#4A7C59]" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#1A202C]">개약풀 로그인 & 데모 권한 선택</h3>
          <p className="text-xs text-[#718096] mt-1">
            원클릭으로 원하는 권한 계정을 선택하거나 Google 계정으로 로그인하세요.
          </p>
        </div>

        {/* Quick 1-Click Demo Roles */}
        <div className="space-y-2.5 mb-5">
          <button
            id="btn-role-free"
            onClick={() => handleSelectRole('FREE')}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-[#4A7C59] hover:bg-emerald-50/30 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-800">일반 회원 (FREE)</p>
                <p className="text-[11px] text-gray-500">기본 요약, 6대 라벨 및 독소 조항 탐지</p>
              </div>
            </div>
            <span className="text-[11px] bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-lg">선택</span>
          </button>

          <button
            id="btn-role-pro"
            onClick={() => handleSelectRole('PRO')}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/60 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#4A7C59] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#4A7C59]">프로 회원 (PRO)</p>
                <p className="text-[11px] text-gray-500">세부 평가지표, Diff 비교, PDF 다운로드 잠금해제</p>
              </div>
            </div>
            <span className="text-[11px] bg-[#4A7C59] text-white font-bold px-2.5 py-1 rounded-lg">추천</span>
          </button>

          <button
            id="btn-role-admin"
            onClick={() => handleSelectRole('ADMIN')}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-purple-200 bg-purple-50/20 hover:bg-purple-50/50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-purple-900">시스템 관리자 (ADMIN)</p>
                <p className="text-[11px] text-gray-500">PRO의 모든 기능 + 관리자 보안 콘솔 권한</p>
              </div>
            </div>
            <span className="text-[11px] bg-purple-600 text-white font-bold px-2.5 py-1 rounded-lg">Admin</span>
          </button>
        </div>

        {/* Google Login */}
        <div className="pt-3 border-t border-gray-100">
          <button
            id="btn-google-signin"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-[#2D3748] flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google 계정으로 계속하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
