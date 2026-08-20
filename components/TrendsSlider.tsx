'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, ChevronLeft, ChevronRight, ExternalLink, ShieldAlert } from 'lucide-react';
import { PRIVACY_TRENDS } from '@/lib/sample-data';

export function TrendsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PRIVACY_TRENDS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentTrend = PRIVACY_TRENDS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PRIVACY_TRENDS.length) % PRIVACY_TRENDS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PRIVACY_TRENDS.length);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-8">
      <div className="bg-gradient-to-r from-[#F4F7F5] via-[#EBF3EE] to-[#F1F6F3] rounded-2xl border border-[#D5E5DA] p-5 sm:p-6 relative overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B6548]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3B6548] flex items-center gap-1">
              <Newspaper className="w-3.5 h-3.5" />
              최신 개인정보 보호 규제 및 트렌드
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-trend-prev"
              onClick={handlePrev}
              className="p-1 rounded-lg bg-white/80 hover:bg-white text-[#4A5568] border border-[#CBD5E0]/60 transition-colors"
              aria-label="이전 뉴스"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-[#718096] px-1">
              {currentIndex + 1} / {PRIVACY_TRENDS.length}
            </span>
            <button
              id="btn-trend-next"
              onClick={handleNext}
              className="p-1 rounded-lg bg-white/80 hover:bg-white text-[#4A5568] border border-[#CBD5E0]/60 transition-colors"
              aria-label="다음 뉴스"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="transition-all duration-300">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#4A7C59] text-white">
              {currentTrend.tag}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[#1A202C]">
              {currentTrend.title}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed max-w-3xl">
            {currentTrend.description}
          </p>
          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[#718096]">
            <span>출처: {currentTrend.source}</span>
            <span>•</span>
            <span>{currentTrend.date}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
