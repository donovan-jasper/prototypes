import { scanIPA } from './iosScanner';
import { scanAPK } from './androidScanner';
import { ComplianceIssue, ScanResult } from '../types';

export const scanBuild = async (fileUri: string, platform: 'ios' | 'android'): Promise<ScanResult> => {
  let issues: ComplianceIssue[] = [];

  try {
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
  } catch (error) {
    console.error('Error scanning build:', error);
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      platform,
      fileName: fileUri.split('/').pop() || 'unknown',
      issues: [{
        id: `issue-${Date.now()}`,
        ruleId: 'scan_error',
        title: 'Scan Error',
        description: 'An unexpected error occurred during scanning',
        severity: 'critical',
        fix: 'Try scanning a different file or contact support',
        documentationUrl: 'https://developer.apple.com/documentation/xcode/creating-an-archive-of-your-app'
      }],
      passed: false
    };
  }
};
