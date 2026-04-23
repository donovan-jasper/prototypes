import { SecurityFinding } from './rules';

export interface SecurityScanResult {
  findings: SecurityFinding[];
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const scanForVulnerabilities = (code: string, filePath: string): SecurityFinding[] => {
  const findings: SecurityFinding[] = [];

  // Hardcoded secrets detection
  const secretPatterns = [
    { pattern: /(sk_live_[0-9a-zA-Z]{24})/, type: 'stripe_api_key' },
    { pattern: /(AKIA[0-9A-Z]{16})/, type: 'aws_access_key' },
    { pattern: /(xox[baprs]-([0-9a-zA-Z]{10,48}))/, type: 'slack_token' },
    { pattern: /(EAACEdEose0cBA[0-9A-Za-z]+)/, type: 'facebook_token' },
    { pattern: /([0-9a-f]{32}-us[0-9]{1,2})/, type: 'twitter_token' },
  ];

  secretPatterns.forEach(({ pattern, type }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'hardcoded_secret',
        severity: 'critical',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description: `Hardcoded ${type} found in code`,
        remediation: `Remove the hardcoded secret and use environment variables or secure credential storage.`,
        details: `This secret was found in the source code, which is a security risk as it can be easily extracted.`,
      });
    }
  });

  // Insecure network calls detection
  const insecureNetworkPatterns = [
    { pattern: /http:\/\//g, type: 'http_connection' },
    { pattern: /new URL\('http:/g, type: 'http_connection' },
    { pattern: /fetch\('http:/g, type: 'http_connection' },
    { pattern: /axios\.get\('http:/g, type: 'http_connection' },
  ];

  insecureNetworkPatterns.forEach(({ pattern, type }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'insecure_network_call',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description: `Insecure HTTP connection detected`,
        remediation: `Use HTTPS instead of HTTP to encrypt data in transit.`,
        details: `HTTP connections transmit data in plaintext, making them vulnerable to eavesdropping and man-in-the-middle attacks.`,
      });
    }
  });

  // Weak encryption detection
  const weakCryptoPatterns = [
    { pattern: /MD5\.digest/g, type: 'md5_hash' },
    { pattern: /SHA1\.digest/g, type: 'sha1_hash' },
    { pattern: /Cipher\.getInstance\("DES"/g, type: 'des_encryption' },
    { pattern: /Cipher\.getInstance\("AES\/ECB/g, type: 'aes_ecb' },
  ];

  weakCryptoPatterns.forEach(({ pattern, type }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'weak_cryptography',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description: `Weak cryptographic algorithm detected`,
        remediation: `Use strong cryptographic algorithms like SHA-256, SHA-3, or AES-GCM instead.`,
        details: `This cryptographic algorithm is considered weak and vulnerable to attacks.`,
      });
    }
  });

  // SQL injection risks
  const sqlInjectionPatterns = [
    { pattern: /String\.format\("SELECT/g, type: 'sql_injection' },
    { pattern: /"SELECT " \+ variable/g, type: 'sql_injection' },
    { pattern: /"INSERT INTO " \+ tableName/g, type: 'sql_injection' },
  ];

  sqlInjectionPatterns.forEach(({ pattern, type }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'sql_injection_risk',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description: `Potential SQL injection vulnerability detected`,
        remediation: `Use parameterized queries or prepared statements instead of string concatenation.`,
        details: `This code appears to construct SQL queries by concatenating strings, which can lead to SQL injection attacks.`,
      });
    }
  });

  // Debug logging detection
  const debugPatterns = [
    { pattern: /console\.log\(/g, type: 'debug_logging' },
    { pattern: /System\.out\.println\(/g, type: 'debug_logging' },
    { pattern: /Log\.d\(/g, type: 'debug_logging' },
    { pattern: /Log\.v\(/g, type: 'debug_logging' },
  ];

  debugPatterns.forEach(({ pattern, type }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'debug_logging',
        severity: 'medium',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description: `Debug logging statement detected`,
        remediation: `Remove debug logging statements or use a proper logging framework with appropriate log levels.`,
        details: `Debug logging statements can expose sensitive information in production environments.`,
      });
    }
  });

  return findings;
};

export const calculateSecurityScore = (findings: SecurityFinding[]): SecurityScanResult => {
  if (findings.length === 0) {
    return {
      findings: [],
      score: 100,
      severity: 'low',
    };
  }

  const severityWeights = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
  };

  const totalWeight = findings.reduce((sum, finding) => {
    return sum + (severityWeights[finding.severity] || 1);
  }, 0);

  const maxPossibleWeight = findings.length * 10; // Assuming all are critical
  const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);

  let overallSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (findings.some(f => f.severity === 'critical')) {
    overallSeverity = 'critical';
  } else if (findings.some(f => f.severity === 'high')) {
    overallSeverity = 'high';
  } else if (findings.some(f => f.severity === 'medium')) {
    overallSeverity = 'medium';
  }

  return {
    findings,
    score: Math.round(score),
    severity: overallSeverity,
  };
};
