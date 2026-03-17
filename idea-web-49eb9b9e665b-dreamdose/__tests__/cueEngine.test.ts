import { generateSchedule, getNextCue, shouldTriggerCue } from '../lib/audio/cueEngine';

describe('Cue Engine', () => {
  test('generates cue schedule for session', () => {
    const schedule = generateSchedule(20); // 20 min session
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0].timeMinutes).toBeLessThan(schedule[schedule.length - 1].timeMinutes);
  });

  test('cue types vary throughout session', () => {
    const schedule = generateSchedule(20);
    const types = new Set(schedule.map(cue => cue.type));
    expect(types.size).toBeGreaterThan(1); // Should have audio, haptic, or both
  });

  test('first cue starts after 3-4 minutes', () => {
    const schedule = generateSchedule(20);
    expect(schedule[0].timeSeconds).toBeGreaterThanOrEqual(180);
    expect(schedule[0].timeSeconds).toBeLessThanOrEqual(240);
  });

  test('cues maintain minimum 20 second spacing', () => {
    const schedule = generateSchedule(20);
    for (let i = 1; i < schedule.length; i++) {
      const timeDiff = schedule[i].timeSeconds - schedule[i - 1].timeSeconds;
      expect(timeDiff).toBeGreaterThanOrEqual(20);
    }
  });

  test('intensity increases throughout session', () => {
    const schedule = generateSchedule(20);
    const firstIntensity = schedule[0].intensity;
    const lastIntensity = schedule[schedule.length - 1].intensity;
    expect(lastIntensity).toBeGreaterThan(firstIntensity);
  });

  test('getNextCue returns correct upcoming cue', () => {
    const schedule = generateSchedule(20);
    const nextCue = getNextCue(schedule, 100);
    expect(nextCue).toBeTruthy();
    expect(nextCue!.timeSeconds).toBeGreaterThan(100);
  });

  test('getNextCue returns null when no more cues', () => {
    const schedule = generateSchedule(20);
    const nextCue = getNextCue(schedule, 9999);
    expect(nextCue).toBeNull();
  });

  test('shouldTriggerCue detects cue timing', () => {
    const cue = { timeMinutes: 5, timeSeconds: 300, type: 'audio' as const, intensity: 0.5 };
    expect(shouldTriggerCue(cue, 300)).toBe(true);
    expect(shouldTriggerCue(cue, 299)).toBe(true);
    expect(shouldTriggerCue(cue, 301)).toBe(true);
    expect(shouldTriggerCue(cue, 295)).toBe(false);
    expect(shouldTriggerCue(cue, 305)).toBe(false);
  });

  test('more combined cues in late session', () => {
    const schedule = generateSchedule(20);
    const earlySchedule = schedule.filter(c => c.timeMinutes < 10);
    const lateSchedule = schedule.filter(c => c.timeMinutes >= 10);
    
    const earlyBothCount = earlySchedule.filter(c => c.type === 'both').length;
    const lateBothCount = lateSchedule.filter(c => c.type === 'both').length;
    
    const earlyBothRatio = earlyBothCount / earlySchedule.length;
    const lateBothRatio = lateBothCount / lateSchedule.length;
    
    expect(lateBothRatio).toBeGreaterThanOrEqual(earlyBothRatio);
  });
});
