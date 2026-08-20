'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, Sparkles, Shield, Cpu, HelpCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string, model: string) => void;
  currentKey: string;
  currentModel: string;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
  currentModel
}: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState(currentKey || '');
  const [modelInput, setModelInput] = useState(currentModel || 'meta/llama-3.1-70b-instruct');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync inputs with props when modal opens using form reset or state update handler
  const handleOpenSync = () => {
    if (keyInput !== currentKey) setKeyInput(currentKey || '');
    if (modelInput !== currentModel) setModelInput(currentModel || 'meta/llama-3.1-70b-instruct');
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(keyInput.trim(), modelInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClearKey = () => {
    setKeyInput('');
    onSaveKey('', modelInput);
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
                NVIDIA NIM API Key 설정
              </h3>
              <p className="text-xs text-[#718096]">개인 브라우저 로컬 스토리지에 안전하게 저장됩니다</p>
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

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-nvidia-key" className="text-xs font-bold text-[#2D3748]">
                NVIDIA API Key
              </label>
              <a
                href="https://build.nvidia.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#4A7C59] hover:underline inline-flex items-center gap-1"
              >
                <span>NVIDIA NIM 키 발급받기</span>
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
              * 키를 입력하지 않아도 서비스 내장 고정밀 법률 AI 룰 엔진 및 Gemini 백업을 통해 정상 분석됩니다.
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
              <option value="meta/llama-3.1-70b-instruct">meta/llama-3.1-70b-instruct (권장 • 고성능 법률 추론)</option>
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
              입력하신 API 키는 서버 DB에 영구 저장되지 않으며, 오직 분석 요청 시 암호화 통신으로만 전달됩니다.
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
              <div></div>
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
                {savedSuccess ? <Check className="w-4 h-4" /> : <Key className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? '저장 완료!' : '설정 저장'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
