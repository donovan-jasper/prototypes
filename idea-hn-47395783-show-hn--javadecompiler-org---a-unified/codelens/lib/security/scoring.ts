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
