import { triggerAutoSave } from '@/lib/storage/autoSave';

describe('Auto-Save', () => {
  it('saves clipboard content when sleep detected', async () => {
    const result = await triggerAutoSave();
    expect(result.saved).toBe(true);
    expect(result.timestamp).toBeDefined();
  });
});
