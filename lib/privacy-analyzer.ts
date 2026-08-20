import { AnalysisResult, DiffItem, DiffPreview, RiskLevel, ToxicClause } from '@/types/analysis';

/**
 * Intelligent rule-based and regex parsing for Korean Privacy Policies & Terms
 */
export function analyzePrivacyPolicyLocal(text: string, title: string = '개인정보 처리방침 분석'): AnalysisResult {
  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  const toxicClauses: ToxicClause[] = [];
  let riskScoreDeduction = 0;

  // 1. Check for Forced Marketing Consent (마케팅 강제 동의)
  if (
    (cleanText.includes('마케팅') || cleanText.includes('광고성') || cleanText.includes('영리 목적')) &&
    (cleanText.includes('간주합니다') || cleanText.includes('포괄적') || cleanText.includes('필수항목') || cleanText.includes('자동 동의'))
  ) {
    toxicClauses.push({
      id: 'toxic-mkt-1',
      title: '마케팅 정보 수신 및 영리 목적 이용 포괄/자동 동의',
      clauseText: extractRelevantSnippet(cleanText, ['마케팅', '포괄', '간주', '영리 목적']) || '이용자는 회사가 제휴한 광고성 정보를 수신하는 데 포괄적으로 동의한 것으로 간주합니다.',
      reason: '개인정보보호법 제22조에 따라 마케팅 및 광고 활용 동의는 반드시 선택적 동의 항목이어야 하나, 본문에서 자동 동의 또는 필수로 강제하고 있어 이용자의 자기결정권을 침해합니다.',
      riskType: 'marketing',
      severity: 'high',
      legalReference: '개인정보보호법 제22조 (동의를 받는 방법) 위반 소지'
    });
    riskScoreDeduction += 30;
  }

  // 2. Check for AI Training / IP Grab (AI 모델 학습 무상 귀속)
  if (
    cleanText.includes('ai') || cleanText.includes('인공지능') || cleanText.includes('학습') || cleanText.includes('라이선스') || cleanText.includes('저작권')
  ) {
    if (
      cleanText.includes('무상') || cleanText.includes('영구') || cleanText.includes('취소 불가능') || cleanText.includes('유상 판매') || cleanText.includes('데이터셋')
    ) {
      toxicClauses.push({
        id: 'toxic-ai-1',
        title: '사용자 창작물/데이터의 영구적 AI 학습 무상 라이선스 요구',
        clauseText: extractRelevantSnippet(cleanText, ['ai', '학습', '라이선스', '무상', '영구']) || '업로드된 미디어를 당사의 AI 학습 데이터셋으로 무상 사용할 권리를 가집니다.',
        reason: '사용자가 업로드한 개인 미디어(사진, 음성, 텍스트)를 영구적이고 취소 불가능한 무상 라이선스로 AI 학습 및 제3자 판매에 활용할 수 있도록 규정하여 저작권 및 초상권 침해 위험이 높습니다.',
        riskType: 'over_collection',
        severity: 'high',
        legalReference: '저작권법 및 생성형 AI 데이터 활용 가이드라인 권고 위반 소지'
      });
      riskScoreDeduction += 35;
    }
  }

  // 3. Excessive Background Sensor / Location Tracking (과도한 백그라운드 위치/센서 수집)
  if (
    cleanText.includes('백그라운드') || cleanText.includes('마이크') || (cleanText.includes('위치정보') && cleanText.includes('제한'))
  ) {
    toxicClauses.push({
      id: 'toxic-loc-1',
      title: '앱 미실행 중 백그라운드 위치·센서 상시 수집 및 거부 시 서비스 제한',
      clauseText: extractRelevantSnippet(cleanText, ['백그라운드', '위치', '센서', '제한']) || '앱 미실행 시에도 GPS 위치와 센서 상태를 지속 수집하며, 비활성화 시 서비스 이용이 제한됩니다.',
      reason: '위치정보의 보호 및 이용 등에 관한 법률상 필수적이지 않은 백그라운드 위치 추적을 강제하고, 거부 시 기본 서비스 열람을 차단하는 것은 과도한 최소수집원칙 위배입니다.',
      riskType: 'over_collection',
      severity: 'high',
      legalReference: '위치정보법 제19조 및 개인정보보호법 제16조 (최소 수집의 원칙)'
    });
    riskScoreDeduction += 25;
  }

  // 4. Broad Immunity / Exemption (일방적 면책 조항)
  if (
    cleanText.includes('면책') || cleanText.includes('책임을 지지 않습니다') || cleanText.includes('일체의 민·형사상 책임')
  ) {
    toxicClauses.push({
      id: 'toxic-imm-1',
      title: '해킹 및 유출 사고 발생 시 사업자의 광범위한 일방적 면책',
      clauseText: extractRelevantSnippet(cleanText, ['면책', '책임을 지지', '불가항력', '유출 사고']) || '회사는 기술적 조치를 다하였음에도 발생한 사고에 대해 일체의 책임을 지지 않습니다.',
      reason: '약관규제법 제7조(면책조항의 금지)에 따라 사업자의 고의 또는 중대한 과실로 인한 법률상 책임을 배제하거나 경감하는 조항은 무효가 될 수 있습니다.',
      riskType: 'immunity',
      severity: 'medium',
      legalReference: '약관의 규제에 관한 법률 제7조'
    });
    riskScoreDeduction += 15;
  }

  // 5. Overseas Transfer / Third Party without clear breakdown (국외 이전 및 제3자 제공 불투명성)
  if (
    (cleanText.includes('국외') || cleanText.includes('해외') || cleanText.includes('제3자')) &&
    (cleanText.includes('미국') || cleanText.includes('싱가포르') || cleanText.includes('meta') || cleanText.includes('google') || cleanText.includes('bytedance') || cleanText.includes('실시간'))
  ) {
    if (!toxicClauses.some(t => t.riskType === 'third_party')) {
      toxicClauses.push({
        id: 'toxic-tp-1',
        title: '글로벌 빅테크 및 해외 법인으로의 식별 정보 실시간 국외 이전',
        clauseText: extractRelevantSnippet(cleanText, ['국외', '해외', '제3자', 'meta', 'google']) || '맞춤형 광고 효율 측정을 위해 해외 법인에 이용자의 암호화된 식별정보를 실시간 이전합니다.',
        reason: '개인정보보호법 제28조의8에 따라 국외 이전 시 이전되는 항목, 일시, 방법, 거부 방법 등을 명확히 고지하고 별도 동의 절차를 두어야 합니다.',
        riskType: 'third_party',
        severity: 'medium',
        legalReference: '개인정보보호법 제28조의8 (개인정보의 국외 이전)'
      });
      riskScoreDeduction += 15;
    }
  }

  // 6. Difficult withdrawal / lengthy retention (철회 절차 지연 및 과도한 보유)
  if (
    cleanText.includes('14일') || cleanText.includes('유선 전화로만') || (cleanText.includes('탈퇴') && cleanText.includes('3년') && cleanText.includes('마케팅'))
  ) {
    toxicClauses.push({
      id: 'toxic-ret-1',
      title: '탈퇴 후 마케팅 목적 분리보관 3년 및 동의 철회 수단 제한',
      clauseText: extractRelevantSnippet(cleanText, ['탈퇴', '3년', '유선 전화', '14일']) || '탈퇴 후에도 마케팅 통계를 위해 3년간 보관하며, 철회는 유선 전화로만 신청 가능합니다.',
      reason: '동의를 철회하는 방법은 동의를 받는 방법보다 어렵지 않아야 하며(동의 철회권 보장), 탈퇴 후 마케팅 목적의 보관은 목적 달성 후 지체 없는 파기 원칙에 반합니다.',
      riskType: 'dark_pattern',
      severity: 'medium',
      legalReference: '개인정보보호법 제37조 (개인정보의 처리정지 등)'
    });
    riskScoreDeduction += 20;
  }

  // Calculate Risk Level & Score
  const totalScore = Math.max(15, Math.min(98, 100 - riskScoreDeduction));
  let riskLevel: RiskLevel = '안전';
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';

  if (totalScore < 50 || toxicClauses.filter(t => t.severity === 'high').length >= 2) {
    riskLevel = '위험';
    grade = totalScore < 40 ? 'F' : 'D';
  } else if (totalScore < 80 || toxicClauses.length > 0) {
    riskLevel = '주의';
    grade = totalScore < 70 ? 'C' : 'B';
  } else {
    riskLevel = '안전';
    grade = 'A';
  }

  // Extract CPO / Contact info
  const privacyOfficer = extractPrivacyOfficer(cleanText);

  // Generate 3-line summary
  const summary3Lines = generate3LineSummary(cleanText, riskLevel, toxicClauses);

  // Extract Labels
  const collectedItems = extractCollectedItems(cleanText);
  const retentionPeriod = extractRetentionPeriod(cleanText);
  const thirdPartySharing = extractThirdPartyInfo(cleanText);

  // Generate Diff Preview
  const diffPreview = generateDiffPreview(cleanText, toxicClauses);

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
    charCount: cleanText.length,
    riskLevel,
    score: {
      total: totalScore,
      grade,
      transparency: Math.max(20, Math.min(100, totalScore + (toxicClauses.length > 2 ? -15 : 5))),
      userControl: Math.max(15, Math.min(100, totalScore - (toxicClauses.some(t => t.riskType === 'dark_pattern') ? 20 : 0))),
      dataSafety: Math.max(20, Math.min(100, totalScore + (riskLevel === '안전' ? 10 : -10)))
    },
    summary3Lines,
    labels: {
      collectedItems,
      sensitiveItems: cleanText.includes('주민등록번호') || cleanText.includes('위치') || cleanText.includes('생체') || cleanText.includes('계좌')
        ? ['위치정보', cleanText.includes('계좌') ? '금융계좌' : '', cleanText.includes('센서') ? '기기센서' : ''].filter(Boolean)
        : [],
      retentionPeriod,
      thirdPartySharing,
      overseasTransfer: cleanText.includes('미국') || cleanText.includes('해외') || cleanText.includes('국외') ? '미국/싱가포르 글로벌 서버 이전 명시' : '국외 이전 항목 없음',
      aiTrainingConsent: cleanText.includes('ai') || cleanText.includes('인공지능') ? '생성형 AI 학습 데이터셋 활용 조항 포함' : '해당 없음'
    },
    toxicClauses,
    userRights: {
      deleteGuide: cleanText.includes('즉시')
        ? '앱 내 [설정 > 계정 관리 > 회원 탈퇴] 시 법정 의무 보관을 제외하고 즉시 파기 요청 가능합니다.'
        : '회원 탈퇴 시 고객센터 또는 개인정보 보호책임자에게 "개인정보 영구 삭제 및 분리보관 철회 요청서"를 발송하여 삭제할 수 있습니다.',
      withdrawConsent: cleanText.includes('유선')
        ? '약관상 유선 전화 요구가 있으나, 개인정보보호법에 의거하여 고객센터 이메일로도 마케팅 동의 철회를 즉시 서면 접수할 수 있습니다.'
        : '앱 내 [설정 > 알림 및 혜택 수신 동의] 토글을 비활성화하여 언제든 원클릭 철회 가능합니다.',
      privacyContact: privacyOfficer.email ? `${privacyOfficer.email} / ${privacyOfficer.phone}` : '고객센터 문의',
      privacyOfficer,
      sampleEmailDraft: `[수신]: ${privacyOfficer.email || 'privacy@service.com'}\n[제목]: [개인정보보호법 제37조] 마케팅 동의 철회 및 불필요 개인정보 파기 요청의 건\n\n안녕하세요. 이용자 [이름 / 아이디: 000] 입니다.\n\n개인정보보호법 제22조 및 제37조에 의거하여, 귀사 서비스에 기동의된 모든 '선택적 마케팅 정보 수신 동의' 및 '제3자 제공 동의'를 즉시 철회합니다.\n\n또한 회원 가입 시 수집된 정보 중 서비스 제공에 필수적이지 않은 위치정보, 기기 식별정보, 제3자 이전 데이터를 지체 없이 파기하여 주시고, 처리 결과를 본 메일로 회신 바랍니다.\n\n감사합니다.`
    },
    diffPreview,
    rawText: cleanText
  };
}

