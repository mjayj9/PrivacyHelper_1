'use client';

import React, { useState } from 'react';
import { Shield, Mail, Phone, ExternalLink, HelpCircle, FileText, ChevronRight } from 'lucide-react';

export function Footer() {
  const [showLegalModal, setShowLegalModal] = useState<string | null>(null);

  return (
    <footer className="w-full bg-[#FAFBF9] border-t border-[#E2E8F0] mt-16 text-[#718096] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4A7C59] flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-[#1A202C]">개약풀 (PrivacyHelper)</span>
            </div>
            <p className="text-xs text-[#5A6A7E] leading-relaxed max-w-md">
              개약풀은 대한민국 개인정보보호법 및 약관규제법에 기반하여 소비자의 알 권리와 디지털 자기결정권을 수호하는 AI 약관 분석 솔루션입니다.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              <span className="bg-[#EBF8F0] text-[#3B6548] px-2 py-0.5 rounded font-semibold border border-[#D1E6D8]">
                NVIDIA NIM 연동
              </span>
              <span className="bg-[#F7FAFC] text-[#4A5568] px-2 py-0.5 rounded font-semibold border border-[#E2E8F0]">
                클라우드 보안 암호화
              </span>
            </div>
          </div>

          {/* Col 2: Services & Legal */}
          <div>
            <h4 className="font-bold text-xs text-[#2D3748] uppercase tracking-wider mb-3">
              이용 및 정책
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="btn-footer-terms"
                  onClick={() => setShowLegalModal('terms')}
                  className="hover:text-[#1A202C] hover:underline"
                >
                  서비스 이용약관
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-privacy"
                  onClick={() => setShowLegalModal('privacy')}
                  className="hover:text-[#1A202C] hover:underline font-bold text-[#4A7C59]"
                >
                  개인정보 처리방침
                </button>
              </li>
              <li>
                <a
                  href="https://www.pipc.go.kr"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1A202C] hover:underline inline-flex items-center gap-1"
                >
                  <span>개인정보보호위원회</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.kisa.or.kr"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1A202C] hover:underline inline-flex items-center gap-1"
                >
                  <span>KISA 한국인터넷진흥원</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer & DPO Support */}
          <div>
            <h4 className="font-bold text-xs text-[#2D3748] uppercase tracking-wider mb-3">
              고객센터 및 고충처리
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#4A7C59]" />
                <span>support@privacyhelper.kr</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#4A7C59]" />
                <span>고객지원: 02-555-7890 (평일 10~18시)</span>
              </li>
              <li className="text-[11px] text-[#A0AEC0] pt-1">
                개인정보 보호책임자(CPO): 정보보호팀 박준영 이사
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-[#EDF2F7] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A0AEC0]">
          <p>
            * 본 서비스의 AI 분석 결과는 정보 제공 및 참고 목적이며, 정식 법률 자문이나 소송상 효력을 대체하지 않습니다.
          </p>
          <p>© {new Date().getFullYear()} 개약풀 (PrivacyHelper). All rights reserved.</p>
        </div>
      </div>

      {/* Simple Legal Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] relative">
            <h3 className="font-bold text-base text-[#1A202C] mb-3">
              {showLegalModal === 'privacy' ? '개약풀 개인정보 처리방침' : '개약풀 서비스 이용약관'}
            </h3>
            <div className="text-xs text-[#4A5568] max-h-64 overflow-y-auto space-y-2 leading-relaxed bg-[#F8F9FA] p-4 rounded-2xl border border-[#EDF2F7]">
              <p>
                1. 개약풀은 사용자가 입력한 약관 본문을 오직 AI 실시간 분석 처리를 위해서만 일시적으로 메모리상에서 활용하며, 별도의 영구 데이터베이스에 무단 보관하지 않습니다.
              </p>
              <p>
                2. NVIDIA NIM API 및 인공지능 모델 호출 시 전달되는 텍스트는 암호화 전송(TLS 1.3)되며 제3자 마케팅 목적으로 재판매되거나 유출되지 않습니다.
              </p>
              <p>
                3. 이용자는 언제든지 로컬 저장소에 보관된 API 키 및 히스토리를 즉시 삭제할 수 있습니다.
              </p>
            </div>
            <div className="mt-4 text-right">
              <button
                id="btn-close-legal-modal"
                onClick={() => setShowLegalModal(null)}
                className="px-4 py-2 bg-[#4A7C59] text-white font-bold rounded-xl text-xs"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
