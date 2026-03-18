export interface ScanResult {
  id: string;
  timestamp: number;
  platform: 'ios' | 'android';
  fileName: string;
  issues: ComplianceIssue[];
  passed: boolean;
}

export interface ComplianceIssue {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  fix: string;
  documentationUrl?: string;
}

export interface ComplianceRule {
  id: string;
  platform: 'ios' | 'android';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  check: string;
  path?: string;
  fix: string;
  documentationUrl?: string;
}
