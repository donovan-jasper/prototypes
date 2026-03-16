import { getExerciseById, calculateRoutineDuration, validateExerciseCompletion } from '../lib/exercises';

describe('Exercise Logic', () => {
  test('retrieves exercise by ID', () => {
    const exercise = getExerciseById('chin-tuck');
    expect(exercise).toBeDefined();
    expect(exercise?.name).toBe('Chin Tuck');
  });

  test('calculates routine duration correctly', () => {
    const duration = calculateRoutineDuration(['chin-tuck', 'shoulder-squeeze']);
    expect(duration).toBeGreaterThan(0);
  });

  test('validates exercise completion', () => {
    const isValid = validateExerciseCompletion('chin-tuck', 10, 3);
    expect(isValid).toBe(true);
  });
});
