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
  {
    type: 'insecure_network_call',
    pattern: /http:\/\//gi,
    severity: 'high',
    description: 'Insecure HTTP connection detected. Use HTTPS instead.',
  },
  {
    type: 'weak_crypto',
    pattern: /(MD5|SHA1|DES|ECB)/gi,
    severity: 'medium',
    description: 'Weak cryptographic algorithm detected. Use stronger algorithms like AES-256-GCM.',
  },
  {
    type: 'exposed_secret',
    pattern: /(aws_access_key_id|firebase_api_key|google_api_key)/gi,
    severity: 'critical',
    description: 'Exposed secret key detected. This could compromise your application.',
  },
];
