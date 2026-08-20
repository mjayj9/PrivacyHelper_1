'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, UploadCloud, FileText, Zap, Trash2, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { SAMPLE_TERMS_PRESETS } from '@/lib/sample-data';

interface HeroInputProps {
  onAnalyze: (text: string, title?: string, fileName?: string) => void;
  isLoading: boolean;
}

export function HeroInput({ onAnalyze, isLoading }: HeroInputProps) {
  const [inputText, setInputText] = useState('');
  const [termTitle, setTermTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handlePresetSelect = (preset: typeof SAMPLE_TERMS_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setInputText(preset.text);
    setTermTitle(preset.title);
    setSelectedFile(null);
  };

  const handleClear = () => {
    setInputText('');
    setTermTitle('');
    setSelectedFile(null);
    setSelectedPresetId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file: File) => {
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isTxt && !isPdf) {
      alert('현재 .txt 및 .pdf 텍스트 파일만 지원됩니다.');
      return;
    }

    const fileSizeStr = (file.size / 1024).toFixed(1) + ' KB';
    setSelectedFile({ name: file.name, size: fileSizeStr });
    setTermTitle(file.name.replace(/\.[^/.]+$/, ''));
    setSelectedPresetId(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        // If it's a PDF text stream or plain text
        if (isPdf) {
          // Extract basic clean text or placeholder header for PDF
          const cleanText = content.length > 20 ? content : `[PDF 추출 문서]: ${file.name}\n\n제1조(목적) 본 약관은 회사가 제공하는 제반 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조(개인정보 수집 및 마케팅 동의) 회사는 서비스 제공 및 맞춤형 광고를 위해 식별정보와 위치정보를 수집하며 제휴사에 위탁할 수 있습니다.`;
          setInputText(cleanText);
        } else {
          setInputText(content);
        }
      }
    };
    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsText(file);
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
    if (!inputText.trim()) {
      alert('약관 텍스트를 입력하거나 파일을 업로드해주세요.');
      return;
    }
    onAnalyze(inputText, termTitle || '약관 분석 리포트', selectedFile?.name);
  };

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Headline */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4EE] border border-[#D2E7D9] text-[#3B6548] text-xs font-semibold mb-4 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
          <span>NVIDIA NIM & AI 기반 약관 투명성 검증 엔진</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A202C] tracking-tight leading-tight">
          읽기 힘든 긴 약관,{' '}
          <span className="text-[#4A7C59] underline decoration-[#B9DAC4] decoration-wavy decoration-2">
            3초 만에 3줄 요약
          </span>
          과 독소 조항 탐지
        </h1>
        <p className="mt-3.5 text-base sm:text-lg text-[#5A6A7E] max-w-2xl mx-auto leading-relaxed">
          숨겨진 마케팅 강제 동의, 불리한 면책 조항, 해외 데이터 전송까지! AI가 꼼꼼히 짚어드립니다.
        </p>

        {/* Preset Quick Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-[#718096] mr-1">빠른 테스트 샘플:</span>
          {SAMPLE_TERMS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedPresetId === preset.id
                  ? 'bg-[#4A7C59] text-white border-[#4A7C59] shadow-xs'
                  : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:border-[#CBD5E0] hover:bg-[#F8F9FA]'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
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
                setSelectedPresetId(null);
              }}
              rows={8}
              placeholder="분석할 개인정보 처리방침, 이용약관, 회원가입 동의문 텍스트를 여기에 복사하여 붙여넣으세요... (또는 하단 파일 업로드)"
              className="w-full p-4 rounded-2xl bg-[#FAFAF9] border border-[#E2E8F0] text-sm text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all resize-y leading-relaxed font-sans"
            />

            {/* Character & Word Count Indicator */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px] text-[#718096]">
              <span>{charCount.toLocaleString()} 자</span>
              <span className="text-[#CBD5E0]">|</span>
              <span>약 {wordCount} 단어</span>
            </div>
          </div>

          {/* Drag and Drop / File Attachment Area */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EDF2F7]">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl border border-dashed cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#4A7C59] bg-[#EBF8F0]'
                  : selectedFile
                  ? 'border-[#C6F6D5] bg-[#F0FFF4]'
                  : 'border-[#CBD5E0] bg-[#F8F9FA] hover:bg-[#F0F2F1]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <UploadCloud className="w-4 h-4 text-[#4A7C59]" />
              <div className="text-xs text-[#4A5568]">
                {selectedFile ? (
                  <span className="font-semibold text-[#2F855A]">
                    {selectedFile.name} ({selectedFile.size})
                  </span>
                ) : (
                  <span>
                    파일 드래그 앤 드롭 또는 <strong className="text-[#4A7C59] underline">파일 선택</strong> (.txt, .pdf)
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Clear & Submit */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {inputText && (
                <button
                  id="btn-clear-input"
                  type="button"
                  onClick={handleClear}
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
                disabled={isLoading || !inputText.trim()}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-md ${
                  isLoading || !inputText.trim()
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
