'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { HeroInput } from '@/components/HeroInput';
import { HistorySection } from '@/components/HistorySection';
import { TrendsSlider } from '@/components/TrendsSlider';
import { LoadingAdModal } from '@/components/LoadingAdModal';
import { ResultDashboard } from '@/components/ResultDashboard';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { AuthModal } from '@/components/AuthModal';
import { SubscribeModal } from '@/components/SubscribeModal';
import { Footer } from '@/components/Footer';
import { AnalysisResult } from '@/types/privacy';
import { MOCK_ANALYSIS_RESULT } from '@/lib/mockData';
import { TermHistoryItem } from '@/types/analysis';
import confetti from 'canvas-confetti';

function PrivacyHelperApp() {
  const { apiKey, selectedModel } = useAuth();
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTermTitle, setLoadingTermTitle] = useState('');

  // Modals
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  const handleAnalyze = async (text: string, title?: string, fileName?: string) => {
    const finalTitle = title || (fileName ? fileName.replace(/\.[^/.]+$/, '') : '약관 분석 리포트');
    setLoadingTermTitle(finalTitle);
    setIsLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          title: finalTitle,
          nvidiaApiKey: apiKey,
          modelName: selectedModel
        })
      });

      const responseData = await res.json();
      const analysisData: AnalysisResult = responseData.data || {
        ...MOCK_ANALYSIS_RESULT,
        id: 'analysis_' + Date.now(),
        docTitle: finalTitle,
        rawText: text
      };

      // 4.8s delay to allow 5-step progress and native sponsor ad review
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
      }, 4800);
    } catch (err) {
      console.warn('Analysis fallback:', err);
      setTimeout(() => {
        const fallback: AnalysisResult = {
          ...MOCK_ANALYSIS_RESULT,
          id: 'analysis_' + Date.now(),
          docTitle: finalTitle,
          rawText: text
        };
        setCurrentResult(fallback);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 4800);
    }
  };

  const handleSelectHistory = (item: TermHistoryItem) => {
    const historyResult: AnalysisResult = {
      ...MOCK_ANALYSIS_RESULT,
      id: item.id,
      docTitle: item.title,
      riskLevel: item.riskLevel,
      safetyScore: item.score,
      summary3Lines: item.sampleResult.summary3Lines || MOCK_ANALYSIS_RESULT.summary3Lines
    };
    setCurrentResult(historyResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2D3748]">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
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
            onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
          />
        ) : (
          <>
            {/* Hero Input Section */}
            <HeroInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* History Section */}
            <HistorySection onSelectHistory={handleSelectHistory} />

            {/* Regulatory Trends Section */}
            <TrendsSlider />
          </>
        )}
      </main>

      {/* 5-Second Native Ad & Loading Modal */}
      <LoadingAdModal isOpen={isLoading} termTitle={loadingTermTitle} />

      {/* Settings & Role Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <PrivacyHelperApp />
    </AuthProvider>
  );
}
