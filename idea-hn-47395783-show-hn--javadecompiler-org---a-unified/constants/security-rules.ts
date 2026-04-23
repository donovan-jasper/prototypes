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
        pattern: /SharedPreferences\.edit\(\)/g,
        type: 'shared_preferences',
        description: 'Insecure SharedPreferences usage detected',
        remediation: 'Use Android Keystore or EncryptedSharedPreferences for sensitive data.'
      },
      {
        pattern: /NSUserDefaults/g,
        type: 'nsuserdefaults',
        description: 'Insecure NSUserDefaults usage detected',
        remediation: 'Use Keychain Services or encrypted storage for sensitive data.'
      },
      {
        pattern: /sqlite3_exec\(/g,
        type: 'plaintext_sql',
        description: 'Plaintext SQL query detected',
        remediation: 'Use parameterized queries to prevent SQL injection.'
      }
    ],
    severity: 'high',
    category: 'storage',
    details: `Storing sensitive data in plaintext storage is a security risk that can lead to data exposure.`
  },
  WEBVIEW_SECURITY: {
    patterns: [
      {
        pattern: /setJavaScriptEnabled\(true\)/g,
        type: 'javascript_enabled',
        description: 'JavaScript enabled in WebView detected',
        remediation: 'Disable JavaScript in WebView unless absolutely necessary.'
      },
      {
        pattern: /setAllowFileAccess\(true\)/g,
        type: 'file_access',
        description: 'File access enabled in WebView detected',
        remediation: 'Disable file access in WebView unless absolutely necessary.'
      },
      {
        pattern: /setAllowUniversalAccessFromFileURLs\(true\)/g,
        type: 'universal_access',
        description: 'Universal access from file URLs enabled in WebView detected',
        remediation: 'Disable universal access from file URLs in WebView unless absolutely necessary.'
      }
    ],
    severity: 'medium',
    category: 'webview',
    details: `WebView configurations can introduce security vulnerabilities if not properly secured.`
  },
  DEBUGGING: {
    patterns: [
      {
        pattern: /android:debuggable="true"/g,
        type: 'debuggable_true',
        description: 'Debuggable flag set to true in AndroidManifest',
        remediation: 'Set android:debuggable to false in production builds.'
      },
      {
        pattern: /NSLog\(/g,
        type: 'nslog',
        description: 'NSLog statement detected',
        remediation: 'Remove NSLog statements from production code.'
      },
      {
        pattern: /console\.log\(/g,
        type: 'console_log',
        description: 'console.log statement detected',
        remediation: 'Remove console.log statements from production code.'
      }
    ],
    severity: 'medium',
    category: 'debugging',
    details: `Debugging statements can expose sensitive information in production environments.`
  }
};
