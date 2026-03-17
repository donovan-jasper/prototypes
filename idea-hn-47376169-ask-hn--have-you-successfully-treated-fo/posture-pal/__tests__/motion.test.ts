import { postureDetector } from '../lib/motion';

describe('Posture Detection', () => {
  beforeEach(() => {
    postureDetector.startCalibration();
  });

  test('calculates calibration offset correctly', () => {
    // Simulate calibration samples
    for (let i = 0; i < 100; i++) {
      postureDetector.addCalibrationSample(
        { x: 0, y: 9.8, z: 0 },
        { x: 0, y: 0, z: 0 }
      );
    }

    // Verify calibration completed
    expect(postureDetector['isCalibrated']).toBe(true);
    expect(postureDetector['calibrationOffset']).toBeCloseTo(0);
  });

  test('detects correct posture for chin tuck', () => {
    // Simulate calibration
    for (let i = 0; i < 100; i++) {
      postureDetector.addCalibrationSample(
        { x: 0, y: 9.8, z: 0 },
        { x: 0, y: 0, z: 0 }
      );
    }

    // Test with correct posture data
    const result = postureDetector.detectPosture(
      { x: 0.5, y: 9.5, z: 0.5 },
      { x: 0, y: 0, z: 0 },
      'chin-tuck'
    );

    expect(result.isCorrect).toBe(true);
    expect(result.angle).toBeCloseTo(3);
    expect(result.feedback).toBe("Perfect posture!");
  });

  test('detects incorrect posture for chin tuck', () => {
    // Simulate calibration
    for (let i = 0; i < 100; i++) {
      postureDetector.addCalibrationSample(
        { x: 0, y: 9.8, z: 0 },
        { x: 0, y: 0, z: 0 }
      );
    }

    // Test with incorrect posture data
    const result = postureDetector.detectPosture(
      { x: 2.0, y: 9.0, z: 1.0 },
      { x: 0, y: 0, z: 0 },
      'chin-tuck'
    );

    expect(result.isCorrect).toBe(false);
    expect(result.angle).toBeCloseTo(7.125);
    expect(result.feedback).toBe("Tilt your head back slightly");
  });

  test('validates hold duration for chin tuck', () => {
    // Simulate calibration
    for (let i = 0; i < 100; i++) {
      postureDetector.addCalibrationSample(
        { x: 0, y: 9.8, z: 0 },
        { x: 0, y: 0, z: 0 }
      );
    }

    // Test hold duration validation
    const isValid = postureDetector.isHoldingCorrectly(
      18000, // 18 seconds
      15000, // 15 seconds required
      'chin-tuck'
    );

    expect(isValid).toBe(true);
  });

  test('uses different thresholds for different exercises', () => {
    // Simulate calibration
    for (let i = 0; i < 100; i++) {
      postureDetector.addCalibrationSample(
        { x: 0, y: 9.8, z: 0 },
        { x: 0, y: 0, z: 0 }
      );
    }

    // Test with shoulder squeeze data
    const result = postureDetector.detectPosture(
      { x: 1.0, y: 9.0, z: 0.5 },
      { x: 0, y: 0, z: 0 },
      'shoulder-squeeze'
    );

    expect(result.isCorrect).toBe(true);
    expect(result.angle).toBeCloseTo(3.578);
    expect(result.feedback).toBe("Perfect posture!");
  });
});
