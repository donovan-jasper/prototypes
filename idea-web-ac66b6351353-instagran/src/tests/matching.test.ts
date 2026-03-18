import { getMatchingScore } from '../utils/matching';

test('Matching score for shared interests', () => {
  const user1 = { hobbies: ['hiking', 'reading'] };
  const user2 = { hobbies: ['reading', 'cooking'] };
  expect(getMatchingScore(user1, user2)).toBe(50); // 1/2 of user1's hobbies shared
});

test('Matching score when all interests are shared', () => {
  const user1 = { hobbies: ['hiking', 'reading'] };
  const user2 = { hobbies: ['hiking', 'reading', 'cooking'] };
  expect(getMatchingScore(user1, user2)).toBe(100); // 2/2 of user1's hobbies shared
});

test('Matching score when no interests are shared', () => {
  const user1 = { hobbies: ['hiking', 'reading'] };
  const user2 = { hobbies: ['cooking', 'gaming'] };
  expect(getMatchingScore(user1, user2)).toBe(0); // 0/2 of user1's hobbies shared
});
