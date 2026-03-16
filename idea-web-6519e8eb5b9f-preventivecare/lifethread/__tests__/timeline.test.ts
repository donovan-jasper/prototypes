import { addTimelineEvent, getTimelineEvents } from '../lib/timeline';
import { initDatabase, resetDatabase } from '../lib/database';

describe('Health Timeline', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
  });

  test('should add and retrieve timeline events', async () => {
    const event = await addTimelineEvent({
      type: 'doctor_visit',
      title: 'Annual checkup',
      date: new Date(),
      notes: 'Blood pressure normal',
    });
    expect(event.title).toBe('Annual checkup');

    const events = await getTimelineEvents();
    expect(events.length).toBeGreaterThan(0);
  });
});
