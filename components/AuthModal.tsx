'use client';

import React, { useState } from 'react';
import { X, Shield, Lock, Mail, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    onLoginSuccess({
      name: '김민준',
      email: 'mjayj9@gmail.com'
    });
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onLoginSuccess({
      name: name.trim() || email.split('@')[0],
      email: email.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF8F0] text-[#4A7C59] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
              {isSignUp ? '개약풀 회원가입' : '개약풀 로그인'}
            </h3>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A0AEC0] hover:text-[#4A5568]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Google One-Click Login Button */}
          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-2xl border border-[#CBD5E0] bg-white hover:bg-[#F8F9FA] text-xs font-bold text-[#2D3748] flex items-center justify-center gap-2.5 transition-all shadow-2xs"
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

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-[#E2E8F0]"></div>
            <span className="px-3 text-[11px] text-[#A0AEC0]">또는 이메일로 시작</span>
            <div className="flex-1 border-t border-[#E2E8F0]"></div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-[#4A5568] mb-1">이름 / 닉네임</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#1A202C]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#4A5568] mb-1">이메일 주소</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#1A202C]"
              />
            </div>

            <button
              id="btn-email-auth-submit"
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-[#4A7C59] hover:bg-[#3B6548] text-white text-xs font-bold shadow-xs transition-colors"
            >
              {isSignUp ? '계정 만들기' : '이메일로 로그인'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-[#4A7C59] hover:underline font-semibold"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 무료 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
