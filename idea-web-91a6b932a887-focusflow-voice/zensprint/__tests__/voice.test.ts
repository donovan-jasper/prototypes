import { generateCoachingMessage, getVoicePack } from '../lib/voice';

describe('Voice Coach', () => {
  it('generates start message', () => {
    const msg = generateCoachingMessage('start', 25, 'motivational');
    expect(msg).toContain('25');
    expect(msg.length).toBeGreaterThan(10);
  });

  it('returns valid voice pack', () => {
    const pack = getVoicePack('default');
    expect(pack).toHaveProperty('name');
    expect(pack).toHaveProperty('pitch');
  });
});
