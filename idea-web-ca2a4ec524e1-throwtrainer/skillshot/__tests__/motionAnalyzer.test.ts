import { analyzeMotion } from '../src/services/motionAnalyzer';

describe('motionAnalyzer', () => {
  it('should detect throw and return throw data', () => {
    const mockCallback = jest.fn();
    const subscription = analyzeMotion(mockCallback);

    // Simulate throw detection
    const mockAccelerometerData = { x: 2, y: 2, z: 2 };
    subscription.accelerometerCallback(mockAccelerometerData);

    expect(mockCallback).toHaveBeenCalledWith({
      speed: expect.any(Number),
      angle: expect.any(Number),
      hit: false,
    });

    subscription.remove();
  });

  it('should handle no motion', () => {
    const mockCallback = jest.fn();
    const subscription = analyzeMotion(mockCallback);

    // Simulate no motion
    const mockAccelerometerData = { x: 0, y: 0, z: 0 };
    subscription.accelerometerCallback(mockAccelerometerData);

    expect(mockCallback).not.toHaveBeenCalled();

    subscription.remove();
  });

  it('should handle erratic motion', () => {
    const mockCallback = jest.fn();
    const subscription = analyzeMotion(mockCallback);

    // Simulate erratic motion
    const mockAccelerometerData = { x: 1, y: 1, z: 1 };
    subscription.accelerometerCallback(mockAccelerometerData);

    expect(mockCallback).not.toHaveBeenCalled();

    subscription.remove();
  });
});