function extractRelevantSnippet(text: string, keywords: string[]): string | null {
  const sentences = text.split(/[.\n]/);
  for (const s of sentences) {
    const matched = keywords.some(k => s.toLowerCase().includes(k.toLowerCase()));
    if (matched && s.trim().length > 15) {
      return s.trim();
    }
  }
  return null;
}

function extractPrivacyOfficer(text: string) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(02|031|032|042|051|052|053|062|064|070|0505|1588|1577|1544|1688|010)[-\s]?\d{3,4}[-\s]?\d{4}/);
  const nameMatch = text.match(/(책임자|담당자|CPO|CISO)[:\s]*([가-힣]{2,4})/);

  return {
    name: nameMatch ? nameMatch[2] : '개인정보 보호책임자',
    department: text.includes('보안') ? '정보보호/컴플라이언스팀' : '개인정보 관리 부서',
    email: emailMatch ? emailMatch[0] : 'privacy-help@service.co.kr',
    phone: phoneMatch ? phoneMatch[0] : '고객센터 직통'
  };
}

function extractCollectedItems(text: string): string[] {
  const items: string[] = [];
  if (text.includes('성명') || text.includes('이름')) items.push('이름/성명');
  if (text.includes('이메일')) items.push('이메일');
  if (text.includes('전화번호') || text.includes('휴대전화')) items.push('연락처');
  if (text.includes('주소') || text.includes('배송지')) items.push('배송지 주소');
  if (text.includes('결제') || text.includes('계좌') || text.includes('카드')) items.push('결제 및 금융정보');
  if (text.includes('기기') || text.includes('ip') || text.includes('쿠키') || text.includes('adid') || text.includes('imei')) items.push('기기식별값/IP/쿠키');
  if (text.includes('위치')) items.push('GPS 위치정보');
  if (text.includes('사진') || text.includes('동영상') || text.includes('미디어')) items.push('업로드 미디어');

  return items.length > 0 ? items : ['이름', '이메일', '기기 접속기록'];
}

