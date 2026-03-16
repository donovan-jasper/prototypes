import { securityRules } from '../../constants/security-rules';

export const scanForVulnerabilities = (code) => {
  const findings = [];

  for (const rule of securityRules) {
    const matches = code.match(rule.pattern);
    if (matches) {
      findings.push({
        type: rule.type,
        severity: rule.severity,
        description: rule.description,
        matches,
      });
    }
  }

  return findings;
};

export const calculateSecurityScore = (vulnerabilities) => {
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
