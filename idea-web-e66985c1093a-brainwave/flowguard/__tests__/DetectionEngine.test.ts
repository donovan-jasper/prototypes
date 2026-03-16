import { DetectionEngine } from '../src/services/DetectionEngine';

describe('DetectionEngine', () => {
  let engine: DetectionEngine;

  beforeEach(() => {
    engine = new DetectionEngine('study');
  });

  test('detects drowsiness from accelerometer stillness', () => {
    const stillData = Array(10).fill({ x: 0.01, y: 0.01, z: 9.81 });
    stillData.forEach(data => engine.processSensorData(data));
    expect(engine.isDrowsy()).toBe(true);
  });

  test('does not trigger on normal movement', () => {
    const normalData = [
      { x: 0.5, y: 0.3, z: 9.8 },
      { x: -0.2, y: 0.6, z: 9.7 },
    ];
    normalData.forEach(data => engine.processSensorData(data));
    expect(engine.isDrowsy()).toBe(false);
  });

  test('adjusts sensitivity by profile', () => {
    const drivingEngine = new DetectionEngine('driving');
    const stillData = { x: 0.05, y: 0.05, z: 9.81 };

    engine.processSensorData(stillData);
    drivingEngine.processSensorData(stillData);

    expect(drivingEngine.getSensitivity()).toBeGreaterThan(engine.getSensitivity());
  });
});