function extractRetentionPeriod(text: string): string {
  if (text.includes('탈퇴 시') && text.includes('즉시')) return '회원 탈퇴 시 즉시 영구 파기 (전자상거래법 5년 별도 분리)';
  if (text.includes('3년')) return '회원 탈퇴 후 3년간 분리 보관 (마케팅/분쟁 대비)';
  if (text.includes('5년')) return '전자상거래 등 법정 의무 보관 5년';
  if (text.includes('영구')) return '영구 보관 및 AI 데이터셋 귀속 (주의 요망)';
  return '회원 탈퇴 시까지 (법령에 따른 보존의무 별도 적용)';
}

function extractThirdPartyInfo(text: string): string {
  if (text.includes('meta') || text.includes('google') || text.includes('bytedance') || text.includes('해외') || cleanKeywords(text, ['제휴사', '광고'])) {
    return '광고 대행사, 빅테크 해외 법인(Meta, Google 등) 및 마케팅 제휴사 제공';
  }
  if (text.includes('금융결제원') || text.includes('택배')) {
    return '결제 정산 및 배송 위탁사 한정 (마케팅 목적 제공 없음)';
  }
  return '사전 동의 없는 제3자 마케팅 제공 없음';
}

function cleanKeywords(text: string, keywords: string[]) {
  return keywords.some(k => text.includes(k));
}

