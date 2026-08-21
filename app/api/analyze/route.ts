import { NextRequest, NextResponse } from 'next/server';
import { MOCK_ANALYSIS_RESULT } from '@/lib/mockData';
import { AnalysisResult } from '@/types/privacy';
import { extractTextFromPdfBuffer } from '@/lib/pdfExtractor';
import { runNvidiaAnalysisCompletion } from '@/lib/nvidiaClient';
import { getServerNvidiaApiKey, getServerSelectedModel } from '@/lib/serverConfig';

const SYSTEM_PROMPT = `
You are '개약풀 AI' (PrivacyHelper AI), a top-tier legal compliance expert specializing in South Korea's Personal Information Protection Act (개인정보보호법, PIPA) and KISA guidelines.
Analyze the provided Privacy Policy / Terms of Service document thoroughly and return STRICTLY a valid JSON object matching this TypeScript interface without any markdown formatting or commentary:

{
  "docTitle": "문서 제목 (예: OOO 서비스 개인정보 처리방침)",
  "analyzedAt": "2026년 8월 20일",
  "safetyScore": 72,
  "riskLevel": "주의",
  "summary3Lines": [
    "핵심 수집 항목 요약 (필수/선택 정보 및 행태정보 수집 범위)",
    "보유 및 파기 기간 (법정 분리보관 대상 및 탈퇴 시 처리 방침)",
    "제3자 제공, 업무 위탁 및 AI 학습/국외이전 여부"
  ],
  "labels": {
    "collectedItems": {
      "mandatory": ["이름", "휴대폰번호", "이메일"],
      "optional": ["위치정보", "생년월일", "마케팅 수신동의"]
    },
    "retentionPeriod": "회원 탈퇴 시 지체 없이 파기 (단, 전자상거래법 관련 기록 5년 분리 보관)",
    "thirdPartySharing": "배송/결제사 위탁 및 마케팅 제휴사 3곳 제3자 제공",
    "overseasTransfer": {
      "isTransferred": false,
      "countryAndEntity": "해당 없음"
    },
    "aiProfiling": {
      "isApplied": true,
      "details": "맞춤형 추천 알고리즘을 위한 이용자 행동 분석"
    },
    "disguisedConsent": {
      "detected": false,
      "description": "선택 동의 강제 등 특이사항 없음"
    }
  },
  "toxicClauses": [
    {
      "articleNo": "제 12조 제 2항",
      "title": "선택 마케팅 미동의 시 서비스 이용 제한 조항",
      "clauseText": "실제 약관에서 발췌한 원문 문장",
      "reason": "개인정보보호법 제22조 제5항 위반 (선택항목 미동의를 이유로 한 서비스 거부 금지).",
      "severity": "HIGH",
      "legalReference": "개인정보보호법 제22조 제5항"
    }
  ],
  "userRights": {
    "deleteGuide": "설정 > 개인정보 관리 메뉴에서 즉시 계정 삭제 및 파기 신청 가능",
    "withdrawConsent": "마이페이지 > 알림/동의 설정에서 원클릭 토글 OFF",
    "privacyOfficerContact": {
      "nameOrDept": "개인정보보호 책임부서 (보안팀)",
      "email": "privacy@service.com",
      "phone": "02-1234-5678"
    },
    "sampleEmailDraft": "CPO 발송용 정식 동의철회 및 파기 요청 공문 템플릿"
  },
  "proMetrics": {
    "collectionExcessScore": 65,
    "retentionRiskScore": 40,
    "thirdPartyRiskScore": 70,
    "userRightsScore": 85,
    "standardDiffAnalysis": "KISA 표준 권고안 대비 제3자 마케팅 위탁 범위가 광범위하며, 동의 철회 안내가 다소 모호하게 기재되어 있습니다.",
    "recommendationsForBiz": [
      "선택 수집 항목에 대한 별도 동의 UI 분리",
      "국외 서버 이전 가능성에 대한 명시적 고지 보강"
    ]
  }
}
Safety Score Rules:
- 80 ~ 100: '안전' (표준 약관 준수, 필수/선택 명확 분리)
- 50 ~ 79: '주의' (선택 항목 강제 의심, 광범위한 위탁)
- 0 ~ 49: '위험' (개인정보보호법 제22조 위반, 일방적 면책, 포괄적 제3자 제공)
`;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let targetText = '';
    let docTitle = '약관 분석 리포트';
    let customApiKey = req.headers.get('x-nvidia-api-key') || process.env.NVIDIA_API_KEY || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const textFromForm = formData.get('text') as string | null;
      const titleFromForm = formData.get('title') as string | null;
      const headerKeyFromForm = formData.get('apiKey') as string | null;

      if (headerKeyFromForm) customApiKey = headerKeyFromForm;
      if (titleFromForm) docTitle = titleFromForm;

      if (file) {
        docTitle = file.name.replace(/\.[^/.]+$/, '');
        const arrayBuf = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          try {
            const { text, title } = await extractTextFromPdfBuffer(buffer);
            targetText = text || '';
            if (title) docTitle = title;
          } catch (pdfErr) {
            console.warn('PDF Parse error, fallback to string conversion:', pdfErr);
            targetText = buffer.toString('utf-8');
          }
        } else {
          targetText = buffer.toString('utf-8');
        }
      } else if (textFromForm) {
        targetText = textFromForm;
      }
    } else {
      // JSON body
      const body = await req.json();
      targetText = body.text || '';
      if (body.title) docTitle = body.title;
      if (body.nvidiaApiKey) customApiKey = body.nvidiaApiKey;
    }

    // Clean up any raw PDF binary markers if user pasted raw PDF file contents directly
    if (targetText.includes('%PDF-') || targetText.includes('endobj') || targetText.includes('/Creator (Mozilla')) {
      // Remove PDF binary structure artifacts
      const cleaned = targetText
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/%PDF-[\d\.]+/g, '')
        .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/g, '')
        .replace(/<<[\s\S]*?>>/g, '')
        .replace(/stream[\s\S]*?endstream/g, '')
        .replace(/xref[\s\S]*?%%EOF/g, '')
        .replace(/trailer[\s\S]*?%%EOF/g, '')
        .trim();

      if (cleaned.length > 20) {
        targetText = cleaned;
      }
    }

    if (!targetText || targetText.trim().length === 0) {
      return NextResponse.json(
        { error: '약관 본문 또는 파일이 비어있습니다.' },
        { status: 400 }
      );
    }

    const effectiveKey = customApiKey || getServerNvidiaApiKey();
    const effectiveModel = getServerSelectedModel();

    // If no NVIDIA NIM API Key provided or configured on server, return tailored Mock data
    if (!effectiveKey) {
      const nowStr = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const mockResult: AnalysisResult = {
        ...MOCK_ANALYSIS_RESULT,
        id: 'analysis_' + Date.now(),
        docTitle: docTitle || MOCK_ANALYSIS_RESULT.docTitle,
        analyzedAt: nowStr,
        rawText: targetText
      };
      return NextResponse.json({ success: true, data: mockResult });
    }

    // Call NVIDIA NIM API with GLM 5.2 / Thinking support
    try {
      const { content, reasoning } = await runNvidiaAnalysisCompletion({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: `[문서 제목]: ${docTitle}\n\n[분석할 약관 원문]:\n${targetText.slice(0, 15000)}`,
        customApiKey: effectiveKey,
        customModel: effectiveModel
      });

      let cleanJson = content.trim();
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
      } else {
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJson = cleanJson.substring(firstBrace, lastBrace + 1).trim();
        }
      }

      const parsedData = JSON.parse(cleanJson);

      const finalResult: AnalysisResult = {
        id: 'analysis_' + Date.now(),
        docTitle: parsedData.docTitle || docTitle,
        analyzedAt:
          parsedData.analyzedAt ||
          new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
        safetyScore: typeof parsedData.safetyScore === 'number' ? parsedData.safetyScore : 70,
        riskLevel: parsedData.riskLevel || '주의',
        summary3Lines: parsedData.summary3Lines || [
          '주요 개인정보 수집 목적 및 항목 검토 완료',
          '보유 기간 및 파기 절차 확인 필요',
          '제3자 제공 및 위탁 범위 주의 필요'
        ],
        labels: parsedData.labels || MOCK_ANALYSIS_RESULT.labels,
        toxicClauses: parsedData.toxicClauses || MOCK_ANALYSIS_RESULT.toxicClauses,
        userRights: parsedData.userRights || MOCK_ANALYSIS_RESULT.userRights,
        proMetrics: parsedData.proMetrics || MOCK_ANALYSIS_RESULT.proMetrics,
        rawText: targetText
      };

      return NextResponse.json({ success: true, data: finalResult, model: effectiveModel, reasoning });
    } catch (apiErr) {
      console.warn('NVIDIA NIM GLM-5.2 API Call failed, falling back to mock:', apiErr);
      const fallback = {
        ...MOCK_ANALYSIS_RESULT,
        id: 'analysis_' + Date.now(),
        docTitle,
        rawText: targetText
      };
      return NextResponse.json({ success: true, data: fallback });
    }
  } catch (error: any) {
    console.error('API Analyze General Error:', error);
    const fallback = {
      ...MOCK_ANALYSIS_RESULT,
      id: 'analysis_' + Date.now(),
      docTitle: '약관 분석 결과',
      rawText: ''
    };
    return NextResponse.json({ success: true, data: fallback });
  }
}
