import { calculateXP } from '../../app/utils/skillTree';

test('XP calculation for daily challenges', () => {
  expect(calculateXP(3)).toBe(30); // 3 days = 30 XP
});
