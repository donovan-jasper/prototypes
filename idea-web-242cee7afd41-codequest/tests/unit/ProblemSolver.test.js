import { calculateAdaptiveDifficulty } from '../../app/hooks/useAdaptiveLogic';

test('adjusts difficulty based on performance', () => {
  expect(calculateAdaptiveDifficulty(80, 'easy')).toBe('medium');
  expect(calculateAdaptiveDifficulty(30, 'hard')).toBe('medium');
});

test('maintains difficulty for moderate performance', () => {
  expect(calculateAdaptiveDifficulty(60, 'easy')).toBe('easy');
  expect(calculateAdaptiveDifficulty(50, 'medium')).toBe('medium');
  expect(calculateAdaptiveDifficulty(70, 'hard')).toBe('hard');
});

test('does not increase beyond hard', () => {
  expect(calculateAdaptiveDifficulty(90, 'hard')).toBe('hard');
});

test('does not decrease below easy', () => {
  expect(calculateAdaptiveDifficulty(20, 'easy')).toBe('easy');
});
