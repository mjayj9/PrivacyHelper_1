'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  Zap,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Key,
  Info,
  CheckCircle2,
  Scale,
  Loader2,
  FileText
} from 'lucide-react';
import { SAMPLE_TERMS_PRESETS, SamplePresetItem } from '@/lib/sample-data';
import { useAuth } from '@/context/AuthContext';

interface HeroInputProps {
  onAnalyze: (text: string, title?: string, fileName?: string) => void;
  isLoading: boolean;
  onOpenApiKey?: () => void;
}

export function HeroInput({ onAnalyze, isLoading, onOpenApiKey }: HeroInputProps) {
  const { apiKey, selectedModel, isProOrAdmin } = useAuth();
  const [inputText, setInputText] = useState('');
  const [termTitle, setTermTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<SamplePresetItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handlePresetSelect = (preset: SamplePresetItem) => {
    setSelectedPreset(preset);
    setInputText(preset.text);
    setTermTitle(preset.title);
    setSelectedFile(null);
  };

  const handleClear = () => {
    setInputText('');
    setTermTitle('');
    setSelectedFile(null);
    setSelectedPreset(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isTxt && !isPdf) {
      alert('현재 .txt 및 .pdf 텍스트 파일만 지원됩니다.');
      return;
    }

    const fileSizeStr = (file.size / 1024).toFixed(1) + ' KB';
    setSelectedFile({ name: file.name, size: fileSizeStr });
    setTermTitle(file.name.replace(/\.[^/.]+$/, ''));
    setSelectedPreset(null);

    if (isPdf) {
      setIsParsingPdf(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok) {
          let errorMsg = 'PDF 텍스트 추출에 실패했습니다.';
          if (contentType.includes('application/json')) {
            const errData = await response.json().catch(() => ({}));
            if (errData.error) errorMsg = errData.error;
          }
          throw new Error(errorMsg);
        }

        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data.text) {
            setInputText(data.text);
            if (data.title) {
              setTermTitle(data.title);
            }
          }
        } else {
          const rawRespText = await response.text();
          if (rawRespText) {
            setInputText(rawRespText);
          }
        }
      } catch (err: any) {
        console.error('PDF extraction failed:', err);
        alert(`PDF 텍스트 추출 중 문제가 발생했습니다: ${err.message || err}`);
      } finally {
        setIsParsingPdf(false);
      }
    } else {
      // Plain text file
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          setInputText(content);
        }
      };
      reader.onerror = () => {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isParsingPdf) {
      alert('PDF 텍스트 추출이 진행 중입니다. 잠시만 기다려주세요.');
      return;
    }
    if (!inputText.trim()) {
      alert('약관 텍스트를 입력하거나 빠른 테스트 샘플을 선택해주세요.');
      return;
    }
    onAnalyze(inputText, termTitle || '약관 분석 리포트', selectedFile?.name);
  };

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Headline */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4EE] border border-[#D2E7D9] text-[#3B6548] text-xs font-semibold mb-3 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
          <span>NVIDIA NIM & 법률 AI 기반 약관 투명성 검증 솔루션</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A202C] tracking-tight leading-tight">
          읽기 힘든 긴 약관,{' '}
          <span className="text-[#4A7C59] underline decoration-[#B9DAC4] decoration-wavy decoration-2">
            3초 만에 3줄 요약
          </span>
          과 독소 조항 탐지
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#5A6A7E] max-w-2xl mx-auto leading-relaxed">
          숨겨진 마케팅 강제 동의, 불리한 면책 조항, 해외 데이터 전송까지! AI가 꼼꼼히 짚어드립니다.
        </p>
      </div>

      {/* Prominent NVIDIA API Key & Engine Notice Card */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#F0FDF4] via-[#F7FBF8] to-[#EDF7F1] border border-[#C6F6D5] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A7C59] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-[#1A202C]">
                  NVIDIA NIM AI 70B 추론 엔진 연동 안내
                </span>
                {apiKey ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]">
                    <CheckCircle2 className="w-3 h-3 text-[#0E9F6E]" />
                    <span>NVIDIA API Key 연결됨 ({selectedModel.split('/')[1] || 'Llama 3.1 70B'})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF08A]/70 text-[#854D0E] border border-[#FDE047]">
                    <Sparkles className="w-3 h-3 text-[#CA8A04]" />
                    <span>NVIDIA Key 입력 시 PRO 70B 실시간 추론 활성화</span>
                  </span>
                )}
                {isProOrAdmin && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#805AD5]/15 text-[#6B46C1] border border-[#D6BCFA]">
                    PRO 멤버십 가동 중
                  </span>
                )}
              </div>
              <p className="text-xs text-[#4A5568] mt-1 leading-relaxed">
                실제 서비스 분석 및 PRO 정밀 리포트는 <strong>NVIDIA NIM (Llama 3.1 70B Instruct)</strong> 추론 모델을 통해 실시간 수행됩니다.
                <span className="text-[#718096] block sm:inline sm:ml-1">
                  (관리자나 사용자가 설정한 NVIDIA 키는 안전하게 암호화 통신에만 사용됩니다.)
                </span>
              </p>
            </div>
          </div>

          <button
            id="btn-hero-open-apikey"
            type="button"
            onClick={onOpenApiKey}
            className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#2F855A] border border-[#9AE6B4] hover:bg-[#EBF8F0] transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs"
          >
            <Key className="w-3.5 h-3.5 text-[#38A169]" />
            <span>{apiKey ? 'API 키 변경/확인' : 'NVIDIA Key 등록하기'}</span>
          </button>
        </div>
      </div>

      {/* Real-World Case Test Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#4A7C59]" />
            <span className="text-xs font-bold text-[#2D3748]">
              실제 공시 사례 기반 빠른 테스트 샘플 (출처 명시)
            </span>
          </div>
          <span className="text-[11px] text-[#718096] hidden sm:inline">
            원클릭으로 실제 약관 본문과 법적 쟁점을 불러옵니다
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {SAMPLE_TERMS_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                id={`btn-preset-${preset.id}`}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`p-2.5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#EBF8F0] border-[#4A7C59] shadow-xs ring-2 ring-[#4A7C59]/20'
                    : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E0] hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EDF2F7] text-[#4A5568]">
                    {preset.badge}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      preset.riskBadge === '위험'
                        ? 'bg-[#FFF5F5] text-[#E05252] border border-[#FED7D7]'
                        : preset.riskBadge === '주의'
                        ? 'bg-[#FFFAF0] text-[#DD6B20] border border-[#FEEBC8]'
                        : 'bg-[#F0FFF4] text-[#38A169] border border-[#C6F6D5]'
                    }`}
                  >
                    {preset.riskBadge}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#1A202C] line-clamp-1">
                  {preset.name.replace(/\[실제사례\]\s*/, '')}
                </h4>
                <p className="text-[11px] text-[#718096] line-clamp-1 mt-0.5">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Preset Source & Legal Detail Info Box */}
        {selectedPreset && (
          <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#CBD5E0] shadow-2xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <Info className="w-4 h-4 text-[#4A7C59] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#1A202C]">
                  📌 선택된 사례 출처:
                </span>
                <span className="font-semibold text-[#2F855A] bg-[#EBF8F0] px-2 py-0.5 rounded text-[11px]">
                  {selectedPreset.source}
                </span>
              </div>
              <p className="text-[#4A5568] leading-relaxed text-[11px]">
                {selectedPreset.sourceDetail}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] font-bold text-[#718096]">주요 쟁점:</span>
                {selectedPreset.keyIssues.map((issue, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-[#F7FAFC] text-[#4A5568] border border-[#E2E8F0] px-1.5 py-0.2 rounded"
                  >
                    #{issue}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Input Form Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden transition-all hover:shadow-md">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-7">
          {/* Optional Title Input */}
          <div className="mb-4">
            <label htmlFor="input-term-title" className="block text-xs font-bold text-[#4A5568] mb-1.5">
              약관 / 서비스 명칭 (선택 사항)
            </label>
            <input
              id="input-term-title"
              type="text"
              value={termTitle}
              onChange={(e) => setTermTitle(e.target.value)}
              placeholder="예: ○○쇼핑몰 이용약관 및 개인정보 처리방침"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all"
            />
          </div>

          {/* Text Area / Dropzone Box */}
          <div className="relative">
            <textarea
              id="textarea-term-input"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSelectedPreset(null);
              }}
              rows={8}
              disabled={isParsingPdf}
              placeholder={
                isParsingPdf
                  ? 'PDF 문서에서 텍스트를 추출하는 중입니다... 잠시만 기다려주세요.'
                  : '분석할 개인정보 처리방침, 이용약관, 회원가입 동의문 텍스트를 여기에 복사하여 붙여넣으세요... (또는 상단 실제사례 샘플 클릭)'
              }
              className={`w-full p-4 rounded-2xl border text-sm text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all resize-y leading-relaxed font-sans ${
                isParsingPdf ? 'bg-[#F0FDF4] border-[#86EFAC]' : 'bg-[#FAFAF9] border-[#E2E8F0]'
              }`}
            />

            {/* Parsing spinner overlay if parsing PDF */}
            {isParsingPdf && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-[#4A7C59] animate-spin" />
                <span className="text-xs font-bold text-[#2F855A]">
                  PDF 문서 본문 텍스트를 깨짐 없이 추출하는 중...
                </span>
              </div>
            )}

            {/* Character & Word Count Indicator */}
            {!isParsingPdf && (
              <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px] text-[#718096]">
                <span>{charCount.toLocaleString()} 자</span>
                <span className="text-[#CBD5E0]">|</span>
                <span>약 {wordCount} 단어</span>
              </div>
            )}
          </div>

          {/* Drag and Drop / File Attachment Area */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EDF2F7]">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (!isParsingPdf) fileInputRef.current?.click();
              }}
              className={`flex-1 w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl border border-dashed cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#4A7C59] bg-[#EBF8F0]'
                  : isParsingPdf
                  ? 'border-[#86EFAC] bg-[#F0FDF4]'
                  : selectedFile
                  ? 'border-[#C6F6D5] bg-[#F0FFF4]'
                  : 'border-[#CBD5E0] bg-[#F8F9FA] hover:bg-[#F0F2F1]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,application/pdf,text/plain"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              {isParsingPdf ? (
                <Loader2 className="w-4 h-4 text-[#4A7C59] animate-spin" />
              ) : selectedFile ? (
                <FileText className="w-4 h-4 text-[#4A7C59]" />
              ) : (
                <UploadCloud className="w-4 h-4 text-[#4A7C59]" />
              )}
              <div className="text-xs text-[#4A5568]">
                {isParsingPdf ? (
                  <span className="font-semibold text-[#2F855A]">
                    PDF 문서 본문 파싱 중... ({selectedFile?.name})
                  </span>
                ) : selectedFile ? (
                  <span className="font-semibold text-[#2F855A]">
                    {selectedFile.name} ({selectedFile.size}) - 텍스트 추출 완료
                  </span>
                ) : (
                  <span>
                    PDF/TXT 파일 드래그 앤 드롭 또는 <strong className="text-[#4A7C59] underline">파일 선택</strong> (.pdf, .txt)
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Clear, Instant PDF Example & Submit */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-instant-pdf-example"
                type="button"
                onClick={() => {
                  const examplePreset = SAMPLE_TERMS_PRESETS[1] || SAMPLE_TERMS_PRESETS[0]; // Global SNS AI / Ecommerce
                  handlePresetSelect(examplePreset);
                  onAnalyze(examplePreset.text, `[PDF 분석 예시] ${examplePreset.title}`, 'sample_privacy_terms.pdf');
                }}
                disabled={isLoading || isParsingPdf}
                className="px-3.5 py-3 rounded-2xl border border-[#4A7C59] bg-[#EBF8F0] text-xs font-bold text-[#2F855A] hover:bg-[#DDF4E5] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                title="기다리지 않고 즉시 PDF 분석 결과물 보기"
              >
                <FileText className="w-4 h-4 text-[#38A169]" />
                <span>📄 PDF 결과물 예시 즉시 보기</span>
              </button>

              {inputText && (
                <button
                  id="btn-clear-input"
                  type="button"
                  onClick={handleClear}
                  disabled={isParsingPdf}
                  className="px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#718096] hover:bg-[#FFF5F5] hover:text-[#E05252] hover:border-[#FEB2B2] transition-colors flex items-center justify-center gap-1.5"
                  title="내용 비우기"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">지우기</span>
                </button>
              )}

              <button
                id="btn-submit-analyze"
                type="submit"
                disabled={isLoading || isParsingPdf || !inputText.trim()}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-md ${
                  isLoading || isParsingPdf || !inputText.trim()
                    ? 'bg-[#A0AEC0] cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-[#4A7C59] to-[#3B6548] hover:from-[#3B6548] hover:to-[#2D4F38] hover:shadow-lg shadow-[#4A7C59]/25 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <Zap className="w-4 h-4 fill-current text-yellow-300 animate-pulse" />
                <span>⚡ AI 약관 분석하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
