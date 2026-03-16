import { getMatchingScore } from '../utils/matching';

test('Matching score for shared interests', () => {
  const user1 = { hobbies: ['hiking', 'reading'] };
  const user2 = { hobbies: ['reading', 'cooking'] };
  expect(getMatchingScore(user1, user2)).toBe(50); // 1/2 shared
});
