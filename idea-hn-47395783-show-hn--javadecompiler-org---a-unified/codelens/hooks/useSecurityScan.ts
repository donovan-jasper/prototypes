import { useState, useEffect } from 'react';
import { scanForVulnerabilities, calculateSecurityScore } from '../lib/security/scanner';

interface SecurityFinding {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  matches: RegExpMatchArray[];
  locations: Array<{
    filePath: string;
    lineNumber: number;
    codeSnippet: string;
  }>;
}

export const useSecurityScan = (files: Array<{ path: string; content: string }>) => {
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);
  const [securityScore, setSecurityScore] = useState(100);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (files.length === 0) return;

    const scan = async () => {
      setIsScanning(true);
      try {
        const findings = scanForVulnerabilities(files);
        const score = calculateSecurityScore(findings);

        setSecurityFindings(findings);
        setSecurityScore(score);
      } catch (error) {
        console.error('Security scan failed:', error);
      } finally {
        setIsScanning(false);
      }
    };

    scan();
  }, [files]);

  return {
    securityFindings,
    securityScore,
    isScanning,
  };
};
