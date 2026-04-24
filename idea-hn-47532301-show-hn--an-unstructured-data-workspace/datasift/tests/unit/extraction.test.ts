import { extractData } from '../../app/utils/extraction';

test('extracts entities from text', () => {
  const text = "Contact John at john@example.com by Friday.";
  const result = extractData(text);
  expect(result.entities).toContainEqual({ type: 'email', value: 'john@example.com' });
});
