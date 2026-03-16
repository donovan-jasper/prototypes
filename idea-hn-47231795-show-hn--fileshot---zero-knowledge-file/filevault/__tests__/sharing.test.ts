import { generateShareLink, validateShareLink, isLinkExpired } from '../lib/sharing';

describe('Sharing', () => {
  it('generates valid share link', () => {
    const link = generateShareLink('file123', 24);
    expect(link).toMatch(/^filevault:\/\/receive\//);
  });

  it('detects expired links', () => {
    const expiredTime = Date.now() - 1000;
    expect(isLinkExpired(expiredTime)).toBe(true);
  });

  it('validates link structure', () => {
    const valid = validateShareLink('filevault://receive/abc123?exp=123456');
    expect(valid).toBe(true);
  });
});
