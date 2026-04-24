import { scanIPA } from './iosScanner';
import { scanAPK } from './androidScanner';
import { ComplianceIssue, ScanResult } from '../types';

export const scanBuild = async (fileUri: string, platform: 'ios' | 'android'): Promise<ScanResult> => {
  let issues: ComplianceIssue[] = [];

  if (platform === 'ios') {
    issues = await scanIPA(fileUri);
  } else {
    issues = await scanAPK(fileUri);
  }

  const passed = issues.filter(issue => issue.severity === 'critical').length === 0;

  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    platform,
    fileName: fileUri.split('/').pop() || 'unknown',
    issues,
    passed
  };
};
