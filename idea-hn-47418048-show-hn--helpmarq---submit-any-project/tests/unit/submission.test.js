import { validateSubmission } from '../../app/utils/submission';

test('validates image submissions', () => {
  expect(validateSubmission({ type: 'image', file: 'test.png' })).toBe(true);
});

test('invalidates empty submissions', () => {
  expect(validateSubmission({ type: '', file: '' })).toBe(false);
});
