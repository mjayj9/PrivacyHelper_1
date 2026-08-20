'use client';

import React from 'react';
import { Bell, ShieldAlert, Sparkles, X, Check } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const notifications = [
    {
      id: 'notif-1',
      type: 'alert',
      title: '개인정보보호법 개정안 시행 안내',
      desc: '다크패턴 규제 및 국외 이전 사전 고지 의무가 대폭 강화되었습니다.',
      time: '1시간 전'
    },
    {
      id: 'notif-2',
      type: 'pro',
      title: 'NVIDIA NIM llama-3.1-70b 연동 지원',
      desc: '초고속 메타 라마 70B 모델로 더 정교한 법률 조항 검토가 가능합니다.',
      time: '3시간 전'
    },
    {
      id: 'notif-3',
      type: 'info',
      title: '신규 분석 프리셋 추가',
      desc: '쇼핑몰, 소셜미디어, 핀테크 표준 약관 원클릭 샘플이 등록되었습니다.',
      time: '1일 전'
    }
  ];

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#4A7C59]" />
          <h4 className="text-sm font-bold text-[#1A202C]">개인정보 & 서비스 알림</h4>
        </div>
        <button
          id="btn-close-notif"
          onClick={onClose}
          className="p-1 text-[#A0AEC0] hover:text-[#4A5568] rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-[#F7FAFC] mt-2 max-h-72 overflow-y-auto space-y-1">
        {notifications.map(n => (
          <div key={n.id} className="py-2.5 px-1 hover:bg-[#F7FAFC] rounded-xl transition-colors">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-[#EBF8F0] text-[#3B6548] flex items-center justify-center shrink-0">
                {n.type === 'alert' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E05252]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#4A7C59]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#2D3748]">{n.title}</p>
                  <span className="text-[10px] text-[#A0AEC0]">{n.time}</span>
                </div>
                <p className="text-[11px] text-[#718096] mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-[#EDF2F7] text-center">
        <button
          id="btn-read-all-notif"
          onClick={onClose}
          className="text-xs text-[#4A7C59] font-semibold hover:underline"
        >
          모든 알림 읽음 처리
        </button>
      </div>
    </div>
  );
}
