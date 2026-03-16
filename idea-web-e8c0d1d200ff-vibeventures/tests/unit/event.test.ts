import { filterEventsByDistance } from '../../src/utils/eventFilters';

test('filters events within 5km', () => {
  const events = [{ id: 1, distance: 3 }, { id: 2, distance: 7 }];
  const result = filterEventsByDistance(events, 5);
  expect(result).toHaveLength(1);
});
