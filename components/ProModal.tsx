'use client';

import React from 'react';
import { Sparkles, X, Check, ShieldCheck, Zap, FileSpreadsheet, Lock } from 'lucide-react';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  if (!isOpen) return null;

  const proFeatures = [
    {
      title: '약관 개정안 실시간 Diff 비교',
      desc: '개정 전/후 조항을 한눈에 대조하여 추가된 독소 조항과 불리한 변경점을 색상 하이라이트'
    },
    {
      title: '무제한 PDF 법률 검토 보고서 출력',
      desc: '고해상도 A4 포맷의 정식 컴플라이언스 분석 보고서 PDF 무제한 생성'
    },
    {
      title: '기업 및 서비스 다중 약관 일괄 모니터링',
      desc: '자주 이용하는 20개 이상 서비스의 약관 변경 시 즉시 카카오톡/이메일 알림'
    },
    {
      title: 'NVIDIA NIM 70B 모델 무제한 토큰',
      desc: '최상위 라마 3.1 70B 파라미터 법률 특화 모델 전용 초고속 인프라'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFF8E7] to-[#FFF0D4] text-[#975A16] flex items-center justify-center border border-[#FEEBC8]">
              <Sparkles className="w-5 h-5 text-[#D69E2E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
                개약풀 PRO 멤버십
              </h3>
              <p className="text-xs text-[#718096]">개정안 비교 & 전문가급 약관 분석 솔루션</p>
            </div>
          </div>
          <button
            id="btn-close-pro-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A0AEC0] hover:text-[#4A5568]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature List */}
        <div className="mt-5 space-y-3">
          {proFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8F9FA] border border-[#EDF2F7]">
              <div className="w-5 h-5 rounded-full bg-[#EBF8F0] text-[#38A169] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A202C]">{feat.title}</h4>
                <p className="text-[11px] text-[#718096] mt-0.5 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Box */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#FAFBF9] to-[#F1F6F3] border border-[#D5E5DA] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#4A7C59] bg-white px-2 py-0.5 rounded-md border border-[#C6F6D5]">
              월간 구독 플랜
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black text-[#1A202C]">₩4,900</span>
              <span className="text-xs text-[#718096]">/ 월</span>
            </div>
          </div>

          <button
            id="btn-upgrade-pro-plan"
            onClick={() => {
              alert('PRO 멤버십 14일 무료 체험이 활성화되었습니다! 개정안 비교 기능이 해제됩니다.');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#4A7C59] hover:bg-[#3B6548] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
            <span>14일 무료 체험 시작</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-[#A0AEC0] mt-3">
          언제든 위약금 없이 1초 만에 해지 가능합니다.
        </p>
      </div>
    </div>
  );
}
