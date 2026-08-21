import { getServerNvidiaApiKey, getServerSelectedModel } from './serverConfig';

interface NvidiaCompletionResult {
  content: string;
  reasoning?: string;
}

/**
 * Execute legal analysis completion using GLM-5.2 (or selected NVIDIA model)
 */
export async function runNvidiaAnalysisCompletion({
  systemPrompt,
  userPrompt,
  customApiKey,
  customModel
}: {
  systemPrompt: string;
  userPrompt: string;
  customApiKey?: string;
  customModel?: string;
}): Promise<NvidiaCompletionResult> {
  const apiKey = (customApiKey || getServerNvidiaApiKey()).trim();
  if (!apiKey || apiKey.length < 5) {
    throw new Error('NVIDIA API Key is not configured on the server.');
  }

  const model = customModel || getServerSelectedModel() || 'z-ai/glm-5.2';
  const isGlm = model.includes('glm');

  const payload: Record<string, any> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    top_p: 0.95,
    max_tokens: 8192
  };

  // For GLM-5.2, pass thinking parameters directly at root of request body
  if (isGlm) {
    payload.chat_template_kwargs = {
      enable_thinking: true,
      clear_thinking: false
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let response: Response;
  try {
    response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`NVIDIA NIM API error (${response.status}): ${errorText || response.statusText}`);
  }

  const json = await response.json();
  const choice = json.choices?.[0];
  if (!choice || !choice.message) {
    throw new Error('Empty response from NVIDIA NIM model');
  }

  const content = choice.message.content || '';
  const reasoning = choice.message.reasoning_content || undefined;

  return {
    content,
    reasoning
  };
}

/**
 * Execute Q&A chat completion for terms and privacy policies using GLM-5.2
 */
export async function runNvidiaChatCompletion({
  termTitle,
  termText,
  question,
  customApiKey,
  customModel
}: {
  termTitle?: string;
  termText: string;
  question: string;
  customApiKey?: string;
  customModel?: string;
}): Promise<{ answer: string; reasoning?: string }> {
  const apiKey = (customApiKey || getServerNvidiaApiKey()).trim();
  if (!apiKey || apiKey.length < 5) {
    throw new Error('NVIDIA API Key is not configured on the server.');
  }

  const model = customModel || getServerSelectedModel() || 'z-ai/glm-5.2';
  const isGlm = model.includes('glm');

  const payload: Record<string, any> = {
    model,
    messages: [
      {
        role: 'system',
        content:
          '당신은 대한민국 개인정보보호법(PIPA) 및 KISA 가이드라인에 정통한 최고 수준의 법률 AI 상담관입니다. 제공된 약관 본문을 정확히 대조하여 사용자의 질문에 친절하고 신뢰도 높은 한국어로 명확히 답변하세요. 사용자가 놓치기 쉬운 불리한 면책이나 독소 조항이 있다면 함께 짚어주세요.'
      },
      {
        role: 'user',
        content: `[약관 명칭]: ${termTitle || '약관'}\n[약관 본문]:\n${termText.slice(0, 12000)}\n\n[사용자 질문]:\n${question}`
      }
    ],
    temperature: 0.2,
    max_tokens: 3000
  };

  if (isGlm) {
    payload.chat_template_kwargs = {
      enable_thinking: true,
      clear_thinking: false
    };
  }

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`NVIDIA NIM Chat API error (${response.status}): ${errorText || response.statusText}`);
  }

  const json = await response.json();
  const choice = json.choices?.[0];
  const answer = choice?.message?.content || '약관에 근거한 검토 결과를 생성하지 못했습니다.';
  const reasoning = choice?.message?.reasoning_content || undefined;

  return {
    answer,
    reasoning
  };
}

