import { validateMessage } from '../../src/utils/chatService';

test('validates message text', () => {
  expect(validateMessage('')).toBe(false);
  expect(validateMessage('Hello')).toBe(true);
});
