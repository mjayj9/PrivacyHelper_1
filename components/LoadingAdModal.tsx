'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';

interface LoadingAdModalProps {
  isOpen: boolean;
  termTitle: string;
}

const SPONSOR_ADS = [
  {
    tag: 'SPONSORED SECURITY',
    title: '기업용 생성형 AI 데이터 유출 방지 (DLP) 솔루션',
    desc: '임직원의 민감 개인정보 및 소스코드 유출을 원천 차단하는 엔터프라이즈 프라이버시 가드',
    company: '클라우드보안 테크놀로지',
    cta: '무료 보안 진단 신청'
  },
  {
    tag: 'SPONSORED COMPLIANCE',
    title: 'KISA 개인정보보호 컴플라이언스 원스톱 패키지',
    desc: '스타트업 및 중소기업을 위한 PIPA 법정 의무 준수 점검 및 CPO 위탁 컨설팅',
    company: '로앤시큐리티 법률사무소',
    cta: '컴플라이언스 가이드 다운로드'
  },
  {
    tag: 'SPONSORED INFRA',
    title: 'NVIDIA NIM 전용 고성능 법률 추론 클라우드',
    desc: 'Llama 3.1 70B 파라미터 기반 초저지연 보안 법률 문서 분석 인프라',
    company: '엔비디아 AI 클라우드 파트너스',
    cta: '인프라 크레딧 받기'
  }
];

export function LoadingAdModal({ isOpen, termTitle }: LoadingAdModalProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [adIndex] = useState(() => Math.floor(Math.random() * SPONSOR_ADS.length));

  const steps = [
    '개인정보보호법(PIPA) 6대 기준 항목 및 수집처 파싱 중...',
    '선택 동의 강제(다크패턴) 및 일방적 면책 조항 탐지 중...',
    'KISA 표준 가이드라인 대비 이탈점 및 독소 조항 정밀 검토 중...',
    '3줄 핵심 요약 및 CPO 권리 행사 대응 가이드 생성 중...'
  ];

  useEffect(() => {
    if (!isOpen) return;

    const startTime = Date.now();
    const duration = 4800; // 4.8 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / duration) * 100), 99);
      setProgress(pct);

      if (pct > 75) setStepIndex(3);
      else if (pct > 50) setStepIndex(2);
      else if (pct > 25) setStepIndex(1);
      else setStepIndex(0);

      if (elapsed >= duration) {
        setProgress(100);
        clearInterval(timer);
      }
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAd = SPONSOR_ADS[adIndex] || SPONSOR_ADS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] relative overflow-hidden">
        {/* Top subtle badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8F0] text-[#4A7C59] text-xs font-bold border border-[#C6F6D5]">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>NVIDIA NIM AI 정밀 법률 분석 중</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#4A7C59]">{progress}%</span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-black text-[#1A202C] leading-snug">
          &quot;{termTitle || '약관'}&quot;을 검토하고 있습니다
        </h3>

        {/* 5-second progress bar */}
        <div className="w-full bg-[#EDF2F7] h-2.5 rounded-full overflow-hidden my-4">
          <div
            className="h-full bg-gradient-to-r from-[#4A7C59] to-[#38A169] transition-all duration-75 rounded-full ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 4-Step Rolling Status */}
        <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDF2F7] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4A7C59] animate-ping" />
            <p className="text-xs font-bold text-[#2D3748] transition-all duration-300">
              {steps[stepIndex]}
            </p>
          </div>
        </div>

        {/* Native Sponsor Ad Banner Card */}
        <div className="bg-gradient-to-br from-[#FAFBF9] to-[#F3F7F4] rounded-2xl p-4 sm:p-5 border border-[#D7E8DC] shadow-2xs relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#4A7C59] border border-[#C6F6D5]">
              {currentAd.tag}
            </span>
            <span className="text-[11px] font-semibold text-[#718096]">{currentAd.company}</span>
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-[#1A202C] mb-1">
            {currentAd.title}
          </h4>
          <p className="text-xs text-[#5A6A7E] leading-relaxed mb-3">
            {currentAd.desc}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#E1ECE4]">
            <span className="text-[10px] text-[#A0AEC0]">약관 분석 대기 시간 동안 제공되는 광고입니다</span>
            <button
              onClick={() => alert(`[스폰서 알림] ${currentAd.company} 안내 페이지로 연결됩니다.`)}
              className="text-[11px] font-bold text-[#4A7C59] hover:text-[#3B6548] flex items-center gap-1 hover:underline"
            >
              <span>{currentAd.cta}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
