import { DatabaseService } from '../services/database';

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService();
  });

  it('should add and retrieve sleep sessions', async () => {
    const session = {
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 300,
      confidence: 0.8,
      batterySaved: 0.5,
    };

    const id = await dbService.addSleepSession(session);
    expect(id).toBeGreaterThan(0);

    const sessions = await dbService.getSleepSessions();
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].id).toBe(id);
    expect(sessions[0].duration).toBe(session.duration);
  });

  it('should update and retrieve user settings', async () => {
    const initialSettings = await dbService.getUserSettings();
    expect(initialSettings).toBeDefined();

    const updatedSettings = {
      rewindAmount: 5,
      detectionSensitivity: 7,
      fadeDuration: 2,
      isPremium: true,
    };

    await dbService.updateUserSettings(updatedSettings);
    const newSettings = await dbService.getUserSettings();

    expect(newSettings.rewindAmount).toBe(updatedSettings.rewindAmount);
    expect(newSettings.detectionSensitivity).toBe(updatedSettings.detectionSensitivity);
    expect(newSettings.fadeDuration).toBe(updatedSettings.fadeDuration);
    expect(newSettings.isPremium).toBe(updatedSettings.isPremium);
  });

  it('should update and retrieve battery stats', async () => {
    const initialStats = await dbService.getBatteryStats();
    expect(initialStats).toBeDefined();

    const updateStats = {
      totalSaved: 1.5,
      weeklySavings: 0.5,
      monthlySavings: 2.0,
    };

    await dbService.updateBatteryStats(updateStats);
    const newStats = await dbService.getBatteryStats();

    expect(newStats.totalSaved).toBeGreaterThanOrEqual(updateStats.totalSaved);
    expect(newStats.weeklySavings).toBeGreaterThanOrEqual(updateStats.weeklySavings);
    expect(newStats.monthlySavings).toBeGreaterThanOrEqual(updateStats.monthlySavings);
  });
});
