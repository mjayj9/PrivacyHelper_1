'use client';

import React from 'react';
import { History, ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpRight, Sparkles } from 'lucide-react';
import { SAMPLE_HISTORY } from '@/lib/sample-data';
import { TermHistoryItem, RiskLevel } from '@/types/analysis';

interface HistorySectionProps {
  onSelectHistory: (item: TermHistoryItem) => void;
}

export function HistorySection({ onSelectHistory }: HistorySectionProps) {
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case '위험':
        return {
          bg: 'bg-[#FFF5F5]',
          text: 'text-[#E05252]',
          border: 'border-[#FEB2B2]',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-[#E05252]" />,
          label: '위험'
        };
      case '주의':
        return {
          bg: 'bg-[#FFFAF0]',
          text: 'text-[#DD6B20]',
          border: 'border-[#FBD38D]',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#DD6B20]" />,
          label: '주의'
        };
      case '안전':
      default:
        return {
          bg: 'bg-[#F0FFF4]',
          text: 'text-[#38A169]',
          border: 'border-[#9AE6B4]',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#38A169]" />,
          label: '안전'
        };
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EBF8F0] text-[#4A7C59]">
            <History className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-[#1A202C]">최근 분석 및 동의 약관 히스토리</h3>
        </div>
        <span className="text-xs text-[#718096]">총 3건 분석됨</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SAMPLE_HISTORY.map((item) => {
          const badge = getRiskBadge(item.riskLevel);
          return (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              id={`card-history-${item.id}`}
              className="group bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md hover:border-[#CBD5E0] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold text-[#718096] bg-[#F7FAFC] px-2 py-0.5 rounded-md border border-[#EDF2F7]">
                    {item.category}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-[#1A202C] group-hover:text-[#4A7C59] transition-colors line-clamp-1 mb-1.5">
                  {item.title}
                </h4>

                <p className="text-xs text-[#4A5568] line-clamp-2 leading-relaxed mb-3">
                  {item.summaryShort}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EDF2F7] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#A0AEC0]">{item.analyzedAt}</span>
                <span className="font-semibold text-[#4A7C59] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  리포트 보기 <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
