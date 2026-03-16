import { SensorService } from '../src/services/SensorService';

describe('SensorService', () => {
  let service: SensorService;

  beforeEach(() => {
    service = new SensorService();
  });

  test('starts and stops sensor monitoring', async () => {
    await service.startMonitoring();
    expect(service.isMonitoring()).toBe(true);

    await service.stopMonitoring();
    expect(service.isMonitoring()).toBe(false);
  });

  test('emits sensor data events', async () => {
    const mockCallback = jest.fn();
    service.onDataReceived(mockCallback);

    await service.startMonitoring();

    // Simulate sensor data
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockCallback).toHaveBeenCalled();
  });
});
