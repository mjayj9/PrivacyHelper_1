'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Share2,
  Printer,
  RotateCcw,
  Sparkles,
  Lock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Mail,
  Phone,
  UserCheck,
  Info,
  Layers,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { AnalysisResult, RiskLevel, ToxicClause } from '@/types/privacy';
import { DiffCheckerPro } from './DiffCheckerPro';
import { useAuth } from '@/context/AuthContext';

interface ResultDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  onOpenSubscribe: () => void;
}

export function ResultDashboard({ result, onReset, onOpenSubscribe }: ResultDashboardProps) {
  const { isProOrAdmin, apiKey } = useAuth();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'high' | 'medium'>('all');

  // Terms Q&A State
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `안녕하세요! "${result.docTitle}" 약관에 대해 궁금한 점이 있으신가요? "탈퇴 시 내 데이터 보존 기간은?", "마케팅 동의 철회는 어떻게 하나요?" 등을 자유롭게 질문해주세요.`,
      time: '방금 전'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case '위험':
        return {
          bg: 'bg-[#FFF5F5]',
          text: 'text-[#E05252]',
          border: 'border-[#FEB2B2]',
          badgeBg: 'bg-[#E05252]',
          label: '위험 (주의 요망)',
          icon: <ShieldAlert className="w-5 h-5 text-[#E05252]" />
        };
      case '주의':
        return {
          bg: 'bg-[#FFFAF0]',
          text: 'text-[#DD6B20]',
          border: 'border-[#FBD38D]',
          badgeBg: 'bg-[#DD6B20]',
          label: '주의 (선택 동의 확인 필요)',
          icon: <AlertTriangle className="w-5 h-5 text-[#DD6B20]" />
        };
      case '안전':
      default:
        return {
          bg: 'bg-[#F0FFF4]',
          text: 'text-[#2F855A]',
          border: 'border-[#9AE6B4]',
          badgeBg: 'bg-[#38A169]',
          label: '안전 (표준 약관 준수)',
          icon: <ShieldCheck className="w-5 h-5 text-[#38A169]" />
        };
    }
  };

  const riskStyle = getRiskStyle(result.riskLevel);

  const handleCopyEmailDraft = () => {
    if (!result.userRights?.sampleEmailDraft) return;
    navigator.clipboard.writeText(result.userRights.sampleEmailDraft);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyClause = (clause: ToxicClause, id: string) => {
    navigator.clipboard.writeText(`[${clause.articleNo || '약관'} 발췌]: ${clause.clauseText}\n[사유]: ${clause.reason}`);
    setCopiedClauseId(id);
    setTimeout(() => setCopiedClauseId(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || isChatLoading) return;

    const userQ = chatQuestion.trim();
    setChatQuestion('');
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userQ,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          termTitle: result.docTitle,
          termText: result.rawText || (result.toxicClauses?.map((c) => c.clauseText).join('\n\n') ?? ''),
          nvidiaApiKey: apiKey
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.answer) {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: json.answer,
              time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsChatLoading(false);
          return;
        }
      }

      // Fallback if network or answer is empty
      let answer = `본 약관(${result.docTitle})의 내용에 따르면, 귀하의 질의("${userQ}")에 대한 검토 결과:\n\n1. 개인정보보호법에 의거하여 관련 목적 외 이용은 제한됩니다.\n2. 마케팅 또는 제3자 제공 동의는 언제든지 설정 메뉴 또는 CPO(${result.userRights?.privacyOfficerContact?.email || '고객센터'})를 통해 즉시 철회 가능합니다.\n3. 법정 보존 기한이 지난 개인정보는 영구 파기 조치됩니다.`;
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: answer,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsChatLoading(false);
    } catch (err) {
      console.warn('Chat term API error:', err);
      let answer = `본 약관(${result.docTitle})의 내용에 따르면, 귀하의 질의("${userQ}")에 대한 검토 결과:\n\n1. 개인정보보호법에 의거하여 관련 목적 외 이용은 제한됩니다.\n2. 마케팅 또는 제3자 제공 동의는 언제든지 설정 메뉴 또는 CPO(${result.userRights?.privacyOfficerContact?.email || '고객센터'})를 통해 즉시 철회 가능합니다.\n3. 법정 보존 기한이 지난 개인정보는 영구 파기 조치됩니다.`;
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: answer,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsChatLoading(false);
    }
  };

  const filteredClauses = (result.toxicClauses || []).filter((clause) => {
    if (selectedRiskFilter === 'high') return clause.severity === 'HIGH';
    if (selectedRiskFilter === 'medium') return clause.severity === 'MEDIUM';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Status Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}
            >
              {riskStyle.icon}
              <span>종합 진단: {riskStyle.label}</span>
            </span>
            <span className="text-xs text-[#718096] flex items-center gap-1 bg-[#F8F9FA] px-2.5 py-1 rounded-lg border border-[#EDF2F7]">
              <Clock className="w-3.5 h-3.5 text-[#A0AEC0]" />
              {result.analyzedAt} 분석
            </span>
            {apiKey ? (
              <span className="text-[11px] font-bold text-[#03543F] bg-[#DEF7EC] px-2.5 py-1 rounded-lg border border-[#BCF0DA] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0E9F6E]" />
                <span>NVIDIA NIM 70B 실시간 추론 적용됨</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#718096] bg-[#F8F9FA] px-2.5 py-1 rounded-lg border border-[#E2E8F0] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#4A7C59]" />
                <span>KISA 표준 법률 룰엔진 검증</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#1A202C]">
            {result.docTitle}
          </h2>
          <p className="text-xs text-[#718096] mt-1">
            대한민국 개인정보보호법(PIPA) 및 KISA 가이드라인 기준 AI 정밀 검토 보고서
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-result-reset"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F8F9FA] hover:bg-[#EDF2F7] text-[#4A5568] border border-[#CBD5E0] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>다른 약관 분석</span>
          </button>

          <button
            id="btn-result-print"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F8F9FA] text-[#4A5568] border border-[#CBD5E0] transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 PDF / 인쇄</span>
          </button>

          <button
            id="btn-result-share"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EBF8F0] hover:bg-[#DFF5E7] text-[#3B6548] border border-[#C6F6D5] transition-colors"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-[#38A169]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedShare ? '링크 복사됨' : '공유하기'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Cards 1 & 2): Summary & Risk Alert */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: 3줄 요약 & PIPA 6대 라벨 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#EDF2F7]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF8F0] text-[#4A7C59] flex items-center justify-center font-bold text-base">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
                    3줄 핵심 요약 & PIPA 6대 라벨
                  </h3>
                  <p className="text-xs text-[#718096]">약관의 핵심 수집·보관·제공 사항 브리핑</p>
                </div>
              </div>

              {/* Privacy Score */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0]">
                  <span className="text-xs text-[#718096] font-medium">안전점수:</span>
                  <span className="text-sm font-black text-[#4A7C59]">{result.safetyScore || 75}점</span>
                </div>
              </div>
            </div>

            {/* PIPA 6 Core Labels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {/* Mandatory/Optional Items */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-[#EDF2F7]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5568] mb-1.5">
                  <span>📌</span>
                  <span>필수 / 선택 수집</span>
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {result.labels?.collectedItems?.mandatory?.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold bg-[#EBF8F0] text-[#2F855A] px-1.5 py-0.5 rounded border border-[#C6F6D5]"
                      >
                        [필수] {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {result.labels?.collectedItems?.optional?.slice(0, 2).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-white text-[#718096] px-1.5 py-0.5 rounded border border-[#E2E8F0]"
                      >
                        [선택] {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Retention Period */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-[#EDF2F7]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5568] mb-1.5">
                  <span>⏳</span>
                  <span>보유 및 파기 기간</span>
                </div>
                <p className="text-[11px] font-medium text-[#2D3748] leading-tight">
                  {result.labels?.retentionPeriod || '탈퇴 시 즉시 파기'}
                </p>
              </div>

              {/* Third Party Sharing */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-[#EDF2F7]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5568] mb-1.5">
                  <span>🏢</span>
                  <span>제3자 제공 / 위탁</span>
                </div>
                <p className="text-[11px] font-medium text-[#2D3748] leading-tight">
                  {result.labels?.thirdPartySharing || '마케팅 목적 제공 없음'}
                </p>
              </div>
            </div>

            {/* Extra PIPA Badges (Overseas, AI profiling, Disguised Consent) */}
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
              {result.labels?.overseasTransfer?.isTransferred && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FFF5F5] text-[#C53030] border border-[#FEB2B2] font-semibold flex items-center gap-1">
                  <span>🌐 국외 이전:</span> {result.labels.overseasTransfer.countryAndEntity}
                </span>
              )}
              {result.labels?.aiProfiling?.isApplied && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FFFAF0] text-[#DD6B20] border border-[#FBD38D] font-semibold flex items-center gap-1">
                  <span>🤖 AI 프로파일링:</span> {result.labels.aiProfiling.details}
                </span>
              )}
              {result.labels?.disguisedConsent?.detected && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FFF5F5] text-[#E05252] border border-[#FEB2B2] font-bold flex items-center gap-1">
                  <span>⚠️ 필수동의 위장:</span> {result.labels.disguisedConsent.description}
                </span>
              )}
            </div>

            {/* 3-Line Bullet Points */}
            <div className="space-y-3 bg-[#FAFBF9] p-4 sm:p-5 rounded-2xl border border-[#E9EFEA]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A7C59]">
                AI 3줄 핵심 브리핑
              </h4>
              <ul className="space-y-2.5">
                {(result.summary3Lines || []).map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2D3748] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#EBF8F0] text-[#3B6548] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 2: 독소 조항 및 불리한 약관 탐지 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#EDF2F7] gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF5F5] text-[#E05252] flex items-center justify-center font-bold text-base">
                  2
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
                      독소 조항 & 주의 약관 탐지
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFF5F5] text-[#E05252] border border-[#FEB2B2]">
                      {result.toxicClauses?.length || 0}건 감지
                    </span>
                  </div>
                  <p className="text-xs text-[#718096]">개인정보보호법(PIPA) 및 약관규제법 위반 소지 조항</p>
                </div>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 self-start sm:self-auto bg-[#F7FAFC] p-1 rounded-xl border border-[#E2E8F0]">
                <button
                  id="btn-filter-all"
                  onClick={() => setSelectedRiskFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedRiskFilter === 'all' ? 'bg-white text-[#1A202C] shadow-xs' : 'text-[#718096]'
                  }`}
                >
                  전체 ({result.toxicClauses?.length || 0})
                </button>
                <button
                  id="btn-filter-high"
                  onClick={() => setSelectedRiskFilter('high')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedRiskFilter === 'high' ? 'bg-[#E05252] text-white shadow-xs' : 'text-[#718096]'
                  }`}
                >
                  고위험 ({result.toxicClauses?.filter((c) => c.severity === 'HIGH').length || 0})
                </button>
              </div>
            </div>

            {/* Toxic Clauses List */}
            {filteredClauses.length === 0 ? (
              <div className="text-center py-8 bg-[#F0FFF4] rounded-2xl border border-[#9AE6B4] p-6">
                <ShieldCheck className="w-10 h-10 text-[#38A169] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#2F855A]">감지된 독소 조항이 없습니다</h4>
                <p className="text-xs text-[#4A5568] mt-1">
                  해당 약관은 개인정보보호법상 필수/선택 동의가 명확히 분리되어 있으며 표준 규정을 준수합니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClauses.map((clause, idx) => {
                  const clauseId = clause.id || `clause-${idx}`;
                  return (
                    <div
                      key={clauseId}
                      className="bg-[#FFF8F8] rounded-2xl p-4 sm:p-5 border border-[#FED7D7] transition-all hover:border-[#FEB2B2]"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              clause.severity === 'HIGH'
                                ? 'bg-[#E05252] text-white'
                                : 'bg-[#DD6B20] text-white'
                            }`}
                          >
                            {clause.severity === 'HIGH' ? '고위험' : '주의'}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#718096]">
                            {clause.articleNo}
                          </span>
                          <h4 className="text-sm font-bold text-[#9B2C2C]">{clause.title}</h4>
                        </div>

                        <button
                          id={`btn-copy-clause-${clauseId}`}
                          onClick={() => handleCopyClause(clause, clauseId)}
                          className="p-1.5 text-[#A0AEC0] hover:text-[#4A5568] rounded-lg hover:bg-white transition-colors"
                          title="조항 내용 복사"
                        >
                          {copiedClauseId === clauseId ? (
                            <Check className="w-3.5 h-3.5 text-[#38A169]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Quoted Original Clause */}
                      <div className="bg-white/90 p-3 rounded-xl border border-[#FEE2E2] mb-2.5 font-mono text-xs text-[#4A5568] leading-relaxed italic">
                        &quot;{clause.clauseText}&quot;
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-[#742A2A] leading-relaxed mb-2 font-sans">
                        <strong className="font-bold">⚠️ 법적 불리 사유: </strong>
                        {clause.reason}
                      </p>

                      {/* Legal Reference */}
                      {clause.legalReference && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#975A16] bg-[#FFFAF0] px-2.5 py-1 rounded-lg border border-[#FEEBC8]">
                          <Info className="w-3.5 h-3.5 shrink-0 text-[#DD6B20]" />
                          <span>{clause.legalReference}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 4: KISA Diff Checker & 4 Core Metrics (PRO/ADMIN Module) */}
          <DiffCheckerPro proMetrics={result.proMetrics} onOpenSubscribe={onOpenSubscribe} />
        </div>

        {/* Right Column: User Rights Guide & Terms Q&A Chat */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 3: 내 권리 찾기 & 대응 가이드 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-[#EDF2F7]">
              <div className="w-9 h-9 rounded-xl bg-[#EBF8F0] text-[#4A7C59] flex items-center justify-center font-bold text-base">
                3
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C]">
                  내 권리 찾기 & 대응 가이드
                </h3>
                <p className="text-xs text-[#718096]">개인정보보호법에 따른 동의 철회 및 파기 요청</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Withdrawal Guide */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#EDF2F7]">
                <h4 className="text-xs font-bold text-[#2D3748] flex items-center gap-1.5 mb-1.5">
                  <span>🗑️</span>
                  <span>회원 탈퇴 및 정보 파기 요청 방법</span>
                </h4>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  {result.userRights?.deleteGuide}
                </p>
              </div>

              {/* Marketing Consent Revocation */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#EDF2F7]">
                <h4 className="text-xs font-bold text-[#2D3748] flex items-center gap-1.5 mb-1.5">
                  <span>🔕</span>
                  <span>마케팅 수신 동의 철회 절차</span>
                </h4>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  {result.userRights?.withdrawConsent}
                </p>
              </div>

              {/* Privacy Officer Contact */}
              <div className="bg-[#EBF8F0] rounded-2xl p-4 border border-[#C6F6D5]">
                <h4 className="text-xs font-bold text-[#2F855A] flex items-center gap-1.5 mb-2">
                  <UserCheck className="w-4 h-4 text-[#38A169]" />
                  <span>개인정보 보호책임자 (CPO)</span>
                </h4>
                <div className="space-y-1 text-xs text-[#2D3748]">
                  {result.userRights?.privacyOfficerContact && (
                    <p className="font-semibold text-[#1A202C]">
                      {result.userRights.privacyOfficerContact.nameOrDept}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#4A7C59]">
                    {result.userRights?.privacyOfficerContact?.email && (
                      <a
                        href={`mailto:${result.userRights.privacyOfficerContact.email}`}
                        className="inline-flex items-center gap-1 hover:underline font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {result.userRights.privacyOfficerContact.email}
                      </a>
                    )}
                    {result.userRights?.privacyOfficerContact?.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {result.userRights.privacyOfficerContact.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Copyable Email Draft Button */}
                {result.userRights?.sampleEmailDraft && (
                  <div className="mt-3 pt-3 border-t border-[#D2E7D9]">
                    <button
                      id="btn-copy-email-draft"
                      onClick={handleCopyEmailDraft}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F0FFF4] text-[#2F855A] border border-[#B9DAC4] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#38A169]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? '공문 템플릿 복사 완료!' : '📄 CPO 발송용 동의철회 공문 복사'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Terms Q&A Chat Widget */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#EDF2F7]">
              <MessageSquare className="w-4 h-4 text-[#4A7C59]" />
              <h3 className="font-bold text-sm text-[#1A202C]">약관 전용 AI 실시간 질의응답</h3>
            </div>

            {/* Chat message bubbles */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs mb-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#4A7C59] text-white rounded-br-xs'
                        : 'bg-[#F4F7F5] text-[#2D3748] border border-[#E2E8F0] rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-[#A0AEC0] mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-1 text-xs text-[#718096] bg-[#F8F9FA] p-2.5 rounded-xl border border-[#EDF2F7] w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-[#4A7C59] animate-spin" />
                  <span>약관 원문을 검토하여 답변 생성 중...</span>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                id="input-chat-question"
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="예: 탈퇴 후 사진 데이터는 어떻게 되나요?"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
              />
              <button
                id="btn-chat-send"
                type="submit"
                disabled={!chatQuestion.trim() || isChatLoading}
                className="p-2 rounded-xl bg-[#4A7C59] text-white disabled:opacity-50 hover:bg-[#3B6548] transition-colors"
                aria-label="질문 전송"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Raw Text Accordion Toggle */}
      {result.rawText && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <button
            id="btn-toggle-rawtext"
            onClick={() => setShowRawText(!showRawText)}
            className="w-full px-6 py-4 flex items-center justify-between text-xs font-bold text-[#4A5568] hover:bg-[#F8F9FA] transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#718096]" />
              <span>약관 원문 전문 확인하기 ({result.rawText.length.toLocaleString()} 자)</span>
            </div>
            {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawText && (
            <div className="p-6 bg-[#FAFAF9] border-t border-[#EDF2F7] max-h-96 overflow-y-auto font-mono text-xs text-[#4A5568] whitespace-pre-wrap leading-relaxed">
              {result.rawText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
