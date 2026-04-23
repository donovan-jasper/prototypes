import { securityRules } from '../../constants/security-rules';

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

export const scanForVulnerabilities = (files: Array<{ path: string; content: string }>): SecurityFinding[] => {
  const findings: SecurityFinding[] = [];

  for (const file of files) {
    for (const rule of securityRules) {
      const matches = [...file.content.matchAll(rule.pattern)];
      if (matches.length > 0) {
        const locations = matches.map(match => {
          const lineNumber = file.content.substring(0, match.index).split('\n').length;
          const start = Math.max(0, match.index - 20);
          const end = Math.min(file.content.length, match.index + match[0].length + 20);
          const codeSnippet = file.content.substring(start, end).replace(/\n/g, ' ');

          return {
            filePath: file.path,
            lineNumber,
            codeSnippet
          };
        });

        findings.push({
          type: rule.type,
          severity: rule.severity,
          description: rule.description,
          matches,
          locations
        });
      }
    }
  }

  return findings;
};

export const calculateSecurityScore = (vulnerabilities: SecurityFinding[]): number => {
  let score = 100;

  for (const vuln of vulnerabilities) {
    switch (vuln.severity) {
      case 'critical':
        score -= 30;
        break;
      case 'high':
        score -= 20;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
    }
  }

  return Math.max(score, 0);
};
