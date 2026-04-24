import { validateRule } from '../hooks/useAIRuleInjection';

test('Rejects console.log in production', () => {
  const rule = { name: 'No console.log', pattern: 'console.log' };
  const code = 'console.log("debug")';
  expect(validateRule(code, rule)).toBe(false);
});

test('Accepts valid code', () => {
  const rule = { name: 'No console.log', pattern: 'console.log' };
  const code = 'console.info("info")';
  expect(validateRule(code, rule)).toBe(true);
});
