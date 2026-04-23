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
      pattern: /Cipher\.getInstance\("AES\/ECB\//g,
      type: 'ecb_mode',
      description: 'ECB encryption mode detected',
      remediation: 'Use CBC or GCM mode instead of ECB for better security.'
    },
    {
      pattern: /Cipher\.getInstance\("RSA\/ECB\//g,
      type: 'rsa_ecb',
      description: 'RSA with ECB mode detected',
      remediation: 'Use RSA with OAEP padding or switch to ECDSA for better security.'
    }
  ];

  weakCryptoPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'weak_encryption',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `Weak cryptographic algorithms are vulnerable to various attacks and should be replaced with stronger alternatives.`,
      });
    }
  });

  // Insecure storage detection
  const insecureStoragePatterns = [
    {
      pattern: /SharedPreferences\.edit\(\)\.putString\(/g,
      type: 'shared_prefs_storage',
      description: 'Potentially insecure SharedPreferences usage detected',
      remediation: 'Use Android Keystore or encrypted SharedPreferences for sensitive data.'
    },
    {
      pattern: /NSUserDefaults\.setObject:/g,
      type: 'user_defaults_storage',
      description: 'Potentially insecure NSUserDefaults usage detected',
      remediation: 'Use Keychain for sensitive data storage on iOS.'
    },
    {
      pattern: /localStorage\.setItem\(/g,
      type: 'local_storage',
      description: 'Potentially insecure localStorage usage detected',
      remediation: 'Use sessionStorage or encrypted storage for sensitive data.'
    },
    {
      pattern: /AsyncStorage\.setItem\(/g,
      type: 'async_storage',
      description: 'Potentially insecure AsyncStorage usage detected',
      remediation: 'Use encrypted storage or secure storage libraries for sensitive data.'
    }
  ];

  insecureStoragePatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'insecure_storage',
        severity: 'medium',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `Storing sensitive data in plaintext storage can lead to data leaks if the device is compromised.`,
      });
    }
  });

  // SQL injection risks
  const sqlInjectionPatterns = [
    {
      pattern: /String\.format\(.*%s.*SQL/g,
      type: 'sql_injection',
      description: 'Potential SQL injection vulnerability detected',
      remediation: 'Use parameterized queries or prepared statements instead of string concatenation.'
    },
    {
      pattern: /execSQL\(.*String\.format\(/g,
      type: 'sql_injection',
      description: 'Potential SQL injection vulnerability detected',
      remediation: 'Use parameterized queries or prepared statements instead of string concatenation.'
    },
    {
      pattern: /rawQuery\(.*String\.format\(/g,
      type: 'sql_injection',
      description: 'Potential SQL injection vulnerability detected',
      remediation: 'Use parameterized queries or prepared statements instead of string concatenation.'
    }
  ];

  sqlInjectionPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'sql_injection',
        severity: 'high',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `String concatenation in SQL queries can lead to SQL injection attacks if user input is not properly sanitized.`,
      });
    }
  });

  // XML parsing vulnerabilities
  const xmlParsingPatterns = [
    {
      pattern: /XmlPullParserFactory\.newInstance\(\)/g,
      type: 'xml_parser',
      description: 'Potentially unsafe XML parser usage detected',
      remediation: 'Use XML parsers with security features enabled or consider using a safer alternative.'
    },
    {
      pattern: /DocumentBuilderFactory\.newInstance\(\)/g,
      type: 'xml_parser',
      description: 'Potentially unsafe XML parser usage detected',
      remediation: 'Use XML parsers with security features enabled or consider using a safer alternative.'
    }
  ];

  xmlParsingPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'xml_parser_vulnerability',
        severity: 'medium',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `Default XML parsers may be vulnerable to XXE (XML External Entity) attacks.`,
      });
    }
  });

  // Debug flags detection
  const debugPatterns = [
    {
      pattern: /android:debuggable="true"/g,
      type: 'debug_flag',
      description: 'Debuggable flag enabled in AndroidManifest',
      remediation: 'Set android:debuggable to false in production builds.'
    },
    {
      pattern: /<key>NSAppTransportSecurity<\/key>\s*<dict>\s*<key>NSAllowsArbitraryLoads<\/key>\s*<true\/>/g,
      type: 'ats_disabled',
      description: 'App Transport Security disabled in Info.plist',
      remediation: 'Enable App Transport Security and properly configure exceptions.'
    }
  ];

  debugPatterns.forEach(({ pattern, type, description, remediation }) => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      findings.push({
        type: 'debug_configuration',
        severity: 'medium',
        filePath,
        lineNumber: code.substring(0, match.index).split('\n').length,
        codeSnippet: match[0],
        description,
        remediation,
        details: `Debug configurations should be disabled in production builds for security and performance reasons.`,
      });
    }
  });

  return findings;
};

export const calculateSecurityScore = (findings: SecurityFinding[]): SecurityScanResult => {
  let score = 100;
  let highestSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  findings.forEach(finding => {
    switch (finding.severity) {
      case 'critical':
        score -= 20;
        if (highestSeverity !== 'critical') highestSeverity = 'critical';
        break;
      case 'high':
        score -= 10;
        if (highestSeverity === 'low' || highestSeverity === 'medium') highestSeverity = 'high';
        break;
      case 'medium':
        score -= 5;
        if (highestSeverity === 'low') highestSeverity = 'medium';
        break;
      case 'low':
        score -= 2;
        break;
    }
  });

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    findings,
    score: Math.round(score),
    severity: highestSeverity
  };
};

export const scanDecompiledCode = async (decompiledFiles: Record<string, string>): Promise<SecurityScanResult> => {
  const allFindings: SecurityFinding[] = [];

  for (const [filePath, code] of Object.entries(decompiledFiles)) {
    const findings = scanForVulnerabilities(code, filePath);
    allFindings.push(...findings);
  }

  return calculateSecurityScore(allFindings);
};
