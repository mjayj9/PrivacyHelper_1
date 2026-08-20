import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '개약풀 (PrivacyHelper) - 개인정보 약관 AI 분석 웹 서비스',
  description: '복잡하고 긴 개인정보 처리방침 및 이용약관을 AI로 정밀 분석하여 3줄 요약, 독소 조항 탐지, 권리 행사 가이드, 개정안 변경점을 제공합니다.',
  openGraph: {
    title: '개약풀 (PrivacyHelper) - 개인정보 약관 AI 분석',
    description: '복잡한 약관, 3초 만에 3줄 요약과 독소 조항을 탐지하세요.',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning className="bg-[#F8F9FA] text-[#2D3748] antialiased min-h-screen selection:bg-[#C6F6D5] selection:text-[#22543D]">
        {children}
      </body>
    </html>
  );
}
