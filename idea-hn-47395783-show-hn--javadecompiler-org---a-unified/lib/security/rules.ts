export interface SecurityFinding {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  filePath: string;
  lineNumber?: number;
  codeSnippet?: string;
  description: string;
  remediation: string;
  details?: string;
}

export const SECURITY_RULES: SecurityFinding[] = [
  {
    type: 'hardcoded_secret',
    severity: 'critical',
    filePath: '',
    description: 'Hardcoded API keys or secrets found in code',
    remediation: 'Remove secrets from code and use environment variables or secure credential storage',
    details: 'Hardcoded secrets can be easily extracted from the compiled application and used by attackers',
  },
  {
    type: 'insecure_network_call',
    severity: 'high',
    filePath: '',
    description: 'Insecure HTTP connections detected',
    remediation: 'Use HTTPS instead of HTTP for all network communications',
    details: 'HTTP connections transmit data in plaintext, making them vulnerable to eavesdropping and man-in-the-middle attacks',
  },
  {
    type: 'weak_cryptography',
    severity: 'high',
    filePath: '',
    description: 'Weak cryptographic algorithms detected',
    remediation: 'Use strong cryptographic algorithms like SHA-256, SHA-3, or AES-GCM',
    details: 'Weak cryptographic algorithms are vulnerable to attacks and should not be used in production',
  },
  {
    type: 'sql_injection_risk',
    severity: 'high',
    filePath: '',
    description: 'Potential SQL injection vulnerabilities detected',
    remediation: 'Use parameterized queries or prepared statements instead of string concatenation',
    details: 'SQL injection can allow attackers to execute arbitrary SQL commands on your database',
  },
  {
    type: 'debug_logging',
    severity: 'medium',
    filePath: '',
    description: 'Debug logging statements detected',
    remediation: 'Remove debug logging statements or use a proper logging framework with appropriate log levels',
    details: 'Debug logging can expose sensitive information in production environments',
  },
  {
    type: 'exposed_endpoint',
    severity: 'high',
    filePath: '',
    description: 'Potentially exposed API endpoints detected',
    remediation: 'Ensure all API endpoints are properly secured with authentication and authorization',
    details: 'Exposed API endpoints can be accessed by unauthorized users if not properly secured',
  },
  {
    type: 'insecure_storage',
    severity: 'high',
    filePath: '',
    description: 'Insecure data storage methods detected',
    remediation: 'Use secure storage mechanisms like Android Keystore or iOS Keychain',
    details: 'Insecure storage can lead to data leakage if the device is compromised',
  },
  {
    type: 'deprecated_api',
    severity: 'medium',
    filePath: '',
    description: 'Usage of deprecated or insecure APIs detected',
    remediation: 'Update to use the latest secure versions of APIs',
    details: 'Deprecated APIs may contain known vulnerabilities and should be avoided',
  },
  {
    type: 'webview_security',
    severity: 'high',
    filePath: '',
    description: 'Potential WebView security issues detected',
    remediation: 'Configure WebView with proper security settings and disable JavaScript if not needed',
    details: 'WebViews can be vulnerable to JavaScript injection attacks if not properly secured',
  },
  {
    type: 'permission_overuse',
    severity: 'medium',
    filePath: '',
    description: 'Excessive or unnecessary permissions requested',
    remediation: 'Request only the minimum permissions required for the app to function',
    details: 'Excessive permissions can increase the attack surface and reduce user trust',
  },
];

export const getRuleByType = (type: string): SecurityFinding | undefined => {
  return SECURITY_RULES.find(rule => rule.type === type);
};