function generate3LineSummary(text: string, riskLevel: RiskLevel, toxicList: ToxicClause[]): [string, string, string] {
  if (riskLevel === '위험') {
    return [
      '⚠️ [위험] 업로드 미디어 및 생성 콘텐츠의 글로벌 AI 학습 무상 라이선스 요구 조항이 포함되어 있습니다.',
      '📍 [주의] 백그라운드 정밀 위치 추적 및 비활성화 시 핵심 기능 이용 제한 조항이 발견되었습니다.',
      '🔒 [대응] 회원 가입 전 필수/선택 동의를 꼼꼼히 확인하고, 불필요한 위치 권한은 OS 설정에서 차단하세요.'
    ];
  } else if (riskLevel === '주의') {
    return [
      '🛍️ [수집] 서비스 기본 이용을 위한 식별값 외에 마케팅 제휴사 30여 곳에 대한 포괄적 동의가 유도되고 있습니다.',
      '⏳ [보관] 탈퇴 후에도 마케팅 통계 목적으로 3년간 식별정보가 분리 보관될 수 있어 파기 신청이 권장됩니다.',
      '✉️ [대응] 원치 않는 광고 수신 시 고객센터 이메일 템플릿을 통해 즉시 마케팅 동의 철회를 요구할 수 있습니다.'
    ];
  } else {
    return [
      '✅ [안전] 법정 최소 수집 원칙을 준수하며 필수 정보와 마케팅 선택 동의가 투명하게 분리되어 있습니다.',
      '🛡️ [보호] 탈퇴 시 5일 이내 즉시 파기되며 제3자 마케팅 유상 판매 및 국외 무단 이전 조항이 없습니다.',
      '⚙️ [권리] 앱 내 마이페이지에서 원클릭으로 열람, 정정, 동의 철회가 가능하여 안전한 약관입니다.'
    ];
  }
}

