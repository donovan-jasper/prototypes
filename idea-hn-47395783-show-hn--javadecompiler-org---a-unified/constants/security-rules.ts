export interface SecurityFinding {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  description: string;
  remediation: string;
  details?: string;
}

export const SECURITY_RULES = {
  HARDCODED_SECRETS: {
    patterns: [
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
    ],
    severity: 'critical',
    category: 'secrets',
    details: `This secret was found in the source code, which is a security risk as it can be easily extracted.`
  },
  INSECURE_NETWORK_CALLS: {
    patterns: [
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
    ],
    severity: 'high',
    category: 'network',
    details: `HTTP connections transmit data in plaintext, making them vulnerable to eavesdropping and man-in-the-middle attacks.`
  },
  WEAK_ENCRYPTION: {
    patterns: [
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
    ],
    severity: 'high',
    category: 'crypto',
    details: `Weak cryptographic algorithms are vulnerable to various attacks and should be replaced with stronger alternatives.`
  },
  INSECURE_STORAGE: {
    patterns: [
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
    ],
    severity: 'medium',
    category: 'storage',
    details: `Storing sensitive data in plaintext storage can lead to data leaks if the device is compromised.`
  },
  SQL_INJECTION: {
    patterns: [
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
    ],
    severity: 'high',
    category: 'database',
    details: `String concatenation in SQL queries can lead to SQL injection attacks if user input is not properly sanitized.`
  },
  XML_PARSER_VULNERABILITIES: {
    patterns: [
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
    ],
    severity: 'medium',
    category: 'parsing',
    details: `Default XML parsers may be vulnerable to XXE (XML External Entity) attacks.`
  },
  DEBUG_CONFIGURATIONS: {
    patterns: [
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
    ],
    severity: 'medium',
    category: 'configuration',
    details: `Debug configurations should be disabled in production builds for security and performance reasons.`
  }
};
