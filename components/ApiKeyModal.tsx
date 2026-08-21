'use client';

import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { apiKey, setApiKey, selectedModel, setSelectedModel, user } = useAuth();
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [modelInput, setModelInput] = useState(selectedModel || 'meta/llama-3.1-70b-instruct');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(keyInput.trim());
    setSelectedModel(modelInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClearKey = () => {
    setKeyInput('');
    setApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF8F0] text-[#4A7C59] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
                NVIDIA NIM API Key & PRO 추론 설정
              </h3>
              <p className="text-xs text-[#718096]">개인 브라우저 로컬 스토리지에 안전하게 보관됩니다</p>
            </div>
          </div>
          <button
            id="btn-close-apikey-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A0AEC0] hover:text-[#4A5568] hover:bg-[#F8F9FA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRO & Key Relationship Info Badge */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#F0FDF4] to-[#F5FAF6] border border-[#C6F6D5] text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#2F855A] mb-1">
            <Sparkles className="w-4 h-4 text-[#38A169]" />
            <span>NVIDIA NIM 실시간 추론 & PRO 기능 작동 원리</span>
          </div>
          <p className="text-[#4A5568] text-[11px] leading-relaxed">
            관리자 또는 사용자가 여기에 발급받은 <strong>NVIDIA NIM API Key</strong>를 입력하면, 
            <strong> Llama 3.1 70B Instruct</strong> 파운데이션 모델을 통해 실시간 약관 심층 분석 및 PRO 전용 KISA 표준 Diff Checker가 즉시 정상 연동되어 작동합니다.
          </p>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-nvidia-key" className="text-xs font-bold text-[#2D3748] flex items-center gap-1">
                <span>NVIDIA API Key</span>
                {apiKey && (
                  <span className="text-[10px] text-[#2F855A] bg-[#DEF7EC] px-1.5 py-0.2 rounded font-semibold">
                    현재 등록됨
                  </span>
                )}
              </label>
              <a
                href="https://build.nvidia.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#4A7C59] hover:underline inline-flex items-center gap-1"
              >
                <span>NVIDIA NIM 무료 키 발급</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              id="input-nvidia-key"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs font-mono text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
            />
            <p className="text-[11px] text-[#718096] mt-1.5 leading-relaxed">
              * 키가 없어도 서비스 내장 고정밀 법률 AI 룰 엔진(KISA 가이드라인)을 통해 안정적으로 데모 분석을 체험하실 수 있습니다.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="select-nvidia-model" className="block text-xs font-bold text-[#2D3748] mb-1.5">
              선택 AI 모델 (NVIDIA NIM)
            </label>
            <select
              id="select-nvidia-model"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs font-medium text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
            >
              <option value="meta/llama-3.1-70b-instruct">meta/llama-3.1-70b-instruct (권장 • 최고 성능 법률 추론)</option>
              <option value="meta/llama-3.1-8b-instruct">meta/llama-3.1-8b-instruct (초고속 경량)</option>
              <option value="mistralai/mixtral-8x7b-instruct-v0.1">mistralai/mixtral-8x7b-instruct</option>
            </select>
          </div>

          {/* Information box */}
          <div className="bg-[#FAFBF9] rounded-2xl p-3.5 border border-[#E2E8F0] text-xs text-[#4A5568] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#3B6548]">
              <Shield className="w-3.5 h-3.5" />
              <span>보안 및 로컬 보관 안내</span>
            </div>
            <p className="text-[11px] text-[#718096] leading-relaxed">
              입력하신 API 키는 브라우저 로컬 스토리지에만 보관되며 분석 요청 시 암호화 통신으로만 전달됩니다.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EDF2F7]">
            {keyInput ? (
              <button
                id="btn-clear-apikey"
                type="button"
                onClick={handleClearKey}
                className="text-xs text-[#E05252] hover:underline font-medium"
              >
                키 삭제
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                id="btn-cancel-apikey"
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718096] hover:bg-[#F8F9FA]"
              >
                취소
              </button>
              <button
                id="btn-save-apikey"
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4A7C59] hover:bg-[#3B6548] transition-all flex items-center gap-1.5 shadow-xs"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? '저장 완료!' : '설정 저장'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
