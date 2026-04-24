import { parseQuery } from '../app/utils/nlpParser';

test('parses "show 500 errors" into filter', () => {
  expect(parseQuery('show 500 errors')).toEqual({
    severity: 'error',
    statusCode: 500,
  });
});

test('parses "show warnings" into filter', () => {
  expect(parseQuery('show warnings')).toEqual({
    severity: 'warning',
  });
});

test('parses "show info logs" into filter', () => {
  expect(parseQuery('show info logs')).toEqual({
    severity: 'info',
  });
});
