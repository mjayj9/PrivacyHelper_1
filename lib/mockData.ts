import { AnalysisResult } from '@/types/privacy';

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  id: 'analysis_sample_coupang',
  docTitle: '종합 커머스 & 멤버십 개인정보 처리방침',
  analyzedAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  safetyScore: 62,
  riskLevel: '주의',
  summary3Lines: [
    '필수 배송정보 외에 맞춤형 광고 및 타겟 마케팅을 위한 기기 식별값 및 행동 패턴 정보가 광범위하게 수집됩니다.',
    '회원 탈퇴 시 전자상거래법에 따라 결제·환불 내역 등 일부 금융 기록이 최대 5년간 분리 보관됩니다.',
    '배송 및 CS 위탁사 외에 12개 외부 애드테크 제휴사에 행태정보가 공유되며, AI 프로파일링이 상품 추천에 적용됩니다.'
  ],
  labels: {
    collectedItems: {
      mandatory: ['성명', '휴대폰번호', '배송지 주소', '결제수단 정보', '암호화된 비밀번호'],
      optional: ['위치정보', '생년월일', '관심 쇼핑 카테고리', '마케팅 수신동의', '앱 설치 목록']
    },
    retentionPeriod: '회원 탈퇴 시 지체 없이 파기 (단, 전자상거래법 결제 기록 5년 분리 보관)',
    thirdPartySharing: '국내 배송/CS 5개사 위탁 및 외부 광고 네트워크 12개사 제3자 제공',
    overseasTransfer: {
      isTransferred: true,
      countryAndEntity: '미국 (AWS Cloud Server, 데이터 백업 및 장애 복구 목적)'
    },
    aiProfiling: {
      isApplied: true,
      details: '이용자 검색어, 찜 목록, 구매 이력 기반 AI 딥러닝 개인화 추천 알고리즘 적용'
    },
    disguisedConsent: {
      detected: true,
      description: '회원가입 시 "전체 동의" 선택 시 선택 마케팅 수신 항목이 자동 체크되는 다크패턴 감지'
    }
  },
  toxicClauses: [
    {
      id: 'toxic-1',
      articleNo: '제 8조 제 2항',
      title: '선택 마케팅 미동의 시 일부 부가서비스 이용 제한 조항',
      clauseText: '회원은 마케팅 정보 수신에 동의하지 않을 권리가 있으나, 미동의 시 쿠폰 지급, 타임딜 알림 및 특정 멤버십 혜택 제공이 일방적으로 제한될 수 있습니다.',
      reason: '개인정보보호법 제22조 제5항 위반. 선택 동의 항목 미동의를 이유로 기본 서비스 및 정당한 혜택을 부당하게 거부하거나 차별하는 것은 위법 소지가 있습니다.',
      severity: 'HIGH',
      legalReference: '개인정보보호법 제22조(동의를 받는 방법) 제5항'
    },
    {
      id: 'toxic-2',
      articleNo: '제 14조 제 3항',
      title: '포괄적 제3자 제공 동의 및 사전 고지 없는 위탁사 변경',
      clauseText: '회사는 원활한 업무 처리를 위해 제3자 위탁 업체를 추가하거나 변경할 수 있으며, 이 경우 별도의 개별 통지 없이 홈페이지 공지사항 게시로 갈음합니다.',
      reason: '개인정보보호법 제26조(업무위탁에 따른 개인정보의 처리 제한) 및 제17조 위반. 수탁자 및 위탁 업무 내용이 변경될 때 정보주체에게 고지하고 선택권을 보장해야 합니다.',
      severity: 'HIGH',
      legalReference: '개인정보보호법 제26조 제2항, 제17조 제2항'
    },
    {
      id: 'toxic-3',
      articleNo: '제 19조 제 1항',
      title: '서비스 장애 및 데이터 멸실 시 사업자 일방적 면책',
      clauseText: '천재지변, 통신망 장애 또는 제3자의 해킹 등 불가항력적인 사유로 인해 회원의 개인정보가 유출되거나 멸실된 경우 회사는 일체의 손해배상 책임을 지지 않습니다.',
      reason: '약관의 규제에 관한 법률 제6조 및 제7조 위반. 사업자의 관리적·기술적 보호조치 의무 위반 여부와 무관하게 일방적으로 면책하는 무효 조항입니다.',
      severity: 'MEDIUM',
      legalReference: '약관규제법 제7조(면책조항의 금지)'
    }
  ],
  userRights: {
    deleteGuide: '앱 내 [마이페이지] > [설정] > [회원 정보 수정] > [회원 탈퇴] 메뉴에서 1단계 본인 인증 후 즉시 계정 삭제 및 파기 신청 가능합니다.',
    withdrawConsent: '앱 내 [설정] > [알림 및 마케팅 수신 동의]에서 Push 알림, SMS, 이메일 토글을 언제든 OFF로 즉시 철회할 수 있습니다.',
    privacyOfficerContact: {
      nameOrDept: '개인정보보호 책임부서 (보안컴플라이언스실 박준영 CPO)',
      email: 'privacy-officer@service-sample.kr',
      phone: '02-1588-9900 (평일 09:00 ~ 18:00)'
    },
    sampleEmailDraft: `[수신]: privacy-officer@service-sample.kr
[제목]: [개인정보보호법 제37조] 개인정보 처리정지 및 마케팅 제3자 제공 동의 철회 요청서

귀사의 무궁한 발전을 기원합니다.
본인은 귀사 서비스의 가입 회원(성명: 홍길동 / 계정: user@sample.com)으로서, 개인정보보호법 제37조(개인정보의 처리정지 등) 및 제38조(권리행사의 방법 및 절차)에 의거하여 아래와 같이 개인정보 처리에 대한 권리를 행사하고자 요청드립니다.

1. 요청 사항:
  가. 마케팅 및 프로모션 목적의 일체 제3자 제공 및 위탁 동의 철회
  나. 개인 맞춤형 행태정보 수집 및 AI 프로파일링 처리 정지
  다. 회원 탈퇴 시 법정 의무 보관 외 일체 식별정보의 지체 없는 영구 파기 확인서 회신

2. 근거 법령: 개인정보보호법 제37조 제1항 및 제38조 제1항
본 요청 접수일로부터 10일 이내에 조치 결과를 상기 이메일로 회신하여 주시기 바랍니다.

2026년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일
신청인: 홍길동 (서명 또는 날인)`
  },
  proMetrics: {
    collectionExcessScore: 68,
    retentionRiskScore: 42,
    thirdPartyRiskScore: 74,
    userRightsScore: 82,
    standardDiffAnalysis: 'KISA 표준 개인정보 처리방침 가이드라인 대비 제3자 마케팅 위탁 범위가 12개사로 과다하며, 선택 수집 항목에 대한 분리 동의 절차가 일부 불명확하여 시정 권고가 필요한 상태입니다.',
    recommendationsForBiz: [
      '필수 동의와 선택 동의 항목의 UI 체크박스를 완벽히 물리적으로 분리하여 "전체 동의" 다크패턴 해소',
      '국외 서버(AWS 미국 리전) 이전 항목에 대해 이전받는 자, 이전 일시, 이전 목적 및 거부 방법 명시적 보강',
      '제3자 위탁사 변경 시 공지사항 게시 갈음 문구를 삭제하고 개인정보보호법 제26조 기준에 맞춰 고지 프로세스 개선',
      '회원 탈퇴 후 분리 보관되는 개인정보의 구체적 항목과 파기 예정일을 마이페이지에 직관적으로 표시'
    ]
  }
};
