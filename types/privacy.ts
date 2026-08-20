export type UserRole = 'FREE' | 'PRO' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type RiskLevel = '안전' | '주의' | '위험';

export interface ToxicClause {
  id?: string;
  articleNo: string;
  title: string;
  clauseText: string; // 약관 원문 발췌
  reason: string;     // PIPA 기준 불리한 법적 이유
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  legalReference?: string;
}

export interface PIPALabels {
  collectedItems: {
    mandatory: string[];
    optional: string[];
  };
  retentionPeriod: string;
  thirdPartySharing: string;
  overseasTransfer: {
    isTransferred: boolean;
    countryAndEntity?: string;
  };
  aiProfiling: {
    isApplied: boolean;
    details?: string;
  };
  disguisedConsent: {
    detected: boolean;
    description?: string;
  };
}

export interface ProMetrics {
  collectionExcessScore: number; // 0~100 (낮을수록 안전)
  retentionRiskScore: number;    // 0~100 (낮을수록 안전)
  thirdPartyRiskScore: number;   // 0~100 (낮을수록 안전)
  userRightsScore: number;       // 0~100 (높을수록 우수)
  standardDiffAnalysis: string;  // 표준 약관 대비 변경/이탈점 분석
  recommendationsForBiz: string[]; // 약관 수정/보완 권고안
}

export interface AnalysisResult {
  id: string;
  docTitle: string;
  analyzedAt: string;
  safetyScore: number;
  riskLevel: RiskLevel;
  summary3Lines: [string, string, string] | string[];
  labels: PIPALabels;
  toxicClauses: ToxicClause[];
  userRights: {
    deleteGuide: string;
    withdrawConsent: string;
    privacyOfficerContact: {
      nameOrDept: string;
      email: string;
      phone: string;
    };
    sampleEmailDraft?: string;
  };
  proMetrics: ProMetrics;
  rawText?: string;
}
