'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroInput } from '@/components/HeroInput';
import { HistorySection } from '@/components/HistorySection';
import { TrendsSlider } from '@/components/TrendsSlider';
import { LoadingModal } from '@/components/LoadingModal';
import { ResultDashboard } from '@/components/ResultDashboard';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { AuthModal } from '@/components/AuthModal';
import { ProModal } from '@/components/ProModal';
import { Footer } from '@/components/Footer';
import { AnalysisResult, TermHistoryItem } from '@/types/analysis';
import { analyzePrivacyPolicyLocal } from '@/lib/privacy-analyzer';
import confetti from 'canvas-confetti';

export default function Home() {
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTermTitle, setLoadingTermTitle] = useState('');

  // Modals
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // User & Key states initialized lazily
  const [nvidiaApiKey, setNvidiaApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('nv_api_key') || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  const [nvidiaModel, setNvidiaModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('nv_model') || 'meta/llama-3.1-70b-instruct';
      } catch (e) {
        return 'meta/llama-3.1-70b-instruct';
      }
    }
    return 'meta/llama-3.1-70b-instruct';
  });

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user_session');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleSaveApiKey = (key: string, model: string) => {
    setNvidiaApiKey(key);
    setNvidiaModel(model);
    try {
      if (key) {
        localStorage.setItem('nv_api_key', key);
      } else {
        localStorage.removeItem('nv_api_key');
      }
      localStorage.setItem('nv_model', model);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const handleLoginSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
    try {
      localStorage.setItem('user_session', JSON.stringify(userData));
    } catch (e) {}
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('user_session');
    } catch (e) {}
  };

  const handleAnalyze = async (text: string, title?: string, fileName?: string) => {
    const finalTitle = title || (fileName ? fileName.replace(/\.[^/.]+$/, '') : '약관 분석 리포트');
    setLoadingTermTitle(finalTitle);
    setIsLoading(true);

    try {
      // Call Next.js Server API
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          title: finalTitle,
          nvidiaApiKey: nvidiaApiKey,
          modelName: nvidiaModel
        })
      });

      if (!res.ok) {
        throw new Error('API 분석 요청 실패');
      }

      const responseData = await res.json();
      const analysisData: AnalysisResult = responseData.data || analyzePrivacyPolicyLocal(text, finalTitle);

      // Smooth delay to allow loading steps & ad experience to be visible
      setTimeout(() => {
        setCurrentResult(analysisData);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (analysisData.riskLevel === '안전') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#4A7C59', '#38A169', '#68D391']
          });
        }
      }, 2400);
    } catch (err) {
      console.warn('Fallback to local engine:', err);
      setTimeout(() => {
        const localData = analyzePrivacyPolicyLocal(text, finalTitle);
        setCurrentResult(localData);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
    }
  };

  const handleSelectHistory = (item: TermHistoryItem) => {
    // Generate full analysis result for history item
    let sampleText = `제1조(수집 목적) 회사는 서비스 제공 및 본인 식별을 위해 회원 정보를 수집합니다.
제2조(마케팅 활용 및 제3자 제공) 제휴 마케팅사 및 광고 대행사에 맞춤형 정보가 제공될 수 있습니다.
제3조(보유 및 파기) 회원 탈퇴 시 관계 법령에 따라 최대 3~5년간 분리 보관됩니다.
제4조(개인정보 보호책임자) 담당 부서: 보안준법지원팀 (cpo-support@service.kr / 02-1588-9900)`;

    const parsedResult = analyzePrivacyPolicyLocal(sampleText, item.title);
    parsedResult.riskLevel = item.riskLevel;
    parsedResult.score.total = item.score;
    if (item.sampleResult.summary3Lines) {
      parsedResult.summary3Lines = item.sampleResult.summary3Lines;
    }

    setCurrentResult(parsedResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2D3748]">
      {/* Top Navbar */}
      <Navbar
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPro={() => setIsProModalOpen(true)}
        hasCustomKey={Boolean(nvidiaApiKey)}
        user={user}
        onLogout={handleLogout}
        onResetToHome={() => {
          setCurrentResult(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentResult ? (
          <ResultDashboard
            result={currentResult}
            onReset={() => {
              setCurrentResult(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPro={() => setIsProModalOpen(true)}
            nvidiaApiKey={nvidiaApiKey}
          />
        ) : (
          <>
            {/* Screen 1: Hero Input Section */}
            <HeroInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Sub-section 1: Recent History Cards */}
            <HistorySection onSelectHistory={handleSelectHistory} />

            {/* Sub-section 2: Regulatory Trends Slider */}
            <TrendsSlider />
          </>
        )}
      </main>

      {/* Screen 2: Loading & Ad Experience Modal */}
      <LoadingModal isOpen={isLoading} termTitle={loadingTermTitle} />

      {/* Settings & Feature Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={handleSaveApiKey}
        currentKey={nvidiaApiKey}
        currentModel={nvidiaModel}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
