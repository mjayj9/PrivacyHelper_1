'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Lock, CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { ProMetrics } from '@/types/privacy';

interface DiffCheckerProProps {
  proMetrics?: ProMetrics;
  onOpenSubscribe: () => void;
}

export function DiffCheckerPro({ proMetrics, onOpenSubscribe }: DiffCheckerProProps) {
  const { isProOrAdmin } = useAuth();

  const metrics = proMetrics || {
    collectionExcessScore: 68,
    retentionRiskScore: 42,
    thirdPartyRiskScore: 74,
    userRightsScore: 82,
    standardDiffAnalysis:
      'KISA 표준 개인정보 처리방침 가이드라인 대비 제3자 마케팅 위탁 범위가 12개사로 과다하며, 선택 수집 항목에 대한 분리 동의 절차가 일부 불명확하여 시정 권고가 필요한 상태입니다.',
    recommendationsForBiz: [
      '필수 동의와 선택 동의 항목의 UI 체크박스를 완벽히 물리적으로 분리하여 "전체 동의" 다크패턴 해소',
      '국외 서버(AWS 미국 리전) 이전 항목에 대해 이전받는 자, 이전 일시, 이전 목적 및 거부 방법 명시적 보강',
      '제3자 위탁사 변경 시 공지사항 게시 갈음 문구를 삭제하고 개인정보보호법 제26조 기준에 맞춰 고지 프로세스 개선',
      '회원 탈퇴 후 분리 보관되는 개인정보의 구체적 항목과 파기 예정일을 마이페이지에 직관적으로 표시'
    ]
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-[#EDF2F7] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFF8E7] to-[#FFF0D4] text-[#975A16] flex items-center justify-center font-bold text-base border border-[#FEEBC8]">
            <Sparkles className="w-4 h-4 text-[#D69E2E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
                KISA 표준 가이드라인 Diff 비교 & 4대 세부 지표
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFF0D4] text-[#975A16] border border-[#FEEBC8]">
                PRO / ADMIN
              </span>
            </div>
            <p className="text-xs text-[#718096]">
              표준 개인정보 처리방침 대비 이탈점 정밀 분석 및 기업용 약관 수정 권고안
            </p>
          </div>
        </div>

        {isProOrAdmin && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EBF8F0] text-[#2F855A] text-xs font-bold border border-[#C6F6D5]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PRO 라이선스 활성화됨</span>
          </div>
        )}
      </div>

      {/* Content wrapper with conditional blur */}
      <div className={`relative ${!isProOrAdmin ? 'min-h-[280px]' : ''}`}>
        <div className={`space-y-6 ${!isProOrAdmin ? 'filter blur-[4px] select-none pointer-events-none opacity-40' : ''}`}>
          {/* 4 Core Quantitative Metrics Grid */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4A7C59] mb-3">
              📊 4대 세부 컴플라이언스 위험도 지표
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Metric 1 */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDF2F7]">
                <span className="text-[11px] font-bold text-[#718096] block mb-1">수집 과다도</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-[#E05252]">{metrics.collectionExcessScore}</span>
                  <span className="text-[10px] text-[#A0AEC0]">/ 100</span>
                </div>
                <div className="w-full bg-[#EDF2F7] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#E05252] h-full rounded-full" style={{ width: `${metrics.collectionExcessScore}%` }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDF2F7]">
                <span className="text-[11px] font-bold text-[#718096] block mb-1">보유 기간 위험도</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-[#DD6B20]">{metrics.retentionRiskScore}</span>
                  <span className="text-[10px] text-[#A0AEC0]">/ 100</span>
                </div>
                <div className="w-full bg-[#EDF2F7] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#DD6B20] h-full rounded-full" style={{ width: `${metrics.retentionRiskScore}%` }} />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDF2F7]">
                <span className="text-[11px] font-bold text-[#718096] block mb-1">제3자 제공 위험도</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-[#E05252]">{metrics.thirdPartyRiskScore}</span>
                  <span className="text-[10px] text-[#A0AEC0]">/ 100</span>
                </div>
                <div className="w-full bg-[#EDF2F7] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#E05252] h-full rounded-full" style={{ width: `${metrics.thirdPartyRiskScore}%` }} />
                </div>
              </div>

              {/* Metric 4 */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#EDF2F7]">
                <span className="text-[11px] font-bold text-[#718096] block mb-1">권리 보장성</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-[#38A169]">{metrics.userRightsScore}</span>
                  <span className="text-[10px] text-[#A0AEC0]">/ 100</span>
                </div>
                <div className="w-full bg-[#EDF2F7] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#38A169] h-full rounded-full" style={{ width: `${metrics.userRightsScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Standard Diff Analysis Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF5] border border-[#FEEBC8]">
            <h4 className="text-xs font-bold text-[#975A16] flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#D69E2E]" />
              <span>KISA 표준 권고안 대비 주요 이탈점 (Diff Analysis)</span>
            </h4>
            <p className="text-xs text-[#744210] leading-relaxed">
              {metrics.standardDiffAnalysis}
            </p>
          </div>

          {/* Recommendations for Business */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7FAFC] border border-[#E2E8F0]">
            <h4 className="text-xs font-bold text-[#2D3748] flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4 text-[#4A7C59]" />
              <span>기업 및 서비스 약관 개정/보완 권고안</span>
            </h4>
            <ul className="space-y-2">
              {metrics.recommendationsForBiz.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#4A5568] leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-[#EBF8F0] text-[#3B6548] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lock Overlay for FREE users */}
        {!isProOrAdmin && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-2xs rounded-2xl text-center z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#FFF0D4] text-[#975A16] flex items-center justify-center mb-3 shadow-md border border-[#FEEBC8]">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-[#1A202C] mb-1">
              KISA 표준 Diff 비교 & 4대 세부 지표 (PRO 전용)
            </h4>
            <p className="text-xs text-[#718096] max-w-sm mb-4 leading-relaxed">
              수집 과다도, 제3자 위험도, 표준 약관 이탈점 정밀 분석 및 기업용 약관 수정 권고안을 확인하세요.
            </p>
            <button
              id="btn-unlock-pro-diff-card"
              onClick={onOpenSubscribe}
              className="px-5 py-2.5 rounded-xl bg-[#4A7C59] hover:bg-[#3B6548] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current text-yellow-300" />
              <span>무료 체험으로 PRO 잠금 해제</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
