import { calculateNextReminder, shouldSendReminder } from '../lib/notifications';

describe('Smart Reminders', () => {
  test('calculates next reminder based on usage pattern', () => {
    const lastCompleted = new Date('2026-03-16T09:00:00');
    const nextReminder = calculateNextReminder(lastCompleted);
    expect(nextReminder).toBeInstanceOf(Date);
  });

  test('respects user quiet hours', () => {
    const shouldSend = shouldSendReminder(new Date('2026-03-16T23:00:00'));
    expect(shouldSend).toBe(false);
  });
});
