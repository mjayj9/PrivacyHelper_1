export type RiskLevel = '안전' | '주의' | '위험';

export interface ToxicClause {
  id: string;
  title: string;
  clauseText: string;
  reason: string;
  riskType: 'marketing' | 'over_collection' | 'third_party' | 'immunity' | 'dark_pattern' | 'data_retention';
  severity: 'high' | 'medium' | 'low';
  legalReference?: string;
}

export interface UserRightsGuide {
  deleteGuide: string;
  withdrawConsent: string;
  privacyContact: string;
  privacyOfficer?: {
    name: string;
    department: string;
    email: string;
    phone: string;
  };
  sampleEmailDraft?: string;
}

export interface DiffItem {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  title: string;
  oldText?: string;
  newText?: string;
  impact: 'unfavorable' | 'neutral' | 'favorable';
  description: string;
}

export interface DiffPreview {
  summary: string;
  isPro: boolean;
  changesCount: {
    added: number;
    removed: number;
    unfavorable: number;
  };
  items: DiffItem[];
}

export interface AnalysisLabels {
  collectedItems: string[];
  sensitiveItems?: string[];
  retentionPeriod: string;
  thirdPartySharing: string;
  overseasTransfer?: string;
  aiTrainingConsent?: string;
}

export interface PrivacyScore {
  total: number; // 0 ~ 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  transparency: number;
  userControl: number;
  dataSafety: number;
}

export interface AnalysisResult {
  id: string;
  title: string;
  analyzedAt: string;
  sourceType: 'text' | 'file';
  fileName?: string;
  charCount: number;
  riskLevel: RiskLevel;
  score: PrivacyScore;
  summary3Lines: [string, string, string] | string[];
  labels: AnalysisLabels;
  toxicClauses: ToxicClause[];
  userRights: UserRightsGuide;
  diffPreview: DiffPreview;
  rawText: string;
}

export interface TermHistoryItem {
  id: string;
  title: string;
  category: string;
  analyzedAt: string;
  riskLevel: RiskLevel;
  score: number;
  summaryShort: string;
  toxicCount: number;
  sampleResult: Partial<AnalysisResult>;
}

export interface PrivacyTrend {
  id: string;
  tag: string;
  title: string;
  description: string;
  source: string;
  date: string;
  link: string;
}

export interface SponsorAd {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  partnerName: string;
  logoEmoji: string;
}
