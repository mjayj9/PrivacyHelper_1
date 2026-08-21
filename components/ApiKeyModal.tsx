'use client';

import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, Shield, Sparkles, CheckCircle2, Server, Cpu, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const {
    apiKey,
    selectedModel,
    isServerConfigured,
    serverKeyMasked,
    serverModel,
    saveServerApiKey,
    refreshServerStatus,
    setApiKey,
    setSelectedModel,
    user
  } = useAuth();

  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [modelInput, setModelInput] = useState(serverModel || selectedModel || 'z-ai/glm-5.2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    // Save to server-side persistent config
    const res = await saveServerApiKey(keyInput.trim(), modelInput);
    if (res.success) {
      setApiKey(keyInput.trim());
      setSelectedModel(modelInput);
      setStatusMessage('✅ 서버에 안전하게 저장되었습니다! 모든 사용자에게 GLM 5.2 추론이 적용됩니다.');
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } else {
      setStatusMessage(`❌ 저장 오류: ${res.message}`);
      setIsSubmitting(false);
    }
  };

  const handleClearServerKey = async () => {
    if (!confirm('서버에 저장된 NVIDIA API 키를 초기화하시겠습니까?')) return;
    setIsSubmitting(true);
    await saveServerApiKey('', modelInput);
    setKeyInput('');
    setApiKey('');
    setIsSubmitting(false);
    setStatusMessage('서버 API 키가 초기화되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF8F0] text-[#4A7C59] flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
                서버 전용 NVIDIA API & GLM-5.2 추론 엔진 설정
              </h3>
              <p className="text-xs text-[#718096]">관리자 등록 시 클라이언트가 아닌 서버에만 안전하게 보관됩니다</p>
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

        {/* Server Status Highlight Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#F0FDF4] via-[#F8FCF9] to-[#EDF7F1] border border-[#C6F6D5] text-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#2F855A]">
              <Cpu className="w-4 h-4 text-[#38A169]" />
              <span>현재 서버 엔진 가동 상태</span>
            </div>
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                isServerConfigured
                  ? 'bg-[#DEF7EC] text-[#03543F] border-[#BCF0DA]'
                  : 'bg-[#FEF08A]/70 text-[#854D0E] border-[#FDE047]'
              }`}
            >
              {isServerConfigured ? '🟢 서버 키 활성화됨' : '🟡 키 미등록 (데모 AI 엔진 가동)'}
            </span>
          </div>
          <p className="text-[#4A5568] text-[11px] leading-relaxed">
            {isServerConfigured ? (
              <>
                현재 서버에 <strong>GLM-5.2 ({serverModel})</strong> 모델 및 API 키({serverKeyMasked})가 등록되어 있어 모든 사용자가 고성능 추론 및 씽킹(Thinking) 분석을 이용할 수 있습니다.
              </>
            ) : (
              <>
                관리자가 여기에 <strong>NVIDIA NIM API Key</strong>를 등록하면 <strong>z-ai/glm-5.2</strong> 추론 엔진이 서버 전용으로 자동 활성화됩니다. (클라이언트 노출 방지)
              </>
            )}
          </p>
        </div>

        {statusMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs font-semibold text-[#166534] flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-[#16A34A]" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-nvidia-key" className="text-xs font-bold text-[#2D3748] flex items-center gap-1">
                <span>NVIDIA API Key (서버 저장)</span>
                {isServerConfigured && (
                  <span className="text-[10px] text-[#2F855A] bg-[#DEF7EC] px-1.5 py-0.2 rounded font-semibold">
                    서버 등록 완료
                  </span>
                )}
              </label>
              <a
                href="https://build.nvidia.com/z-ai/glm-5-2"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#4A7C59] hover:underline inline-flex items-center gap-1"
              >
                <span>NVIDIA NIM 키 발급</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              id="input-nvidia-key"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={isServerConfigured ? `현재 서버 저장됨 (${serverKeyMasked}) - 변경 시 입력` : "nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs font-mono text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
            />
            <p className="text-[11px] text-[#718096] mt-1.5 leading-relaxed">
              * 키를 등록하면 브라우저가 아닌 앱 백엔드 서버에만 암호화 저장되어 호출됩니다.
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
              <option value="z-ai/glm-5.2">z-ai/glm-5.2 (권장 • 최신 GLM 5.2 씽킹 추론 엔진)</option>
              <option value="meta/llama-3.1-70b-instruct">meta/llama-3.1-70b-instruct (Llama 3.1 70B)</option>
              <option value="meta/llama-3.1-8b-instruct">meta/llama-3.1-8b-instruct (초고속 경량)</option>
            </select>
          </div>

          {/* Security & Server Privacy Box */}
          <div className="bg-[#FAFBF9] rounded-2xl p-3.5 border border-[#E2E8F0] text-xs text-[#4A5568] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#3B6548]">
              <Shield className="w-3.5 h-3.5" />
              <span>보안 및 서버 단일 저장 보장</span>
            </div>
            <p className="text-[11px] text-[#718096] leading-relaxed">
              OpenAI 클라이언트 호환 API (<code className="bg-[#EDF2F7] px-1 rounded text-[#2D3748]">https://integrate.api.nvidia.com/v1</code>)를 통해 서버 사이드에서만 안전하게 통신합니다.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EDF2F7]">
            {isServerConfigured || keyInput ? (
              <button
                id="btn-clear-apikey"
                type="button"
                onClick={handleClearServerKey}
                disabled={isSubmitting}
                className="text-xs text-[#E05252] hover:underline font-medium"
              >
                서버 키 초기화
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
                닫기
              </button>
              <button
                id="btn-save-apikey"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4A7C59] hover:bg-[#3B6548] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? '서버 저장 중...' : '서버에 설정 저장'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
