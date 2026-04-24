export const validateGitUrl = (url: string): boolean => {
  // Basic URL validation
  if (!url || typeof url !== 'string') return false;

  // Check for common Git URL patterns
  const gitUrlPatterns = [
    /^https?:\/\/github\.com\/[^\/]+\/[^\/]+(\.git)?$/,
    /^https?:\/\/gitlab\.com\/[^\/]+\/[^\/]+(\.git)?$/,
    /^https?:\/\/bitbucket\.org\/[^\/]+\/[^\/]+(\.git)?$/,
    /^git@github\.com:[^\/]+\/[^\/]+\.git$/,
    /^git@gitlab\.com:[^\/]+\/[^\/]+\.git$/,
    /^git@bitbucket\.org:[^\/]+\/[^\/]+\.git$/
  ];

  return gitUrlPatterns.some(pattern => pattern.test(url));
};

export const validateBranchName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;

  // Branch name validation rules
  const invalidChars = /[~^:?*\s[\]]/;
  const reservedNames = ['HEAD', 'FETCH_HEAD', 'MERGE_HEAD', 'ORIG_HEAD'];

  return !invalidChars.test(name) && !reservedNames.includes(name);
};

export const validateCommitMessage = (message: string): boolean => {
  if (!message || typeof message !== 'string') return false;

  // Basic commit message validation
  return message.trim().length > 0 && message.length <= 1000;
};

export const validateFilePath = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false;

  // File path validation
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  const invalidNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4',
                       'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];

  const parts = path.split('/').filter(part => part !== '');
  if (parts.length === 0) return false;

  return parts.every(part => {
    return !invalidChars.test(part) &&
           !invalidNames.includes(part.toUpperCase()) &&
           part.length <= 255;
  });
};