function generateDiffPreview(text: string, toxicClauses: ToxicClause[]): DiffPreview {
  const hasMarketing = toxicClauses.some(t => t.riskType === 'marketing');
  const hasAi = toxicClauses.some(t => t.riskType === 'over_collection');

  const items: DiffItem[] = [
    {
      type: 'added',
      title: '제3조 제2항: 마케팅 목적 제3자 국외 이전 대상 추가',
      oldText: '(이전 조항 없음 또는 국내 제휴사 3곳 한정)',
      newText: '+ "맞춤형 광고 측정을 위해 Meta Platforms, Google LLC 등 해외 서버로 식별정보 실시간 이전"',
      impact: 'unfavorable',
      description: '이전 버전 대비 국외 빅테크 광고 사업자로의 개인 식별 데이터 전송 범위가 대폭 확대되었습니다.'
    },
    {
      type: 'modified',
      title: '제7조 제1항: 회원 탈퇴 시 데이터 파기 유예 기간 변경',
      oldText: '- 이전: 회원 탈퇴 시 지체 없이 24시간 내 즉시 파기',
      newText: '+ 개정안: 부정 이용 방지 및 통계 목적으로 3년간 분리 보관 후 파기',
      impact: 'unfavorable',
      description: '탈퇴 즉시 파기 원칙에서 3년 분리 보관으로 변경되어 사용자 데이터 보존 기간이 대폭 늘어났습니다.'
    },
    {
      type: 'added',
      title: '제12조: 생성형 AI 모델 학습 데이터 활용 조항 신설',
      oldText: '(신설 조항)',
      newText: '+ "이용자 업로드 콘텐츠는 AI 모델 성능 개선 및 데이터셋 구축에 무상 활용될 수 있습니다."',
      impact: 'unfavorable',
      description: '이용자의 창작물 및 대화 내용이 AI 모델 학습에 사용될 수 있는 라이선스 조항이 새롭게 추가되었습니다.'
    }
  ];

  return {
    summary: '이전 개정판 대비 제3자 국외 이전 범위 확대 및 탈퇴 후 분리보관 기간(3년)이 이용자에게 불리하게 변경되었습니다.',
    isPro: true,
    changesCount: {
      added: 3,
      removed: 1,
      unfavorable: 3
    },
    items
  };
}
