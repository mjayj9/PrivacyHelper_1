import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { question, termText, termTitle, nvidiaApiKey } = await req.json();

    if (!question || !termText) {
      return NextResponse.json({ error: '질문과 약관 본문이 필요합니다.' }, { status: 400 });
    }

    // 1. Try NVIDIA NIM if provided
    if (nvidiaApiKey && typeof nvidiaApiKey === 'string' && nvidiaApiKey.trim().length > 5) {
      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvidiaApiKey.trim()}`
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-70b-instruct',
            messages: [
              {
                role: 'system',
                content: '당신은 대한민국 개인정보 약관 전문 법률 AI 상담원입니다. 약관 본문을 근거로 사용자의 질문에 친절하고 명확하게 한국어로 답변하세요. 불리하거나 주의할 점이 있다면 짚어주세요.'
              },
              {
                role: 'user',
                content: `[약관 명칭]: ${termTitle || '약관'}\n[약관 본문]:\n${termText}\n\n[사용자 질문]:\n${question}`
              }
            ],
            temperature: 0.3,
            max_tokens: 1000
          })
        });

        if (res.ok) {
          const json = await res.json();
          const answer = json.choices?.[0]?.message?.content;
          if (answer) {
            return NextResponse.json({ answer, source: 'NVIDIA NIM' });
          }
        }
      } catch (err) {
        console.warn('NVIDIA NIM Q&A failed, falling back:', err);
      }
    }

    // 2. Try Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `[약관 명칭]: ${termTitle || '약관'}\n[약관 본문]:\n${termText}\n\n[사용자 질문]:\n${question}`,
          config: {
            systemInstruction: '당신은 대한민국 개인정보 약관 전문 법률 AI 상담원입니다. 제공된 약관 본문을 근거로 일반 사용자가 이해하기 쉽게 2~4문장으로 핵심을 짚어 친절하게 답변해주세요. 주의할 독소 조항이 있다면 함께 짚어주세요.',
            temperature: 0.3
          }
        });

        if (response.text) {
          return NextResponse.json({ answer: response.text, source: 'Gemini AI' });
        }
      } catch (err) {
        console.warn('Gemini Q&A failed, falling back:', err);
      }
    }

    // 3. Smart local keyword answer
    const qLower = question.toLowerCase();
    let localAnswer = '제공해주신 약관을 검토한 결과, ';
    if (qLower.includes('탈퇴') || qLower.includes('삭제') || qLower.includes('파기')) {
      if (termText.includes('3년') || termText.includes('5년')) {
        localAnswer += '회원 탈퇴를 하더라도 부정 이용 방지 및 관계 법령에 따라 일부 거래/식별 정보가 3~5년간 분리 보관될 수 있습니다. 완전 파기를 원하시면 개인정보 보호책임자에게 직접 파기 요청 공문을 보내셔야 합니다.';
      } else {
        localAnswer += '회원 탈퇴 시 지체 없이 파기되는 것이 원칙이나, 전자상거래법 등 법정 의무 보관 항목은 일정 기간 별도 DB에 보관됩니다.';
      }
    } else if (qLower.includes('마케팅') || qLower.includes('광고') || qLower.includes('전화') || qLower.includes('문자')) {
      localAnswer += '약관 내 마케팅 수신 동의가 포함되어 있는지 확인이 필요합니다. 원치 않는 광고는 앱 내 설정(알림 토글 OFF) 또는 고객센터 이메일 접수를 통해 즉시 철회할 수 있습니다.';
    } else if (qLower.includes('ai') || qLower.includes('학습') || qLower.includes('사진') || qLower.includes('동영상')) {
      if (termText.includes('ai') || termText.includes('학습') || termText.includes('라이선스')) {
        localAnswer += '⚠️ 주의: 본 약관에는 사용자가 업로드한 미디어를 AI 모델 학습 및 제3자 라이선스로 활용할 수 있는 조항이 포함되어 있습니다. 민감한 사진이나 창작물 업로드 시 주의가 필요합니다.';
      } else {
        localAnswer += '본 약관에서 이용자의 콘텐츠를 AI 학습 데이터로 무단 활용한다는 명시적인 위험 조항은 발견되지 않았습니다.';
      }
    } else if (qLower.includes('위치')) {
      if (termText.includes('백그라운드') || termText.includes('위치')) {
        localAnswer += '약관상 GPS 위치정보 수집 항목이 포함되어 있습니다. 앱을 사용하지 않을 때의 위치 추적을 원치 않으시면 스마트폰 OS 설정에서 위치 권한을 [앱 사용 중에만 허용]으로 변경하세요.';
      } else {
        localAnswer += '약관 본문에 과도한 실시간 위치 추적 조항은 명시되어 있지 않습니다.';
      }
    } else {
      localAnswer += `해당 약관에 대한 문의 내용에 대해, 개인정보보호법에 따라 이용자는 언제든지 본인의 개인정보 열람·정정·삭제 및 처리정지를 요구할 권리가 있습니다. 상세 내용은 약관 내 명시된 개인정보 보호책임자(CPO)에게 직접 문의하실 수 있습니다.`;
    }

    return NextResponse.json({ answer: localAnswer, source: 'Rule Heuristic' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error occurred' }, { status: 500 });
  }
}
