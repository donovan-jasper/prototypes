import { scanForVulnerabilities, calculateSecurityScore } from '../lib/security/scanner';

describe('Security Scanner', () => {
  it('should detect hardcoded API keys', () => {
    const code = 'const API_KEY = "sk_live_12345";';
    const results = scanForVulnerabilities(code);
    expect(results).toContainEqual(
      expect.objectContaining({ type: 'hardcoded_secret' })
    );
  });

  it('should detect SQL injection risks', () => {
    const code = 'const query = "SELECT * FROM users WHERE id = " + userId;';
    const results = scanForVulnerabilities(code);
    expect(results).toContainEqual(
      expect.objectContaining({ type: 'sql_injection' })
    );
  });

  it('should calculate security score correctly', () => {
    const vulnerabilities = [
      { severity: 'high', type: 'sql_injection' },
      { severity: 'low', type: 'weak_crypto' }
    ];
    const score = calculateSecurityScore(vulnerabilities);
    expect(score).toBeLessThan(70);
  });
});
