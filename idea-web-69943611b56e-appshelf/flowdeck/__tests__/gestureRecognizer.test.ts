import { recognizeGesture } from '../lib/gestureRecognizer';

describe('Gesture Recognizer', () => {
  test('recognizes swipe up pattern', () => {
    const points = [
      { x: 100, y: 500 },
      { x: 100, y: 100 }
    ];
    expect(recognizeGesture(points)).toBe('swipe_up');
  });

  test('recognizes L-shape pattern', () => {
    const points = [
      { x: 100, y: 100 },
      { x: 100, y: 300 },
      { x: 300, y: 300 }
    ];
    expect(recognizeGesture(points)).toBe('l_shape');
  });
});
