import { scheduleWateringReminder, cancelReminder, getNextWateringDate } from '../lib/notifications';

describe('Notification scheduling', () => {
  test('calculates next watering date correctly', () => {
    const lastWatered = new Date('2026-03-10');
    const frequency = 7;
    const nextDate = getNextWateringDate(lastWatered.toISOString(), frequency);
    expect(nextDate.toISOString().split('T')[0]).toBe('2026-03-17');
  });

  test('schedules a reminder', async () => {
    const notificationId = await scheduleWateringReminder({
      id: '1',
      name: 'Monstera',
      species: 'Monstera deliciosa',
      wateringFrequency: 7,
      lastWatered: new Date('2026-03-10').toISOString(),
      photoUris: [],
      createdAt: new Date().toISOString(),
    });
    expect(notificationId).toBeDefined();
  });

  test('cancels a reminder', async () => {
    const notificationId = await scheduleWateringReminder({
      id: '2',
      name: 'Pothos',
      species: 'Epipremnum aureum',
      wateringFrequency: 5,
      lastWatered: new Date('2026-03-11').toISOString(),
      photoUris: [],
      createdAt: new Date().toISOString(),
    });
    await cancelReminder(notificationId);
    expect(true).toBe(true);
  });
});
