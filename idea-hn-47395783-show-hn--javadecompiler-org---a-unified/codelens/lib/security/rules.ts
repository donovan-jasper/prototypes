export const securityRules = [
  {
    type: 'hardcoded_secret',
    pattern: /(api_key|secret|token|password)\s*=\s*["'][^"']+["']/gi,
    severity: 'high',
    description: 'Hardcoded secret detected. This could expose sensitive information.',
  },
  {
    type: 'sql_injection',
    pattern: /(SELECT|INSERT|UPDATE|DELETE)\s+.*\+\s*[^+]+/gi,
    severity: 'critical',
    description: 'Potential SQL injection vulnerability detected. Use parameterized queries instead.',
  },
  // Add more security rules here
];
