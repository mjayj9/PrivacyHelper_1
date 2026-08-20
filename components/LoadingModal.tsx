'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SPONSOR_ADS } from '@/lib/sample-data';

interface LoadingModalProps {
  isOpen: boolean;
  termTitle: string;
}

export function LoadingModal({ isOpen, termTitle }: LoadingModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [adIndex, setAdIndex] = useState(() => Math.floor(Math.random() * SPONSOR_ADS.length));

  const steps = [
    '약관 내 수집 항목 및 필수/선택 동의 구분 파싱 중...',
    'AI가 이용자에게 불리한 독소 조항 및 일방적 면책 탐지 중...',
    '3줄 핵심 요약 및 개인정보 파기·철회 가이드 생성 중...',
    'NVIDIA NIM & AI 법률 검토 엔진 최종 리포트 패키징 완료...'
  ];

  useEffect(() => {
    if (!isOpen) return;

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);

    return () => {
      clearInterval(stepInterval);
    };
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  const currentAd = SPONSOR_ADS[adIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] relative overflow-hidden">
        {/* Top Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4A7C59] via-[#5B8E7D] to-[#3B6548] animate-pulse"></div>

        {/* Loading Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF8F0] text-[#4A7C59] flex items-center justify-center mx-auto mb-4 border border-[#C6F6D5] relative">
            <Loader2 className="w-7 h-7 animate-spin text-[#4A7C59]" />
            <Sparkles className="w-4 h-4 text-[#D69E2E] absolute -top-1 -right-1 animate-bounce" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#1A202C]">
            AI 약관 정밀 분석 진행 중
          </h3>
          <p className="text-xs text-[#718096] mt-1 line-clamp-1">
            {termTitle || '제출된 개인정보 처리방침'}
          </p>
        </div>

        {/* Progress Step Indicator */}
        <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#EDF2F7] mb-6">
          <div className="space-y-2.5">
            {steps.map((text, idx) => {
              const isDone = idx < stepIndex;
              const isCurrent = idx === stepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'text-[#2F855A] font-bold scale-[1.01]'
                      : isDone
                      ? 'text-[#4A7C59] opacity-75'
                      : 'text-[#A0AEC0]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#38A169] shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#4A7C59] shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#CBD5E0] shrink-0 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </div>
                  )}
                  <span className="truncate">{text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Native Sponsor Ad Card */}
        <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FFF9EE] rounded-2xl border border-[#FEEBC8] p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEFCBF] text-[#975A16] border border-[#FAF089]">
              {currentAd.badge}
            </span>
            <span className="text-[11px] text-[#A0AEC0]">{currentAd.partnerName}</span>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{currentAd.logoEmoji}</span>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-[#2D3748] mb-1 leading-snug">
                {currentAd.title}
              </h4>
              <p className="text-[11px] text-[#718096] leading-relaxed mb-3">
                {currentAd.description}
              </p>
              <a
                href={currentAd.ctaLink}
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#4A7C59] hover:underline"
              >
                <span>{currentAd.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#A0AEC0] mt-4">
          잠시만 기다려주세요. 약관 길이에 따라 2~4초 소요됩니다.
        </p>
      </div>
    </div>
  );
}
