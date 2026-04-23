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
    {
      pattern: /(sk_live_[0-9a-zA-Z]{24})/,
      type: 'stripe_api_key',
      description: 'Stripe API key found in code',
      remediation: 'Remove the hardcoded secret and use environment variables or secure credential storage.'
    },
    {
      pattern: /(AKIA[0-9A-Z]{16})/,
      type: 'aws_access_key',
      description: 'AWS access key found in code',
      remediation: 'Remove the hardcoded secret and use AWS Secrets Manager or similar service.'
    },
    {
      pattern: /(xox[baprs]-([0-9a-zA-Z]{10,48}))/,
      type: 'slack_token',
      description: 'Slack token found in code',
      remediation: 'Remove the hardcoded secret and use Slack OAuth flow for authentication.'
    },
    {
      pattern: /(EAACEdEose0cBA[0-9A-Za-z]+)/,
      type: 'facebook_token',
      description: 'Facebook access token found in code',
      remediation: 'Remove the hardcoded secret and implement proper Facebook authentication flow.'
    },
    {
      pattern: /([0-9a-f]{32}-us[0-9]{1,2})/,
      type: 'twitter_token',
      description: 'Twitter API token found in code',
      remediation: 'Remove the hardcoded secret and use Twitter OAuth flow for authentication.'
    },
    {
      pattern: /(password\s*=\s*['"][^'"]+['"])/i,
      type: 'hardcoded_password',
      description: 'Hardcoded password found in code',
      remediation: 'Remove the hardcoded password and implement proper authentication flow.'
    },
    {
      pattern: /(api_key\s*=\s*['"][^'"]+['"])/i,
      type: 'hardcoded_api_key',
      description: 'Hardcoded API key found in code',
      remediation: 'Remove the hardcoded API key and use environment variables or secure credential storage.'
    }
  ];

  secretPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'hardcoded_secret',
        severity: 'critical',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `This secret was found in the source code, which is a security risk as it can be easily extracted.`,
      });
    }
  });

  // Insecure network calls detection
  const insecureNetworkPatterns = [
    {
      pattern: /http:\/\//g,
      type: 'http_connection',
      description: 'Insecure HTTP connection detected',
      remediation: 'Use HTTPS instead of HTTP to encrypt data in transit.'
    },
    {
      pattern: /new URL\('http:/g,
      type: 'http_connection',
      description: 'Insecure HTTP connection detected',
      remediation: 'Use HTTPS instead of HTTP to encrypt data in transit.'
    },
    {
      pattern: /fetch\('http:/g,
      type: 'http_connection',
      description: 'Insecure HTTP connection detected',
      remediation: 'Use HTTPS instead of HTTP to encrypt data in transit.'
    },
    {
      pattern: /axios\.get\('http:/g,
      type: 'http_connection',
      description: 'Insecure HTTP connection detected',
      remediation: 'Use HTTPS instead of HTTP to encrypt data in transit.'
    },
    {
      pattern: /WebSocket\('ws:/g,
      type: 'insecure_websocket',
      description: 'Insecure WebSocket connection detected',
      remediation: 'Use WSS instead of WS to encrypt WebSocket communications.'
    }
  ];

  insecureNetworkPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'insecure_network_call',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `HTTP connections transmit data in plaintext, making them vulnerable to eavesdropping and man-in-the-middle attacks.`,
      });
    }
  });

  // Weak encryption detection
  const weakCryptoPatterns = [
    {
      pattern: /MD5\.digest/g,
      type: 'md5_hash',
      description: 'MD5 hash function detected',
      remediation: 'Use SHA-256 or SHA-3 instead of MD5 for hashing.'
    },
    {
      pattern: /SHA1\.digest/g,
      type: 'sha1_hash',
      description: 'SHA1 hash function detected',
      remediation: 'Use SHA-256 or SHA-3 instead of SHA1 for hashing.'
    },
    {
      pattern: /Cipher\.getInstance\("DES"/g,
      type: 'des_encryption',
      description: 'DES encryption detected',
      remediation: 'Use AES-256 instead of DES for encryption.'
    },
    {
      pattern: /Cipher\.getInstance\("AES\/ECB/g,
      type: 'aes_ecb',
      description: 'AES ECB mode detected',
      remediation: 'Use AES-GCM or AES-CBC with proper initialization vectors instead of ECB mode.'
    },
    {
      pattern: /Cipher\.getInstance\("RSA\/ECB/g,
      type: 'rsa_ecb',
      description: 'RSA ECB mode detected',
      remediation: 'Use RSA-OAEP or RSA-PSS with proper padding instead of ECB mode.'
    }
  ];

  weakCryptoPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'weak_cryptography',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `This cryptographic algorithm is considered weak and vulnerable to attacks.`,
      });
    }
  });

  // SQL injection risks
  const sqlInjectionPatterns = [
    {
      pattern: /String\.format\("SELECT/g,
      type: 'sql_injection',
      description: 'Potential SQL injection vulnerability detected',
      remediation: 'Use parameterized queries or prepared statements instead of string concatenation.'
    },
    {
      pattern: /"SELECT " \+ variable/g,
      type: 'sql_injection',
      description: 'Potential SQL injection vulnerability detected',
      remediation: 'Use parameterized queries or prepared statements instead of string concatenation.'
    },
    {
      pattern: /"INSERT INTO " \+ tableName/g,
      type: 'sql_injection',
      description: 'Potential SQL injection vulnerability detected',
      remediation: 'Use parameterized queries or prepared statements instead of string concatenation.'
    },
    {
      pattern: /query\s*=\s*"[^"]*?"\s*\+\s*userInput/g,
      type: 'sql_injection',
      description: 'Potential SQL injection vulnerability detected',
      remediation: 'Use parameterized queries or prepared statements instead of string concatenation.'
    }
  ];

  sqlInjectionPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'sql_injection_risk',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `This code appears to construct SQL queries by concatenating strings, which can lead to SQL injection attacks.`,
      });
    }
  });

  // Debug logging detection
  const debugPatterns = [
    {
      pattern: /console\.log\(/g,
      type: 'debug_logging',
      description: 'Debug logging statement detected',
      remediation: 'Remove debug logging statements or use a proper logging framework with appropriate log levels.'
    },
    {
      pattern: /System\.out\.println\(/g,
      type: 'debug_logging',
      description: 'Debug logging statement detected',
      remediation: 'Remove debug logging statements or use a proper logging framework with appropriate log levels.'
    },
    {
      pattern: /Log\.d\(/g,
      type: 'debug_logging',
      description: 'Debug logging statement detected',
      remediation: 'Remove debug logging statements or use a proper logging framework with appropriate log levels.'
    },
    {
      pattern: /Log\.v\(/g,
      type: 'debug_logging',
      description: 'Debug logging statement detected',
      remediation: 'Remove debug logging statements or use a proper logging framework with appropriate log levels.'
    },
    {
      pattern: /NSLog\(/g,
      type: 'debug_logging',
      description: 'Debug logging statement detected',
      remediation: 'Remove debug logging statements or use a proper logging framework with appropriate log levels.'
    }
  ];

  debugPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'debug_logging',
        severity: 'medium',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `Debug logging statements can expose sensitive information and should be removed from production code.`,
      });
    }
  });

  // Insecure storage detection
  const insecureStoragePatterns = [
    {
      pattern: /SharedPreferences\.edit\(\)\.putString\(/g,
      type: 'insecure_storage',
      description: 'Potentially insecure storage of sensitive data',
      remediation: 'Use Android Keystore or encrypted SharedPreferences for sensitive data storage.'
    },
    {
      pattern: /NSUserDefaults\.setObject:/g,
      type: 'insecure_storage',
      description: 'Potentially insecure storage of sensitive data',
      remediation: 'Use Keychain for sensitive data storage on iOS.'
    },
    {
      pattern: /AsyncStorage\.setItem\(/g,
      type: 'insecure_storage',
      description: 'Potentially insecure storage of sensitive data',
      remediation: 'Use encrypted storage solutions for sensitive data in React Native.'
    },
    {
      pattern: /localStorage\.setItem\(/g,
      type: 'insecure_storage',
      description: 'Potentially insecure storage of sensitive data',
      remediation: 'Use encrypted storage solutions for sensitive data in web contexts.'
    }
  ];

  insecureStoragePatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'insecure_data_storage',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `Storing sensitive data in plaintext storage mechanisms can lead to data exposure if the device is compromised.`,
      });
    }
  });

  // Insecure permissions detection
  const insecurePermissionsPatterns = [
    {
      pattern: /<uses-permission android:name="android.permission.INTERNET" \/>/g,
      type: 'insecure_permission',
      description: 'Internet permission detected',
      remediation: 'Ensure this permission is necessary and properly justified in your app\'s privacy policy.'
    },
    {
      pattern: /<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" \/>/g,
      type: 'insecure_permission',
      description: 'External storage read permission detected',
      remediation: 'Request this permission only when necessary and handle sensitive data appropriately.'
    },
    {
      pattern: /<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" \/>/g,
      type: 'insecure_permission',
      description: 'External storage write permission detected',
      remediation: 'Request this permission only when necessary and handle sensitive data appropriately.'
    },
    {
      pattern: /<uses-permission android:name="android.permission.READ_CONTACTS" \/>/g,
      type: 'insecure_permission',
      description: 'Contacts read permission detected',
      remediation: 'Request this permission only when necessary and handle sensitive data appropriately.'
    }
  ];

  insecurePermissionsPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'insecure_permission',
        severity: 'medium',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `Overly permissive Android permissions can increase the attack surface of your app.`,
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
      severity: 'low'
    };
  }

  const severityWeights = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  let totalWeight = 0;
  let maxWeight = 0;

  findings.forEach(finding => {
    const weight = severityWeights[finding.severity];
    totalWeight += weight;
    if (weight > maxWeight) {
      maxWeight = weight;
    }
  });

  // Calculate score based on total weight and max severity
  const baseScore = Math.max(0, 100 - (totalWeight * 5));
  const adjustedScore = Math.max(0, baseScore - (maxWeight * 10));

  // Determine overall severity
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (maxWeight >= 4) severity = 'critical';
  else if (maxWeight >= 3) severity = 'high';
  else if (maxWeight >= 2) severity = 'medium';

  return {
    findings,
    score: Math.round(adjustedScore),
    severity
  };
};
