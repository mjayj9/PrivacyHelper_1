'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Check, Zap, Sparkles, Shield, X, FileSpreadsheet, Lock } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const { upgradeToPro, user } = useAuth();
  if (!isOpen) return null;

  const handleUpgrade = () => {
    upgradeToPro();
    alert('🎉 축하합니다! PRO 플랜이 성공적으로 활성화되었습니다. 모든 세부 지표와 Diff 비교 기능이 잠금 해제되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-emerald-100 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <button
          id="btn-close-subscribe-modal"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-[#4A7C59] mb-3 border border-emerald-100">
            <Sparkles className="w-7 h-7 text-[#4A7C59]" />
          </div>
          <h2 className="text-2xl font-black text-[#1A202C]">개약풀 PRO 멤버십</h2>
          <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
            개인정보보호법(PIPA) 기반 심층 분석, KISA 가이드라인 Diff 비교, 기업용 권고안을 무제한으로 이용하세요.
          </p>
        </div>

        <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-200/80 mb-6 space-y-3.5">
          <div className="flex items-start text-xs sm:text-sm text-[#2D3748]">
            <Check className="w-4 h-4 text-[#4A7C59] mr-2.5 shrink-0 mt-0.5" />
            <span>
              <strong>4대 세부 평가지표</strong> (수집 과다도, 보유 위험도, 제3자 위험도, 권리 보장성 정밀 진단)
            </span>
          </div>
          <div className="flex items-start text-xs sm:text-sm text-[#2D3748]">
            <Check className="w-4 h-4 text-[#4A7C59] mr-2.5 shrink-0 mt-0.5" />
            <span>
              <strong>KISA 표준 가이드라인 비교 (Diff Checker)</strong> 독소 조항 및 이탈점 자동 탐지
            </span>
          </div>
          <div className="flex items-start text-xs sm:text-sm text-[#2D3748]">
            <Check className="w-4 h-4 text-[#4A7C59] mr-2.5 shrink-0 mt-0.5" />
            <span>
              <strong>기업용 맞춤 약관 수정 제안서 & A4 PDF 종합 리포트</strong> 무제한 인쇄/출력
            </span>
          </div>
          <div className="flex items-start text-xs sm:text-sm text-[#2D3748]">
            <Check className="w-4 h-4 text-[#4A7C59] mr-2.5 shrink-0 mt-0.5" />
            <span>
              <strong>NVIDIA NIM 70B 모델 무제한 토큰</strong> 초고속 법률 전용 인프라
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-3xl font-extrabold text-[#1A202C]">₩9,900</span>
          <span className="text-xs text-gray-500 font-medium"> / 월 (시연용 무료 활성화)</span>
        </div>

        <button
          id="btn-confirm-upgrade-pro"
          onClick={handleUpgrade}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#4A7C59] hover:bg-[#3B6447] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 fill-current text-yellow-300" />
          <span>PRO 멤버십 즉시 활성화하기</span>
        </button>
        <p className="text-[11px] text-center text-gray-400 mt-3">
          * 테스트 환경으로 실제 결제가 발생하지 않고 즉시 PRO 권한이 부여됩니다.
        </p>
      </div>
    </div>
  );
};
