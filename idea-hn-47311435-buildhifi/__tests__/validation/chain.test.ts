import { validateSignalChain } from '@/lib/validation/chain';

describe('Signal Chain Validation', () => {
  test('valid turntable → phono preamp → amp → speakers', () => {
    const chain = [
      { type: 'turntable', outputs: ['rca'] },
      { type: 'preamp', inputs: ['rca'], outputs: ['rca'] },
      { type: 'amplifier', inputs: ['rca'], outputs: ['speaker'] },
      { type: 'speaker', inputs: ['speaker'] }
    ];
    expect(validateSignalChain(chain).isValid).toBe(true);
  });

  test('detects missing phono preamp', () => {
    const chain = [
      { type: 'turntable', outputs: ['rca'] },
      { type: 'amplifier', inputs: ['rca'], outputs: ['speaker'] }
    ];
    const result = validateSignalChain(chain);
    expect(result.isValid).toBe(false);
    expect(result.suggestions).toContain('Add phono preamp');
  });
});
