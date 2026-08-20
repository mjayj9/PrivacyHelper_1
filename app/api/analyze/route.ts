import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { analyzePrivacyPolicyLocal } from '@/lib/privacy-analyzer';
import { AnalysisResult } from '@/types/analysis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, title, nvidiaApiKey, modelName } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: '분석할 약관 텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const termTitle = title || '개인정보 처리방침 분석 리포트';

    // 1. Try NVIDIA NIM API if key is provided
    if (nvidiaApiKey && typeof nvidiaApiKey === 'string' && nvidiaApiKey.trim().length > 5) {
      try {
        const nvidiaResult = await callNvidiaNimApi(trimmedText, termTitle, nvidiaApiKey.trim(), modelName);
        if (nvidiaResult) {
          return NextResponse.json({
            success: true,
            provider: 'NVIDIA NIM (meta/llama-3.1-70b-instruct)',
            data: nvidiaResult
          });
        }
      } catch (err: any) {
        console.warn('NVIDIA NIM API call failed, attempting fallback:', err?.message || err);
      }
    }

    // 2. Try Server-Side Gemini API if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiResult = await callGeminiApi(trimmedText, termTitle);
        if (geminiResult) {
          return NextResponse.json({
            success: true,
            provider: 'Google Gemini 3.7 Flash',
            data: geminiResult
          });
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local engine:', err?.message || err);
      }
    }

    // 3. Robust High-Accuracy Local Privacy Rule Engine
    const localResult = analyzePrivacyPolicyLocal(trimmedText, termTitle);
    return NextResponse.json({
      success: true,
      provider: 'PrivacyHelper Local AI Rule Engine',
      data: localResult
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '약관 분석 중 오류가 발생했습니다.', details: error?.message },
      { status: 500 }
    );
  }
}

const SYSTEM_PROMPT = `당신은 대한민국 개인정보보호법, 정보통신망법, 전자상거래법, 위치정보법 및 약관규제법에 정통한 최고 권위의 개인정보 약관 전문 법률 AI 분석가 '개약풀(PrivacyHelper)'입니다.
사용자가 입력한 약관/개인정보 처리방침을 일반인이 한눈에 이해하기 쉽게 정밀 분석하여, 반드시 아래의 JSON 형식만 순수하게 반환하세요. 마크다운(\`\`\`json) 기호 없이 유효한 JSON 문자열만 출력하세요.

JSON Schema:
{
  "summary3Lines": [
    "핵심 수집 및 이용 목적 요약 (이모지 포함)",
    "제3자 제공 및 보관/파기 기간 요약 (이모지 포함)",
    "이용자 권리 행사 및 주의사항 요약 (이모지 포함)"
  ],
  "labels": {
    "collectedItems": ["수집 항목 1", "수집 항목 2", "기기식별값 등"],
    "retentionPeriod": "보유 및 파기 기간 명시 (예: 탈퇴 시 즉시 파기 / 법정 5년 보관)",
    "thirdPartySharing": "제3자 제공/위탁 여부 요약",
    "overseasTransfer": "국외 이전 여부 (없으면 '해당 없음')",
    "aiTrainingConsent": "AI 모델 학습 활용 조항 여부 (없으면 '해당 없음')"
  },
  "riskLevel": "안전" | "주의" | "위험",
  "score": {
    "total": 75,
    "grade": "A" | "B" | "C" | "D" | "F",
    "transparency": 80,
    "userControl": 70,
    "dataSafety": 75
  },
  "toxicClauses": [
    {
      "id": "toxic-1",
      "title": "독소 조항 명칭 (예: 마케팅 정보 수신 포괄 동의 유도)",
      "clauseText": "해당 조항 원문 발췌",
      "reason": "왜 이용자에게 불리하거나 법적 위반 소지가 있는지 알기 쉬운 설명",
      "riskType": "marketing" | "over_collection" | "third_party" | "immunity" | "dark_pattern",
      "severity": "high" | "medium" | "low",
      "legalReference": "관련 법률 조항 권고 (예: 개인정보보호법 제22조)"
    }
  ],
  "userRights": {
    "deleteGuide": "회원 탈퇴 및 개인정보 즉시 파기 요청 방법",
    "withdrawConsent": "마케팅 동의 및 선택 항목 철회 절차",
    "privacyContact": "약관에 기재된 개인정보 보호책임자/고충처리 담당자 이메일 및 전화번호",
    "sampleEmailDraft": "이용자가 담당자에게 복사해서 보낼 수 있는 공문 형식의 동의 철회 및 파기 요청 메일 전문"
  },
  "diffPreview": {
    "summary": "개정안의 주요 불리한 변경점 요약",
    "isPro": true,
    "changesCount": { "added": 2, "removed": 0, "unfavorable": 2 }
  }
}`;

async function callNvidiaNimApi(text: string, title: string, apiKey: string, modelName?: string): Promise<AnalysisResult | null> {
  const model = modelName || 'meta/llama-3.1-70b-instruct';
  const endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `[약관 명칭]: ${title}\n\n[약관 전문]:\n${text}` }
      ],
      temperature: 0.2,
      max_tokens: 3500,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API HTTP ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  return parseJsonResponse(rawContent, text, title);
}

async function callGeminiApi(text: string, title: string): Promise<AnalysisResult | null> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: `[약관 명칭]: ${title}\n\n[약관 본문]:\n${text}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  const rawContent = response.text;
  if (!rawContent) return null;

  return parseJsonResponse(rawContent, text, title);
}

function parseJsonResponse(raw: string, originalText: string, title: string): AnalysisResult {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  const parsed = JSON.parse(cleaned);
  const localRef = analyzePrivacyPolicyLocal(originalText, title);

  return {
    id: `result-${Date.now()}`,
    title: title || '개인정보 처리방침 분석 리포트',
    analyzedAt: new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    sourceType: 'text',
    charCount: originalText.length,
    riskLevel: parsed.riskLevel || localRef.riskLevel,
    score: parsed.score || localRef.score,
    summary3Lines: parsed.summary3Lines || localRef.summary3Lines,
    labels: {
      collectedItems: parsed.labels?.collectedItems || localRef.labels.collectedItems,
      retentionPeriod: parsed.labels?.retentionPeriod || localRef.labels.retentionPeriod,
      thirdPartySharing: parsed.labels?.thirdPartySharing || localRef.labels.thirdPartySharing,
      overseasTransfer: parsed.labels?.overseasTransfer || localRef.labels.overseasTransfer,
      aiTrainingConsent: parsed.labels?.aiTrainingConsent || localRef.labels.aiTrainingConsent
    },
    toxicClauses: parsed.toxicClauses && parsed.toxicClauses.length > 0 ? parsed.toxicClauses : localRef.toxicClauses,
    userRights: {
      deleteGuide: parsed.userRights?.deleteGuide || localRef.userRights.deleteGuide,
      withdrawConsent: parsed.userRights?.withdrawConsent || localRef.userRights.withdrawConsent,
      privacyContact: parsed.userRights?.privacyContact || localRef.userRights.privacyContact,
      sampleEmailDraft: parsed.userRights?.sampleEmailDraft || localRef.userRights.sampleEmailDraft,
      privacyOfficer: localRef.userRights.privacyOfficer
    },
    diffPreview: parsed.diffPreview || localRef.diffPreview,
    rawText: originalText
  };
}
